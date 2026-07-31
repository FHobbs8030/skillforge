const crypto = require("crypto");
const express = require("express");
const fetch = require("node-fetch");

const User = require("../models/User");
const GitHubOAuthState = require("../models/GitHubOAuthState");
const requireAuth = require("../middleware/auth");

const router = express.Router();

const GITHUB_API_VERSION = "2026-03-10";
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

function toBase64Url(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function createRandomValue(byteLength = 32) {
  return toBase64Url(crypto.randomBytes(byteLength));
}

function hashState(state) {
  return crypto.createHash("sha256").update(state).digest("hex");
}

function createCodeChallenge(codeVerifier) {
  return toBase64Url(
    crypto.createHash("sha256").update(codeVerifier).digest(),
  );
}

function getOAuthConfig() {
  const config = {
    clientId: String(process.env.GITHUB_APP_CLIENT_ID || "").trim(),
    clientSecret: String(process.env.GITHUB_APP_CLIENT_SECRET || "").trim(),
    callbackUrl: String(process.env.GITHUB_APP_CALLBACK_URL || "").trim(),
    frontendUrl: String(process.env.FRONTEND_URL || "").trim(),
  };

  const missingVariables = [];

  if (!config.clientId) {
    missingVariables.push("GITHUB_APP_CLIENT_ID");
  }

  if (!config.clientSecret) {
    missingVariables.push("GITHUB_APP_CLIENT_SECRET");
  }

  if (!config.callbackUrl) {
    missingVariables.push("GITHUB_APP_CALLBACK_URL");
  }

  if (!config.frontendUrl) {
    missingVariables.push("FRONTEND_URL");
  }

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing GitHub OAuth configuration: ${missingVariables.join(", ")}`,
    );
  }

  let callbackUrl;
  let frontendUrl;

  try {
    callbackUrl = new URL(config.callbackUrl);
    frontendUrl = new URL(config.frontendUrl);
  } catch {
    throw new Error("GitHub OAuth URLs must be valid absolute URLs.");
  }

  const allowedProtocols = new Set(["http:", "https:"]);

  if (
    !allowedProtocols.has(callbackUrl.protocol) ||
    !allowedProtocols.has(frontendUrl.protocol)
  ) {
    throw new Error("GitHub OAuth URLs must use HTTP or HTTPS.");
  }

  if (callbackUrl.search || callbackUrl.hash) {
    throw new Error(
      "GITHUB_APP_CALLBACK_URL cannot contain query parameters or a hash.",
    );
  }

  return config;
}

async function fetchVerifiedGitHubProfile(accessToken, config) {
  let profileData;
  let profileRequestError = null;

  try {
    const profileResponse = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "SkillForge",
        "X-GitHub-Api-Version": GITHUB_API_VERSION,
      },
    });

    profileData = await profileResponse.json();

    if (!profileResponse.ok) {
      throw new Error(
        profileData?.message ||
          "GitHub could not return the authorized profile.",
      );
    }
  } catch (error) {
    profileRequestError = error;
  }

  const basicAuthorization = Buffer.from(
    `${config.clientId}:${config.clientSecret}`,
  ).toString("base64");

  const revokeResponse = await fetch(
    `https://api.github.com/applications/${encodeURIComponent(
      config.clientId,
    )}/token`,
    {
      method: "DELETE",

      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Basic ${basicAuthorization}`,
        "Content-Type": "application/json",
        "User-Agent": "SkillForge",
        "X-GitHub-Api-Version": GITHUB_API_VERSION,
      },

      body: JSON.stringify({
        access_token: accessToken,
      }),
    },
  );

  if (!revokeResponse.ok && revokeResponse.status !== 404) {
    throw new Error(
      `GitHub temporary token revocation failed with status ${revokeResponse.status}.`,
    );
  }

  if (profileRequestError) {
    throw profileRequestError;
  }

  return profileData;
}

function buildProfileRedirect(status, reason = "") {
  const fallbackUrl = "http://localhost:5173";
  const configuredFrontendUrl =
    String(process.env.FRONTEND_URL || "").trim() || fallbackUrl;

  let redirectUrl;

  try {
    redirectUrl = new URL("/profile", configuredFrontendUrl);
  } catch {
    redirectUrl = new URL("/profile", fallbackUrl);
  }

  redirectUrl.searchParams.set("github", status);

  if (reason) {
    redirectUrl.searchParams.set("reason", reason);
  }

  return redirectUrl.toString();
}

function redirectToProfile(res, status, reason = "") {
  return res.redirect(302, buildProfileRedirect(status, reason));
}

function getQueryValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

/* =========================
   BEGIN GITHUB CONNECTION
========================= */

