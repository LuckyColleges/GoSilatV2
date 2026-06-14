import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Colors } from '../../constants/colors'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'

export default function RegisterScreen() {
  const router = useRouter()
  const { setAuth } = useAuthStore()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Semua field wajib diisi.')
      return
    }
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak sama.')
      return
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await authService.register({
        name,
        email,
        password,
        phone,
      })
      setAuth(response.user, response.token)
      router.replace('/(official)/mydata')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Registrasi gagal, coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Brand */}
      <View style={styles.brandSection}>
        <Text style={styles.brand}>GoSilat</Text>
        <Text style={styles.brandSub}>Daftar sebagai Official</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Buat Akun</Text>
        <Text style={styles.subtitle}>
          Akun official digunakan untuk mendaftarkan atlit ke kejuaraan
        </Text>

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Name */}
        <Text style={styles.label}>Nama Lengkap</Text>
        <TextInput
          style={styles.input}
          placeholder="Nama official / pelatih"
          placeholderTextColor={Colors.textSecondary}
          value={name}
          onChangeText={setName}
        />

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="contoh@email.com"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Phone */}
        <Text style={styles.label}>No. HP (opsional)</Text>
        <TextInput
          style={styles.input}
          placeholder="08xxxxxxxxxx"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Minimal 8 karakter"
          placeholderTextColor={Colors.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Confirm Password */}
        <Text style={styles.label}>Konfirmasi Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Ulangi password"
          placeholderTextColor={Colors.textSecondary}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.btnRegister, loading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textLight} />
          ) : (
            <Text style={styles.btnText}>Daftar Sekarang</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Sudah punya akun? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginLink}>Login di sini</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brand: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 2,
  },
  brandSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 4,
    shadowColor: Colors.brown,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnRegister: {
    backgroundColor: Colors.orange,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 15,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: 13,
    color: Colors.orange,
    fontWeight: 'bold',
  },
})