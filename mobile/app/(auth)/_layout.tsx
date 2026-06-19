import { useEffect, useState } from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../src/stores';

export default function AuthLayout() {
  const { isAuthenticated, checkStoredAuth } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    checkStoredAuth().finally(() => setChecked(true));
  }, []);

  if (!checked) return null;
  if (isAuthenticated) return <Redirect href="/(app)/dashboard" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}