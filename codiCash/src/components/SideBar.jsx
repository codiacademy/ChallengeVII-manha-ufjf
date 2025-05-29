import React from "react";
import dashboardIcon from "../img/dashboard-icon.png";
import salesIcon from "../img/sales-icon.png";
import expensesIcon from "../img/expenses-icon.png";
import reportsIcon from "../img/reports-icon.png";
// import settingsIcon from "../img/settings-icon.png";
import { useNavigate } from "react-router-dom";

// Trabalhar com viewheight para tentar corrigir o problema de scroll

const SideBar = () => {
  return (
    <nav className="bg-[#ffffff] text-[#a243d2] h-screen w-22 flex flex-col hover:w-45 transition-all duration-300 border-r-2 border-[#a243d2]">
      <ul className="w-full">
        <li className="flex items-center p-4 hover:bg-[#a243d2] hover:text-white cursor-pointer" onClick={()=> useNavigate("/dashboard")}>
            <img src={dashboardIcon} alt="Dashboard" className="w-12 h-12 mr-2"/>
            <p className="overflow-hidden">Dashboard</p>
        </li>
        <li className="flex items-center p-4 hover:bg-[#a243d2] hover:text-white cursor-pointer" onClick={() => useNavigate("/sales")}>
            <img src={salesIcon} alt="Sales" className="w-12 h-12 mr-2" />
            <p className="overflow-hidden">Vendas</p>
        </li>
        <li className="flex items-center p-4 hover:bg-[#a243d2] hover:text-white cursor-pointer" onClick={() => useNavigate("/expenses")}>
            <img src={expensesIcon} alt="Expenses" className="w-12 h-12 mr-2" />
            <p className="overflow-hidden">Despesas</p>
        </li>
        <li className="flex items-center p-4 hover:bg-[#a243d2] hover:text-white cursor-pointer" onClick={() => useNavigate("/reports")}> 
            <img src={reportsIcon} alt="Reports" className="w-12 h-12 mr-2" />
            <p className="overflow-hidden">Relatórios</p>
        </li>
        {/* Uncomment when settings icon is available */}
        {/* <li className="flex items-center p-4 hover:bg-[#a243d2] cursor-pointer bottom-0">
          <a onClick={() => useNavigate("/settings")}>
            <img src={settingsIcon} alt="Settings" className="w-12 h-12 mr-2" />
            <p className="overflow-hidden">Configurações</p>
          </a>
        </li> */}
      </ul>
    </nav>
  );
};

export default SideBar;
