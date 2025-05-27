import React from "react";
import SideBar from "../components/SideBar";
import Header from "../components/Header";

const AppLayout = () => {
  return (
    <div className="fixed top-0 left-0 w-auto h-screen z-50">
      <Header />
      <SideBar />
    </div>
  );
};

export default AppLayout;
