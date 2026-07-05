import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import WelcomePage from "./pages/WelcomePage/WelcomePage";
import DemoMission from "./pages/DemoMission/DemoMission";
import HostDashboard from "./pages/HostDashboard/HostDashboard";
import CollaboratorDashboard from "./pages/CollaboratorDashboard/CollaboratorDashboard";
import AppDashboard from "./pages/AppDashboard/AppDashboard";
import AuthPage from "./pages/AuthPage/AuthPage";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

import useAuth from "./contexts/useAuth";

import "./App.css";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return children;
}

function App() {
  const location = useLocation();
  const { isAuthLoading } = useAuth();

  const isWelcomePage = location.pathname === "/";
  const isSignUpPage = location.pathname === "/signup";
  const isSignInPage = location.pathname === "/signin";
  const isAuthPage = isSignUpPage || isSignInPage;

  /*
   * Authentication routes retain the Welcome Page layout because the
   * authentication interface appears over the Welcome Page on desktop.
   */
  const isWelcomeExperience = isWelcomePage || isAuthPage;

  const isDemoMission = location.pathname === "/demo";
  const isHostPreview = location.pathname === "/host-preview";
  const isCollaboratorPreview = location.pathname === "/collaborator-preview";
  const isAppDashboard = location.pathname === "/app";

  const appLayoutClassName = [
    "app-layout",
    isWelcomeExperience && "app-layout--welcome",
    isAuthPage && "app-layout--auth",
    isDemoMission && "app-layout--demo",
    isHostPreview && "app-layout--host-preview",
    isCollaboratorPreview && "app-layout--collaborator-preview",
    isAppDashboard && "app-layout--app-dashboard",
  ]
    .filter(Boolean)
    .join(" ");

  const mainContentClassName = [
    "main-content",
    isWelcomeExperience && "main-content--welcome",
    isAuthPage && "main-content--auth",
    isDemoMission && "main-content--demo",
    isHostPreview && "main-content--host-preview",
    isCollaboratorPreview && "main-content--collaborator-preview",
    isAppDashboard && "main-content--app-dashboard",
  ]
    .filter(Boolean)
    .join(" ");

  const mainInnerClassName = [
    "main-inner",
    isWelcomeExperience && "main-inner--welcome",
    isAuthPage && "main-inner--auth",
    isDemoMission && "main-inner--demo",
    isHostPreview && "main-inner--host-preview",
    isCollaboratorPreview && "main-inner--collaborator-preview",
    isAppDashboard && "main-inner--app-dashboard",
  ]
    .filter(Boolean)
    .join(" ");

  if (isAuthLoading) {
    return (
      <div className="app-container" aria-busy="true">
        <div className="app-layout">
          <main className="main-content">
            <div className="main-inner">
              <div
                className="auth-loading-state"
                role="status"
                aria-live="polite"
              >
                Restoring your SkillForge session...
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className={appLayoutClassName}>
        <Header
          isWelcomePage={isWelcomeExperience}
          isDemoMission={isDemoMission}
          isHostPreview={isHostPreview}
          isCollaboratorPreview={isCollaboratorPreview}
        />

        <main className={mainContentClassName}>
          <div className={mainInnerClassName}>
            <Routes>
              <Route path="/" element={<WelcomePage />} />

              <Route
                path="/signup"
                element={
                  <PublicOnlyRoute>
                    <>
                      <WelcomePage />
                      <AuthPage mode="signup" />
                    </>
                  </PublicOnlyRoute>
                }
              />

              <Route
                path="/signin"
                element={
                  <PublicOnlyRoute>
                    <>
                      <WelcomePage />
                      <AuthPage mode="signin" />
                    </>
                  </PublicOnlyRoute>
                }
              />

              <Route path="/demo" element={<DemoMission />} />

              <Route path="/host-preview" element={<HostDashboard />} />

              <Route
                path="/collaborator-preview"
                element={<CollaboratorDashboard />}
              />

              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Navigate to="/app" replace />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
