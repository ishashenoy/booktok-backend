// API Configuration
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3001/api'  // Change to your actual backend URL
  : 'https://your-production-api.com/api';

// Theme Colors - Cozy Academia Aesthetic
export const LIGHT_THEME = {
  dark: false,
  colors: {
    // Primary colors - warm browns and beiges
    primary: '#8B7355',      // Warm brown
    accent: '#D4A574',       // Golden beige
    secondary: '#C9A082',    // Light coffee
    
    // Backgrounds - soft creams and beiges
    background: '#FAF7F2',   // Soft cream
    surface: '#F5F1E8',      // Warm beige
    card: '#FFFFFF',         // Pure white for cards
    
    // Text colors
    text: '#3D2B1F',         // Dark brown
    textSecondary: '#6B5B4A', // Medium brown
    textLight: '#9B8B7A',    // Light brown
    
    // UI elements
    border: '#E8DFD1',       // Soft border
    shadow: '#3D2B1F15',     // Subtle shadow
    
    // Status colors
    success: '#8B9A5B',      // Sage green
    warning: '#D4A574',      // Golden
    error: '#C17A7A',        // Soft red
    info: '#7A9AAA',         // Soft blue
    
    // Interactive
    buttonPrimary: '#8B7355',
    buttonSecondary: '#D4A574',
    buttonText: '#FFFFFF',
    
    // Special
    highlight: '#F4E6D1',    // Highlight background
    overlay: '#3D2B1F80',    // Overlay
  }
};

export const DARK_THEME = {
  dark: true,
  colors: {
    // Primary colors - deep browns and sepia
    primary: '#A68B6B',      // Muted brown
    accent: '#C9A082',       // Warm beige
    secondary: '#8B7355',    // Medium brown
    
    // Backgrounds - dark library vibes
    background: '#2C2418',   // Dark brown
    surface: '#3D2B1F',      // Medium dark brown
    card: '#4A3A2C',         // Dark card
    
    // Text colors
    text: '#F5F1E8',         // Cream text
    textSecondary: '#C9A082', // Muted beige
    textLight: '#8B7355',    // Light brown
    
    // UI elements
    border: '#5A4A3A',       // Dark border
    shadow: '#00000040',     // Dark shadow
    
    // Status colors
    success: '#A6B57A',      // Sage green
    warning: '#C9A082',      // Golden
    error: '#C17A7A',        // Soft red
    info: '#7A9AAA',         // Soft blue
    
    // Interactive
    buttonPrimary: '#A68B6B',
    buttonSecondary: '#C9A082',
    buttonText: '#2C2418',
    
    // Special
    highlight: '#5A4A3A',    // Highlight background
    overlay: '#00000080',    // Overlay
  }
};
