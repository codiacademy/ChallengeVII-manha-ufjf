import React from "react";
import { SquarePlus  } from "lucide-react";
// import { setPage } from "../App";
import LogInPage from "./LogInPage";
import AppLayout from "../components/AppLayout";
import Buttons from "../components/Buttons";

const DashboardPage = () => {
  return (
    <div className="bg-[#ffffff] flex flex-col items-center justify-center h-full ">
      <div className="flex flex-col items-center justify-center h-auto w-100 bg-[#a243d2] rounded-lg shadow-lg">
        <h1 className="text-white text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-white text-lg">
          Bem-vindo ao seu painel de controle!
        </p>
      </div>
      <div className="mt-8">
        <Buttons
          onClick={() => {}}
          className="mb-4 flex items-center gap-2 rounded-full  px-4 py-2 text-white"
        >
          <SquarePlus  size={18} />
          <span>Nova Venda</span>
        </Buttons>
      </div>
    </div>
  );
};

export default DashboardPage;
