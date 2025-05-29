import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LogInPage from "./view/LogInPage";
import DashboardPage from "./view/DashboardPage";
import SalesPage from "./view/SalesPage";
import ExpensesPage from "./view/ExpensesPage";
import ReportsPage from "./view/ReportsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LogInPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="*" element={<h1>Erro 404 - Uai</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
