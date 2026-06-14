import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, FlatList, useWindowDimensions, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { Colors } from '../../constants/colors'
import { Tournament, TournamentStatus } from '../../types/tournament'
import { tournamentService } from '../../services/tournamentService'
import { useAuthStore } from '../../store/authStore'
import CustomModal from '../ui/Modal'
import { formatDateToID } from '../../utils/dateFormatter'
import { resolveImageUrl } from '../../utils/urlResolver'

const STATUS_LABEL: Record<TournamentStatus, string> = {
  coming_soon: 'Coming Soon',
  registration_open: 'Pendaftaran Dibuka',
  registration_closed: 'Pendaftaran Ditutup',
  ongoing: 'Berlangsung',
  finished: 'Selesai',
}

const STATUS_COLOR: Record<TournamentStatus, string> = {
  coming_soon: Colors.statusComingSoon,
  registration_open: Colors.statusOpen,
  registration_closed: Colors.statusClosed,
  ongoing: Colors.statusOngoing,
  finished: Colors.statusFinished,
}

export default function TournamentCard() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const { width } = useWindowDimensions()

  // Responsif: 1 kolom di HP, 2 di layar besar
  const isMobile = width < 768
  const COLUMN_COUNT = isMobile ? 1 : 2
  const LIST_PADDING = 24
  const GAP = 24 // Increased from 16 for better spacing

  const cardWidth = (width - (LIST_PADDING * 2) - (GAP * (COLUMN_COUNT - 1))) / COLUMN_COUNT

  // Custom Modal state
  const [modalVisible, setModalVisible] = useState(false)
  const [pendingTournamentId, setPendingTournamentId] = useState<number | null>(null)

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await tournamentService.getAll()
        setTournaments(data)
      } catch (error) {
        console.error('Failed to fetch tournaments:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTournaments()
  }, [])

  const handleDaftar = (tournamentId: number) => {
    if (!user) {
      setPendingTournamentId(tournamentId)
      setModalVisible(true)
      return
    }
    router.push(`/(official)/pendaftaran/${tournamentId}`)
  }

  if (loading) {
    return <Text style={styles.loading}>Memuat kejuaraan...</Text>
  }

  return (
    <View style={{ flex: 1 }}>
      <CustomModal
        visible={modalVisible}
        title="Login Diperlukan"
        message="Silakan login terlebih dahulu untuk melakukan pendaftaran."
        type="info"
        onClose={() => setModalVisible(false)}
        onConfirm={() => {
          setModalVisible(false)
          router.push('/(auth)/login')
        }}
        confirmText="Login Sekarang"
      />

      <FlatList
        data={tournaments}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        numColumns={COLUMN_COUNT}
        key={COLUMN_COUNT}
        columnWrapperStyle={COLUMN_COUNT > 1 ? { justifyContent: 'space-between' } : null}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { width: cardWidth }]}
            onPress={() => router.push(`/(public)/pertandingan/${item.id}`)}
          >
            {/* Banner Image */}
            <View style={styles.bannerContainer}>
                {item.banner_url ? (
                    <Image 
                        source={{ uri: resolveImageUrl(item.banner_url) || undefined }} 
                        style={styles.banner}
                        resizeMode="contain"
                    />
                ) : (
                    <View style={styles.bannerPlaceholder}>
                        <Text style={styles.placeholderText}>No Banner</Text>
                    </View>
                )}
                {/* Status Badge Over Image */}
                <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] }]}>
                    <Text style={styles.badgeText}>{STATUS_LABEL[item.status]}</Text>
                </View>
            </View>

            {/* Info */}
            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.detail}>📍 {item.location}</Text>
                <Text style={styles.detail}>📅 {formatDateToID(item.start_date)}</Text>
                <Text style={styles.detail}>
                👥 {item.registered_count} / {item.quota} peserta
                </Text>

                <View style={styles.footerBtns}>
                    <TouchableOpacity
                        style={styles.btnDetail}
                        onPress={() => router.push(`/(public)/pertandingan/${item.id}`)}
                    >
                        <Text style={styles.btnDetailText}>Detail</Text>
                    </TouchableOpacity>

                    {item.status === 'registration_open' && (
                        <TouchableOpacity
                        style={styles.btnDaftar}
                        onPress={() => handleDaftar(item.id)}
                        >
                        <Text style={styles.btnDaftarText}>Daftar</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  loading: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.brown,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden', // Required for image borderRadius
  },
  bannerContainer: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.backgroundSecondary,
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
  },
  placeholderText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: Colors.textLight,
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
    minHeight: 40,
  },
  detail: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  footerBtns: {
    flexDirection: 'row', 
    gap: 8,
    marginTop: 14,
    width: '100%',
  },
  btnDetail: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  btnDetailText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  btnDaftar: {
    flex: 1,
    backgroundColor: Colors.orange,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnDaftarText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 12,
  },
})
