import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/';
const BASE_URL = 'http://127.0.0.1:8000/';
const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

// setting up the api connection thingy
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// google books api client
const googleBooksClient = axios.create({
  baseURL: GOOGLE_BOOKS_API,
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

// helper to convert Google Books data to our app format
const convertGoogleBookToAppFormat = (googleBook) => {
  const bookInfo = googleBook.volumeInfo || {};
  
  // extract fields or use defaults
  return {
    id: googleBook.id,
    title: bookInfo.title || 'Unknown Title',
    author: bookInfo.authors ? bookInfo.authors[0] : 'Unknown Author',
    genre: bookInfo.categories ? bookInfo.categories[0] : 'Fiction',
    published_year: bookInfo.publishedDate ? parseInt(bookInfo.publishedDate.substring(0, 4)) : 0,
    average_rating: bookInfo.averageRating || 0,
    reviews: [], // empty by default, will be filled with local reviews
    created_at: new Date().toISOString(),
    // Add image URL and description
    coverImage: bookInfo.imageLinks?.thumbnail || bookInfo.imageLinks?.smallThumbnail || null,
    description: bookInfo.description || "No description available for this book."
  };
};

// generate random reviews for books that don't have any
const generateRandomReviews = (bookId, numberOfReviews = 3) => {
  const usernames = ['bookworm42', 'readinglover', 'literatefan', 'pagebydawn', 'storydreamer', 'novelquest', 'wordsmith', 'booknerd', 'readaholic'];
  const reviewTemplates = [
    "omg this book was SO good!! couldn't put it down all weekend 👌",
    "honestly not my fav tbh. the plot was kinda meh and the characters were flat :(",
    "the writing style is rly unique, took a while to get used to but worth it",
    "this is one of those books that stays with u long after u finish reading",
    "started slow but OMG that ending!! totally worth it 🔥",
    "unpopular opinion but i think it's overrated. the hype made me expect more",
    "wow just wow... the author's best work yet! can't wait for the sequel",
    "dnf @ 30% lol... just couldn't connect with the main character",
    "beautifully written with incredible world-building. a new fav for sure!",
    "idk why everyone loves this so much??? the plot holes were HUGE",
    "binged it in one sitting! sleep deprived but no regrets haha",
    "this book made me cry 😭 such powerful storytelling",
    "not as good as the author's previous work but still a decent read",
    "the character development in this one is just *chef's kiss*",
    "meh. it was ok. wouldn't recommend but wouldn't say avoid either",
  ];
  
  const reviews = [];
  
  for (let i = 0; i < numberOfReviews; i++) {
    // Generate a random date within the last year
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 365));
    
    // Generate a random rating between 1-5
    const rating = Math.floor(Math.random() * 5) + 1;
    
    // Generate a random review
    const review = {
      id: bookId + '_auto_' + i,
      book: bookId,
      user: {
        id: 100 + i, // use IDs that won't conflict with real users
        username: usernames[Math.floor(Math.random() * usernames.length)]
      },
      rating: rating,
      comment: reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)],
      created_at: randomDate.toISOString(),
      updated_at: randomDate.toISOString(),
      is_auto_generated: true // flag to identify auto-generated reviews
    };
    
    reviews.push(review);
  }
  
  return reviews;
};

// book api stuff - using Google Books API
export const booksApi = {
  getAll: async (params) => {
    let query = 'subject:fiction';
    
    if (params && params.search) {
      query = params.search;
    }
    
    const response = await googleBooksClient.get('', { 
      params: { 
        q: query,
        maxResults: 40
      } 
    });
    
    // convert Google Books format to our app format
    const books = response.data.items.map(convertGoogleBookToAppFormat);
    
    // add local app data (mock reviews)
    const booksWithLocalData = books.map(book => {
      // get any stored reviews for this book
      let storedReviews = JSON.parse(localStorage.getItem(`book_${book.id}_reviews`) || '[]');
      
      // If no user reviews exist, generate some random ones and store them
      if (storedReviews.length === 0) {
        // Generate between 2-5 random reviews
        const randomReviewCount = Math.floor(Math.random() * 4) + 2;
        const autoReviews = generateRandomReviews(book.id, randomReviewCount);
        storedReviews = autoReviews;
        localStorage.setItem(`book_${book.id}_reviews`, JSON.stringify(storedReviews));
      }
      
      return {
        ...book,
        reviews: storedReviews,
        average_rating: storedReviews.length ? 
          storedReviews.reduce((sum, review) => sum + review.rating, 0) / storedReviews.length : 
          (book.average_rating || 0)
      };
    });
    
    // match our API response format
    return { data: booksWithLocalData };
  },
  
  getById: async (id) => {
    const response = await googleBooksClient.get(`/${id}`);
    
    // convert to our app format
    const book = convertGoogleBookToAppFormat(response.data);
    
    // add local reviews
    let storedReviews = JSON.parse(localStorage.getItem(`book_${book.id}_reviews`) || '[]');
    
    // If no user reviews exist, generate some random ones and store them
    if (storedReviews.length === 0) {
      // Generate between 3-7 random reviews for the detail page
      const randomReviewCount = Math.floor(Math.random() * 5) + 3;
      const autoReviews = generateRandomReviews(book.id, randomReviewCount);
      storedReviews = autoReviews;
      localStorage.setItem(`book_${book.id}_reviews`, JSON.stringify(storedReviews));
    }
    
    book.reviews = storedReviews;
    
    // calculate average from our reviews if we have any
    if (storedReviews.length > 0) {
      book.average_rating = storedReviews.reduce((sum, review) => sum + review.rating, 0) / storedReviews.length;
    }
    
    // match our API response format
    return { data: book };
  },
  
  getBookReviews: (id) => {
    // Get reviews from localStorage
    let storedReviews = JSON.parse(localStorage.getItem(`book_${id}_reviews`) || '[]');
    
    // If no reviews, generate some random ones
    if (storedReviews.length === 0) {
      const randomReviewCount = Math.floor(Math.random() * 5) + 3;
      storedReviews = generateRandomReviews(id, randomReviewCount);
      localStorage.setItem(`book_${id}_reviews`, JSON.stringify(storedReviews));
    }
    
    return { data: storedReviews };
  },
};

