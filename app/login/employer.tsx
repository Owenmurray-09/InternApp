import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/lib/auth/AuthProvider';

export default function EmployerLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, loading, error, clearError } = useAuthContext();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email || !password) {
      console.log('Error', 'Please fill in all fields');
      return;
    }

    try {
      clearError();
      if (isSignUp) {
        // Sign up with employer role in metadata
        await signUp(email, password, { role: 'employer' });
        console.log('Success', 'Employer account created! Please check your email to verify your account.');
      } else {
        await signIn(email, password);
        // The auth context will handle redirecting to appropriate page
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    clearError();
  };

  const goBack = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.icon}>🏢</Text>
        <Text style={styles.title}>Employer Portal</Text>
        <Text style={styles.subtitle}>
          {isSignUp
            ? 'Create your employer account to post jobs and hire students'
            : 'Sign in to your employer account'
          }
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isSignUp ? 'Create Employer Account' : 'Sign In as Employer'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
          <Text style={styles.toggleButtonText}>
            {isSignUp
              ? 'Already have an employer account? Sign In'
              : "Don't have an employer account? Sign Up"}
          </Text>
        </TouchableOpacity>

        <View style={styles.switchRole}>
          <Text style={styles.switchRoleText}>
            Looking for internships?
          </Text>
          <TouchableOpacity onPress={() => router.push('/login/student')}>
            <Text style={styles.switchRoleLink}>Go to Student Sign-In</Text>
          </TouchableOpacity>
        </View>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginTop: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#34C759',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#34C759',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  form: {
    flex: 1,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#34C759',
    fontSize: 14,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  switchRole: {
    marginTop: 40,
    alignItems: 'center',
  },
  switchRoleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  switchRoleLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});