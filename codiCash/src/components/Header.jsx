import React from "react";
import cclogo from "../img/cclogo.png";
import Modal from "./Modal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-[#a243d2] w-full flex relative z-40">
      <img src={cclogo} alt="Logo" className="w-24 h-24 mx-0 left-0" />
      <div className="flex justify-end items-center w-full mr-10">
        {user && (
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="w-12 h-12 rounded-full bg-white text-[#a243d2] flex items-center justify-center text-xl font-bold hover:bg-gray-100 transition-colors"
          >
            {user.nome.charAt(0).toUpperCase()}
          </button>
        )}
      </div>

      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        position="top-right"
      >
        <div className="flex flex-col">
          {user && (
            <>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-[#a243d2] text-white flex items-center justify-center text-lg font-bold mr-3">
                  {user.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-[#a243d2]">
                    {user.nome}
                  </p>
                  <p className="text-sm text-[#a243d2] capitalize">
                    {user.papel}
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