import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Container>
      <Row className="align-items-center py-5">
        <Col md={6}>
          <h1 className="display-4 fw-bold">Book Review Platform</h1>
          <p className="lead">
            Discover new books, share your thoughts, and see what others think about your favorite reads.
          </p>
          <Button as={Link} to="/books" variant="primary" size="lg" className="me-2">
            Browse Books
          </Button>
        </Col>
        <Col md={6} className="text-center">
          <img 
            src="https://source.unsplash.com/random/600x400/?books" 
            alt="Books" 
            className="img-fluid rounded shadow-lg" 
            style={{ maxHeight: '400px' }}
          />
        </Col>
      </Row>
      
      <Row className="my-5">
        <Col md={4} className="mb-4">
          <div className="p-4 bg-light rounded text-center">
            <i className="bi bi-book fs-1 text-primary mb-3"></i>
            <h3>Discover Books</h3>
            <p>Find new books across various genres and authors.</p>
          </div>
        </Col>
        <Col md={4} className="mb-4">
          <div className="p-4 bg-light rounded text-center">
            <i className="bi bi-star fs-1 text-warning mb-3"></i>
            <h3>Rate & Review</h3>
            <p>Share your thoughts and rate books you've read.</p>
          </div>
        </Col>
        <Col md={4} className="mb-4">
          <div className="p-4 bg-light rounded text-center">
            <i className="bi bi-people fs-1 text-success mb-3"></i>
            <h3>Community Insights</h3>
            <p>See what others think about books you're interested in.</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Home; 