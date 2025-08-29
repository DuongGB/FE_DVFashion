import React from "react";

const EmployeeCard = ({ name, image, role }) => {
  return (
    <div className="flex items-center p-4 border border-gray-300 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow mb-4">
      <img
        src={image}
        alt={name}
        className="w-14 h-14 rounded-full object-cover mr-4"
      />
      <div>
        <h4 className="text-lg font-semibold text-gray-800">{name}</h4>
        {role && <p className="text-sm text-gray-500">{role}</p>}
      </div>
    </div>
  );
};

export default EmployeeCard;
