import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

export default function SettingsScreen({ navigation }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [spoilFilter, setSpoilFilter] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    Alert.alert('Language Changed', `Language changed to ${LANGUAGES.find(l => l.code === langCode)?.name}`);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'We are committed to protecting your privacy...');
  };

  const handleTermsOfService = () => {
    Alert.alert('Terms of Service', 'By using BookTok, you agree to...');
  };

  const Section = ({ title, children }) => (
    <View style={styles(theme).section}>
      <Text style={styles(theme).sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingItem = ({ icon, label, value, onPress, rightComponent, danger }) => (
    <TouchableOpacity
      style={styles(theme).settingItem}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles(theme).settingLeft}>
        <Ionicons
          name={icon}
          size={24}
          color={danger ? theme.colors.error : theme.colors.text}
        />
        <Text
          style={[
            styles(theme).settingLabel,
            danger && styles(theme).settingLabelDanger,
          ]}
        >
          {label}
        </Text>
      </View>
      {rightComponent || (value && (
        <Text style={styles(theme).settingValue}>{value}</Text>
      ))}
      {onPress && !rightComponent && !value && (
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  const dynamicStyles = styles(theme);

  return (
    <ScrollView style={dynamicStyles.container} contentContainerStyle={dynamicStyles.scrollContent}>
      {/* Appearance */}
      <Section title="Appearance">
        <SettingItem
          icon="moon-outline"
          label="Dark Mode"
          rightComponent={
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
              thumbColor={theme.colors.card}
            />
          }
        />
        <SettingItem
          icon="color-palette-outline"
          label="Theme Color"
          value="Default"
          onPress={() => Alert.alert('Theme', 'More themes coming soon!')}
        />
      </Section>

      {/* Language & Region */}
      <Section title="Language & Region">
        <SettingItem
          icon="language-outline"
          label="Language"
          value={LANGUAGES.find(l => l.code === language)?.name}
          onPress={() => {
            Alert.alert(
              'Select Language',
              'Choose your preferred language',
              LANGUAGES.map(lang => ({
                text: `${lang.flag} ${lang.name}`,
                onPress: () => handleLanguageChange(lang.code),
              })).concat([{ text: 'Cancel', style: 'cancel' }])
            );
          }}
        />
        <SettingItem
          icon="globe-outline"
          label="Region"
          value="Global"
          onPress={() => Alert.alert('Region', 'Region settings coming soon!')}
        />
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <SettingItem
          icon="notifications-outline"
          label="Push Notifications"
          rightComponent={
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
              thumbColor={theme.colors.card}
            />
          }
        />
        <SettingItem
          icon="mail-outline"
          label="Email Notifications"
          rightComponent={
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
              thumbColor={theme.colors.card}
            />
          }
        />
      </Section>

      {/* Privacy & Security */}
      <Section title="Privacy & Security">
        <SettingItem
          icon="shield-checkmark-outline"
          label="Privacy Mode"
          rightComponent={
            <Switch
              value={privacyMode}
              onValueChange={setPrivacyMode}
              trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
              thumbColor={theme.colors.card}
            />
          }
        />
        <SettingItem
          icon="eye-off-outline"
          label="Spoiler Filter"
          rightComponent={
            <Switch
              value={spoilFilter}
              onValueChange={setSpoilFilter}
              trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
              thumbColor={theme.colors.card}
            />
          }
        />
        <SettingItem
          icon="lock-closed-outline"
          label="Change Password"
          onPress={() => Alert.alert('Change Password', 'Password change feature coming soon!')}
        />
        <SettingItem
          icon="finger-print-outline"
          label="Biometric Authentication"
          onPress={() => Alert.alert('Biometric', 'Biometric authentication coming soon!')}
        />
      </Section>

      {/* Content */}
      <Section title="Content">
        <SettingItem
          icon="filter-outline"
          label="Content Filter"
          value="Safe"
          onPress={() => Alert.alert('Content Filter', 'Content filter settings coming soon!')}
        />
        <SettingItem
          icon="download-outline"
          label="Download Settings"
          onPress={() => Alert.alert('Downloads', 'Download settings coming soon!')}
        />
        <SettingItem
          icon="cloud-download-outline"
          label="Auto-download on WiFi"
          rightComponent={
            <Switch
              value={false}
              onValueChange={() => {}}
              trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
              thumbColor={theme.colors.card}
            />
          }
        />
      </Section>

      {/* Data & Storage */}
      <Section title="Data & Storage">
        <SettingItem
          icon="trash-outline"
          label="Clear Cache"
          onPress={handleClearCache}
        />
        <SettingItem
          icon="download-outline"
          label="Downloaded Content"
          value="0 MB"
          onPress={() => Alert.alert('Downloads', 'No downloaded content')}
        />
      </Section>

      {/* About */}
      <Section title="About">
        <SettingItem
          icon="document-text-outline"
          label="Privacy Policy"
          onPress={handlePrivacyPolicy}
        />
        <SettingItem
          icon="document-outline"
          label="Terms of Service"
          onPress={handleTermsOfService}
        />
        <SettingItem
          icon="information-circle-outline"
          label="App Version"
          value="1.0.0"
        />
        <SettingItem
          icon="code-outline"
          label="Open Source Licenses"
          onPress={() => Alert.alert('Licenses', 'Open source licenses information...')}
        />
      </Section>

      {/* Footer */}
      <View style={dynamicStyles.footer}>
        <Text style={dynamicStyles.footerText}>Made with ❤️ for book lovers</Text>
        <Text style={dynamicStyles.footerSubtext}>BookTok v1.0.0</Text>
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
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
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
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  settingLabelDanger: {
    color: theme.colors.error,
  },
  settingValue: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginRight: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
});
