import { useState } from "react";
import { Link } from "react-router-dom";

import { signInUser } from "../../utils/api";

import "./SignInForm.css";

const AUTH_TOKEN_KEY = "skillforgeAuthToken";
const AUTH_USER_KEY = "skillforgeAuthUser";

function storeAuthSession({ token, user }, rememberMe) {
  const selectedStorage = rememberMe
    ? window.localStorage
    : window.sessionStorage;

  const unusedStorage = rememberMe
    ? window.sessionStorage
    : window.localStorage;

  /*
   * Prevent an older session from remaining in the other
   * browser-storage location.
   */
  unusedStorage.removeItem(AUTH_TOKEN_KEY);
  unusedStorage.removeItem(AUTH_USER_KEY);

  selectedStorage.setItem(AUTH_TOKEN_KEY, token);
  selectedStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function SignInForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));

    setFormMessage("");
    setMessageType("");
  };

  const validateForm = () => {
    const nextErrors = {};
    const normalizedEmail = formData.email.trim();

    if (!normalizedEmail) {
      nextErrors.email = "Enter your email address.";
    } else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      nextErrors.password = "Enter your password.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFormMessage("");
      setMessageType("");
      return;
    }

    setErrors({});
    setFormMessage("");
    setMessageType("");
    setIsSubmitting(true);

    try {
      const response = await signInUser({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (!response?.token || !response?.user) {
        throw new Error(
          "The server returned an incomplete authentication response.",
        );
      }

      storeAuthSession(
        {
          token: response.token,
          user: response.user,
        },
        formData.rememberMe,
      );

      setFormData((currentData) => ({
        ...currentData,
        password: "",
      }));

      setFormMessage(response.message || "Signed in successfully.");
      setMessageType("success");
    } catch (error) {
      if (error.fields && Object.keys(error.fields).length > 0) {
        setErrors(error.fields);
      }

      setFormMessage(
        error.message || "Unable to sign in. Please check your credentials.",
      );
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    setFormMessage(
      "Password recovery will be added in a later authentication phase.",
    );
    setMessageType("info");
  };

  return (
    <form
      className="signin-form"
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isSubmitting}
    >
      <div className="signin-form__field">
        <label htmlFor="signin-email">Email address</label>

        <input
          id="signin-email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          autoCapitalize="none"
          spellCheck="false"
          placeholder="name@example.com"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "signin-email-error" : undefined}
        />

        {errors.email && (
          <span id="signin-email-error" className="signin-form__error">
            {errors.email}
          </span>
        )}
      </div>

      <div className="signin-form__field">
        <label htmlFor="signin-password">Password</label>

        <input
          id="signin-password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="current-password"
          placeholder="Enter your password"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? "signin-password-error" : undefined
          }
        />

        {errors.password && (
          <span id="signin-password-error" className="signin-form__error">
            {errors.password}
          </span>
        )}
      </div>

      <div className="signin-form__options">
        <label className="signin-form__remember">
          <input
            name="rememberMe"
            type="checkbox"
            checked={formData.rememberMe}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <span>Remember me</span>
        </label>

        <button
          className="signin-form__forgot"
          type="button"
          onClick={handleForgotPassword}
          disabled={isSubmitting}
        >
          Forgot password?
        </button>
      </div>

      <button
        className="signin-form__submit"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing In..." : "Sign In"}
      </button>

      {formMessage && (
        <p
          className={`signin-form__message${
            messageType === "error" ? " signin-form__message--error" : ""
          }`}
          role={messageType === "error" ? "alert" : "status"}
        >
          {formMessage}
        </p>
      )}

      <p className="signin-form__footer">
        New to SkillForge? <Link to="/signup">Create an account</Link>
      </p>
    </form>
  );
}

export default SignInForm;
