import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import WelcomePage from "./pages/WelcomePage/WelcomePage";
import DemoMission from "./pages/DemoMission/DemoMission";
import HostDashboard from "./pages/HostDashboard/HostDashboard";
import CollaboratorDashboard from "./pages/CollaboratorDashboard/CollaboratorDashboard";
import AuthPage from "./pages/AuthPage/AuthPage";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

import "./App.css";

function App() {
  const location = useLocation();

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

  const appLayoutClassName = [
    "app-layout",
    isWelcomeExperience && "app-layout--welcome",
    isAuthPage && "app-layout--auth",
    isDemoMission && "app-layout--demo",
    isHostPreview && "app-layout--host-preview",
    isCollaboratorPreview && "app-layout--collaborator-preview",
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
  ]
    .filter(Boolean)
    .join(" ");

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
                  <>
                    <WelcomePage />
                    <AuthPage mode="signup" />
                  </>
                }
              />

              <Route
                path="/signin"
                element={
                  <>
                    <WelcomePage />
                    <AuthPage mode="signin" />
                  </>
                }
              />

              <Route path="/demo" element={<DemoMission />} />

              <Route path="/host-preview" element={<HostDashboard />} />

              <Route
                path="/collaborator-preview"
                element={<CollaboratorDashboard />}
              />

              <Route
                path="/profile"
                element={<Navigate to="/collaborator-preview" replace />}
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
