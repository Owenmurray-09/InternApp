import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text, Switch, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { theme } from '@/config/theme';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { useCreateJob, useUploadJobImages } from '@/lib/hooks/useJobs';
import * as ImagePicker from 'expo-image-picker';

const AVAILABLE_TAGS = [
  'cash register', 'customer service', 'heavy lifting', 'front desk',
  'retail', 'barista', 'inventory', 'cleaning', 'basic coding', 'graphic design',
  'programming', 'web development', 'data analysis', 'healthcare', 'research',
  'marketing', 'writing', 'tutoring', 'manual labor', 'administrative',
  'social media', 'photography', 'event planning', 'sales'
];

export default function NewJobScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [stipendAmount, setStipendAmount] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Refs for focus management
  const descriptionRef = useRef<TextInput>(null);

  const { createJob, loading: createLoading } = useCreateJob();
  const { uploadImages, loading: uploadLoading, progress } = useUploadJobImages();

  // Centralized function to reset all form state
  const resetFormState = () => {
    console.log('🔄 Resetting job form state to blank');
    setTitle('');
    setDescription('');
    setLocation('');
    setIsPaid(false);
    setStipendAmount('');
    setSelectedTags([]);
    setSelectedImages([]);
    setErrors({});
  };

  // Reset form state when component mounts
  useEffect(() => {
    console.log('🚀 NewJobScreen component mounted - resetting form state');
    resetFormState();
    loadCompany();
  }, []);

  // Additional reset when screen comes into focus (handles navigation edge cases)
  useFocusEffect(
    React.useCallback(() => {
      console.log('👁️ NewJobScreen came into focus - ensuring clean state');
      resetFormState();
    }, [])
  );

  const loadCompany = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_user_id', user.id)
        .single();

      if (error) {
        console.log('Company query error in job creation:', error);

        if (error.code === 'PGRST116') {
          // No company found, redirect to setup
          console.log('No company found, redirecting to company setup');
          router.replace('/employer/company-setup');
          return;
        }

        // Handle other database permission errors like we do elsewhere
        if (error.code === 'PGRST301' || error.message?.includes('406')) {
          console.log('Database permissions issue, using placeholder company ID');
          setCompanyId('placeholder-company-id');
          return;
        }

        // For other errors, redirect to setup
        console.log('Other company error, redirecting to setup');
        router.replace('/employer/company-setup');
        return;
      }

      setCompanyId(data.id);
    } catch (error) {
      console.error('Error loading company:', error);
    } finally {
      setLoadingCompany(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );

    // Clear tag validation error
    if (errors.tags) {
      setErrors(prev => ({ ...prev, tags: '' }));
    }
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission needed: Camera roll permissions are required to select images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      aspect: [16, 9],
    });

    if (!result.canceled) {
      setSelectedImages(prev => [...prev, ...result.assets].slice(0, 5)); // Max 5 images
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Job title is required';
    } else if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Job description is required';
    } else if (description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (selectedTags.length === 0) {
      newErrors.tags = 'Select at least one skill tag';
    }

    if (isPaid && stipendAmount && parseFloat(stipendAmount) < 0) {
      newErrors.stipend_amount = 'Amount must be positive';
    }

    setErrors(newErrors);

    // Focus on first error field
    if (newErrors.description) {
      setTimeout(() => descriptionRef.current?.focus(), 100);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('=== JOB POSTING SUBMIT DEBUG ===');
    console.log('handleSubmit called');
    console.log('Company ID:', companyId);

    if (!companyId) {
      console.log('❌ No company ID found');
      console.error('Error: Company not found. Please set up your company first.');
      return;
    }

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      console.log('Validation errors:', errors);
      return;
    }

    console.log('✅ Form validation passed');

    try {
      const jobData = {
        company_id: companyId,
        title: title.trim(),
        description: description.trim(),
        location: location.trim() || null,
        tags: selectedTags,
        is_paid: isPaid,
        stipend_amount: isPaid && stipendAmount ? parseFloat(stipendAmount) : null,
      };

      console.log('📝 Job data to submit:', jobData);
      console.log('🚀 Calling createJob...');

      let job;
      try {
        job = await createJob(jobData);
        console.log('✅ Job created successfully:', job);
      } catch (createError: any) {
        console.log('❌ Job creation failed:', createError);
        console.error('Error:', createError.message || 'Failed to create job');
        return;
      }

      // Upload images if any selected
      if (selectedImages.length > 0) {
        console.log('📸 Uploading images...');
        try {
          const imageFiles = await Promise.all(
            selectedImages.map(async (asset) => {
              const response = await fetch(asset.uri);
              const blob = await response.blob();
              return new File([blob], asset.fileName || 'image.jpg', { type: 'image/jpeg' });
            })
          );

          await uploadImages(job.id, imageFiles);
          console.log('✅ Images uploaded successfully');
        } catch (imageError) {
          console.warn('⚠️ Image upload failed, but job was created:', imageError);
        }
      }

      // Show success message
      const notificationResult = (job as any).notificationResult;
      let successMessage = 'Job posted successfully!';

      if (notificationResult?.success && notificationResult?.matchedStudents !== undefined) {
        const matchedCount = notificationResult.matchedStudents;
        if (matchedCount > 0) {
          successMessage += `\n\nWe notified ${matchedCount} matched student${matchedCount === 1 ? '' : 's'}!`;
        } else {
          successMessage += '\n\nYour job is live! Students will be notified as their interests match.';
        }
      } else {
        successMessage += '\n\nYour job is now live and visible to students!';
      }

      console.log('🎉 Success! Job posted successfully, navigating to employer dashboard...');
      console.log('Success:', successMessage);

      // Reset form state before navigation to ensure clean state for next time
      resetFormState();
      router.replace('/employer');

    } catch (error: any) {
      console.log('❌ UNEXPECTED ERROR in handleSubmit:', error);
      console.log('Error message:', error.message);
      console.error('Error:', error.message || 'An unexpected error occurred');
    }
    console.log('=== JOB POSTING SUBMIT END ===');
  };

  if (loadingCompany) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Post New Job</Text>
          <Text style={styles.subtitle}>Create a job posting to find students</Text>
        </View>

        <Card style={styles.form}>
          <View>
            <Input
              label="Job Title *"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
              }}
              placeholder="e.g., Marketing Intern, Server Assistant"
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          <View>
            <Input
              ref={descriptionRef}
              label="Job Description *"
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
              }}
              multiline
              placeholder="Describe the role, responsibilities, and what students will learn..."
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          <Input
            label="Location"
            value={location}
            onChangeText={setLocation}
            placeholder="County, Province or Remote"
          />

          <View style={styles.imagesSection}>
            <Text style={styles.sectionTitle}>Job Images (Optional)</Text>
            <Text style={styles.sectionSubtitle}>Add up to 5 images to showcase the workplace or role</Text>

            {selectedImages.length > 0 && (
              <ScrollView horizontal style={styles.imagesPreview} showsHorizontalScrollIndicator={false}>
                {selectedImages.map((image, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri: image.uri }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Text style={styles.removeImageText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <Button
              title={`Add Images (${selectedImages.length}/5)`}
              onPress={pickImages}
              variant="outline"
              disabled={selectedImages.length >= 5}
              style={styles.addImageButton}
            />
          </View>

          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <View style={styles.paidToggle}>
              <Text style={styles.toggleLabel}>This is a paid position</Text>
              <Switch value={isPaid} onValueChange={setIsPaid} />
            </View>

            {isPaid && (
              <View>
                <Input
                  label="Stipend Amount ($)"
                  value={stipendAmount}
                  onChangeText={(text) => {
                    setStipendAmount(text);
                    if (errors.stipend_amount) setErrors(prev => ({ ...prev, stipend_amount: '' }));
                  }}
                  keyboardType="numeric"
                  placeholder="e.g., 2500 for total, 18 for hourly"
                />
                {errors.stipend_amount && <Text style={styles.errorText}>{errors.stipend_amount}</Text>}
              </View>
            )}
          </View>

          <View style={styles.tagsSection}>
            <Text style={styles.sectionTitle}>Required Skills & Tags *</Text>
            <Text style={styles.tagsSubtitle}>
              Select tags that match the skills needed for this job
            </Text>

            <View style={styles.tagsContainer}>
              {AVAILABLE_TAGS.map(tag => (
                <Tag
                  key={tag}
                  label={tag}
                  selected={selectedTags.includes(tag)}
                  onPress={() => handleTagToggle(tag)}
                />
              ))}
            </View>
            {errors.tags && <Text style={styles.errorText}>{errors.tags}</Text>}
            {selectedTags.length === 0 && (
              <Text style={styles.helperText}>Please select at least one skill tag</Text>
            )}
          </View>

          <View style={styles.actions}>
            <Button
              title={uploadLoading ? `Uploading Images... ${Math.round(progress)}%` : "Post Job"}
              onPress={() => {
                console.log('📋 Post Job button clicked');
                console.log('Button state - createLoading:', createLoading, 'uploadLoading:', uploadLoading);
                handleSubmit();
              }}
              loading={createLoading || uploadLoading}
              disabled={createLoading || uploadLoading}
            />

            <Button
              title="Cancel"
              onPress={() => router.back()}
              variant="outline"
              disabled={createLoading || uploadLoading}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
  },
  header: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontFamily: theme.fontFamily.titleBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  form: {
    margin: theme.spacing.lg,
    marginTop: 0,
    padding: theme.spacing.lg,
  },
  paymentSection: {
    marginVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.titleMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  paidToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  toggleLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  tagsSection: {
    marginVertical: theme.spacing.md,
  },
  tagsSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actions: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error || '#ff4444',
    marginTop: theme.spacing.xs,
  },
  helperText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  imagesSection: {
    marginVertical: theme.spacing.md,
  },
  sectionSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  imagesPreview: {
    marginVertical: theme.spacing.md,
  },
  imageContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  previewImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addImageButton: {
    marginTop: theme.spacing.md,
  },
});