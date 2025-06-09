import React from "react";
// import { setPage } from "../App";
import LogInPage from "./LogInPage";
import AppLayout from "../components/AppLayout";


const SalesPage = () => {
  return (
    <div className="bg-[#ffffff] h-full flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center h-auto w-100 bg-[#a243d2] rounded-lg shadow-lg">
        <h1 className="text-white text-3xl font-bold mb-4">Sales Page</h1>
        <p className="text-white text-lg">
          Bem-vindo a sua página de vendas!
        </p>
      </div>
    </div>
  );
};

export default SalesPage;