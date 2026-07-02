import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import WelcomePage from "./pages/WelcomePage/WelcomePage";
import DemoMission from "./pages/DemoMission/DemoMission";
import HostDashboard from "./pages/HostDashboard/HostDashboard";
import CollaboratorDashboard from "./pages/CollaboratorDashboard/CollaboratorDashboard";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

import "./App.css";

function App() {
  const location = useLocation();

  const isWelcomePage = location.pathname === "/";
  const isDemoMission = location.pathname === "/demo";
  const isHostPreview = location.pathname === "/host-preview";
  const isCollaboratorPreview = location.pathname === "/collaborator-preview";

  const appLayoutClassName = [
    "app-layout",
    isWelcomePage && "app-layout--welcome",
    isDemoMission && "app-layout--demo",
    isHostPreview && "app-layout--host-preview",
    isCollaboratorPreview && "app-layout--collaborator-preview",
  ]
    .filter(Boolean)
    .join(" ");

  const mainContentClassName = [
    "main-content",
    isWelcomePage && "main-content--welcome",
    isDemoMission && "main-content--demo",
    isHostPreview && "main-content--host-preview",
    isCollaboratorPreview && "main-content--collaborator-preview",
  ]
    .filter(Boolean)
    .join(" ");

  const mainInnerClassName = [
    "main-inner",
    isWelcomePage && "main-inner--welcome",
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
          isWelcomePage={isWelcomePage}
          isDemoMission={isDemoMission}
          isHostPreview={isHostPreview}
          isCollaboratorPreview={isCollaboratorPreview}
        />

        <main className={mainContentClassName}>
          <div className={mainInnerClassName}>
            <Routes>
              <Route path="/" element={<WelcomePage />} />

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
