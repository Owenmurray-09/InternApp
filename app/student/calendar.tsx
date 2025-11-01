import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/config/theme';
import { CalendarView } from '@/components/ui/CalendarView';
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
}

export default function CalendarScreen() {
  const { user } = useAuthContext();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Note: In a real implementation, you would fetch events from Supabase
  // For now, we'll show a placeholder implementation
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
        //     jobs (
        //       title
        //     )
        //   `)
        //   .eq('participant_user_id', user.id)
        //   .order('start_at', { ascending: true });

        // For now, return empty array or mock data
        const mockEvents: CalendarEvent[] = [
          // Uncomment to test with mock data:
          // {
          //   id: '1',
          //   title: 'Interview with TechCorp',
          //   start_at: new Date().toISOString(),
          //   end_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          //   notes: 'Phone interview for software intern position',
          //   jobs: { title: 'Software Intern' }
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
    console.log(
      event.title,
      `${new Date(event.start_at).toLocaleString()}\n\n${event.notes || 'No additional details'}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Calendar</Text>
          <Text style={styles.subtitle}>
            View your upcoming interviews and events
          </Text>
        </View>

        <View style={styles.content}>
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
              <Text style={styles.emptyTitle}>No Events Scheduled</Text>
              <Text style={styles.emptyText}>
                When you have interviews or other events scheduled, they'll appear here.
                {'\n\n'}
                Events are typically scheduled when:
                {'\n'}• Employers want to interview you
                {'\n'}• Company information sessions are planned
                {'\n'}• Application deadlines are approaching
              </Text>
            </View>
          )}

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>📅 About Your Calendar</Text>
            <Text style={styles.infoText}>
              This calendar shows your job-related events including:
              {'\n'}• Interview appointments
              {'\n'}• Company information sessions
              {'\n'}• Application deadlines
              {'\n'}• Follow-up reminders
              {'\n\n'}
              Employers can schedule events with you directly through the platform.
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
  errorContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.danger + '10',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.danger + '30',
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.body,
    color: theme.colors.danger,
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