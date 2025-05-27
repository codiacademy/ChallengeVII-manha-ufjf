import React from "react";
import dashboardIcon from "../img/dashboard-icon.png";
import salesIcon from "../img/sales-icon.png";
import expensesIcon from "../img/expenses-icon.png";
import reportsIcon from "../img/reports-icon.png";
// import settingsIcon from "../img/settings-icon.png";

const SideBar = () => {
  return (
        <nav className="bg-[#ffffff] text-[#a243d2] h-screen w-20 flex flex-col items-center hover:w-45 transition-all duration-300 border-r-2 border-[#a243d2]">
          <ul className="w-full">
            <li className="flex items-center p-4 hover:bg-[#a243d2] cursor-pointer">
              <img src={dashboardIcon} alt="Dashboard" className="w-12 h-12 mr-2" />
              <p className="overflow-hidden">Dashboard</p>
            </li>
            <li className="flex items-center p-4 hover:bg-[#a243d2] cursor-pointer">
              <img src={salesIcon} alt="Sales" className="w-12 h-12 mr-2" />
              <p className="overflow-hidden">Vendas</p>
            </li>
            <li className="flex items-center p-4 hover:bg-[#a243d2] cursor-pointer">
              <img src={expensesIcon} alt="Expenses" className="w-12 h-12 mr-2" />
              <p className="overflow-hidden">Despesas</p>
            </li>
            <li className="flex items-center p-4 hover:bg-[#a243d2] cursor-pointer">
              <img src={reportsIcon} alt="Reports" className="w-12 h-12 mr-2" />
              <p className="overflow-hidden">Relatórios</p>
            </li>
            {/* Uncomment when settings icon is available */}
            {/* <li className="flex items-center p-4 hover:bg-[#a243d2] cursor-pointer">
              <img src={settingsIcon} alt="Settings" className="w-12 h-12 mr-2" />
              Configurações
            </li> */}
          </ul>
        </nav>
  );
};

export default SideBar;