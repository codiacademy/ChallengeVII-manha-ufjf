import React from "react";
import cclogo from "../img/cclogo.png";
import themeIcon from "../img/theme-icon.png";
import notificationIcon from "../img/notification-icon.png";
import Modal from "./Modal";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const [userData, setUserData] = React.useState(null);
  const navigate = useNavigate();
  const loggedInUser = localStorage.getItem("loggedInUser");

  React.useEffect(() => {
    if (loggedInUser) {
      fetch(`http://localhost:3001/usuarios?nome=${loggedInUser}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.length > 0) {
            setUserData(data[0]);
            // Salva todos os dados do usuário no localStorage
            localStorage.setItem("loggedInUserData", JSON.stringify(data[0]));
          }
        });
    }
  }, [loggedInUser]);

  const handleThemeChange = () => {
    console.log("Theme changed");
  };

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  return (
    <header className="bg-[#a243d2] w-full flex relative z-40">
      <img src={cclogo} alt="Logo" className="w-24 h-24 mx-0 left-0" />
      <div className="flex justify-end items-center w-full mr-10">
        <button onClick={handleThemeChange} className="pr-10">
          <img src={themeIcon} alt="Tema" className="w-12 h-12" />
        </button>
        <button onClick={handleNotificationClick} className="pr-10">
          <img
            src={notificationIcon}
            alt="Notificações"
            className="w-12 h-12"
          />
        </button>
        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="w-12 h-12 rounded-full bg-white text-[#a243d2] flex items-center justify-center text-xl font-bold hover:bg-gray-100 transition-colors"
        >
          {loggedInUser ? loggedInUser.charAt(0).toUpperCase() : ""}
        </button>
      </div>

      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        position="top-right"
      >
        <div className="flex flex-col">
          {userData && (
            <>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-[#a243d2] text-white flex items-center justify-center text-lg font-bold mr-3">
                  {userData.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-[#a243d2]">
                    {userData.nome}
                  </p>
                  <p className="text-sm text-[#a243d2] capitalize">
                    {userData.papel}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-2">
                <button
                  className="w-full text-left px-2 py-2 text-sm text-[#a243d2] hover:bg-gray-100 rounded transition-colors"
                  onClick={() => {
                    navigate("/settings");
                    setIsProfileModalOpen(false);
                  }}
                >
                  Configurações
                </button>
                <button
                  className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 rounded text-red-600 hover:text-red-800 transition-colors"
                  onClick={handleLogout}
                >
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </header>
  );
};

export default Header;
