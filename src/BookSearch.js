// src/BookSearch.js

import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import { FaBars, FaSearch, FaTimes } from 'react-icons/fa';

const API_URL = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = 'AIzaSyArIes8imMz5szHdvsUzBmZn56BLW_aFAs';

const BookSearch = () => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchBooks = async (query) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}`, {
        params: {
          q: query,
          key: API_KEY
        }
      });
      setBooks(response.data.items || []);
    } catch (error) {
      setError('Error fetching data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    searchBooks(query);
  };

  return (
    <div>
      <nav>
        <div className="menu-icon">
          <span><FaBars /></span>
        </div>
        <div className="logo">
          BOOK FINDER
        </div>
        <div className="nav-items">
          <li><a href="#"></a></li>
          <li><a href="#"></a></li>
          <li><a href="#"></a></li>
          <li><a href="#"></a></li>
        </div>
        <div className="search-icon">
          <span><FaSearch /></span>
        </div>
        <div className="cancel-icon">
          <span><FaTimes /></span>
        </div>
        <form id="search-form" onSubmit={handleSearch}>
          <input
            type="search"
            id="search-input"
            name="q"
            placeholder="Search"
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit"><FaSearch /></button>
        </form>
      </nav>
      <div id="search-results">
        {loading && <p>Searching...</p>}
        {error && <p>{error}</p>}
        {!loading && books.length === 0 && <p>No results found.</p>}
        <div className="book-list">
          {books.map((book) => (
            <div key={book.id} className="book-card" data-id={book.id}>
              <img
                src={book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/128x192.png?text=No+image'}
                alt={book.volumeInfo.title}
              />
              <div>
                <h2>{book.volumeInfo.title}</h2>
                <p>Author(s): {book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown'}</p>
                <p>Published: {book.volumeInfo.publishedDate}</p>
                <p>Summary: {book.volumeInfo.description}</p>
                <button onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(`${book.volumeInfo.title} ${book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown'} doctype:pdf`)}&btnI=1`, '_blank')}>
                  Download PDF
                </button>
                <button onClick={() => window.open(book.volumeInfo.infoLink, '_blank')}>
                  More Info
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookSearch;
