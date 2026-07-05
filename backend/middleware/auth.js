const jwt = require("jsonwebtoken");

const User = require("../models/User");

function getBearerToken(request) {
  const authorizationHeader = request.get("Authorization");

  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.trim().split(/\s+/);

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

async function requireAuth(request, response, next) {
  const token = getBearerToken(request);

  if (!token) {
    return response.status(401).json({
      error: "Authentication required.",
    });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (!decodedToken.sub) {
      return response.status(401).json({
        error: "Authentication required.",
      });
    }

    const user = await User.findById(decodedToken.sub);

    if (!user) {
      return response.status(401).json({
        error: "Authentication required.",
      });
    }

    request.user = user;

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return response.status(401).json({
        error: "Your session has expired. Please sign in again.",
      });
    }

    return response.status(401).json({
      error: "Authentication required.",
    });
  }
}

module.exports = requireAuth;
