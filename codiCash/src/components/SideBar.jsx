import React from "react";
import dashboardIcon from "../img/dashboard-icon.png";
import salesIcon from "../img/sales-icon.png";
import expensesIcon from "../img/expenses-icon.png";
import reportsIcon from "../img/reports-icon.png";
import { useNavigate } from "react-router-dom";

const SideBar = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-[#ffffff] text-[#a243d2] h-screen w-22 hover:w-45 transition-all duration-300 fixed z-10 border-r-2 border-[#a243d2]">
      <ul className="w-full">
        <li className="flex items-center p-4 hover:bg-[#a243d2] hover:text-white cursor-pointer" onClick={() => navigate("/dashboard")}>
            <img src={dashboardIcon} alt="Dashboard" className="w-12 h-12 mr-2"/>
            <p className="overflow-hidden">Dashboard</p>
        </li>
        <li className="flex items-center p-4 hover:bg-[#a243d2] hover:text-white cursor-pointer" onClick={() => navigate("/sales")}>
            <img src={salesIcon} alt="Sales" className="w-12 h-12 mr-2" />
            <p className="overflow-hidden">Vendas</p>
        </li>
        <li className="flex items-center p-4 hover:bg-[#a243d2] hover:text-white cursor-pointer" onClick={() => navigate("/expenses")}>
            <img src={expensesIcon} alt="Expenses" className="w-12 h-12 mr-2" />
            <p className="overflow-hidden">Despesas</p>
        </li>
        <li className="flex items-center p-4 hover:bg-[#a243d2] hover:text-white cursor-pointer" onClick={() => navigate("/reports")}> 
            <img src={reportsIcon} alt="Reports" className="w-12 h-12 mr-2" />
            <p className="overflow-hidden">Relatórios</p>
        </li>
      </ul>
    </nav>
  );
};

export default SideBar;