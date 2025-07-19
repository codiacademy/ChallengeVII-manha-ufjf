import React from "react";

const Modal = ({ isOpen, onClose, children, position = "top-right" }) => {
  if (!isOpen) return null;

  const positionClasses = {
    "top-right": "fixed top-4 right-4 mt-12 mr-2",
    "center": "fixed inset-0 flex items-center justify-center"
  };

  return (
    <div className={`${positionClasses[position]} z-50`}>
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 min-w-[256px]">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-[#a243d2] hover:text-[#580581] text-lg font-bold"
        >
          &times;
        </button>
        <div className="p-4 pt-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;