import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import { booksApi, reviewsApi, authApi } from '../services/api';

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  
  // For simplicity, we're using a fixed user in this demo
  // In a real app, this would come from an auth context
  const isAuthenticated = true; 
  const currentUserId = 2; // user1's ID is 2 in the database, not 1

  // Ensure we have an auth token before submitting reviews
  useEffect(() => {
    const getAuthToken = async () => {
      if (!localStorage.getItem('token')) {
        try {
          setAuthLoading(true);
          console.log('Attempting to authenticate...');
          const response = await authApi.login();
          if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            console.log('Authentication successful, token stored');
          } else {
            console.error('Authentication response missing token:', response);
          }
        } catch (err) {
          console.error('Failed to authenticate:', err);
          console.error('Response data:', err.response?.data);
        } finally {
          setAuthLoading(false);
        }
      }
    };
    
    getAuthToken();
  }, []);

  // Fetch book details
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const response = await booksApi.getById(id);
        console.log('Book data fetched:', response.data);
        if (response.data.reviews) {
          console.log('Reviews found:', response.data.reviews.length, response.data.reviews);
        } else {
          console.log('No reviews found in response data');
        }
        setBook(response.data);
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError('Failed to fetch book details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  // Handle review submission (create/update)
  const handleReviewSubmit = async (reviewData) => {
    try {
      console.log('Starting review submission with data:', reviewData);
      
      // Ensure we have auth token
      if (!localStorage.getItem('token')) {
        const authResponse = await authApi.login();
        localStorage.setItem('token', authResponse.data.token);
      }
      
      let response;
      if (editingReview) {
        // Update existing review
        console.log(`Updating review ID ${editingReview.id}`);
        response = await reviewsApi.update(editingReview.id, reviewData);
      } else {
        // Create new review
        console.log('Creating new review');
        response = await reviewsApi.create(reviewData);
      }
      
      console.log('Review API response:', response);
      
      // Force a delay to ensure backend processing is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh book data to show the new/updated review
      console.log('Fetching updated book data...');
      const bookResponse = await booksApi.getById(id);
      console.log('Updated book data:', bookResponse.data);
      if (bookResponse.data.reviews) {
        console.log('Updated reviews:', bookResponse.data.reviews.length, bookResponse.data.reviews);
      }
      setBook(bookResponse.data);
      
      // Reset form state
      setShowReviewForm(false);
      setEditingReview(null);
    } catch (err) {
      console.error('Error in handleReviewSubmit:', err);
      console.error('Error response:', err.response?.data);
      throw err; // Let the form component handle the error
    }
  };

  // Handle review deletion
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await reviewsApi.delete(reviewId);
        
        // Refresh book data
        const response = await booksApi.getById(id);
        setBook(response.data);
      } catch (err) {
        console.error('Error deleting review:', err);
        alert('Failed to delete the review. Please try again.');
      }
    }
  };

  // Handle review edit
  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  // Cancel review edit/creation
  const handleCancelReview = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  // Check if current user has already reviewed this book
  const hasUserReviewed = book?.reviews.some(review => review.user.id === currentUserId);

  // Add a refresh function
  const handleRefresh = async () => {
    try {
      setLoading(true);
      console.log('Manually refreshing book data...');
      const response = await booksApi.getById(id);
      console.log('Refreshed book data:', response.data);
      if (response.data.reviews) {
        console.log('Reviews after refresh:', response.data.reviews.length, response.data.reviews);
      }
      setBook(response.data);
    } catch (err) {
      console.error('Error refreshing book data:', err);
      setError('Failed to refresh book data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Link to="/books" className="btn btn-primary">Back to Books</Link>
      </Container>
    );
  }

  if (!book) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Book not found.</Alert>
        <Link to="/books" className="btn btn-primary">Back to Books</Link>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Link to="/books" className="btn btn-outline-secondary mb-4">
        <i className="bi bi-arrow-left me-2"></i>Back to Books
      </Link>
      
      <Row>
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title as="h1">{book.title}</Card.Title>
              <Card.Subtitle className="mb-3 text-muted">by {book.author}</Card.Subtitle>
              
              <div className="mb-3">
                <Badge bg="secondary" className="me-2">{book.genre}</Badge>
                <Badge bg="info">Published: {book.published_year}</Badge>
                {book.average_rating > 0 && (
                  <Badge bg="warning" text="dark" className="ms-2">
                    <i className="bi bi-star-fill me-1"></i>
                    {book.average_rating.toFixed(1)}
                  </Badge>
                )}
              </div>
              
              <Card.Text>
                This is where a book description would go. Since our API doesn't provide one,
                this is a placeholder.
              </Card.Text>
            </Card.Body>
          </Card>
          
          <div className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center">
                <h2 className="mb-0 me-3">Reviews</h2>
                <Button 
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
              {isAuthenticated && !hasUserReviewed && !showReviewForm && (
                <Button 
                  variant="primary" 
                  onClick={() => setShowReviewForm(true)}
                >
                  Write a Review
                </Button>
              )}
            </div>
            
            {showReviewForm && (
              <ReviewForm 
                bookId={book.id} 
                review={editingReview}
                onSubmit={handleReviewSubmit}
                onCancel={handleCancelReview}
              />
            )}
            
            {book.reviews && book.reviews.length === 0 ? (
              <Alert variant="info">No reviews yet. Be the first to review this book!</Alert>
            ) : !book.reviews ? (
              <Alert variant="warning">Problem loading reviews. Please refresh the page.</Alert>
            ) : (
              <>
                <p>Total reviews: {book.reviews.length}</p>
                {book.reviews.map(review => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    canModify={isAuthenticated && review.user && review.user.id === currentUserId}
                    onEdit={handleEditReview}
                    onDelete={handleDeleteReview}
                  />
                ))}
              </>
            )}
          </div>
        </Col>
        
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Header as="h5">Book Details</Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Title:</strong> {book.title}
              </div>
              <div className="mb-3">
                <strong>Author:</strong> {book.author}
              </div>
              <div className="mb-3">
                <strong>Genre:</strong> {book.genre}
              </div>
              <div className="mb-3">
                <strong>Published Year:</strong> {book.published_year}
              </div>
              <div className="mb-3">
                <strong>Average Rating:</strong> {book.average_rating > 0 
                  ? `${book.average_rating.toFixed(1)} / 5` 
                  : 'No ratings yet'
                }
              </div>
              <div>
                <strong>Number of Reviews:</strong> {book.reviews.length}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BookDetail; 