import { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Colors } from '../../constants/colors'
import { registrationService } from '../../services/registrationService'
import { formatDateToID } from '../../utils/dateFormatter'

export default function MyRegistrationsScreen() {
  const router = useRouter()
  const [summaries, setSummaries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSummary = async () => {
    try {
      setLoading(true)
      const response = await registrationService.getMySummary()
      setSummaries(response.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return Colors.statusOpen
      case 'rejected':
        return Colors.statusClosed
      default:
        return Colors.statusComingSoon
    }
  }

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status_reg) },
          ]}
        >
          <Text style={styles.statusText}>{(item.status_reg || 'pending').toUpperCase()}</Text>
        </View>
        <Text style={styles.regDate}>{formatDateToID(item.registered_at)}</Text>
      </View>

      <Text style={styles.tournamentName}>{item.tournament_name}</Text>
      <Text style={styles.location}>📍 {item.tournament_location}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Jumlah Atlit</Text>
          <Text style={styles.infoValue}>{item.athlete_count} Atlit</Text>
        </View>

        <TouchableOpacity
          style={styles.btnAction}
          onPress={() => router.push(`/(official)/pendaftaran/${item.tournament_id}`)}
        >
          <Text style={styles.btnActionText}>Lihat Registrasi</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Riwayat Registrasi</Text>
        <Text style={styles.pageSubtitle}>Daftar pendaftaran kejuaraan Anda</Text>
      </View>

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Kembali</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : summaries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Anda belum melakukan registrasi apapun.</Text>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push('/(public)/pertandingan')}
          >
            <Text style={styles.btnPrimaryText}>Cari Kejuaraan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={summaries}
          keyExtractor={(item) => item.tournament_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  pageHeader: {
    backgroundColor: Colors.primary,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center', // Align center
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textLight,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 13,
    color: Colors.cream,
    opacity: 0.8,
    marginTop: 6,
    textAlign: 'center',
  },
  navBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    gap: 16,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: Colors.textLight,
    fontSize: 10,
    fontWeight: 'bold',
  },
  regDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tournamentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  infoBox: {
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  btnAction: {
    backgroundColor: Colors.orange,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  btnActionText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 13,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 15,
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  btnPrimaryText: {
    color: Colors.textLight,
    fontWeight: 'bold',
  },
})
