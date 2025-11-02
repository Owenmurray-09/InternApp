import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { theme } from '@/config/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Application {
  id: string;
  note: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: 'submitted' | 'accepted' | 'rejected';
  created_at: string;
  profiles: {
    name: string;
    bio: string;
    avatar_url: string | null;
  };
}

export default function ApplicantsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadApplications();
    }
  }, [id]);

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          note,
          contact_email,
          contact_phone,
          status,
          created_at,
          profiles!inner (
            name,
            bio,
            avatar_url
          )
        `)
        .eq('job_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    setUpdatingStatus(applicationId);
    console.log(`🔄 Attempting to update application ${applicationId} to status: ${status}`);

    try {
      // Check current user authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('❌ Auth error:', authError);
        throw new Error('Authentication failed');
      }

      console.log('👤 Current user:', user?.id, user?.email);

      const { data, error, count } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId)
        .select('*');

      console.log('📊 Update response:', { data, error, count });

      if (error) {
        console.error('❌ Database error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ No rows were updated. This usually means RLS policy blocked the update.');
        console.warn('Check that you own the job this application is for.');
        throw new Error('Update blocked - you may not have permission to update this application');
      }

      console.log('✅ Application updated successfully:', data[0]);

      // Remove the immediate local state update to avoid race conditions
      // Just refresh from server
      await loadApplications();
    } catch (error: any) {
      console.error('❌ Error updating application status:', error.message);
      // You might want to show a toast/alert here in the future
    } finally {
      setUpdatingStatus(null);
    }
  };

  const renderApplication = ({ item }: { item: Application }) => (
    <Card style={styles.applicationCard}>
      <View style={styles.applicantHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.profiles.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.applicantInfo}>
          <Text style={styles.applicantName}>{item.profiles.name}</Text>
          <Text style={styles.applicantBio} numberOfLines={2}>
            {item.profiles.bio}
          </Text>
          <Text style={styles.applicationDate}>
            Applied {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {item.contact_email && (
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Contact Information:</Text>
          <Text style={styles.contactText}>Email: {item.contact_email}</Text>
          {item.contact_phone && (
            <Text style={styles.contactText}>Phone: {item.contact_phone}</Text>
          )}
        </View>
      )}

      {item.note && (
        <View style={styles.noteSection}>
          <Text style={styles.noteTitle}>Cover Note:</Text>
          <Text style={styles.noteText}>{item.note}</Text>
        </View>
      )}

      {item.status === 'submitted' && (
        <View style={styles.actions}>
          <Button
            title="Accept"
            onPress={() => updateApplicationStatus(item.id, 'accepted')}
            variant="secondary"
            size="sm"
            loading={updatingStatus === item.id}
            disabled={updatingStatus !== null}
          />
          <Button
            title="Reject"
            onPress={() => updateApplicationStatus(item.id, 'rejected')}
            variant="outline"
            size="sm"
            loading={updatingStatus === item.id}
            disabled={updatingStatus !== null}
          />
        </View>
      )}

      {item.status !== 'submitted' && (
        <View style={styles.statusSection}>
          <View style={styles.statusDisplay}>
            <Text style={styles.statusIcon}>
              {item.status === 'accepted' ? '✅' : '❌'}
            </Text>
            <Text style={[
              styles.statusText,
              { color: item.status === 'accepted' ? theme.colors.success : theme.colors.error }
            ]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
          <Button
            title={item.status === 'accepted' ? 'Change to Rejected' : 'Change to Accepted'}
            onPress={() => updateApplicationStatus(item.id, item.status === 'accepted' ? 'rejected' : 'accepted')}
            variant="outline"
            size="sm"
            loading={updatingStatus === item.id}
            disabled={updatingStatus !== null}
            style={[
              styles.changeButton,
              { borderColor: item.status === 'accepted' ? theme.colors.error : theme.colors.success }
            ]}
            textStyle={{
              color: item.status === 'accepted' ? theme.colors.error : theme.colors.success
            }}
          />
        </View>
      )}
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>No applications yet</Text>
      <Text style={styles.emptyText}>
        Students will see your job posting and can apply directly
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading applications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Applications</Text>
        <Text style={styles.subtitle}>{applications.length} applications received</Text>
      </View>

      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        renderItem={renderApplication}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
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
    fontSize: theme.fontSize.xxxl,
    fontFamily: theme.fontFamily.titleBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
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
  list: {
    padding: theme.spacing.lg,
    paddingTop: 0,
    flexGrow: 1,
  },
  applicationCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  applicantHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.titleMedium,
    color: theme.colors.textOnPrimary,
  },
  applicantInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  applicantName: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.titleMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  applicantBio: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  applicationDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  contactSection: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  contactTitle: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bodyMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  contactText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  noteSection: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  noteTitle: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bodyMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  noteText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  statusDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    fontSize: theme.fontSize.lg,
    marginRight: theme.spacing.sm,
  },
  statusText: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.bodyMedium,
  },
  changeButton: {
    marginLeft: theme.spacing.md,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontFamily: theme.fontFamily.titleMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});