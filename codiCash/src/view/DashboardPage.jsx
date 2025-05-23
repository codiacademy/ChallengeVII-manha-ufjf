import React, { useState } from "react";
// import { setPage } from "../App";
import LogInPage from "./LogInPage";

const DashboardPage = () => {
  return (
    <div className="bg-[#580581] h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center h-auto w-100 bg-[#a243d2] rounded-lg shadow-lg">
        <h1 className="text-white text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-white text-lg">
          Bem-vindo ao seu painel de controle!
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;