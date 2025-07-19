import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LogInPage from "./view/LogInPage";
import AppLayout from "./components/AppLayout";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-center" autoClose={3000} />
        <Routes>
          <Route path="/" element={<LogInPage />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;