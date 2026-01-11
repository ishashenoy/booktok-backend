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
import { userBookService } from '../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BookshelfScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [userBooks, setUserBooks] = useState([]);
  const [charms, setCharms] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);

  useEffect(() => {
    loadUserBooks();
    loadCharms();
  }, []);

  const loadUserBooks = async () => {
    try {
      const response = await userBookService.getUserBooks();
      setUserBooks(response.userBooks || []);
      setTotalBooks(response.userBooks?.length || 0);
    } catch (error) {
      console.error('Error loading user books:', error);
      // Mock data for demo
      setUserBooks([
        {
          _id: '1',
          book: {
            _id: '1',
            title: 'The Midnight Library',
            coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
          },
          status: 'completed',
          rating: 5,
        },
        {
          _id: '2',
          book: {
            _id: '2',
            title: 'Shadow and Bone',
            coverImage: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400',
          },
          status: 'reading',
          progress: 45,
        },
      ]);
      setTotalBooks(2);
    }
  };

  const loadCharms = () => {
    // Mock charms - earned by completing series
    setCharms([
      { id: '1', name: 'Midnight Charm', icon: 'moon', series: 'The Midnight Library Series', earned: true },
      { id: '2', name: 'Shadow Charm', icon: 'star', series: 'Grishaverse', earned: false },
      { id: '3', name: 'Evelyn Charm', icon: 'sparkles', series: 'Evelyn Hugo', earned: true },
    ]);
  };

  const filteredBooks = userBooks.filter(ub => {
    if (activeTab === 'all') return true;
    return ub.status === activeTab;
  });

  const renderBook = ({ item }) => (
    <TouchableOpacity
      style={styles(theme).bookCard}
      onPress={() => navigation.navigate('BookDetail', { book: item.book })}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.book?.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400' }}
        style={styles(theme).bookCover}
        resizeMode="cover"
      />
      <View style={styles(theme).bookInfo}>
        <Text style={styles(theme).bookTitle} numberOfLines={2}>
          {item.book?.title || 'Unknown Book'}
        </Text>
        <View style={styles(theme).statusBadge}>
          <Text style={styles(theme).statusText}>
            {item.status === 'completed' ? '✓ Read' : 
             item.status === 'reading' ? '📖 Reading' : 
             '📚 Want to Read'}
          </Text>
        </View>
        {item.rating && (
          <View style={styles(theme).ratingContainer}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < item.rating ? 'star' : 'star-outline'}
                size={16}
                color={theme.colors.accent}
              />
            ))}
          </View>
        )}
        {item.progress > 0 && item.status === 'reading' && (
          <View style={styles(theme).progressContainer}>
            <View style={styles(theme).progressBar}>
              <View
                style={[
                  styles(theme).progressFill,
                  { width: `${item.progress}%` },
                ]}
              />
            </View>
            <Text style={styles(theme).progressText}>{item.progress}%</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderCharm = ({ item }) => (
    <View style={styles(theme).charmCard}>
      <View style={[
        styles(theme).charmIcon,
        !item.earned && styles(theme).charmIconLocked,
      ]}>
        <Ionicons
          name={item.earned ? item.icon : 'lock-closed'}
          size={40}
          color={item.earned ? theme.colors.accent : theme.colors.textSecondary}
        />
      </View>
      <Text style={styles(theme).charmName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles(theme).charmSeries} numberOfLines={1}>
        {item.series}
      </Text>
      {!item.earned && (
        <Text style={styles(theme).charmLocked}>Locked</Text>
      )}
    </View>
  );

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'reading', label: 'Reading' },
    { key: 'completed', label: 'Completed' },
    { key: 'want_to_read', label: 'Want to Read' },
  ];

  const dynamicStyles = styles(theme);

  return (
    <ScrollView style={dynamicStyles.container} contentContainerStyle={dynamicStyles.scrollContent}>
      {/* Header Stats */}
      <LinearGradient
        colors={[theme.colors.accent + '40', theme.colors.primary + '20']}
        style={dynamicStyles.header}
      >
        <View style={dynamicStyles.statsContainer}>
          <View style={dynamicStyles.statItem}>
            <Ionicons name="library" size={32} color={theme.colors.accent} />
            <Text style={dynamicStyles.statNumber}>{totalBooks}</Text>
            <Text style={dynamicStyles.statLabel}>Books</Text>
          </View>
          <View style={dynamicStyles.statItem}>
            <Ionicons name="trophy" size={32} color={theme.colors.accent} />
            <Text style={dynamicStyles.statNumber}>{charms.filter(c => c.earned).length}</Text>
            <Text style={dynamicStyles.statLabel}>Charms</Text>
          </View>
          <View style={dynamicStyles.statItem}>
            <Ionicons name="flame" size={32} color={theme.colors.accent} />
            <Text style={dynamicStyles.statNumber}>
              {userBooks.filter(ub => ub.status === 'reading').length}
            </Text>
            <Text style={dynamicStyles.statLabel}>Active</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={dynamicStyles.tabsContainer}
        contentContainerStyle={dynamicStyles.tabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              dynamicStyles.tab,
              activeTab === tab.key && dynamicStyles.tabActive,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                dynamicStyles.tabText,
                activeTab === tab.key && dynamicStyles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bookshelf Grid */}
      <View style={dynamicStyles.bookshelfContainer}>
        <View style={dynamicStyles.bookshelfTop} />
        <FlatList
          data={filteredBooks}
          renderItem={renderBook}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={dynamicStyles.bookRow}
          scrollEnabled={false}
        />
      </View>

      {/* Charms Section */}
      <View style={dynamicStyles.charmsSection}>
        <Text style={dynamicStyles.sectionTitle}>Earned Charms</Text>
        <Text style={dynamicStyles.sectionSubtitle}>
          Complete book series to unlock special charms for your library!
        </Text>
        <FlatList
          data={charms}
          renderItem={renderCharm}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={dynamicStyles.charmsList}
        />
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: theme.colors.buttonText,
    fontWeight: '600',
  },
  bookshelfContainer: {
    padding: 16,
    marginTop: 16,
  },
  bookshelfTop: {
    height: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
    marginBottom: 16,
  },
  bookRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bookCard: {
    width: (SCREEN_WIDTH - 48) / 2,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
  },
  bookCover: {
    width: '100%',
    height: 200,
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
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.highlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
  },
  progressText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  charmsSection: {
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    fontFamily: 'serif',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  charmsList: {
    paddingRight: 16,
  },
  charmCard: {
    width: 120,
    alignItems: 'center',
    marginRight: 16,
    padding: 12,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  charmIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  charmIconLocked: {
    backgroundColor: theme.colors.border,
    opacity: 0.5,
  },
  charmName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  charmSeries: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  charmLocked: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});
