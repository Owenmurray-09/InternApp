import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/config/theme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuthContext } from '@/lib/auth/AuthProvider';
import { supabase } from '@/lib/supabase';

interface Company {
  id: string;
  name: string;
  description: string;
  location: string | null;
}

export default function EmployerProfileScreen() {
  const { user, signOut } = useAuthContext();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    location: '',
  });

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      setLoading(true);

      if (!user) return;

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      setCompany(data);

      if (data) {
        setEditForm({
          name: data.name || '',
          description: data.description || '',
          location: data.location || '',
        });
      }
    } catch (error) {
      console.error('Error loading company:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!user) return;

      const updateData = {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        location: editForm.location.trim() || null,
      };

      if (company) {
        // Update existing company
        const { error } = await supabase
          .from('companies')
          .update(updateData)
          .eq('id', company.id);

        if (error) throw error;
      } else {
        // Create new company
        const { error } = await supabase
          .from('companies')
          .insert({
            ...updateData,
            owner_user_id: user.id,
          });

        if (error) throw error;
      }

      await loadCompany();
      setIsEditing(false);
      console.log('Success', 'Company profile updated successfully!');
    } catch (error: any) {
      console.log('Error', error.message || 'Failed to update company profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (company) {
      setEditForm({
        name: company.name || '',
        description: company.description || '',
        location: company.location || '',
      });
    }
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (error: any) {
      console.log('Error', error.message || 'Failed to sign out');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your company information and account settings</Text>
        </View>

        <View style={styles.content}>
          <Card style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {(company?.name || user?.email)?.charAt(0)?.toUpperCase() || 'C'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {company?.name || 'Company Name'}
                </Text>
                <Text style={styles.profileRole}>Employer</Text>
              </View>
            </View>

            {isEditing ? (
              <View style={styles.editForm}>
                <Input
                  label="Company Name *"
                  value={editForm.name}
                  onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                  placeholder="Enter company name"
                />

                <Input
                  label="Description *"
                  value={editForm.description}
                  onChangeText={(text) => setEditForm({ ...editForm, description: text })}
                  placeholder="Describe your company..."
                  multiline
                />


                <Input
                  label="Location"
                  value={editForm.location}
                  onChangeText={(text) => setEditForm({ ...editForm, location: text })}
                  placeholder="City, State/Province"
                />


                <View style={styles.editActions}>
                  <Button
                    title="Save Changes"
                    onPress={handleSave}
                    loading={saving}
                  />
                  <Button
                    title="Cancel"
                    onPress={handleCancel}
                    variant="outline"
                  />
                </View>
              </View>
            ) : (
              <View style={styles.profileDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{user?.email}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Company Name</Text>
                  <Text style={styles.detailValue}>
                    {company?.name || 'No company name set'}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailValue}>
                    {company?.description || 'No description added yet'}
                  </Text>
                </View>


                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>
                    {company?.location || 'Location not specified'}
                  </Text>
                </View>


                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Account Created</Text>
                  <Text style={styles.detailValue}>
                    {new Date(user?.created_at || '').toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Last Sign In</Text>
                  <Text style={styles.detailValue}>
                    {user?.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : 'Never'
                    }
                  </Text>
                </View>

                <Button
                  title={company ? "Edit Company Profile" : "Setup Company Profile"}
                  onPress={() => setIsEditing(true)}
                  style={styles.editButton}
                />
              </View>
            )}
          </Card>

          <Card style={styles.actionsCard}>
            <Text style={styles.sectionTitle}>Account Actions</Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/employer/company-setup')}
              >
                <Text style={styles.actionButtonText}>🏢 Company Setup</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  console.log(
                    'Coming Soon',
                    'Settings will be available in a future update.'
                  );
                }}
              >
                <Text style={styles.actionButtonText}>⚙️ Settings (disabled)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  console.log(
                    'Help & Support',
                    'For support, please contact us at support@bridgeapp.com'
                  );
                }}
              >
                <Text style={styles.actionButtonText}>❓ Help & Support (disabled)</Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Sign Out"
              onPress={handleSignOut}
              variant="outline"
              style={styles.signOutButton}
            />
          </Card>
        </View>
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
    fontFamily: theme.fontFamily.body,
    color: theme.colors.textSecondary,
  },
  header: {
    padding: theme.spacing.lg,
    paddingBottom: 0,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontFamily: theme.fontFamily.titleMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.body,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  content: {
    padding: theme.spacing.lg,
  },
  profileCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: 24,
    fontFamily: theme.fontFamily.titleMedium,
    color: theme.colors.textOnPrimary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.titleMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  profileRole: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.body,
    color: theme.colors.textSecondary,
  },
  profileDetails: {
    gap: theme.spacing.md,
  },
  detailItem: {
    marginBottom: theme.spacing.md,
  },
  detailLabel: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.bodyMedium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  detailValue: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.body,
    color: theme.colors.text,
    lineHeight: 20,
  },
  editButton: {
    marginTop: theme.spacing.md,
  },
  editForm: {
    gap: theme.spacing.md,
  },
  editActions: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  actionsCard: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.titleMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  actionButtons: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  actionButton: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionButtonText: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bodyMedium,
    color: theme.colors.text,
  },
  signOutButton: {
    borderColor: theme.colors.error,
  },
});