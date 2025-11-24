import React from 'react';

export default function Button({ children, onClick, className = "", variant = "primary", disabled = false, ...props }) {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-1";
  
  let variantStyles = "";
  switch (variant) {
    case "primary":
      variantStyles = "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900";
      break;
    case "outline":
      variantStyles = "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-300";
      break;
    case "ghost":
      variantStyles = "text-gray-600 hover:bg-gray-100 focus:ring-gray-200";
      break;
    case "danger":
      variantStyles = "bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-200";
      break;
    default:
      variantStyles = "bg-gray-900 text-white hover:bg-gray-800";
  }

  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${disabledStyles} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}