import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { signUpUser } from "../../utils/api";

import "./SignUpForm.css";

const MEMBERSHIP_OPTIONS = ["free", "pro", "team"];

function getInitialMembership(searchParams) {
  const requestedPlan = searchParams.get("plan")?.toLowerCase();

  return MEMBERSHIP_OPTIONS.includes(requestedPlan) ? requestedPlan : "free";
}

function SignUpForm() {
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    membership: getInitialMembership(searchParams),
  });

  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
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

    const normalizedFullName = formData.fullName.trim();
    const normalizedEmail = formData.email.trim();

    if (normalizedFullName.length < 2) {
      nextErrors.fullName = "Enter your full name.";
    }

    if (!normalizedEmail) {
      nextErrors.email = "Enter your email address.";
    } else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (formData.password.length < 8) {
      nextErrors.password = "Password must contain at least 8 characters.";
    }

    if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
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
      const response = await signUpUser({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        membership: formData.membership,
      });

      setFormMessage(
        response?.message ||
          "Account created successfully. You can now sign in.",
      );
      setMessageType("success");

      setFormData((currentData) => ({
        ...currentData,
        password: "",
        confirmPassword: "",
      }));
    } catch (error) {
      if (error.fields && Object.keys(error.fields).length > 0) {
        setErrors(error.fields);
      }

      setFormMessage(
        error.message || "Unable to create your account. Please try again.",
      );
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="signup-form"
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isSubmitting}
    >
      <div className="signup-form__field">
        <label htmlFor="signup-full-name">Full name</label>

        <input
          id="signup-full-name"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
          autoComplete="name"
          placeholder="Fred Hobbs"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={
            errors.fullName ? "signup-full-name-error" : undefined
          }
        />

        {errors.fullName && (
          <span id="signup-full-name-error" className="signup-form__error">
            {errors.fullName}
          </span>
        )}
      </div>

      <div className="signup-form__field">
        <label htmlFor="signup-email">Email address</label>

        <input
          id="signup-email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          placeholder="name@example.com"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "signup-email-error" : undefined}
        />

        {errors.email && (
          <span id="signup-email-error" className="signup-form__error">
            {errors.email}
          </span>
        )}
      </div>

      <div className="signup-form__field">
        <label htmlFor="signup-password">Password</label>

        <input
          id="signup-password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? "signup-password-error" : undefined
          }
        />

        {errors.password && (
          <span id="signup-password-error" className="signup-form__error">
            {errors.password}
          </span>
        )}
      </div>

      <div className="signup-form__field">
        <label htmlFor="signup-confirm-password">Confirm password</label>

        <input
          id="signup-confirm-password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          placeholder="Enter your password again"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={
            errors.confirmPassword ? "signup-confirm-password-error" : undefined
          }
        />

        {errors.confirmPassword && (
          <span
            id="signup-confirm-password-error"
            className="signup-form__error"
          >
            {errors.confirmPassword}
          </span>
        )}
      </div>

      <div className="signup-form__field">
        <label htmlFor="signup-membership">Membership plan</label>

        <select
          id="signup-membership"
          name="membership"
          value={formData.membership}
          onChange={handleChange}
          disabled={isSubmitting}
        >
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="team">Team</option>
        </select>
      </div>

      <button
        className="signup-form__submit"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating Account..." : "Create Account"}
      </button>

      {formMessage && (
        <p
          className={`signup-form__message${
            messageType === "error" ? " signup-form__message--error" : ""
          }`}
          role={messageType === "error" ? "alert" : "status"}
        >
          {formMessage}
        </p>
      )}

      <p className="signup-form__footer">
        Already have a SkillForge account? <Link to="/signin">Sign in</Link>
      </p>
    </form>
  );
}

export default SignUpForm;
