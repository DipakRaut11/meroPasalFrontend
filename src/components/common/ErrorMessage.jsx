import React from 'react';

export const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="text-red-500 bg-red-100 border border-red-400 rounded px-4 py-2 my-2">
      {message}
    </div>
  );
};
