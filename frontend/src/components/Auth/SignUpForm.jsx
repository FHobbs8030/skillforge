import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

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
  };

  const validateForm = () => {
    const nextErrors = {};

    if (formData.fullName.trim().length < 2) {
      nextErrors.fullName = "Enter your full name.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Enter your email address.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
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

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFormMessage("");
      return;
    }

    setErrors({});
    setFormMessage(
      "Signup validation passed. Account creation will be connected to the backend in the next checkpoint.",
    );
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit} noValidate>
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
        >
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="team">Team</option>
        </select>
      </div>

      <button className="signup-form__submit" type="submit">
        Create Account
      </button>

      {formMessage && (
        <p className="signup-form__message" role="status">
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
