import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuthContext } from '@/lib/auth/AuthProvider';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function EmployerLayout() {
  const { status, role, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading
    if (loading) return;

    // If not authenticated, redirect to login
    if (status === 'unauthenticated') {
      router.replace('/login/employer');
      return;
    }

    // If authenticated but wrong role, redirect to their proper section
    if (status === 'authenticated' && role) {
      if (role === 'student') {
        router.replace('/student');
        return;
      }
      // If role is 'employer', continue to render
      if (role !== 'employer') {
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
        <ActivityIndicator size="large" color="#34C759" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Only render content if user is authenticated as an employer
  if (status === 'authenticated' && role === 'employer') {
    return <Slot />;
  }

  // Show loading while redirects are happening
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#34C759" />
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