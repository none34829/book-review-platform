import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/';
const BASE_URL = 'http://127.0.0.1:8000/';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// For testing without authentication
const TEST_MODE = true;

// Add request/response interceptors for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url, config.data || config.params);
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    
    // For testing - if we're in test mode and doing a review operation without a token,
    // add basic auth credentials directly
    if (TEST_MODE && 
        !token && 
        (config.url.includes('reviews') || config.url.includes('token')) && 
        config.method !== 'get') {
      // Use HTTP Basic Auth with user1/password123
      const credentials = 'user1:password123';
      const encoded = btoa(credentials);
      config.headers.Authorization = `Basic ${encoded}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Books API
export const booksApi = {
  getAll: (params) => apiClient.get('books/', { params }),
  getById: (id) => apiClient.get(`books/${id}/`),
  getBookReviews: (id) => apiClient.get(`books/${id}/reviews/`),
};

// Reviews API
export const reviewsApi = {
  getAll: () => apiClient.get('reviews/'),
  getById: (id) => apiClient.get(`reviews/${id}/`),
  create: (data) => {
    console.log('Creating review with data:', data);
    // Try to get a token first if we don't have one
    if (!localStorage.getItem('token') && TEST_MODE) {
      return authApi.login()
        .then(res => {
          localStorage.setItem('token', res.data.token);
          // Ensure data is correctly formatted
          const formattedData = {
            ...data,
            rating: parseInt(data.rating, 10),
            book: parseInt(data.book, 10),
            user_id: 2 // Use ID 2 for user1
          };
          console.log('Creating review with formatted data:', formattedData);
          return apiClient.post('reviews/', formattedData);
        });
    }
    // Ensure data is correctly formatted
    const formattedData = {
      ...data,
      rating: parseInt(data.rating, 10),
      book: parseInt(data.book, 10),
      user_id: 2 // Use ID 2 for user1
    };
    console.log('Creating review with formatted data:', formattedData);
    return apiClient.post('reviews/', formattedData);
  },
  update: (id, data) => {
    // Ensure data is correctly formatted
    const formattedData = {
      ...data,
      rating: parseInt(data.rating, 10),
      book: parseInt(data.book, 10),
      user_id: 2 // Use ID 2 for user1
    };
    return apiClient.put(`reviews/${id}/`, formattedData);
  },
  delete: (id) => apiClient.delete(`reviews/${id}/`),
};

// Auth API - note we're using a different URL for token auth
export const authApi = {
  login: (username = 'user1', password = 'password123') => 
    axios.post(`${BASE_URL}api-token-auth/`, { username, password }),
  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    return token ? { token } : null;
  },
  logout: () => {
    localStorage.removeItem('token');
  },
};

export default {
  books: booksApi,
  reviews: reviewsApi,
  auth: authApi,
}; 