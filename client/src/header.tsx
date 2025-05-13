import React, { useState } from 'react';

const header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const searchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Add search logic here
    console.log('Search:', searchQuery);
  };
  return (
    <header className="header">
    <h1>Dashboard</h1>
    <form className="search-form" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={searchChange}
        />
        <button type="submit">🔍</button>
      </form>
    <div className="user-info">
      <span>User</span>
    </div>
  </header>
  );
}

export default header;