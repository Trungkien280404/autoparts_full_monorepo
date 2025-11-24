import React from 'react';

export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${className}`}
      {...props}
    />
  );
}