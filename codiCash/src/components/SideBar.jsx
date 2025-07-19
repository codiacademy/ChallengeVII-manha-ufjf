import React from "react";
import { LayoutDashboard, ShoppingCart, BanknoteArrowDown, PieChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useMobileDetect from "../hooks/useMobileDetect";

const SideBar = () => {
  const navigate = useNavigate();
  const isMobile = useMobileDetect();

  if (isMobile) {
    return (
      <nav className="bg-white text-[#a243d2] fixed bottom-0 left-0 right-0 z-50 border-t-2 border-[#a243d2]">
        <ul className="flex justify-around">
          <li
            className="flex flex-col items-center p-2 hover:bg-[#a243d2] hover:text-white cursor-pointer group"
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboard className="w-6 h-6 group-hover:text-white text-[#a243d2]" />
            <p className="text-xs">Dashboard</p>
          </li>
          <li
            className="flex flex-col items-center p-2 hover:bg-[#a243d2] hover:text-white cursor-pointer group"
            onClick={() => navigate("/sales")}
          >
            <ShoppingCart className="w-6 h-6 group-hover:text-white text-[#a243d2]" />
            <p className="text-xs">Vendas</p>
          </li>
          <li
            className="flex flex-col items-center p-2 hover:bg-[#a243d2] hover:text-white cursor-pointer group"
            onClick={() => navigate("/expenses")}
          >
            <BanknoteArrowDown className="w-6 h-6 group-hover:text-white text-[#a243d2]" />
            <p className="text-xs">Despesas</p>
          </li>
          <li
            className="flex flex-col items-center p-2 hover:bg-[#a243d2] hover:text-white cursor-pointer group"
            onClick={() => navigate("/reports")}
          >
            <PieChart className="w-6 h-6 group-hover:text-white text-[#a243d2]" />
            <p className="text-xs">Relatórios</p>
          </li>
        </ul>
      </nav>
    );
  }

  return (
    <nav className="group bg-[#ffffff] text-[#a243d2] h-screen w-22 hover:w-45 transition-all duration-300 fixed z-10 border-r-2 border-[#a243d2]">
      <ul className="w-full">
        <li
          className="flex items-center p-4 hover:bg-[#a243d2] hover:text-white cursor-pointer group/item"
          onClick={() => navigate("/dashboard")}
        >
          <div className="min-w-[60px] flex justify-center">
            <LayoutDashboard
              className="w-8 h-8 text-[#a243d2] group-hover/item:text-white"
              strokeWidth={2.5}
            />
          </div>
          <p className="transition-all duration-300 overflow-hidden max-w-0 group-hover:max-w-[200px] group-hover:opacity-100 opacity-0">
            Dashboard
          </p>
        </li>
        <li
          className="flex items-center p-4 hover:bg-[#a243d2] hover:text-white cursor-pointer group/item"
          onClick={() => navigate("/sales")}
        >
          <div className="min-w-[60px] flex justify-center">
            <ShoppingCart
              className="w-8 h-8 text-[#a243d2] group-hover/item:text-white"
              strokeWidth={2.5}
            />
          </div>
          <p className="transition-all duration-300 overflow-hidden max-w-0 group-hover:max-w-[200px] group-hover:opacity-100 opacity-0">
            Vendas
          </p>
        </li>
        <li
          className="flex items-center p-4 hover:bg-[#a243d2] hover:text-white cursor-pointer group/item"
          onClick={() => navigate("/expenses")}
        >
          <div className="min-w-[60px] flex justify-center">
            <BanknoteArrowDown
              className="w-8 h-8 text-[#a243d2] group-hover/item:text-white"
              strokeWidth={2.5}
            />
          </div>
          <p className="transition-all duration-300 overflow-hidden max-w-0 group-hover:max-w-[200px] group-hover:opacity-100 opacity-0">
            Despesas
          </p>
        </li>
        <li
          className="flex items-center p-4 hover:bg-[#a243d2] hover:text-white cursor-pointer group/item"
          onClick={() => navigate("/reports")}
        >
          <div className="min-w-[60px] flex justify-center">
            <PieChart
              className="w-8 h-8 text-[#a243d2] group-hover/item:text-white"
              strokeWidth={2.5}
            />
          </div>
          <p className="transition-all duration-300 overflow-hidden max-w-0 group-hover:max-w-[200px] group-hover:opacity-100 opacity-0">
            Relatórios
          </p>
        </li>
      </ul>
    </nav>
  );
};

export default SideBar;