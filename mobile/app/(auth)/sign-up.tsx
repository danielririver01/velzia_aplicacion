import { useCallback, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Text, TextInput, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSignUp } from '@clerk/clerk-expo';
import { useAuthStore } from '../../src/stores';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { isLoaded, signUp, setActive } = useSignUp();
  const { loginWithClerk, isLoading, error, clearError } = useAuthStore();

  const handleSignUp = useCallback(async () => {
    if (!isLoaded) return;
    clearError();

    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error('Clerk sign up error:', err);
    }
  }, [isLoaded, email, password]);

  const handleVerify = useCallback(async () => {
    if (!isLoaded) return;
    clearError();

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        const clerkToken = result.createdSessionId;
        if (clerkToken) {
          const success = await loginWithClerk(clerkToken);
          if (success) router.replace('/(app)/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Clerk verify error:', err);
    }
  }, [isLoaded, code]);

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    fieldName: string,
    options?: { placeholder?: string; keyboardType?: 'default' | 'email-address'; secureTextEntry?: boolean; autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'; maxLength?: number }
  ) => {
    const isFocused = focusedField === fieldName;
    return (
      <View style={styles.inputContainer}>
        <View style={styles.labelContainer}>
          <Text style={[styles.label, isFocused && styles.labelFocused]}>{label}</Text>
        </View>
        <TextInput
          style={[styles.input, isFocused && styles.inputFocused]}
          placeholder={options?.placeholder || ''}
          placeholderTextColor="#262626"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocusedField(fieldName)}
          onBlur={() => setFocusedField(null)}
          keyboardType={options?.keyboardType || 'default'}
          secureTextEntry={options?.secureTextEntry}
          autoCapitalize={options?.autoCapitalize || 'none'}
          maxLength={options?.maxLength}
        />
      </View>
    );
  };

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
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.logo}>Velzia</Text>
            <View style={styles.spacer} />
          </View>

          {!pendingVerification ? (
            <>
              <View style={styles.welcomeSection}>
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={['#f2460d', '#f97316']}
                    style={styles.iconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialIcons name="person-add" size={28} color="#ffffff" />
                  </LinearGradient>
                </View>
                <Text style={styles.title}>Crea tu cuenta</Text>
                <Text style={styles.subtitle}>
                  Usa el mismo email que registraste en la web.
                </Text>
              </View>

              <View style={styles.form}>
                {renderInput('Correo electrónico', email, setEmail, 'email', {
                  placeholder: 'nombre@dominio.com', keyboardType: 'email-address',
                })}
                {renderInput('Contraseña', password, setPassword, 'password', {
                  placeholder: 'Mínimo 8 caracteres', secureTextEntry: true,
                })}
                {error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}
                <TouchableOpacity
                  style={[styles.signInButton, (!email || !password || isLoading) && styles.signInButtonDisabled]}
                  onPress={handleSignUp}
                  disabled={isLoading || !email || !password}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#f2460d', '#f97316']}
                    style={styles.signInGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.signInText}>{isLoading ? 'CREANDO...' : 'REGISTRARSE'}</Text>
                    {!isLoading && <Text style={styles.signInArrow}>→</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.welcomeSection}>
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={['#f2460d', '#f97316']}
                    style={styles.iconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialIcons name="mail-outline" size={28} color="#ffffff" />
                  </LinearGradient>
                </View>
                <Text style={styles.title}>Verifica tu email</Text>
                <Text style={styles.subtitle}>
                  Ingresa el código de verificación enviado a {email}
                </Text>
              </View>

              <View style={styles.form}>
                {renderInput('Código de verificación', code, setCode, 'code', {
                  placeholder: '000000', keyboardType: 'email-address', maxLength: 6,
                })}
                {error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}
                <TouchableOpacity
                  style={[styles.signInButton, (code.length < 6 || isLoading) && styles.signInButtonDisabled]}
                  onPress={handleVerify}
                  disabled={isLoading || code.length < 6}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#f2460d', '#f97316']}
                    style={styles.signInGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.signInText}>{isLoading ? 'VERIFICANDO...' : 'VERIFICAR'}</Text>
                    {!isLoading && <Text style={styles.signInArrow}>→</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>{'¿Ya tienes cuenta? '}</Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)')}>
              <Text style={styles.footerLink}>Inicia sesión</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 16, position: 'relative' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: '#e0c0b1', fontSize: 24 },
  logo: { fontFamily: 'Outfit', fontSize: 30, fontWeight: '900', letterSpacing: -1.8, color: '#ffb690', position: 'absolute', left: 0, right: 0, textAlign: 'center' },
  spacer: { width: 40 },
  welcomeSection: { alignItems: 'center', marginTop: 20, marginBottom: 32 },
  iconContainer: { marginBottom: 20 },
  iconGradient: { width: 64, height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#f97316', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 30, elevation: 10 },
  title: { fontFamily: 'Outfit', fontSize: 28, fontWeight: '900', letterSpacing: -1.5, color: '#ffffff', textTransform: 'uppercase', marginBottom: 8 },
  subtitle: { fontFamily: 'Inter', fontSize: 14, fontWeight: '500', color: '#71717a', textAlign: 'center', lineHeight: 21, paddingHorizontal: 16 },
  form: { gap: 16 },
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
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 'auto', paddingTop: 32 },
  footerText: { fontFamily: 'Inter', fontSize: 12, fontWeight: '700', color: '#71717a' },
  footerLink: { fontFamily: 'Inter', fontSize: 12, fontWeight: '700', color: '#ffb690' },
});