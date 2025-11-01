import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@/config/theme';
import { Card } from './Card';

interface CalendarEvent {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  notes?: string;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventPress?: (event: CalendarEvent) => void;
  loading?: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ events, onEventPress, loading }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getEventsForDate = (day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const targetDateString = targetDate.toISOString().split('T')[0];

    return events.filter(event => {
      const eventDate = new Date(event.start_at).toISOString().split('T')[0];
      return eventDate === targetDateString;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell} />
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day);
      const hasEvents = dayEvents.length > 0;
      const today = isToday(day);

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            today && styles.todayCell,
            hasEvents && styles.eventCell
          ]}
          onPress={() => {
            if (hasEvents && onEventPress && dayEvents[0]) {
              onEventPress(dayEvents[0]);
            }
          }}
        >
          <Text style={[
            styles.dayText,
            today && styles.todayText,
            hasEvents && styles.eventText
          ]}>
            {day}
          </Text>
          {hasEvents && (
            <View style={styles.eventIndicator}>
              <Text style={styles.eventCount}>{dayEvents.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <Card style={styles.container}>
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      {/* Calendar Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('prev')}
        >
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.monthYear}>{formatDate(currentDate)}</Text>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('next')}
        >
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Days of week header */}
      <View style={styles.weekHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <View key={day} style={styles.weekDay}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {renderCalendarGrid()}
      </View>

      {/* Events for selected month */}
      {events.length > 0 && (
        <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
          <Text style={styles.eventsTitle}>Events This Month</Text>
          {events
            .filter(event => {
              const eventDate = new Date(event.start_at);
              return (
                eventDate.getMonth() === currentDate.getMonth() &&
                eventDate.getFullYear() === currentDate.getFullYear()
              );
            })
            .map(event => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventItem}
                onPress={() => onEventPress?.(event)}
              >
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>
                  {new Date(event.start_at).toLocaleDateString()} at{' '}
                  {new Date(event.start_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
                {event.notes && (
                  <Text style={styles.eventNotes}>{event.notes}</Text>
                )}
              </TouchableOpacity>
            ))}
        </ScrollView>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.body,
    color: theme.colors.textSecondary,
    padding: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  navButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
  },
  navButtonText: {
    fontSize: 24,
    fontFamily: theme.fontFamily.titleMedium,
    color: theme.colors.primary,
  },
  monthYear: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.titleMedium,
    color: theme.colors.text,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  weekDayText: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.bodyMedium,
    color: theme.colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.lg,
  },
  dayCell: {
    width: '14.28%', // 1/7 of the width
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRadius: theme.borderRadius.sm,
    margin: 1,
  },
  todayCell: {
    backgroundColor: theme.colors.primary,
  },
  eventCell: {
    backgroundColor: theme.colors.accent + '20', // 20% opacity
  },
  dayText: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.body,
    color: theme.colors.text,
  },
  todayText: {
    color: theme.colors.textOnPrimary,
    fontFamily: theme.fontFamily.bodyMedium,
  },
  eventText: {
    fontFamily: theme.fontFamily.bodyMedium,
  },
  eventIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: theme.colors.accent,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventCount: {
    fontSize: 10,
    fontFamily: theme.fontFamily.bodyMedium,
    color: theme.colors.textOnPrimary,
  },
  eventsList: {
    maxHeight: 200,
  },
  eventsTitle: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.titleMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  eventItem: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
  },
  eventTitle: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.bodyMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  eventDate: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  eventNotes: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.body,
    color: theme.colors.text,
  },
});