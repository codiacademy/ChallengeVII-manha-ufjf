import React from "react";

const SummaryCard = ({ title, value, icon, color, borderColor }) => (
  <div className={`p-4 rounded-lg border ${borderColor} ${color} shadow-sm`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
      </div>
      <div className="p-2 rounded-full bg-white">{icon}</div>
    </div>
  </div>
);

export default SummaryCard;