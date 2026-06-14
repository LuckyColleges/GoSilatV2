import { useEffect } from 'react'
import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Colors } from '../../constants/colors'
import Carousel from '../../components/home/Carousel'
import PartnershipBox from '../../components/home/PartnershipBox'
import TournamentCard from '../../components/home/TournamentCard'
import { useAuthStore } from '../../store/authStore'

export default function HomeScreen() {
  const router = useRouter()
  const { isAuthenticated, user, isLoaded } = useAuthStore()

  useEffect(() => {
    if (isLoaded && isAuthenticated && user?.role_id === 1) {
      router.replace('/(admin)/dashboard')
    }
  }, [isAuthenticated, user, isLoaded])

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Carousel */}
      <Carousel />

      {/* Our Partnerships */}
      <PartnershipBox />

      {/* Kejuaraan Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kejuaraan</Text>
        <TournamentCard />
      </View>

      {/* Tutorial Section */}
      <View style={styles.tutorialSection}>
        <Text style={styles.sectionTitle}>Cara Daftar Kejuaraan</Text>
        <Text style={styles.tutorialText}>
          Lihat panduan lengkap cara mendaftarkan atlit ke kejuaraan GoSilat.
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  tutorialSection: {
    padding: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
  },
  tutorialText: {
    color: Colors.textLight,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
})
