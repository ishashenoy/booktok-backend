import { api } from '../context/AuthContext';

// Book Services
export const bookService = {
  // Search books
  searchBooks: async (query) => {
    const response = await api.get('/search/books', { params: { q: query } });
    return response.data;
  },

  // Get book by ID
  getBookById: async (id) => {
    const response = await api.get(`/search/books/${id}`);
    return response.data;
  },

  // Create book (author only)
  createBook: async (bookData) => {
    const response = await api.post('/search/books', bookData);
    return response.data;
  },

  // Update book (author only)
  updateBook: async (id, bookData) => {
    const response = await api.patch(`/search/books/${id}`, bookData);
    return response.data;
  },
};

// User Book Services (reading list, progress, etc.)
export const userBookService = {
  // Get user's books
  getUserBooks: async () => {
    const response = await api.get('/user-books');
    return response.data;
  },

  // Add book to user's collection
  addUserBook: async (bookId, status = 'to-read', progress = 0) => {
    const response = await api.post('/user-books', {
      book: bookId,
      status,
      progress,
    });
    return response.data;
  },

  // Update user book (status, rating, review, progress)
  updateUserBook: async (userBookId, updates) => {
    const response = await api.patch(`/user-books/${userBookId}`, updates);
    return response.data;
  },

  // Remove book from user's collection
  removeUserBook: async (userBookId) => {
    const response = await api.delete(`/user-books/${userBookId}`);
    return response.data;
  },
};

// Animation/AI Services
export const animationService = {
  // Analyze book and generate animation spec
  analyzeBook: async (bookData) => {
    const response = await api.post('/generate/analyze', bookData);
    return response.data;
  },

  // Generate animation specification
  generateAnimationSpec: async (bookData) => {
    const response = await api.post('/generate/animation-spec', bookData);
    return response.data;
  },
};

// Mock data for demo purposes
export const mockBooks = [
  {
    _id: '1',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    summary: 'Between life and death there is a library, and within that library, the shelves go on forever...',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
    genre: 'Fiction',
    keywords: ['philosophy', 'second-chances', 'library', 'life-choices'],
    tropes: ['#secondchance', '#magicalrealism', '#selfdiscovery'],
    likes: 1250,
    views: 8900,
    animationUrl: null,
  },
  {
    _id: '2',
    title: 'The Seven Husbands of Evelyn Hugo',
    author: 'Taylor Jenkins Reid',
    summary: 'Reclusive Hollywood movie icon Evelyn Hugo is finally ready to tell the truth about her glamorous and scandalous life...',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    genre: 'Historical Fiction',
    keywords: ['hollywood', 'secrets', 'love', 'lgbtq+'],
    tropes: ['#enemiestolovers', '#hollywoodglamour', '#lgbtq'],
    likes: 2100,
    views: 15200,
    animationUrl: null,
  },
  {
    _id: '3',
    title: 'Shadow and Bone',
    author: 'Leigh Bardugo',
    summary: 'Soldier. Summoner. Saint. Alina Starkov is a soldier, but when her regiment is attacked on the Fold, she reveals a dormant power...',
    coverImage: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400',
    genre: 'Fantasy',
    keywords: ['magic', 'grisha', 'russia', 'chosen-one'],
    tropes: ['#fantasy', '#magic', '#chosenone', '#darkacademia'],
    likes: 3500,
    views: 24500,
    animationUrl: null,
  },
];
