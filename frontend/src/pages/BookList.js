import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import BookCard from '../components/BookCard';
import { booksApi } from '../services/api';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [genre, setGenre] = useState('');
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const params = {};
        if (searchTerm) params.search = searchTerm;
        const response = await booksApi.getAll(params);
        setBooks(response.data);
        
        // grab all the different genres from the books
        const uniqueGenres = [...new Set(response.data.map(book => book.genre))];
        setGenres(uniqueGenres);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to fetch books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchTerm]);

  // show only books matching the selected genre
  const filteredBooks = genre 
    ? books.filter(book => book.genre === genre) 
    : books;

  return (
    <Container>
      <h1 className="mb-4">Book Catalog</h1>
      
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by title, author, or genre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6}>
          <Form.Select 
            value={genre} 
            onChange={(e) => setGenre(e.target.value)}
            aria-label="Filter by genre"
          >
            <option value="">All Genres</option>
            {genres.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : filteredBooks.length === 0 ? (
        <Alert variant="info">No books found matching your criteria.</Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredBooks.map(book => (
            <Col key={book.id}>
              <BookCard book={book} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default BookList; 