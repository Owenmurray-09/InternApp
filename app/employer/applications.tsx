import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { theme } from '@/config/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthContext } from '@/lib/auth/AuthProvider';

interface Application {
  id: string;
  status: 'submitted' | 'accepted' | 'rejected';
  created_at: string;
  note: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  profiles: {
    name: string;
    bio: string;
    avatar_url: string | null;
    interests: string[];
    experience: string | null;
    phone: string | null;
  };
  jobs: {
    id: string;
    title: string;
  };
}

export default function EmployerApplicationsScreen() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) return;

      // Get all applications for jobs owned by this employer
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          created_at,
          note,
          contact_email,
          contact_phone,
          profiles!inner (
            name,
            bio,
            avatar_url,
            interests,
            experience,
            phone
          ),
          jobs!inner (
            id,
            title,
            companies!inner (
              owner_user_id
            )
          )
        `)
        .eq('jobs.companies.owner_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setApplications(data || []);
    } catch (err) {
      console.error('Error loading applications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) throw error;

      console.log('Success', `Application ${status} successfully`);
      await loadApplications();
    } catch (error: any) {
      console.log('Error', error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return theme.colors.success;
      case 'rejected': return theme.colors.error;
      default: return theme.colors.warning;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      default: return 'Pending';
    }
  };

  const renderApplication = ({ item }: { item: Application }) => (
    <Card style={styles.applicationCard}>
      <View style={styles.applicationHeader}>
        <View style={styles.studentInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.profiles?.name?.charAt(0)?.toUpperCase() || 'S'}
            </Text>
          </View>
          <View style={styles.studentDetails}>
            <Text style={styles.studentName}>{item.profiles?.name || 'Student'}</Text>
            <Text style={styles.jobTitle}>{item.jobs?.title}</Text>
            <Text style={styles.applicationDate}>
              Applied {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      {item.profiles?.bio && (
        <Text style={styles.bio} numberOfLines={2}>{item.profiles.bio}</Text>
      )}

      {item.profiles?.interests && item.profiles.interests.length > 0 && (
        <View style={styles.interestsContainer}>
          <Text style={styles.interestsLabel}>Skills:</Text>
          <Text style={styles.interests}>
            {item.profiles.interests.slice(0, 3).join(', ')}
            {item.profiles.interests.length > 3 ? '...' : ''}
          </Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        <Button
          title="View Details"
          onPress={() => router.push(`/employer/jobs/${item.jobs.id}/applicants`)}
          variant="outline"
          style={styles.actionButton}
        />
        {item.status === 'submitted' && (
          <>
            <Button
              title="Accept"
              onPress={() => updateApplicationStatus(item.id, 'accepted')}
              style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
            />
            <Button
              title="Reject"
              onPress={() => updateApplicationStatus(item.id, 'rejected')}
              style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
            />
          </>
        )}
      </View>
    </Card>
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
        <Text style={styles.title}>Applications</Text>
        <Text style={styles.subtitle}>
          Review applications from students across all your job postings
        </Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Button title="Retry" onPress={loadApplications} />
        </View>
      ) : applications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Applications Yet</Text>
          <Text style={styles.emptyText}>
            Applications from students will appear here. Make sure your job postings are active to start receiving applications.
          </Text>
          <Button
            title="View My Jobs"
            onPress={() => router.push('/employer')}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <FlatList
          data={applications}
          renderItem={renderApplication}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingBottom: theme.spacing.md,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.body,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.titleMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  applicationCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  applicationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: theme.fontFamily.titleMedium,
    color: theme.colors.textOnPrimary,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.titleMedium,
    color: theme.colors.text,
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.bodyMedium,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  applicationDate: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.body,
    color: theme.colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.fontFamily.bodyMedium,
    textTransform: 'uppercase',
  },
  bio: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.body,
    color: theme.colors.text,
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  interestsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  interestsLabel: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.bodyMedium,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xs,
  },
  interests: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.body,
    color: theme.colors.text,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});