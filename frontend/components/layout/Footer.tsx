import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient' // 1. Import LinearGradient
import { Colors } from '../../constants/colors'
import { Config } from '../../constants/config'
import { useRouter } from 'expo-router'

export default function Footer() {
  const router = useRouter()

  return (
    /* 2. Ganti View utama dengan LinearGradient.
         - colors: Menerima array warna. Warna pertama (indeks 0) adalah bagian atas, warna kedua adalah bagian bawah.
         - 'transparent': Membuat bagian atas memudar tembus pandang ke background halaman.
         - Colors.primary: Warna solid utama proyekmu di bagian bawah.
    */
    <LinearGradient
      colors={[Colors.primaryLight, Colors.primary]} 
      style={styles.footer}
    >
      {/* Social Media */}
      <View style={styles.socmed}>
        <TouchableOpacity onPress={() => Linking.openURL(Config.INSTAGRAM)}>
          <Text style={styles.socmedItem}>Instagram</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL(Config.YOUTUBE)}>
          <Text style={styles.socmedItem}>YouTube</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL(Config.TIKTOK)}>
          <Text style={styles.socmedItem}>TikTok</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.infoText}>{Config.EMAIL}</Text>
        <Text style={styles.infoText}>Contact: {Config.CONTACT_PERSON}</Text>
        <TouchableOpacity onPress={() => router.push('/(public)/tentang')}>
          <Text style={styles.link}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>

      {/* Rights */}
      <Text style={styles.rights}>
        © {new Date().getFullYear()} {Config.APP_NAME}. All rights reserved.
      </Text>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  footer: {
    // 3. Hapus backgroundColor solid di sini agar tidak menimpa efek gradient-nya
    paddingTop: 40, // Ditambah sedikit padding atas agar efek transparan transisinya lebih halus
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
  },
  blurContainer: {
    overflow: 'hidden',
  },
  socmed: {
    flexDirection: 'row',
    gap: 20,
  },
  socmedItem: {
    color: Colors.textLight,
    fontSize: 14,
  },
  info: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  infoText: {
    color: Colors.textLight,
    fontSize: 12,
    opacity: 0.8,
  },
  link: {
    color: Colors.secondary,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  rights: {
    color: Colors.textLight,
    fontSize: 11,
    opacity: 0.6,
  },
})