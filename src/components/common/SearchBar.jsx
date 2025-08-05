import React from 'react';

export const SearchBar = ({ filters, onFilterChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 my-4">
      <input
        type="text"
        name="name"
        placeholder="Search by name"
        value={filters.name}
        onChange={handleChange}
        className="border border-gray-300 px-4 py-2 rounded w-full md:w-1/3"
      />
      <input
        type="text"
        name="brand"
        placeholder="Search by brand"
        value={filters.brand}
        onChange={handleChange}
        className="border border-gray-300 px-4 py-2 rounded w-full md:w-1/3"
      />
      <input
        type="text"
        name="category"
        placeholder="Search by category"
        value={filters.category}
        onChange={handleChange}
        className="border border-gray-300 px-4 py-2 rounded w-full md:w-1/3"
      />
    </div>
  );
};
