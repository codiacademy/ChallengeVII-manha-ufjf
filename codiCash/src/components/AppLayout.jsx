import React from "react";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import ContentWrapper from "./ContentWrapper";

const AppLayout = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 min-h-0 z-0">
        <SideBar />
        <ContentWrapper />
      </div>
    </div>
  );
};

export default AppLayout;