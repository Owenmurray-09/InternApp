import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/config/theme';
import { CalendarView } from '@/components/ui/CalendarView';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthContext } from '@/lib/auth/AuthProvider';

interface CalendarEvent {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  notes?: string;
  jobs?: {
    title: string;
  };
  participant_email?: string;
}

export default function EmployerCalendarScreen() {
  const { user } = useAuthContext();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Note: In a real implementation, you would fetch events from Supabase
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Replace with actual Supabase query when events table is available
        // const { data, error } = await supabase
        //   .from('events')
        //   .select(`
        //     id,
        //     title,
        //     notes,
        //     start_at,
        //     end_at,
        //     participant_email,
        //     jobs (
        //       title
        //     )
        //   `)
        //   .eq('organizer_user_id', user.id)
        //   .order('start_at', { ascending: true });

        // For now, return empty array or mock data
        const mockEvents: CalendarEvent[] = [
          // Uncomment to test with mock data:
          // {
          //   id: '1',
          //   title: 'Interview with John Doe',
          //   start_at: new Date().toISOString(),
          //   end_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          //   notes: 'Technical interview for software intern position',
          //   jobs: { title: 'Software Intern' },
          //   participant_email: 'john.doe@example.com'
          // }
        ];

        setEvents(mockEvents);
      } catch (err) {
        console.error('Error loading events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadEvents();
    }
  }, [user]);

  const handleEventPress = (event: CalendarEvent) => {
    Alert.alert(
      event.title,
      `${new Date(event.start_at).toLocaleString()}\n\nParticipant: ${event.participant_email || 'Not specified'}\n\n${event.notes || 'No additional details'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Edit Event',
          onPress: () => {
            Alert.alert('Coming Soon', 'Event editing will be available in a future update.');
          }
        }
      ]
    );
  };

  const handleScheduleInterview = () => {
    Alert.alert(
      'Schedule Interview',
      'Interview scheduling will be available when viewing job applicants. You can schedule interviews directly from the applicants list.',
      [{ text: 'Got it' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Calendar</Text>
          <Text style={styles.subtitle}>
            Manage your interviews and meetings with candidates
          </Text>
        </View>

        <View style={styles.content}>
          {/* Quick Actions */}
          <Card style={styles.actionsCard}>
            <Text style={styles.actionsTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <Button
                title="Schedule Interview"
                onPress={handleScheduleInterview}
                style={styles.actionButton}
              />
              <Button
                title="View Applicants"
                onPress={() => {
                  Alert.alert(
                    'View Applicants',
                    'Navigate to your job postings to view and manage applicants.'
                  );
                }}
                variant="outline"
                style={styles.actionButton}
              />
            </View>
          </Card>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error loading calendar: {error}</Text>
            </View>
          ) : (
            <CalendarView
              events={events}
              loading={loading}
              onEventPress={handleEventPress}
            />
          )}

          {!loading && !error && events.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Interviews Scheduled</Text>
              <Text style={styles.emptyText}>
                Your interview calendar is empty. Here's how to get started:
                {'\n\n'}
                1. Post job openings to attract candidates
                {'\n'}
                2. Review applications as they come in
                {'\n'}
                3. Schedule interviews with promising candidates
                {'\n'}
                4. Use this calendar to manage your interview schedule
              </Text>
              <TouchableOpacity
                style={styles.getStartedButton}
                onPress={() => {
                  Alert.alert(
                    'Get Started',
                    'Navigate to the Jobs section to create your first job posting and start receiving applications.'
                  );
                }}
              >
                <Text style={styles.getStartedText}>Create Job Posting</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>📅 Employer Calendar Features</Text>
            <Text style={styles.infoText}>
              Use your calendar to:
              {'\n'}• Schedule interviews with candidates
              {'\n'}• Set up information sessions
              {'\n'}• Track application deadlines
              {'\n'}• Manage follow-up appointments
              {'\n\n'}
              Students will receive automatic notifications when you schedule events with them.
            </Text>
          </View>
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
  },
  content: {
    padding: theme.spacing.lg,
  },
  actionsCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  actionsTitle: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.titleMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  errorContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.error + '10',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.error + '30',
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.body,
    color: theme.colors.error,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
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
  getStartedButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  getStartedText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bodyMedium,
  },
  infoContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.accent + '10',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.accent + '30',
    marginTop: theme.spacing.lg,
  },
  infoTitle: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.titleMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.body,
    color: theme.colors.text,
    lineHeight: 22,
  },
});