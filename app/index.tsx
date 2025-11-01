import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
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

  // If user is already authenticated, redirect to their dashboard
  if (status === 'authenticated') {
    const userRole = user?.user_metadata?.role;

    if (userRole === 'student') {
      router.replace('/student');
      return null;
    } else if (userRole === 'employer') {
      router.replace('/employer');
      return null;
    }

    // If no role is set, show landing page to let them choose
    // This shouldn't happen with our current auth flow, but just in case
  }

  // Landing page for unauthenticated users
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/InternAppBridgeLogo.jpg')}
        style={styles.logo}
        resizeMode="contain"
        onError={() => console.log('Image failed to load')}
      />
      <Text style={[styles.title, { display: 'none' }]}>Bridge</Text>
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
  logo: {
    height: 120,
    marginBottom: 8,
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
});
