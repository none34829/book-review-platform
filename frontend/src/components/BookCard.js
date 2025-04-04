import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const BookCard = ({ book }) => {
  // Ensure we have valid data
  if (!book) return null;
  
  // Default placeholder image when no cover is available
  const defaultCoverImage = 'https://via.placeholder.com/128x196/e9ecef/495057?text=No+Cover';
  
  return (
    <Card className="h-100 shadow-sm">
      <div className="text-center pt-3">
        <img
          src={book.coverImage || defaultCoverImage}
          alt={`${book.title} cover`}
          style={{ 
            height: '180px', 
            objectFit: 'contain',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        />
      </div>
      <Card.Body>
        <Card.Title>{book.title}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">by {book.author}</Card.Subtitle>
        <Card.Text>
          <Badge bg="secondary" className="me-1">{book.genre}</Badge>
          <Badge bg="info">{book.published_year}</Badge>
        </Card.Text>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <i className="bi bi-star-fill text-warning"></i> 
            <span className="ms-1">{book.average_rating ? book.average_rating.toFixed(1) : 'No ratings'}</span>
          </div>
          <Link to={`/books/${book.id}`} className="btn btn-primary btn-sm">View Details</Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BookCard; 