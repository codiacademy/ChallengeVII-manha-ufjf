import React from "react";
import cclogo from "../img/cclogo.png";

const Header = () => {
  return (
    <header className="bg-[#a243d2] w-screen">
      <img src={cclogo} alt="Logo" className="w-24 h-24 mx-0" />
    </header>
  );
};

export default Header;
