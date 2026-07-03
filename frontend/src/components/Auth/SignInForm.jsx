import { useState } from "react";
import { Link } from "react-router-dom";

import "./SignInForm.css";

function SignInForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState("");

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
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = "Enter your email address.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      nextErrors.password = "Enter your password.";
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
      "Sign-in validation passed. Authentication will be connected to the backend in the next checkpoint.",
    );
  };

  return (
    <form className="signin-form" onSubmit={handleSubmit} noValidate>
      <div className="signin-form__field">
        <label htmlFor="signin-email">Email address</label>

        <input
          id="signin-email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          placeholder="name@example.com"
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
          />

          <span>Remember me</span>
        </label>

        <button
          className="signin-form__forgot"
          type="button"
          onClick={() => {
            setFormMessage(
              "Password recovery will be added after backend authentication is connected.",
            );
          }}
        >
          Forgot password?
        </button>
      </div>

      <button className="signin-form__submit" type="submit">
        Sign In
      </button>

      {formMessage && (
        <p className="signin-form__message" role="status">
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
