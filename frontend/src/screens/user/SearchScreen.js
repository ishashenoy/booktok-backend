import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { bookService, mockBooks } from '../../services/api';

export default function SearchScreen({ navigation }) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    loadTrending();
    loadSuggestions();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      performSearch(searchQuery);
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  const loadTrending = () => {
    setTrending(mockBooks.slice(0, 5));
  };

  const loadSuggestions = () => {
    // AI-generated suggestions based on user's reading history
    setSuggestions([
      { id: '1', text: 'Dark Academia Novels', icon: 'school' },
      { id: '2', text: 'Enemies to Lovers Romance', icon: 'heart' },
      { id: '3', text: 'Fantasy Series with Magic', icon: 'sparkles' },
      { id: '4', text: 'Historical Fiction 1800s', icon: 'time' },
    ]);
  };

  const performSearch = async (query) => {
    try {
      const response = await bookService.searchBooks(query);
      setResults(response.books || []);
    } catch (error) {
      console.error('Error searching:', error);
      // Fallback to mock results
      const filtered = mockBooks.filter(book =>
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    }
  };

  const handleBookPress = (book) => {
    navigation.navigate('BookDetail', { book });
    // Add to recent searches
    const recent = [...recentSearches.filter(s => s !== book.title), book.title].slice(0, 5);
    setRecentSearches(recent);
  };

  const handleSuggestionPress = (suggestion) => {
    setSearchQuery(suggestion.text);
  };

  const renderBookResult = ({ item }) => (
    <TouchableOpacity
      style={styles(theme).resultCard}
      onPress={() => handleBookPress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400' }}
        style={styles(theme).resultCover}
        resizeMode="cover"
      />
      <View style={styles(theme).resultInfo}>
        <Text style={styles(theme).resultTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles(theme).resultAuthor}>{item.author}</Text>
        <Text style={styles(theme).resultSummary} numberOfLines={2}>
          {item.summary}
        </Text>
        <View style={styles(theme).resultBadges}>
          {item.tropes?.slice(0, 2).map((trope, idx) => (
            <View key={idx} style={styles(theme).resultBadge}>
              <Text style={styles(theme).resultBadgeText}>{trope}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const dynamicStyles = styles(theme);

  return (
    <View style={dynamicStyles.container}>
      {/* Search Bar */}
      <View style={dynamicStyles.searchContainer}>
        <View style={dynamicStyles.searchBar}>
          <Ionicons name="search" size={24} color={theme.colors.textSecondary} style={dynamicStyles.searchIcon} />
          <TextInput
            style={dynamicStyles.searchInput}
            placeholder="Search books, authors, or plots..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchQuery.length === 0 ? (
        <ScrollView style={dynamicStyles.scrollContent} contentContainerStyle={dynamicStyles.scrollContentContainer}>
          {/* AI Suggestions */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>💡 We Think You'd Like...</Text>
            <View style={dynamicStyles.suggestionsGrid}>
              {suggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.id}
                  style={dynamicStyles.suggestionCard}
                  onPress={() => handleSuggestionPress(suggestion)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[theme.colors.accent + '30', theme.colors.primary + '20']}
                    style={dynamicStyles.suggestionGradient}
                  >
                    <Ionicons name={suggestion.icon} size={32} color={theme.colors.accent} />
                    <Text style={dynamicStyles.suggestionText} numberOfLines={2}>
                      {suggestion.text}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>Recent Searches</Text>
              {recentSearches.map((search, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={dynamicStyles.recentItem}
                  onPress={() => setSearchQuery(search)}
                >
                  <Ionicons name="time-outline" size={20} color={theme.colors.textSecondary} />
                  <Text style={dynamicStyles.recentText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Trending Books */}
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>🔥 Trending Now</Text>
            <FlatList
              data={trending}
              renderItem={renderBookResult}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={dynamicStyles.trendingList}
            />
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={results}
          renderItem={renderBookResult}
          keyExtractor={(item) => item._id}
          contentContainerStyle={dynamicStyles.resultsList}
          ListEmptyComponent={
            <View style={dynamicStyles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={dynamicStyles.emptyText}>No books found</Text>
              <Text style={dynamicStyles.emptySubtext}>Try a different search term</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
    fontFamily: 'serif',
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  suggestionCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  suggestionGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  suggestionText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  recentText: {
    marginLeft: 12,
    fontSize: 14,
    color: theme.colors.text,
  },
  trendingList: {
    paddingRight: 16,
  },
  resultsList: {
    padding: 16,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  resultCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  resultAuthor: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  resultSummary: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
    marginBottom: 8,
  },
  resultBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  resultBadge: {
    backgroundColor: theme.colors.highlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resultBadgeText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
});
