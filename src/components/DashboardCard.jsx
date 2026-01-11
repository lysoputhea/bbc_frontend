import React from "react";

const DashboardCard = ({
  title,
  value,
  icon,
  color = "from-indigo-500 to-purple-500",
  month,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-between ">
      {/* Left: Text Section */}
      <div className="flex flex-col space-y-1">
        <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
          {title}
        </p>
        {month && <p className="text-xs text-gray-400 italic">{month}</p>}
        <p className="text-4xl font-extrabold text-gray-800 leading-tight">
          {value}
        </p>
      </div>

      {/* Right: Icon Section */}
      <div
        className={`flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r ${color} text-white shadow-lg`}
      >
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
};

export default DashboardCard;