router.post("/connect", requireAuth, async (req, res) => {
  try {
    const config = getOAuthConfig();

    const state = createRandomValue(32);
    const codeVerifier = createRandomValue(64);
    const codeChallenge = createCodeChallenge(codeVerifier);

    await GitHubOAuthState.deleteMany({
      user: req.user._id,
    });

    await GitHubOAuthState.create({
      user: req.user._id,
      stateHash: hashState(state),
      codeVerifier,
      redirectUri: config.callbackUrl,
      expiresAt: new Date(Date.now() + OAUTH_STATE_TTL_MS),
    });

    const authorizationUrl = new URL(
      "https://github.com/login/oauth/authorize",
    );

    authorizationUrl.searchParams.set("client_id", config.clientId);
    authorizationUrl.searchParams.set("redirect_uri", config.callbackUrl);
    authorizationUrl.searchParams.set("state", state);
    authorizationUrl.searchParams.set("code_challenge", codeChallenge);
    authorizationUrl.searchParams.set("code_challenge_method", "S256");
    authorizationUrl.searchParams.set("prompt", "select_account");

    return res.status(200).json({
      authorizationUrl: authorizationUrl.toString(),
    });
  } catch (error) {
    console.error("GitHub connection start error:", error.message);

    return res.status(500).json({
      error: "Unable to start the GitHub connection. Please try again.",
    });
  }
});

/* =========================
   GITHUB CALLBACK
========================= */

router.get("/callback", async (req, res) => {
  const providerError = getQueryValue(req.query.error);

  if (providerError) {
    const reason =
      providerError === "access_denied" ? "cancelled" : "github_error";

    return redirectToProfile(res, "error", reason);
  }

  const code = getQueryValue(req.query.code);
  const state = getQueryValue(req.query.state);

  if (!code || !state) {
    return redirectToProfile(res, "error", "missing_response");
  }

  let config;

  try {
    config = getOAuthConfig();
  } catch (error) {
    console.error("GitHub OAuth configuration error:", error.message);

    return redirectToProfile(res, "error", "configuration");
  }

  let oauthState;

  try {
    oauthState = await GitHubOAuthState.findOneAndDelete({
      stateHash: hashState(state),
      expiresAt: {
        $gt: new Date(),
      },
    });
  } catch (error) {
    console.error("GitHub OAuth state lookup error:", error.message);

    return redirectToProfile(res, "error", "invalid_state");
  }

  if (!oauthState) {
    return redirectToProfile(res, "error", "invalid_state");
  }

  try {
    const tokenParameters = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: oauthState.redirectUri,
      code_verifier: oauthState.codeVerifier,
    });

    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",

        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "SkillForge",
        },

        body: tokenParameters.toString(),
      },
    );

    const tokenData = await tokenResponse.json();

    if (
      !tokenResponse.ok ||
      tokenData.error ||
      typeof tokenData.access_token !== "string"
    ) {
      throw new Error("GitHub rejected the authorization code.");
    }

    const accessToken = tokenData.access_token;

    delete tokenData.access_token;
    delete tokenData.refresh_token;

    const profileData = await fetchVerifiedGitHubProfile(
      accessToken,
      config,
    );

    const githubUserId =
      profileData.id === undefined || profileData.id === null
        ? ""
        : String(profileData.id).trim();

    const githubUsername =
      typeof profileData.login === "string"
        ? profileData.login.trim()
        : "";

    const githubProfileUrl =
      typeof profileData.html_url === "string"
        ? profileData.html_url.trim()
        : "";

    const githubAvatarUrl =
      typeof profileData.avatar_url === "string"
        ? profileData.avatar_url.trim()
        : "";

    if (!githubUserId || !githubUsername) {
      throw new Error("GitHub returned an incomplete user identity.");
    }

    const existingConnection = await User.findOne({
      "github.userId": githubUserId,

      _id: {
        $ne: oauthState.user,
      },
    }).select("_id");

    if (existingConnection) {
      return redirectToProfile(res, "error", "account_in_use");
    }

    const user = await User.findById(oauthState.user);

    if (!user) {
      return redirectToProfile(res, "error", "skillforge_account_missing");
    }

    const now = new Date();

    const connectedAt =
      user.github?.userId === githubUserId && user.github?.connectedAt
        ? user.github.connectedAt
        : now;

    user.github = {
      userId: githubUserId,
      username: githubUsername,
      profileUrl: githubProfileUrl,
      avatarUrl: githubAvatarUrl,
      connectedAt,
      lastSyncedAt: now,
    };

    if (user.avatar?.source !== "upload") {
      if (githubAvatarUrl) {
        user.avatar = {
          url: githubAvatarUrl,
          source: "github",
        };
      } else if (user.avatar?.source === "github") {
        user.avatar = undefined;
      }
    }

    await user.save();

    return redirectToProfile(res, "connected");
  } catch (error) {
    console.error("GitHub OAuth callback error:", error.message);

    if (error?.code === 11000) {
      return redirectToProfile(res, "error", "account_in_use");
    }

    return redirectToProfile(res, "error", "connection_failed");
  }
});

/* =========================
   DISCONNECT GITHUB
========================= */

router.delete("/", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        error: "SkillForge account not found.",
      });
    }

    const wasConnected = Boolean(user.github?.userId);

    user.github = undefined;

    if (user.avatar?.source === "github") {
      user.avatar = undefined;
    }

    await user.save();

    const safeUser = user.toObject();

    delete safeUser.passwordHash;

    return res.status(200).json({
      message: wasConnected
        ? "GitHub account disconnected."
        : "No GitHub account was connected.",
      user: safeUser,
    });
  } catch (error) {
    console.error("GitHub disconnect error:", error.message);

    return res.status(500).json({
      error: "Unable to disconnect GitHub. Please try again.",
    });
  }
});

module.exports = router;
