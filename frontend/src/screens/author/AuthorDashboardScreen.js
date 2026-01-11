import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { bookService } from '../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AuthorDashboardScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBooks: 12,
    totalViews: 45200,
    totalLikes: 8450,
    avgRating: 4.6,
  });
  const [recentBooks, setRecentBooks] = useState([]);

  useEffect(() => {
    loadAuthorBooks();
  }, []);

  const loadAuthorBooks = async () => {
    try {
      // In production, fetch author's books
      // For now, use mock data
      setRecentBooks([
        {
          _id: '1',
          title: 'My First Novel',
          coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
          views: 12000,
          likes: 2300,
          rating: 4.8,
          status: 'published',
        },
      ]);
    } catch (error) {
      console.error('Error loading author books:', error);
    }
  };

  const renderBook = ({ item }) => (
    <TouchableOpacity
      style={styles(theme).bookCard}
      onPress={() => navigation.navigate('BookDetail', { book: item })}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400' }}
        style={styles(theme).bookCover}
        resizeMode="cover"
      />
      <View style={styles(theme).bookInfo}>
        <Text style={styles(theme).bookTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles(theme).bookStats}>
          <View style={styles(theme).stat}>
            <Ionicons name="eye-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles(theme).statText}>{item.views.toLocaleString()}</Text>
          </View>
          <View style={styles(theme).stat}>
            <Ionicons name="heart-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles(theme).statText}>{item.likes.toLocaleString()}</Text>
          </View>
          <View style={styles(theme).stat}>
            <Ionicons name="star" size={16} color={theme.colors.accent} />
            <Text style={styles(theme).statText}>{item.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const dynamicStyles = styles(theme);

  return (
    <ScrollView style={dynamicStyles.container} contentContainerStyle={dynamicStyles.scrollContent}>
      {/* Welcome Header */}
      <LinearGradient
        colors={[theme.colors.accent + '40', theme.colors.primary + '20']}
        style={dynamicStyles.header}
      >
        <Text style={dynamicStyles.welcomeText}>Welcome back, {user?.username || 'Author'}!</Text>
        <Text style={dynamicStyles.subtitleText}>Your writing journey continues</Text>
      </LinearGradient>

      {/* Stats Overview */}
      <View style={dynamicStyles.statsContainer}>
        <View style={dynamicStyles.statCard}>
          <LinearGradient
            colors={[theme.colors.accent + '30', theme.colors.primary + '20']}
            style={dynamicStyles.statCardGradient}
          >
            <Ionicons name="library" size={32} color={theme.colors.accent} />
            <Text style={dynamicStyles.statNumber}>{stats.totalBooks}</Text>
            <Text style={dynamicStyles.statLabel}>Total Books</Text>
          </LinearGradient>
        </View>
        <View style={dynamicStyles.statCard}>
          <LinearGradient
            colors={[theme.colors.accent + '30', theme.colors.primary + '20']}
            style={dynamicStyles.statCardGradient}
          >
            <Ionicons name="eye" size={32} color={theme.colors.accent} />
            <Text style={dynamicStyles.statNumber}>
              {(stats.totalViews / 1000).toFixed(1)}K
            </Text>
            <Text style={dynamicStyles.statLabel}>Total Views</Text>
          </LinearGradient>
        </View>
        <View style={dynamicStyles.statCard}>
          <LinearGradient
            colors={[theme.colors.accent + '30', theme.colors.primary + '20']}
            style={dynamicStyles.statCardGradient}
          >
            <Ionicons name="heart" size={32} color={theme.colors.error} />
            <Text style={dynamicStyles.statNumber}>
              {(stats.totalLikes / 1000).toFixed(1)}K
            </Text>
            <Text style={dynamicStyles.statLabel}>Total Likes</Text>
          </LinearGradient>
        </View>
        <View style={dynamicStyles.statCard}>
          <LinearGradient
            colors={[theme.colors.accent + '30', theme.colors.primary + '20']}
            style={dynamicStyles.statCardGradient}
          >
            <Ionicons name="star" size={32} color={theme.colors.accent} />
            <Text style={dynamicStyles.statNumber}>{stats.avgRating.toFixed(1)}</Text>
            <Text style={dynamicStyles.statLabel}>Avg Rating</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={dynamicStyles.actionsContainer}>
        <TouchableOpacity
          style={dynamicStyles.actionButton}
          onPress={() => navigation.navigate('Upload')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme.colors.accent, theme.colors.primary]}
            style={dynamicStyles.actionGradient}
          >
            <Ionicons name="add-circle" size={32} color={theme.colors.buttonText} />
            <Text style={dynamicStyles.actionText}>Upload New Book</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={dynamicStyles.actionButtonSecondary}
          onPress={() => navigation.navigate('Analytics')}
          activeOpacity={0.8}
        >
          <Ionicons name="analytics" size={28} color={theme.colors.accent} />
          <Text style={dynamicStyles.actionTextSecondary}>View Analytics</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Books */}
      <View style={dynamicStyles.section}>
        <View style={dynamicStyles.sectionHeader}>
          <Text style={dynamicStyles.sectionTitle}>Your Books</Text>
          <TouchableOpacity>
            <Text style={dynamicStyles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={recentBooks}
          renderItem={renderBook}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={dynamicStyles.booksList}
        />
      </View>

      {/* Performance Highlights */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Performance Highlights</Text>
        <View style={dynamicStyles.highlightCard}>
          <Ionicons name="trending-up" size={32} color={theme.colors.success} />
          <View style={dynamicStyles.highlightContent}>
            <Text style={dynamicStyles.highlightTitle}>Views up 23% this week!</Text>
            <Text style={dynamicStyles.highlightSubtext}>
              Your latest book is gaining traction
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    fontFamily: 'serif',
  },
  subtitleText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statCardGradient: {
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  actionText: {
    color: theme.colors.buttonText,
    fontSize: 18,
    fontWeight: '600',
  },
  actionButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  actionTextSecondary: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    padding: 16,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: 'serif',
  },
  seeAllText: {
    fontSize: 14,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  booksList: {
    paddingRight: 16,
  },
  bookCard: {
    width: 180,
    marginRight: 16,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bookCover: {
    width: '100%',
    height: 240,
  },
  bookInfo: {
    padding: 12,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  bookStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  highlightCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    gap: 16,
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  highlightSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});
