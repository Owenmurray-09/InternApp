import { Slot } from 'expo-router';
import { AuthProvider } from '@/lib/auth/AuthProvider';
import { RouteGuard } from '@/components/RouteGuard';

export default function RootLayout() {
  return (
    <AuthProvider>
      <RouteGuard>
        <Slot />
      </RouteGuard>
    </AuthProvider>
  );
}
