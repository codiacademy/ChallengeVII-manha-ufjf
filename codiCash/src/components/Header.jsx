import React from "react";
import cclogo from "../img/cclogo.png";
import themeIcon from "../img/theme-icon.png";
import notificationIcon from "../img/notification-icon.png";
import Modal from "./Modal";

const Header = () => {
  const loggedInUser = localStorage.getItem("loggedInUser");
  const userInitial = loggedInUser.charAt(0).toUpperCase(); 

  const handleThemeChange = () => {
    // Logic to change theme can be added here
    console.log("Theme changed");
  };
  const handleNotificationClick = () => {
    // Logic to handle notifications can be added here
    console.log("Notifications clicked");
  };
  const handleProfileClick = () => {
    
  };

  return (
    <header className="bg-[#a243d2] w-full flex">
      <img src={cclogo} alt="Logo" className="w-24 h-24 mx-0 left-0" />
      <div className="flex justify-end items-center w-full mr-10">
        <button onClick={() => handleThemeChange()} className="pr-10">
          <img src={themeIcon} alt="Tema" className="w-12 h-12"/>
        </button>
        <button onClick={() => handleNotificationClick()} className="pr-10">
          <img src={notificationIcon} alt="Notificações" className="w-12 h-12"/>
        </button>
        <button onClick={() => handleProfileClick()} className="w-12 h-12 rounded-full bg-white text-[#a243d2] flex items-center justify-center text-xl font-bold">
          {userInitial}
          </button>
      </div>
    </header>
  );
};

export default Header;
