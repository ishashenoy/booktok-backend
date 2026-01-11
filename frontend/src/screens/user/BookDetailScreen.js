import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { bookService, userBookService } from '../../services/api';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BookDetailScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { book: initialBook } = route.params;
  
  const [book, setBook] = useState(initialBook);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [userBookStatus, setUserBookStatus] = useState(null);
  const [showSpoilerComments, setShowSpoilerComments] = useState(false);

  useEffect(() => {
    loadBookDetails();
    loadComments();
    checkUserBookStatus();
  }, []);

  const loadBookDetails = async () => {
    try {
      const response = await bookService.getBookById(book._id);
      setBook(response.book);
    } catch (error) {
      console.error('Error loading book:', error);
    }
  };

  const loadComments = () => {
    // Mock comments - in production, fetch from API
    setComments([
      {
        _id: '1',
        user: { username: 'BookLover23' },
        text: 'This book changed my life! The characters are so well-developed.',
        isSpoiler: false,
        createdAt: new Date(),
      },
      {
        _id: '2',
        user: { username: 'ReadingQueen' },
        text: '[SPOILER] I can\'t believe what happened in chapter 7!',
        isSpoiler: true,
        createdAt: new Date(),
      },
    ]);
  };

  const checkUserBookStatus = async () => {
    try {
      const response = await userBookService.getUserBooks();
      const userBook = response.userBooks.find(ub => ub.book._id === book._id);
      if (userBook) {
        setUserBookStatus(userBook.status);
      }
    } catch (error) {
      console.error('Error checking user book status:', error);
    }
  };

  const handleAddToLibrary = async (status) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await userBookService.addUserBook(book._id, status);
      setUserBookStatus(status);
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      _id: Date.now().toString(),
      user: { username: user?.username || 'You' },
      text: newComment,
      isSpoiler: newComment.toLowerCase().includes('[spoiler]'),
      createdAt: new Date(),
    };

    setComments([comment, ...comments]);
    setNewComment('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleToggleLike = () => {
    setIsLiked(!isLiked);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderComment = ({ item }) => {
    const [showSpoiler, setShowSpoiler] = useState(false);
    const isSpoiler = item.isSpoiler || item.text.toLowerCase().includes('[spoiler]');

    return (
      <View style={styles(theme).commentItem}>
        <View style={styles(theme).commentHeader}>
          <Text style={styles(theme).commentUsername}>{item.user.username}</Text>
          {isSpoiler && (
            <View style={styles(theme).spoilerBadge}>
              <Text style={styles(theme).spoilerText}>SPOILER</Text>
            </View>
          )}
        </View>
        {isSpoiler && !showSpoiler ? (
          <TouchableOpacity
            style={styles(theme).spoilerBlur}
            onPress={() => setShowSpoiler(true)}
          >
            <Text style={styles(theme).spoilerButtonText}>
              Tap to reveal spoiler
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles(theme).commentText}>{item.text}</Text>
        )}
      </View>
    );
  };

  const styles = (theme) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    coverSection: {
      width: '100%',
      height: 300,
      position: 'relative',
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
      height: 100,
    },
    actionButtons: {
      flexDirection: 'row',
      padding: 16,
      gap: 12,
    },
    actionButton: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    actionButtonActive: {
      backgroundColor: theme.colors.accent + '30',
      borderColor: theme.colors.accent,
    },
    actionButtonText: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '500',
      marginTop: 4,
    },
    contentSection: {
      padding: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
      fontFamily: 'serif',
    },
    author: {
      fontSize: 20,
      color: theme.colors.textSecondary,
      marginBottom: 16,
      fontStyle: 'italic',
    },
    metadataContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 20,
      gap: 8,
    },
    metadataBadge: {
      backgroundColor: theme.colors.highlight,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    metadataText: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginTop: 24,
      marginBottom: 12,
      fontFamily: 'serif',
    },
    summary: {
      fontSize: 16,
      color: theme.colors.text,
      lineHeight: 24,
      marginBottom: 20,
    },
    tropesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 20,
      gap: 8,
    },
    tropeBadge: {
      backgroundColor: theme.colors.accent + '30',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
    },
    tropeText: {
      color: theme.colors.accent,
      fontSize: 14,
      fontWeight: '600',
    },
    commentsSection: {
      marginTop: 20,
    },
    commentInputContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    commentInput: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 14,
      maxHeight: 100,
    },
    submitButton: {
      marginLeft: 8,
      paddingHorizontal: 16,
      justifyContent: 'center',
    },
    commentItem: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    commentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    commentUsername: {
      fontWeight: '600',
      color: theme.colors.text,
      fontSize: 14,
    },
    spoilerBadge: {
      backgroundColor: theme.colors.error,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    spoilerText: {
      color: '#FFF',
      fontSize: 10,
      fontWeight: 'bold',
    },
    spoilerBlur: {
      backgroundColor: theme.colors.border,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    spoilerButtonText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontStyle: 'italic',
    },
    commentText: {
      color: theme.colors.text,
      fontSize: 14,
      lineHeight: 20,
    },
  });

  const dynamicStyles = styles(theme);

  return (
    <ScrollView style={dynamicStyles.container} contentContainerStyle={dynamicStyles.scrollContent}>
      {/* Cover Image */}
      <View style={dynamicStyles.coverSection}>
        <Image
          source={{ uri: book.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400' }}
          style={dynamicStyles.coverImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', theme.colors.background]}
          style={dynamicStyles.gradientOverlay}
        />
      </View>

      {/* Quick Actions */}
      <View style={dynamicStyles.actionButtons}>
        <TouchableOpacity
          style={[dynamicStyles.actionButton, isLiked && dynamicStyles.actionButtonActive]}
          onPress={handleToggleLike}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={isLiked ? theme.colors.error : theme.colors.text}
          />
          <Text style={dynamicStyles.actionButtonText}>Like</Text>
        </TouchableOpacity>

        {!userBookStatus ? (
          <>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={() => handleAddToLibrary('want_to_read')}
            >
              <Ionicons name="bookmark-outline" size={24} color={theme.colors.text} />
              <Text style={dynamicStyles.actionButtonText}>Want to Read</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={() => handleAddToLibrary('reading')}
            >
              <Ionicons name="book-outline" size={24} color={theme.colors.text} />
              <Text style={dynamicStyles.actionButtonText}>Start Reading</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={[dynamicStyles.actionButton, dynamicStyles.actionButtonActive]}>
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.accent} />
            <Text style={dynamicStyles.actionButtonText}>
              {userBookStatus === 'completed' ? 'Completed' : 'In Library'}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={dynamicStyles.contentSection}>
        <Text style={dynamicStyles.title}>{book.title}</Text>
        <Text style={dynamicStyles.author}>by {book.author}</Text>

        <View style={dynamicStyles.metadataContainer}>
          <View style={dynamicStyles.metadataBadge}>
            <Text style={dynamicStyles.metadataText}>{book.genre}</Text>
          </View>
          <View style={dynamicStyles.metadataBadge}>
            <Text style={dynamicStyles.metadataText}>⭐ {(book.rating || 4.5).toFixed(1)}</Text>
          </View>
          <View style={dynamicStyles.metadataBadge}>
            <Text style={dynamicStyles.metadataText}>👁️ {book.views || 0} views</Text>
          </View>
        </View>

        <Text style={dynamicStyles.sectionTitle}>Summary</Text>
        <Text style={dynamicStyles.summary}>{book.summary}</Text>

        {book.tropes && book.tropes.length > 0 && (
          <>
            <Text style={dynamicStyles.sectionTitle}>Tropes & Themes</Text>
            <View style={dynamicStyles.tropesContainer}>
              {book.tropes.map((trope, idx) => (
                <TouchableOpacity key={idx} style={dynamicStyles.tropeBadge}>
                  <Text style={dynamicStyles.tropeText}>{trope}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Comments Section */}
        <View style={dynamicStyles.commentsSection}>
          <Text style={dynamicStyles.sectionTitle}>Comments</Text>

          <View style={dynamicStyles.commentInputContainer}>
            <TextInput
              style={dynamicStyles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor={theme.colors.textSecondary}
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity
              style={dynamicStyles.submitButton}
              onPress={handleSubmitComment}
            >
              <Ionicons name="send" size={24} color={theme.colors.accent} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        </View>
      </View>
    </ScrollView>
  );
}
