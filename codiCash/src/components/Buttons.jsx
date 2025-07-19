import React from "react";

const Buttons = ({ onClick, children, className }) => {
  return (
    <button
      onClick={onClick}
      className={`bg-[#a243d2] hover:bg-[#a107d2] text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline ${className}`}
    >
      {children}
    </button>
  );
}

export default Buttons;