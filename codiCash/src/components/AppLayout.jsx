import React from "react";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <SideBar />
        <main className="flex-1 bg-[#f9f9f9] p-6 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;