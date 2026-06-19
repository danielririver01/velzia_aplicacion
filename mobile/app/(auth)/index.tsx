import { useCallback, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Text, TextInput, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';
import { useAuthStore } from '../../src/stores';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { isLoaded, signIn, setActive } = useSignIn();
  const { loginWithClerk, isLoading, error, clearError } = useAuthStore();

  const handleLogin = useCallback(async () => {
    if (!isLoaded) return;
    clearError();

    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        const clerkToken = result.createdSessionId;
        if (clerkToken) {
          await setActive({ session: result.createdSessionId });
          const success = await loginWithClerk(clerkToken);
          if (success) router.replace('/(app)/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Clerk sign in error:', err);
    }
  }, [isLoaded, email, password]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />
      <View style={styles.backgroundGradient}>
        <LinearGradient
          colors={['rgba(249,115,22,0.15)', 'transparent']}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.spacer} />
            <Text style={styles.logo}>Velzia</Text>
            <View style={styles.spacer} />
          </View>

          <View style={styles.welcomeSection}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#f2460d', '#f97316']}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialIcons name="rocket-launch" size={28} color="#ffffff" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Bienvenido de vuelta</Text>
            <Text style={styles.subtitle}>
              Ingresa tus credenciales para continuar.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Text style={[styles.label, emailFocused && styles.labelFocused]}>
                  Correo electrónico
                </Text>
              </View>
              <TextInput
                style={[styles.input, emailFocused && styles.inputFocused]}
                placeholder="nombre@dominio.com"
                placeholderTextColor="#262626"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Text style={[styles.label, passwordFocused && styles.labelFocused]}>
                  Contraseña
                </Text>
              </View>
              <TextInput
                style={[styles.input, passwordFocused && styles.inputFocused]}
                placeholder="••••••••"
                placeholderTextColor="#262626"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.signInButton, (!email || !password || isLoading) && styles.signInButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading || !email || !password}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#f2460d', '#f97316']}
                style={styles.signInGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.signInText}>
                  {isLoading ? 'INGRESANDO...' : 'INICIAR SESIÓN'}
                </Text>
                {!isLoading && <Text style={styles.signInArrow}>→</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{'¿No tienes cuenta? '}</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
              <Text style={styles.footerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  backgroundGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 400 },
  gradient: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 60, paddingBottom: 16, position: 'relative' },
  logo: { fontFamily: 'Outfit', fontSize: 30, fontWeight: '900', letterSpacing: -1.8, color: '#ffb690', position: 'absolute', left: 0, right: 0, textAlign: 'center' },
  spacer: { width: 40 },
  welcomeSection: { alignItems: 'center', marginTop: 40, marginBottom: 48 },
  iconContainer: { marginBottom: 24 },
  iconGradient: { width: 64, height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#f97316', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 30, elevation: 10 },
  title: { fontFamily: 'Outfit', fontSize: 30, fontWeight: '900', letterSpacing: -1.8, color: '#ffffff', textTransform: 'uppercase', marginBottom: 8 },
  subtitle: { fontFamily: 'Inter', fontSize: 14, fontWeight: '500', color: '#71717a', textAlign: 'center', lineHeight: 21 },
  form: { gap: 24 },
  inputContainer: { position: 'relative' },
  labelContainer: { position: 'absolute', top: -8, left: 16, zIndex: 10, backgroundColor: '#050505', paddingHorizontal: 8 },
  label: { fontFamily: 'Inter', fontSize: 9, fontWeight: '900', letterSpacing: 2.5, color: '#a1a1aa', textTransform: 'uppercase' },
  labelFocused: { color: '#ffb690' },
  input: { backgroundColor: '#0a0a0a', borderWidth: 1, borderColor: '#262626', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 16, fontFamily: 'Inter', fontSize: 14, fontWeight: '500', color: '#ffffff' },
  inputFocused: { borderColor: '#ffb690', shadowColor: '#ffb690', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  errorContainer: { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  errorText: { fontFamily: 'Inter', fontSize: 13, fontWeight: '500', color: '#ef4444', textAlign: 'center' },
  signInButton: { marginTop: 8, borderRadius: 16, overflow: 'hidden', shadowColor: '#f2460d', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 8 },
  signInButtonDisabled: { opacity: 0.5, shadowOpacity: 0, elevation: 0 },
  signInGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 18, gap: 8 },
  signInText: { fontFamily: 'Inter', fontSize: 10, fontWeight: '900', letterSpacing: 2, color: '#ffffff', textTransform: 'uppercase' },
  signInArrow: { color: '#ffffff', fontSize: 18 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 'auto', paddingTop: 48 },
  footerText: { fontFamily: 'Inter', fontSize: 12, fontWeight: '700', color: '#71717a' },
  footerLink: { fontFamily: 'Inter', fontSize: 12, fontWeight: '700', color: '#ffb690' },
});