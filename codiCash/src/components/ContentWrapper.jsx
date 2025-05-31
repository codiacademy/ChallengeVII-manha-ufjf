import React from "react";
import DashboardPage from "../view/DashboardPage";
import SalesPage from "../view/SalesPage";
import ExpensesPage from "../view/ExpensesPage";
import ReportsPage from "../view/ReportsPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "../App";

const ContentWrapper = () => {
  if (Route == "/dashboard") {
    return <DashboardPage />;
  }
  else if (Route == "/sales") {
    return <SalesPage />;
  }
  else if (Route == "/expenses") {
    return <ExpensesPage />;
  }
  else if (Route == "/reports") {
    return <ReportsPage />;
  }
  else {
    return <h1>Erro 404 - Uai</h1>;
  }

}

export default ContentWrapper;