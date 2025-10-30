import React, { useState } from "react";

const API_BASE = "http://localhost:8080/api/v1/products/search";

export default function SearchBox({ onResults }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("name");

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const res = await fetch(`${API_BASE}?type=${type}&value=${query}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      onResults(data); // send results back to dashboard
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  return (
    <div className="search-box flex gap-2 mb-6">
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border rounded p-2"
      >
        <option value="name">Name</option>
        <option value="brand">Brand</option>
        <option value="category">Category</option>
      </select>

      <input
        type="text"
        placeholder={`Search by ${type}...`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border rounded p-2 flex-grow"
      />

      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Search
      </button>
    </div>
  );
}
