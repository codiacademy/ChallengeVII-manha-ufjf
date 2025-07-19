import React from "react";

const ModalChart = ({ isOpen, onClose, children, position = "top-right", size = "md" }) => {
  if (!isOpen) return null;

  const positionClasses = {
    "top-right": "fixed top-4 right-4 mt-12 mr-2",
    "center": "fixed inset-0 flex items-center justify-center p-4"
  };

  const sizeClasses = {
    "sm": "max-w-sm w-full",
    "md": "max-w-md w-full",
    "lg": "max-w-lg w-full",
    "xl": "max-w-xl w-full",
    "2xl": "max-w-2xl w-full",
    "3xl": "max-w-3xl w-full",
    "4xl": "max-w-4xl w-full",
    "5xl": "max-w-5xl w-full",
    "6xl": "max-w-6xl w-full",
    "7xl": "max-w-7xl w-full"
  };

  return (
    <>
      <div className={`${positionClasses[position]} z-50`}>
        <div className={`bg-white rounded-lg shadow-xl border border-gray-200 ${position === "center" ? sizeClasses[size] : "min-w-[256px]"} max-h-[90vh] overflow-hidden`}>
          {position !== "center" && (
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-[#a243d2] hover:text-[#580581] text-lg font-bold z-10"
            >
              &times;
            </button>
          )}
          <div className={`${position === "center" ? "h-full" : "p-4 pt-6"}`}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalChart;