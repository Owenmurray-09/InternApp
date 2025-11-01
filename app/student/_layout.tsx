import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuthContext } from '@/lib/auth/AuthProvider';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/config/theme';

export default function StudentLayout() {
  const { status, role, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading
    if (loading) return;

    // If not authenticated, redirect to login
    if (status === 'unauthenticated') {
      router.replace('/login/student');
      return;
    }

    // If authenticated but wrong role, redirect to their proper section
    if (status === 'authenticated' && role) {
      if (role === 'employer') {
        router.replace('/employer');
        return;
      }
      // If role is 'student', continue to render
      if (role !== 'student') {
        // This shouldn't happen, but just in case
        router.replace('/');
        return;
      }
    }

    // If authenticated but no role set, redirect to home (shouldn't happen with new flow)
    if (status === 'authenticated' && !role) {
      router.replace('/');
      return;
    }
  }, [status, role, loading, router]);

  // Show loading while auth is being determined
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Only render content if user is authenticated as a student
  if (status === 'authenticated' && role === 'student') {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            paddingBottom: 8,
            paddingTop: 8,
            height: 80,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textLight,
          tabBarLabelStyle: {
            fontFamily: theme.fontFamily.bodyMedium,
            fontSize: 12,
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Jobs',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="work" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="applications"
          options={{
            title: 'Applications',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="assignment" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="event" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    );
  }

  // Show loading while redirects are happening
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Redirecting...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});