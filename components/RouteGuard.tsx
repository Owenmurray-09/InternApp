import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuthContext } from '@/lib/auth/AuthProvider';

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { status, role, loading } = useAuthContext();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Don't redirect while loading
    if (loading) return;

    const isLoginPage = segments[0] === 'login';
    const isStudentSection = segments[0] === 'student';
    const isEmployerSection = segments[0] === 'employer';
    const isHomePage = segments.length === 0 || segments[0] === 'index';

    // If user is not authenticated and trying to access protected routes
    if (status === 'unauthenticated' && !isLoginPage && !isHomePage) {
      router.replace('/');
      return;
    }

    // If user is authenticated but on login pages, redirect to appropriate dashboard
    if (status === 'authenticated' && isLoginPage) {
      if (role === 'student') {
        router.replace('/student');
      } else if (role === 'employer') {
        router.replace('/employer');
      } else {
        // No role set, stay on home
        router.replace('/');
      }
      return;
    }

    // Simple role-based protection (main layouts handle detailed protection)
    if (status === 'authenticated' && role) {
      // If student trying to access employer section
      if (role === 'student' && isEmployerSection) {
        router.replace('/student');
        return;
      }

      // If employer trying to access student section
      if (role === 'employer' && isStudentSection) {
        router.replace('/employer');
        return;
      }
    }
  }, [status, role, loading, segments, router]);

  // Show loading screen while auth is initializing
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
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