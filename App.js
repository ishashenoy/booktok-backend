import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { API_BASE_URL } from './src/config/constants';

// Auth Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

// User Screens
import FeedScreen from './src/screens/user/FeedScreen';
import SearchScreen from './src/screens/user/SearchScreen';
import BookshelfScreen from './src/screens/user/BookshelfScreen';
import ProfileScreen from './src/screens/user/ProfileScreen';
import BookDetailScreen from './src/screens/user/BookDetailScreen';

// Author Screens
import AuthorDashboardScreen from './src/screens/author/AuthorDashboardScreen';
import AuthorUploadScreen from './src/screens/author/AuthorUploadScreen';
import AuthorAnalyticsScreen from './src/screens/author/AuthorAnalyticsScreen';

// Settings
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { theme } = useTheme();
  const { user } = useAuth();

  if (user?.role === 'author') {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'AuthorFeed') iconName = 'library';
            else if (route.name === 'Upload') iconName = 'add-circle';
            else if (route.name === 'Analytics') iconName = 'analytics';
            else if (route.name === 'AuthorProfile') iconName = 'person';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.accent,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
          },
          headerStyle: {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
          headerTintColor: theme.colors.text,
        })}
      >
        <Tab.Screen name="AuthorFeed" component={FeedScreen} options={{ title: 'Book Feed' }} />
        <Tab.Screen name="Upload" component={AuthorUploadScreen} options={{ title: 'Upload Book' }} />
        <Tab.Screen name="Analytics" component={AuthorAnalyticsScreen} options={{ title: 'Analytics' }} />
        <Tab.Screen name="AuthorProfile" component={ProfileScreen} options={{ title: 'Profile' }} />
      </Tab.Navigator>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Feed') iconName = 'book';
          else if (route.name === 'Search') iconName = 'search';
          else if (route.name === 'Bookshelf') iconName = 'library';
          else if (route.name === 'Profile') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
        },
        headerTintColor: theme.colors.text,
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} options={{ title: 'Feed' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Discover' }} />
      <Tab.Screen name="Bookshelf" component={BookshelfScreen} options={{ title: 'My Library' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return null; // You can add a loading screen here
  }

  return (
    <NavigationContainer
      theme={{
        dark: theme.dark,
        colors: {
          primary: theme.colors.accent,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.accent,
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen 
              name="BookDetail" 
              component={BookDetailScreen} 
              options={{ 
                headerShown: true,
                headerStyle: { backgroundColor: theme.colors.surface },
                headerTintColor: theme.colors.text,
              }} 
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{ 
                headerShown: true,
                headerStyle: { backgroundColor: theme.colors.surface },
                headerTintColor: theme.colors.text,
              }} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <StatusBar style="auto" />
            <AppNavigator />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
