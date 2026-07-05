import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import AuthShell from "../../components/Auth/AuthShell";
import SignInForm from "../../components/Auth/SignInForm";
import SignUpForm from "../../components/Auth/SignUpForm";

const AUTH_PAGE_CONTENT = {
  signup: {
    eyebrow: "Create your account",
    title: "Start building with SkillForge",
    description:
      "Create an account, select your membership, and begin organizing collaborative software projects.",
    FormComponent: SignUpForm,
  },

  signin: {
    eyebrow: "Welcome back",
    title: "Sign in to SkillForge",
    description:
      "Access your projects, invitations, team communication, and development activity.",
    FormComponent: SignInForm,
  },
};

function AuthPage({ mode = "signup" }) {
  const navigate = useNavigate();

  const pageContent = AUTH_PAGE_CONTENT[mode] ?? AUTH_PAGE_CONTENT.signup;

  const { eyebrow, title, description, FormComponent } = pageContent;

  const handleClose = useCallback(() => {
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <AuthShell
      eyebrow={eyebrow}
      title={title}
      description={description}
      onClose={handleClose}
    >
      <FormComponent />
    </AuthShell>
  );
}

export default AuthPage;
