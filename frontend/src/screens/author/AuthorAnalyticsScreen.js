import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AuthorAnalyticsScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const [analytics, setAnalytics] = useState({
    totalBooks: 12,
    totalViews: 45200,
    totalLikes: 8450,
    avgRating: 4.6,
    engagementRate: 18.7,
    completionRate: 65.3,
  });

  const [bookAnalytics] = useState([
    {
      id: '1',
      title: 'My First Novel',
      views: 12000,
      likes: 2300,
      comments: 450,
      shares: 120,
      avgWatchTime: 85,
      dropOffPoint: 'Chapter 3',
    },
    {
      id: '2',
      title: 'Second Book',
      views: 8500,
      likes: 1800,
      comments: 320,
      shares: 95,
      avgWatchTime: 78,
      dropOffPoint: 'Chapter 5',
    },
  ]);

  const dynamicStyles = styles(theme);

  return (
    <ScrollView style={dynamicStyles.container} contentContainerStyle={dynamicStyles.scrollContent}>
      {/* Overview Stats */}
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>Analytics Dashboard</Text>
        <Text style={dynamicStyles.headerSubtitle}>Track your book performance</Text>
      </View>

      {/* Key Metrics */}
      <View style={dynamicStyles.metricsContainer}>
        <View style={dynamicStyles.metricCard}>
          <LinearGradient
            colors={[theme.colors.accent + '30', theme.colors.primary + '20']}
            style={dynamicStyles.metricGradient}
          >
            <Ionicons name="eye" size={32} color={theme.colors.accent} />
            <Text style={dynamicStyles.metricValue}>
              {(analytics.totalViews / 1000).toFixed(1)}K
            </Text>
            <Text style={dynamicStyles.metricLabel}>Total Views</Text>
          </LinearGradient>
        </View>
        <View style={dynamicStyles.metricCard}>
          <LinearGradient
            colors={[theme.colors.accent + '30', theme.colors.primary + '20']}
            style={dynamicStyles.metricGradient}
          >
            <Ionicons name="heart" size={32} color={theme.colors.error} />
            <Text style={dynamicStyles.metricValue}>
              {(analytics.totalLikes / 1000).toFixed(1)}K
            </Text>
            <Text style={dynamicStyles.metricLabel}>Total Likes</Text>
          </LinearGradient>
        </View>
        <View style={dynamicStyles.metricCard}>
          <LinearGradient
            colors={[theme.colors.accent + '30', theme.colors.primary + '20']}
            style={dynamicStyles.metricGradient}
          >
            <Ionicons name="trending-up" size={32} color={theme.colors.success} />
            <Text style={dynamicStyles.metricValue}>{analytics.engagementRate}%</Text>
            <Text style={dynamicStyles.metricLabel}>Engagement</Text>
          </LinearGradient>
        </View>
        <View style={dynamicStyles.metricCard}>
          <LinearGradient
            colors={[theme.colors.accent + '30', theme.colors.primary + '20']}
            style={dynamicStyles.metricGradient}
          >
            <Ionicons name="checkmark-circle" size={32} color={theme.colors.success} />
            <Text style={dynamicStyles.metricValue}>{analytics.completionRate}%</Text>
            <Text style={dynamicStyles.metricLabel}>Completion</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Book Performance */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Book Performance</Text>
        {bookAnalytics.map((book) => (
          <View key={book.id} style={dynamicStyles.bookAnalyticsCard}>
            <Text style={dynamicStyles.bookTitle}>{book.title}</Text>
            <View style={dynamicStyles.bookStats}>
              <View style={dynamicStyles.statRow}>
                <Ionicons name="eye-outline" size={18} color={theme.colors.textSecondary} />
                <Text style={dynamicStyles.statText}>{book.views.toLocaleString()} views</Text>
              </View>
              <View style={dynamicStyles.statRow}>
                <Ionicons name="heart-outline" size={18} color={theme.colors.error} />
                <Text style={dynamicStyles.statText}>{book.likes.toLocaleString()} likes</Text>
              </View>
              <View style={dynamicStyles.statRow}>
                <Ionicons name="chatbubble-outline" size={18} color={theme.colors.textSecondary} />
                <Text style={dynamicStyles.statText}>{book.comments} comments</Text>
              </View>
              <View style={dynamicStyles.statRow}>
                <Ionicons name="share-outline" size={18} color={theme.colors.textSecondary} />
                <Text style={dynamicStyles.statText}>{book.shares} shares</Text>
              </View>
            </View>
            <View style={dynamicStyles.dropOffSection}>
              <Text style={dynamicStyles.dropOffLabel}>⚠️ Drop-off Point:</Text>
              <Text style={dynamicStyles.dropOffText}>{book.dropOffPoint}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Hook Intelligence Section */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Hook Intelligence</Text>
        <View style={dynamicStyles.hookCard}>
          <Ionicons name="analytics-outline" size={48} color={theme.colors.accent} />
          <Text style={dynamicStyles.hookTitle}>Optimize Your Opening</Text>
          <Text style={dynamicStyles.hookText}>
            Track where readers drop off in your animated previews and opening chapters to optimize your story's hook for maximum engagement.
          </Text>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    fontFamily: 'serif',
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  metricCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metricGradient: {
    padding: 20,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  section: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
    fontFamily: 'serif',
  },
  bookAnalyticsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  bookStats: {
    gap: 8,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  dropOffSection: {
    backgroundColor: theme.colors.warning + '20',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  dropOffLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  dropOffText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  hookCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  hookTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'serif',
  },
  hookText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
