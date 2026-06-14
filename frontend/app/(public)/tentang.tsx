import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { Colors } from '../../constants/colors'

export default function TentangScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Tentang Kami</Text>
        <Text style={styles.pageSubtitle}>GoSilat — Portal Kejuaraan Silat Indonesia</Text>
      </View>

      {/* Sejarah */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sejarah</Text>
        <Text style={styles.body}>
          GoSilat didirikan dengan semangat untuk memajukan olahraga Pencak Silat
          di Indonesia. Berawal dari kebutuhan akan platform digital yang mampu
          mengelola kejuaraan secara efisien, GoSilat hadir sebagai solusi modern
          bagi para atlit, pelatih, dan penyelenggara kejuaraan.
        </Text>
      </View>

      {/* Visi Misi */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Visi</Text>
        <View style={styles.visiBox}>
          <Text style={styles.visiText}>
            "Menjadi platform digital terdepan dalam pengelolaan dan
            pengembangan Pencak Silat di Indonesia."
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Misi</Text>
        {[
          'Menyediakan informasi kejuaraan yang akurat dan mudah diakses.',
          'Mempermudah proses pendaftaran atlit secara digital.',
          'Mendukung transparansi hasil dan data kejuaraan.',
          'Membangun ekosistem Pencak Silat yang modern dan profesional.',
        ].map((misi, i) => (
          <View key={i} style={styles.misiItem}>
            <View style={styles.misiDot} />
            <Text style={styles.misiText}>{misi}</Text>
          </View>
        ))}
      </View>

      {/* Privasi & Kebijakan */}
      <View style={[styles.section, styles.privasiSection]}>
        <Text style={styles.sectionTitle}>Privasi & Kebijakan</Text>
        <Text style={styles.body}>
          GoSilat berkomitmen untuk melindungi data pribadi pengguna sesuai
          dengan peraturan perlindungan data yang berlaku di Indonesia.
          Data yang dikumpulkan hanya digunakan untuk keperluan operasional
          kejuaraan dan tidak akan disebarkan kepada pihak ketiga tanpa
          persetujuan pengguna.
        </Text>
        <Text style={[styles.body, { marginTop: 12 }]}>
          Dengan menggunakan layanan GoSilat, kamu menyetujui kebijakan
          penggunaan data kami. Untuk pertanyaan lebih lanjut, hubungi kami
          melalui email resmi GoSilat.
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  pageHeader: {
    backgroundColor: Colors.primary,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  pageSubtitle: {
    fontSize: 13,
    color: Colors.cream,
    opacity: 0.8,
    textAlign: 'center',
  },
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  privasiSection: {
    backgroundColor: Colors.backgroundSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  visiBox: {
    backgroundColor: Colors.yellow,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.orange,
  },
  visiText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: Colors.brown,
    lineHeight: 24,
    fontWeight: '600',
  },
  misiItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  misiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.orange,
    marginTop: 6,
  },
  misiText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    flex: 1,
  },
})