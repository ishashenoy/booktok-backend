import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { bookService, animationService } from '../../services/api';
import * as Haptics from 'expo-haptics';

export default function AuthorUploadScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [keywords, setKeywords] = useState('');
  const [genre, setGenre] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [customAnimation, setCustomAnimation] = useState(null);
  const [useAIGeneration, setUseAIGeneration] = useState(true);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const genres = ['Fiction', 'Fantasy', 'Romance', 'Mystery', 'Thriller', 'Science Fiction', 'Historical Fiction', 'Non-Fiction'];

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled) {
        setCoverImage(result.assets[0].uri);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error(error);
    }
  };

  const pickAnimation = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setCustomAnimation(result.assets[0].uri);
        setUseAIGeneration(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video');
      console.error(error);
    }
  };

  const handleGenerateVibe = async () => {
    if (!title || !summary) {
      Alert.alert('Missing Information', 'Please fill in title and summary to generate vibe collage');
      return;
    }

    setGenerating(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      // Call AI service to generate animation and vibe collage
      const response = await animationService.generateAnimationSpec({
        title,
        summary,
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
        genre,
      });

      // Simulate processing time
      setTimeout(() => {
        setGenerating(false);
        Alert.alert('Success!', 'Vibe collage and animation generated successfully!');
      }, 2000);
    } catch (error) {
      setGenerating(false);
      Alert.alert('Error', 'Failed to generate vibe collage. Using default generation.');
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    if (!title || !summary || !genre) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const bookData = {
        title,
        summary,
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
        genre,
        coverImage: coverImage || '',
        authorId: user?.id || user?._id,
        source: 'author_uploaded',
      };

      const response = await bookService.createBook(bookData);

      // If AI generation is enabled, generate animation
      if (useAIGeneration && !customAnimation) {
        await handleGenerateVibe();
      }

      setLoading(false);
      Alert.alert('Success!', 'Book uploaded successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setTitle('');
            setSummary('');
            setKeywords('');
            setGenre('');
            setCoverImage(null);
            setCustomAnimation(null);
            navigation.navigate('AuthorFeed');
          },
        },
      ]);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.response?.data?.error || 'Failed to upload book');
      console.error(error);
    }
  };

  const dynamicStyles = styles(theme);

  return (
    <ScrollView style={dynamicStyles.container} contentContainerStyle={dynamicStyles.scrollContent}>
      <View style={dynamicStyles.formContainer}>
        {/* Cover Image Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.label}>Cover Image *</Text>
          <TouchableOpacity
            style={dynamicStyles.imagePicker}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            {coverImage ? (
              <Image source={{ uri: coverImage }} style={dynamicStyles.coverImage} />
            ) : (
              <View style={dynamicStyles.imagePlaceholder}>
                <Ionicons name="image-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={dynamicStyles.placeholderText}>Tap to add cover image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.label}>Title *</Text>
          <TextInput
            style={dynamicStyles.input}
            placeholder="Enter book title"
            placeholderTextColor={theme.colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Genre */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.label}>Genre *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={dynamicStyles.genreContainer}>
            {genres.map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  dynamicStyles.genreButton,
                  genre === g && dynamicStyles.genreButtonActive,
                ]}
                onPress={() => setGenre(g)}
              >
                <Text
                  style={[
                    dynamicStyles.genreText,
                    genre === g && dynamicStyles.genreTextActive,
                  ]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Summary */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.label}>Summary *</Text>
          <TextInput
            style={[dynamicStyles.input, dynamicStyles.textArea]}
            placeholder="Write a compelling summary of your book..."
            placeholderTextColor={theme.colors.textSecondary}
            value={summary}
            onChangeText={setSummary}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Keywords */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.label}>Keywords (comma-separated)</Text>
          <TextInput
            style={dynamicStyles.input}
            placeholder="e.g., dark academia, romance, magic, mystery"
            placeholderTextColor={theme.colors.textSecondary}
            value={keywords}
            onChangeText={setKeywords}
          />
          <Text style={dynamicStyles.hint}>
            Add keywords to help AI generate better vibe collage and animations
          </Text>
        </View>

        {/* Animation Options */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.label}>Animation</Text>
          
          <TouchableOpacity
            style={dynamicStyles.optionCard}
            onPress={() => setUseAIGeneration(true)}
            activeOpacity={0.8}
          >
            <View style={dynamicStyles.optionLeft}>
              <Ionicons
                name={useAIGeneration ? 'radio-button-on' : 'radio-button-off'}
                size={24}
                color={theme.colors.accent}
              />
              <View style={dynamicStyles.optionContent}>
                <Text style={dynamicStyles.optionTitle}>AI Generated</Text>
                <Text style={dynamicStyles.optionDescription}>
                  Let AI create an animation based on your book's vibe
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.optionCard}
            onPress={() => {
              setUseAIGeneration(false);
              pickAnimation();
            }}
            activeOpacity={0.8}
          >
            <View style={dynamicStyles.optionLeft}>
              <Ionicons
                name={!useAIGeneration ? 'radio-button-on' : 'radio-button-off'}
                size={24}
                color={theme.colors.accent}
              />
              <View style={dynamicStyles.optionContent}>
                <Text style={dynamicStyles.optionTitle}>Upload Custom</Text>
                <Text style={dynamicStyles.optionDescription}>
                  Upload your own animation video
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {customAnimation && (
            <View style={dynamicStyles.customAnimationContainer}>
              <Text style={dynamicStyles.customAnimationText}>Custom animation selected</Text>
              <TouchableOpacity onPress={() => setCustomAnimation(null)}>
                <Text style={dynamicStyles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}

          {useAIGeneration && (
            <TouchableOpacity
              style={dynamicStyles.generateButton}
              onPress={handleGenerateVibe}
              disabled={generating}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.colors.accent, theme.colors.primary]}
                style={dynamicStyles.generateGradient}
              >
                {generating ? (
                  <>
                    <ActivityIndicator color={theme.colors.buttonText} />
                    <Text style={dynamicStyles.generateButtonText}>Generating...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="sparkles" size={20} color={theme.colors.buttonText} />
                    <Text style={dynamicStyles.generateButtonText}>Generate Vibe Collage</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[dynamicStyles.submitButton, loading && dynamicStyles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme.colors.accent, theme.colors.primary]}
            style={dynamicStyles.submitGradient}
          >
            {loading ? (
              <>
                <ActivityIndicator color={theme.colors.buttonText} />
                <Text style={dynamicStyles.submitButtonText}>Uploading...</Text>
              </>
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={24} color={theme.colors.buttonText} />
                <Text style={dynamicStyles.submitButtonText}>Upload Book</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
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
  formContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  imagePicker: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  genreContainer: {
    marginTop: 8,
  },
  genreButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  genreButtonActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  genreText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  genreTextActive: {
    color: theme.colors.buttonText,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  optionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  customAnimationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  customAnimationText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  removeText: {
    fontSize: 14,
    color: theme.colors.error,
    fontWeight: '600',
  },
  generateButton: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  generateButtonText: {
    color: theme.colors.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 12,
  },
  submitButtonText: {
    color: theme.colors.buttonText,
    fontSize: 18,
    fontWeight: '600',
  },
});
