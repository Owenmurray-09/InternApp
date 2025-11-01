import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/config/theme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/lib/auth/AuthProvider';

export default function CompanySetupScreen() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [companySaved, setCompanySaved] = useState(false);
  const [existingCompanyId, setExistingCompanyId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadExistingCompany();
  }, [user]);

  const loadExistingCompany = async () => {
    if (!user) return;

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: company, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_user_id', authUser.id)
        .single();

      if (error) {
        // No company found or other error - that's fine for new setup
        console.log('No existing company found or error:', error);
      } else if (company) {
        // Company exists, populate form
        setExistingCompanyId(company.id);
        setFormData({
          name: company.name || '',
          description: company.description || '',
          location: company.location || '',
          email: company.email || '',
          phone: company.phone || '',
        });
        // Don't set companySaved to true here - only after actual save/update
      }
    } catch (error) {
      console.error('Error loading existing company:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSaveCompany = async () => {
    if (!formData.name.trim()) {
      console.log('Error', 'Please enter a company name');
      return;
    }

    if (!formData.description.trim()) {
      console.log('Error', 'Please enter a company description');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // First, ensure user has a profile (required for foreign key constraint)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Create profile if it doesn't exist
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            role: 'employer',
            name: user.email?.split('@')[0] || 'Employer',
            interests: [],
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error('Failed to create user profile');
        }
      }

      const companyData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        location: formData.location.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        owner_user_id: user.id,
      };

      let error;
      if (existingCompanyId) {
        // Update existing company
        const result = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', existingCompanyId);
        error = result.error;
      } else {
        // Create new company
        const result = await supabase
          .from('companies')
          .insert(companyData);
        error = result.error;
      }

      if (error) throw error;

      console.log('Company created successfully');
      setCompanySaved(true);
    } catch (error: any) {
      console.error('Company creation error:', error);
      console.log('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToDashboard = () => {
    console.log('=== COMPANY SETUP CONTINUE CLICKED ===');
    console.log('User:', user?.email);
    console.log('🏢 Navigating to: /employer');
    router.replace('/employer');
    console.log('🏢 Employer dashboard navigation completed');
  };

  if (loadingData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading company information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {existingCompanyId ? 'Edit Your Company' : 'Setup Your Company'}
          </Text>
          <Text style={styles.subtitle}>
            {existingCompanyId
              ? 'Update your company profile information'
              : 'Create your company profile to start posting jobs'
            }
          </Text>
        </View>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Company Information</Text>

          <Input
            label="Company Name *"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholder="e.g. Acme Corporation"
          />

          <Input
            label="Description *"
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Describe your company and what you do..."
            multiline
          />

          <Input
            label="Location"
            value={formData.location}
            onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
            placeholder="e.g. San Francisco, CA"
          />

          <Input
            label="Contact Email"
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
            placeholder="contact@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Phone Number"
            value={formData.phone}
            onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
            placeholder=""
            keyboardType="phone-pad"
          />

          {!companySaved ? (
            <Button
              title={existingCompanyId ? "Update Company Profile" : "Save Company Profile"}
              onPress={handleSaveCompany}
              loading={loading}
              style={styles.submitButton}
            />
          ) : (
            <View style={styles.successSection}>
              <Text style={styles.successTitle}>
                ✅ Company Profile {existingCompanyId ? 'Updated' : 'Saved'}!
              </Text>
              <Text style={styles.successMessage}>
                Your company profile has been {existingCompanyId ? 'updated' : 'created'} successfully. You can now start posting jobs and managing applications.
              </Text>

              <Button
                title="Go to Dashboard"
                onPress={handleContinueToDashboard}
                style={styles.continueButton}
              />

              <Button
                title="Edit Company Info"
                onPress={() => setCompanySaved(false)}
                variant="outline"
                style={styles.editButton}
              />
            </View>
          )}
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>What's Next?</Text>
          <Text style={styles.infoText}>
            After creating your company profile, you'll be able to:
          </Text>
          <Text style={styles.infoItem}>• Post job opportunities</Text>
          <Text style={styles.infoItem}>• Manage applications</Text>
          <Text style={styles.infoItem}>• Communicate with students</Text>
          <Text style={styles.infoItem}>• Build your employer brand</Text>
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
  header: {
    padding: theme.spacing.lg,
    paddingBottom: 0,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.bodyMedium,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontFamily: theme.fontFamily.titleBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  formCard: {
    margin: theme.spacing.lg,
    marginTop: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.titleMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  submitButton: {
    marginTop: theme.spacing.lg,
  },
  successSection: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  successTitle: {
    fontSize: theme.fontSize.xl,
    fontFamily: theme.fontFamily.titleMedium,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  continueButton: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  editButton: {
    width: '100%',
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
  infoCard: {
    margin: theme.spacing.lg,
    marginTop: 0,
    padding: theme.spacing.lg,
  },
  infoTitle: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.titleMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  infoItem: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
  },
});