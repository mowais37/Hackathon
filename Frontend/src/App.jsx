// src/App.jsx
import React, { useEffect, useContext } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

// Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Agents from "./pages/Agents";
import Tools from "./pages/Tools";
import Logs from "./pages/Logs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Chat from './pages/Chat';
import NotFound from "./pages/NotFound";

// Context
import AuthContext from "./context/auth/authContext";
import AuthState from "./context/auth/AuthState";
import AgentState from "./context/agent/AgentState";
import ToolState from "./context/tool/ToolState";
import LogState from "./context/log/LogState";

// Components
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Alert from "./components/common/Alert";
import PrivateRoute from "./components/common/PrivateRoute";
import "./index.css"; // Authentication utilities
import setAuthToken from "./utils/setAuthToken";
import debugAuth from "./utils/authDebug";

// Set token in headers if it exists in localStorage
if (localStorage.token) {
  console.log("Token found in localStorage, setting in axios headers");
  setAuthToken(localStorage.token);
} else {
  console.log("No token found in localStorage");
}

function App() {
  return (
    <AuthState>
      <AgentState>
        <ToolState>
          <LogState>
            <Router>
              <AppContent />
            </Router>
          </LogState>
        </ToolState>
      </AgentState>
    </AuthState>
  );
}

// Separate component to use context hooks
const AppContent = () => {
  const authContext = useContext(AuthContext);
  const { loadUser } = authContext;

  // Debug auth status
  useEffect(() => {
    // Check headers settings
    console.log("Current axios headers:", axios.defaults.headers.common);

    // Debug authentication
    debugAuth();
  }, []);

  // Load user when component mounts
  useEffect(() => {
    loadUser();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="app-container">
      <Navbar />
      <Alert />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={<PrivateRoute element={<Dashboard />} />}
          />
          <Route
            path="/agents/*"
            element={<PrivateRoute element={<Agents />} />}
          />
          <Route
            path="/tools/*"
            element={<PrivateRoute element={<Tools />} />}
          />
          <Route path="/logs" element={<PrivateRoute element={<Logs />} />} />
          <Route
            path="/profile"
            element={<PrivateRoute element={<Profile />} />}
          />
            <Route path="/chat" element={<PrivateRoute element={<Chat />} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
