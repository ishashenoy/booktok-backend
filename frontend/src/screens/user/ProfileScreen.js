import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const [stats] = useState({
    booksRead: 42,
    booksReading: 3,
    reviews: 28,
    charmsEarned: 7,
  });

  const menuItems = [
    {
      icon: 'library-outline',
      label: 'My Bookshelf',
      action: () => navigation.navigate('Bookshelf'),
    },
    {
      icon: 'settings-outline',
      label: 'Settings',
      action: () => navigation.navigate('Settings'),
    },
    {
      icon: 'help-circle-outline',
      label: 'Help & Support',
      action: () => {},
    },
    {
      icon: 'information-circle-outline',
      label: 'About BookTok',
      action: () => {},
    },
    {
      icon: 'log-out-outline',
      label: 'Logout',
      action: async () => {
        await logout();
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      },
      danger: true,
    },
  ];

  const dynamicStyles = styles(theme);

  return (
    <ScrollView style={dynamicStyles.container} contentContainerStyle={dynamicStyles.scrollContent}>
      {/* Profile Header */}
      <LinearGradient
        colors={[theme.colors.accent + '40', theme.colors.primary + '20']}
        style={dynamicStyles.header}
      >
        <View style={dynamicStyles.avatarContainer}>
          <View style={dynamicStyles.avatar}>
            <Ionicons name="person" size={60} color={theme.colors.accent} />
          </View>
        </View>
        <Text style={dynamicStyles.username}>{user?.username || 'Reader'}</Text>
        <Text style={dynamicStyles.email}>{user?.email || 'user@example.com'}</Text>
        {user?.role === 'author' && (
          <View style={dynamicStyles.authorBadge}>
            <Ionicons name="create-outline" size={16} color={theme.colors.accent} />
            <Text style={dynamicStyles.authorBadgeText}>Author</Text>
          </View>
        )}
      </LinearGradient>

      {/* Stats */}
      <View style={dynamicStyles.statsContainer}>
        <View style={dynamicStyles.statCard}>
          <Ionicons name="library" size={32} color={theme.colors.accent} />
          <Text style={dynamicStyles.statNumber}>{stats.booksRead}</Text>
          <Text style={dynamicStyles.statLabel}>Books Read</Text>
        </View>
        <View style={dynamicStyles.statCard}>
          <Ionicons name="book" size={32} color={theme.colors.accent} />
          <Text style={dynamicStyles.statNumber}>{stats.booksReading}</Text>
          <Text style={dynamicStyles.statLabel}>Reading</Text>
        </View>
        <View style={dynamicStyles.statCard}>
          <Ionicons name="star" size={32} color={theme.colors.accent} />
          <Text style={dynamicStyles.statNumber}>{stats.reviews}</Text>
          <Text style={dynamicStyles.statLabel}>Reviews</Text>
        </View>
        <View style={dynamicStyles.statCard}>
          <Ionicons name="trophy" size={32} color={theme.colors.accent} />
          <Text style={dynamicStyles.statNumber}>{stats.charmsEarned}</Text>
          <Text style={dynamicStyles.statLabel}>Charms</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={dynamicStyles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={dynamicStyles.menuItem}
            onPress={item.action}
            activeOpacity={0.7}
          >
            <View style={dynamicStyles.menuItemLeft}>
              <Ionicons
                name={item.icon}
                size={24}
                color={item.danger ? theme.colors.error : theme.colors.text}
              />
              <Text
                style={[
                  dynamicStyles.menuItemText,
                  item.danger && dynamicStyles.menuItemTextDanger,
                ]}
              >
                {item.label}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
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
    paddingTop: 40,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: theme.colors.accent,
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
    fontFamily: 'serif',
  },
  email: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  authorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent + '30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  authorBadgeText: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  menuItemTextDanger: {
    color: theme.colors.error,
  },
});
