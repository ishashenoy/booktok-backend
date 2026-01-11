# BookTok Frontend

A fully functional React Native/Expo mobile app frontend for BookTok - a TikTok-like platform for books with cozy dark academia aesthetics.

## 📁 Project Structure

```
frontend/
├── App.js                    # Main app entry point with navigation
├── app.json                  # Expo configuration
├── babel.config.js          # Babel configuration
├── package.json             # Dependencies
└── src/
    ├── config/
    │   └── constants.js     # API config & theme colors
    ├── context/
    │   ├── AuthContext.js   # Authentication state management
    │   └── ThemeContext.js  # Theme (light/dark) management
    ├── screens/
    │   ├── auth/
    │   │   ├── LoginScreen.js
    │   │   └── RegisterScreen.js
    │   ├── author/
    │   │   ├── AuthorDashboardScreen.js
    │   │   ├── AuthorUploadScreen.js
    │   │   └── AuthorAnalyticsScreen.js
    │   ├── user/
    │   │   ├── FeedScreen.js          # TikTok-like vertical feed
    │   │   ├── SearchScreen.js        # Search with AI suggestions
    │   │   ├── BookshelfScreen.js     # User library with charms
    │   │   ├── BookDetailScreen.js    # Book details & comments
    │   │   └── ProfileScreen.js
    │   └── SettingsScreen.js          # Settings, theme, language
    └── services/
        └── api.js           # API service layer

```

## 🎨 Features

### User Features
- **TikTok-like Feed**: Vertical scrolling feed with book animations
- **Search & Discovery**: AI-powered book suggestions based on reading history
- **Personal Bookshelf**: Track reading progress with customizable bookshelves
- **Charms & Rewards**: Earn charms by completing book series
- **Book Details**: View summaries, tropes, reviews, and comments
- **Spoiler-Safe Comments**: Comments filtered with spoiler protection
- **Dark/Light Theme**: Cozy dark academia aesthetic with theme toggle

### Author Features
- **Dashboard**: View analytics and performance metrics
- **Upload Books**: Upload books with cover images and summaries
- **AI Animation Generation**: Generate vibe collages and animations
- **Custom Animations**: Upload custom animation videos
- **Analytics**: Track views, likes, engagement, and drop-off points
- **Hook Intelligence**: See where readers drop off to optimize openings

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   cd booktok-backend/frontend
   npm install
   ```

2. **Configure API URL**
   - Update `src/config/constants.js` with your backend API URL
   - Default: `http://localhost:3001/api` (development)

3. **Start the App**
   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on Device/Emulator**
   ```bash
   npm run android   # Android
   npm run ios       # iOS
   npm run web       # Web browser
   ```

## 🎨 Theme

The app uses a cozy dark academia color palette:
- **Light Theme**: Warm beiges, creams, and browns (#FAF7F2, #D4A574)
- **Dark Theme**: Deep browns and sepia tones (#2C2418, #C9A082)

## 📱 Screens Overview

### Authentication
- Login/Register with email and password
- Role selection (Reader/Author)

### Feed (User)
- Vertical scrolling feed (TikTok-style)
- Like, comment, share actions
- Book covers, summaries, and tropes displayed
- Smooth animations and haptic feedback

### Search
- Real-time search functionality
- AI-powered suggestions ("We Think You'd Like...")
- Recent searches
- Trending books section

### Bookshelf
- View all books (All, Reading, Completed, Want to Read)
- Progress tracking
- Rating system
- Earned charms display
- Customizable shelves

### Book Detail
- Full book information
- Spoiler-safe comments section
- Add to library options
- Tropes and hashtags
- View/like counts

### Author Dashboard
- Performance metrics (views, likes, ratings)
- Quick actions (Upload, Analytics)
- Recent books list
- Performance highlights

### Author Upload
- Book metadata (title, summary, genre, keywords)
- Cover image upload
- AI or custom animation options
- Vibe collage generation

### Author Analytics
- Detailed analytics dashboard
- Book performance metrics
- Engagement and completion rates
- Hook Intelligence (drop-off analysis)

### Settings
- Theme toggle (Light/Dark)
- Language selection (8 languages)
- Notification preferences
- Privacy & Security settings
- Content filters
- Cache management

## 🔗 API Integration

The app connects to your backend API at:
- **Base URL**: Configured in `src/config/constants.js`
- **Endpoints Used**:
  - `/api/user/login` - User authentication
  - `/api/user/register` - User registration
  - `/api/search/books` - Search books
  - `/api/user-books` - User's reading list
  - `/api/generate/analyze` - AI animation generation

## 📦 Dependencies

- **expo**: ~50.0.0 - Expo framework
- **react-native**: 0.73.2 - React Native
- **@react-navigation**: Navigation library
- **expo-linear-gradient**: Gradient backgrounds
- **expo-image-picker**: Image selection
- **expo-haptics**: Haptic feedback
- **axios**: HTTP client
- **@react-native-async-storage**: Local storage

## 🎯 Next Steps

1. Add placeholder images in `assets/` folder (icon.png, splash.png, etc.)
2. Update API_BASE_URL in `src/config/constants.js` to match your backend
3. Install dependencies: `npm install`
4. Test the app: `npm start`

## 💡 Notes

- Mock data is included in `src/services/api.js` for demo purposes
- Some features may need backend API implementation
- The app is designed for quick demo during hackathon presentation
- All screens follow the cozy dark academia aesthetic theme
