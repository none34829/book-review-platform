import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/';
const BASE_URL = 'http://127.0.0.1:8000/';

// setting up the api connection thingy
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// for testing without login stuff - makes dev easier
const TEST_MODE = true;

// adding some code to check requests and responses
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url, config.data || config.params);
    
    // grab token if we have one
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    
    // hack for testing - if no token but doing review stuff
    if (TEST_MODE && 
        !token && 
        (config.url.includes('reviews') || config.url.includes('token')) && 
        config.method !== 'get') {
      // just use basic auth with user1
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

// book api stuff
export const booksApi = {
  getAll: (params) => apiClient.get('books/', { params }),
  getById: (id) => apiClient.get(`books/${id}/`),
  getBookReviews: (id) => apiClient.get(`books/${id}/reviews/`),
};

// review related api calls
export const reviewsApi = {
  getAll: () => apiClient.get('reviews/'),
  getById: (id) => apiClient.get(`reviews/${id}/`),
  create: (data) => {
    console.log('Creating review with data:', data);
    // try getting a token first if missing
    if (!localStorage.getItem('token') && TEST_MODE) {
      return authApi.login()
        .then(res => {
          localStorage.setItem('token', res.data.token);
          // make sure data looks right
          const formattedData = {
            ...data,
            rating: parseInt(data.rating, 10),
            book: parseInt(data.book, 10),
            user_id: 2 // use user1 id
          };
          console.log('Creating review with formatted data:', formattedData);
          return apiClient.post('reviews/', formattedData);
        });
    }
    // make sure data looks right
    const formattedData = {
      ...data,
      rating: parseInt(data.rating, 10),
      book: parseInt(data.book, 10),
      user_id: 2 // use user1 id
    };
    console.log('Creating review with formatted data:', formattedData);
    return apiClient.post('reviews/', formattedData);
  },
  update: (id, data) => {
    // make sure data looks right
    const formattedData = {
      ...data,
      rating: parseInt(data.rating, 10),
      book: parseInt(data.book, 10),
      user_id: 2 // use user1 id
    };
    return apiClient.put(`reviews/${id}/`, formattedData);
  },
  delete: (id) => apiClient.delete(`reviews/${id}/`),
};

// auth stuff - using different url for tokens
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