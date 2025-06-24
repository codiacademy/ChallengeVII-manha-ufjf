import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardPage from "../view/DashboardPage";
import SalesPage from "../view/SalesPage";
import ExpensesPage from "../view/ExpensesPage";
import ReportsPage from "../view/ReportsPage";
import SettingsPage from "../view/SettingsPage";

const ContentWrapper = () => {
  return (
    <div className="flex-1 overflow-auto relative z-0 ml-[88px]">
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<h1>Erro 404 - Uai</h1>} />
      </Routes>
    </div>
  );
};

export default ContentWrapper;