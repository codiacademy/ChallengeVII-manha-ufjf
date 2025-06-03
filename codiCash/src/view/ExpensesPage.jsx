import React, { useState } from "react";
// import { setPage } from "../App";
import LogInPage from "./LogInPage";
import AppLayout from "../components/AppLayout";


const ExpensesPage = () => {
  return (
    <div className="bg-[#ffffff] h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center h-auto w-100 bg-[#a243d2] rounded-lg shadow-lg">
        <h1 className="text-white text-3xl font-bold mb-4">Expenses Page</h1>
        <p className="text-white text-lg">
          Bem-vindo a sua página de gastos!
        </p>
      </div>
    </div>
  );
};

export default ExpensesPage;