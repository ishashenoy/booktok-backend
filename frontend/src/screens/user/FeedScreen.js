import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { mockBooks, bookService } from '../../services/api';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_HEIGHT = SCREEN_HEIGHT;

export default function FeedScreen({ navigation }) {
  const { theme } = useTheme();
  const [books, setBooks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      // In demo, use mock data; in production, fetch from API
      const response = await mockBooks; // await bookService.searchBooks('');
      setBooks(response);
    } catch (error) {
      console.error('Error loading books:', error);
      // Fallback to mock data
      setBooks(mockBooks);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleLike = async (bookId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement like functionality
  };

  const handleComment = (book) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('BookDetail', { book });
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Implement share functionality
  };

  const renderBook = ({ item, index }) => (
    <FeedItem
      book={item}
      index={index}
      currentIndex={currentIndex}
      onLike={handleLike}
      onComment={handleComment}
      onShare={handleShare}
      theme={theme}
      navigation={navigation}
    />
  );

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item._id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />
    </View>
  );
}

function FeedItem({ book, index, currentIndex, onLike, onComment, onShare, theme, navigation }) {
  const [isLiked, setIsLiked] = useState(false);
  const likeScale = useRef(new Animated.Value(1)).current;

  const handleLikePress = () => {
    setIsLiked(!isLiked);
    Animated.sequence([
      Animated.spring(likeScale, {
        toValue: 1.3,
        useNativeDriver: true,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
    onLike(book._id);
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.itemContainer}>
      {/* Cover Image/Animation Background */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: book.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400' }}
          style={styles.coverImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', theme.colors.background + 'E6', theme.colors.background]}
          style={styles.gradientOverlay}
        />
      </View>

      {/* Book Info Overlay */}
      <View style={styles.infoContainer}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={handleLikePress} activeOpacity={0.8}>
            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={32}
                color={isLiked ? theme.colors.error : theme.colors.text}
                style={styles.actionIcon}
              />
            </Animated.View>
          </TouchableOpacity>
          <Text style={styles.actionCount}>{book.likes || 0}</Text>

          <TouchableOpacity onPress={() => onComment(book)} activeOpacity={0.8}>
            <Ionicons name="chatbubble-outline" size={28} color={theme.colors.text} style={styles.actionIcon} />
          </TouchableOpacity>
          <Text style={styles.actionCount}>42</Text>

          <TouchableOpacity onPress={onShare} activeOpacity={0.8}>
            <Ionicons name="share-outline" size={28} color={theme.colors.text} style={styles.actionIcon} />
          </TouchableOpacity>
          <Text style={styles.actionCount}>Share</Text>

          {/* Scroll indicator */}
          <View style={styles.scrollIndicator}>
            <Ionicons name="book-outline" size={24} color={theme.colors.textSecondary} />
          </View>
        </View>

        <View style={styles.rightSection}>
          {/* Author Avatar */}
          <View style={styles.authorAvatar}>
            <Ionicons name="person-circle" size={50} color={theme.colors.accent} />
          </View>

          {/* Book Title & Author */}
          <Text style={styles.bookTitle} numberOfLines={2}>
            {book.title}
          </Text>
          <Text style={styles.authorName}>{book.author}</Text>

          {/* Genre Badge */}
          <View style={styles.genreBadge}>
            <Text style={styles.genreText}>{book.genre}</Text>
          </View>

          {/* Summary */}
          <Text style={styles.summary} numberOfLines={3}>
            {book.summary}
          </Text>

          {/* Tropes/Hashtags */}
          <View style={styles.tropesContainer}>
            {book.tropes?.slice(0, 3).map((trope, idx) => (
              <TouchableOpacity key={idx} style={styles.tropeBadge}>
                <Text style={styles.tropeText}>{trope}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => navigation.navigate('BookDetail', { book })}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.accent, theme.colors.primary]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>View Details</Text>
              <Ionicons name="arrow-forward" size={20} color={theme.colors.buttonText} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    width: SCREEN_WIDTH,
    position: 'relative',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 0.6,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: ITEM_HEIGHT * 0.5,
  },
  leftSection: {
    alignItems: 'center',
    marginRight: 16,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionCount: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 16,
  },
  scrollIndicator: {
    marginTop: 24,
    opacity: 0.6,
  },
  rightSection: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  authorAvatar: {
    marginBottom: 12,
  },
  bookTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    fontFamily: 'serif',
  },
  authorName: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  genreBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.accent + '30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  genreText: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summary: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  tropesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  tropeBadge: {
    backgroundColor: theme.colors.highlight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tropeText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  viewButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
});
