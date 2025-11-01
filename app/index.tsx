import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/lib/auth/AuthProvider';

export default function LandingScreen() {
  const router = useRouter();
  const { status, user, signOut } = useAuthContext();

  const handleStudentLogin = () => {
    router.push('/login/student');
  };

  const handleEmployerLogin = () => {
    router.push('/login/employer');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  // If user is already authenticated, show them where they can go
  if (status === 'authenticated') {
    const userRole = user?.user_metadata?.role;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>
          You're logged in as: {user?.email}
        </Text>
        <Text style={styles.roleText}>
          Role: {userRole || 'No role set'}
        </Text>

        <View style={styles.buttonContainer}>
          {userRole === 'student' && (
            <TouchableOpacity
              style={[styles.roleButton, styles.studentButton]}
              onPress={() => router.push('/student')}
            >
              <Text style={styles.buttonText}>Go to Student Dashboard</Text>
            </TouchableOpacity>
          )}

          {userRole === 'employer' && (
            <TouchableOpacity
              style={[styles.roleButton, styles.employerButton]}
              onPress={() => router.push('/employer')}
            >
              <Text style={styles.buttonText}>Go to Employer Dashboard</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <StatusBar style="auto" />
      </View>
    );
  }

  // Landing page for unauthenticated users
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clean Job Marketplace</Text>
      <Text style={styles.subtitle}>
        Connecting students with meaningful work opportunities
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.roleButton, styles.studentButton]}
          onPress={handleStudentLogin}
        >
          <Text style={styles.buttonIcon}>🎓</Text>
          <Text style={styles.buttonText}>I'm a Student</Text>
          <Text style={styles.buttonSubtext}>Find internships and jobs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, styles.employerButton]}
          onPress={handleEmployerLogin}
        >
          <Text style={styles.buttonIcon}>🏢</Text>
          <Text style={styles.buttonText}>I'm an Employer</Text>
          <Text style={styles.buttonSubtext}>Post jobs and hire students</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  roleText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  roleButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  studentButton: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  employerButton: {
    borderColor: '#34C759',
    backgroundColor: '#f0fff4',
  },
  buttonIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  signOutButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
