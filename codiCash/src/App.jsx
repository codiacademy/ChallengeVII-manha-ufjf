import React, { useState } from "react";
import LogInPage from "./view/LogInPage";
import DashboardPage from "./view/DashboardPage";
// import SalesPage from "./view/SalesPage";
// import ExpensesPage from "./view/ExpensesPage";
// import ReportsPage from "./view/ReportsPage";

function App() {
  const [page, setPage] = useState("login");

  const renderPage = () => {
    switch (page) {
      case "login":
        return <LogInPage setPage={setPage}/>;
      case "dashboard":
        return <DashboardPage />;
      // case "sales":
      //   return <SalesPage />;
      // case "expenses":
      //   return <ExpensesPage />;
      // case "reports":
      //   return <ReportsPage />;
      default:
        return <h1>Erro 404 - Uai</h1>;
    }
  };

  return <>{renderPage()}</>;
}

export default App;