// review related api calls - storing reviews in localStorage
export const reviewsApi = {
  getAll: () => {
    const allReviews = [];
    // iterate through localStorage to find all reviews
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('book_') && key.endsWith('_reviews')) {
        const bookReviews = JSON.parse(localStorage.getItem(key) || '[]');
        allReviews.push(...bookReviews);
      }
    }
    return { data: allReviews };
  },
  
  getById: (id) => {
    // find the review by id in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('book_') && key.endsWith('_reviews')) {
        const bookReviews = JSON.parse(localStorage.getItem(key) || '[]');
        const review = bookReviews.find(review => review.id === parseInt(id));
        if (review) {
          return { data: review };
        }
      }
    }
    return Promise.reject(new Error('Review not found'));
  },
  
  create: (data) => {
    console.log('Creating review with data:', data);
    
    // make sure data looks right
    const formattedData = {
      ...data,
      id: Date.now(), // generate unique ID
      rating: parseInt(data.rating, 10),
      book: data.book,
      user: { id: 2, username: 'user1' }, // use user1
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // get existing reviews
    const storageKey = `book_${data.book}_reviews`;
    const existingReviews = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    // add new review
    const updatedReviews = [...existingReviews, formattedData];
    localStorage.setItem(storageKey, JSON.stringify(updatedReviews));
    
    console.log('Review stored in localStorage:', formattedData);
    return { data: formattedData };
  },
  
  update: (id, data) => {
    let updatedReview = null;
    
    // find the book that has this review
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('book_') && key.endsWith('_reviews')) {
        const bookReviews = JSON.parse(localStorage.getItem(key) || '[]');
        const reviewIndex = bookReviews.findIndex(review => review.id === parseInt(id));
        
        if (reviewIndex !== -1) {
          // found the review, update it
          const updatedReviews = [...bookReviews];
          updatedReview = {
            ...updatedReviews[reviewIndex],
            rating: parseInt(data.rating, 10),
            comment: data.comment,
            updated_at: new Date().toISOString()
          };
          
          updatedReviews[reviewIndex] = updatedReview;
          localStorage.setItem(key, JSON.stringify(updatedReviews));
          break;
        }
      }
    }
    
    if (!updatedReview) {
      return Promise.reject(new Error('Review not found'));
    }
    
    return { data: updatedReview };
  },
  
  delete: (id) => {
    // find the book that has this review
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('book_') && key.endsWith('_reviews')) {
        const bookReviews = JSON.parse(localStorage.getItem(key) || '[]');
        const reviewIndex = bookReviews.findIndex(review => review.id === parseInt(id));
        
        if (reviewIndex !== -1) {
          // found the review, remove it
          const updatedReviews = bookReviews.filter((_, index) => index !== reviewIndex);
          localStorage.setItem(key, JSON.stringify(updatedReviews));
          return { data: { success: true } };
        }
      }
    }
    
    return Promise.reject(new Error('Review not found'));
  }
};

// auth stuff - using different url for tokens
export const authApi = {
  login: (username = 'user1', password = 'password123') => {
    // Mock token generation
    const token = btoa(`${username}:${password}`);
    return Promise.resolve({ 
      data: { 
        token: token,
        user: { id: 2, username: 'user1' }
      } 
    });
  },
  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    return token ? { token, user: { id: 2, username: 'user1' } } : null;
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