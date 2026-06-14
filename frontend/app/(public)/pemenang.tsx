import { useEffect, useState, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Image,
  useWindowDimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Colors } from '../../constants/colors'
import { tournamentService } from '../../services/tournamentService'
import { Tournament } from '../../types/tournament'
import { resolveImageUrl } from '../../utils/urlResolver'

export default function PemenangScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  
  // Calculate columns based on width
  const numColumns = width > 1000 ? 3 : width > 600 ? 2 : 1
  const cardWidth = (width - 32 - (numColumns - 1) * 16) / numColumns

  const [search, setSearch] = useState('')
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await tournamentService.getAll()
        setTournaments(data)
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTournaments()
  }, [])

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [tournaments, search])

  const renderTournamentCard = ({ item }: { item: Tournament }) => (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={() => router.push(`/(public)/pemenang/${item.id}`)}
    >
      <Image
        source={{ uri: resolveImageUrl(item.banner_url) || 'https://placehold.co/600x400?text=No+Banner' }}
        style={styles.cardBanner}
        resizeMode="contain"
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
        <View style={styles.cardDetailRow}>
          <Text style={styles.cardDetailText}>📅 {item.start_date}</Text>
        </View>
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() => router.push(`/(public)/pemenang/${item.id}`)}
        >
          <Text style={styles.viewBtnText}>Lihat Pemenang</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* PAGE HEADER */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>🏆 Daftar Pemenang</Text>
        <Text style={styles.pageSubtitle}>Pilih pertandingan untuk melihat hasil kejuaraan</Text>
      </View>

      <View style={styles.body}>
        {/* SEARCH BAR */}
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari pertandingan..."
            placeholderTextColor={Colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Memuat pertandingan...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTournaments}
            renderItem={renderTournamentCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={numColumns}
            key={numColumns} // Force re-render when numColumns changes
            contentContainerStyle={styles.listContainer}
            columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🏅</Text>
                <Text style={styles.emptyText}>Tidak ada pertandingan ditemukan.</Text>
              </View>
            }
          />
        )}
      </View>
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
    fontSize: 14,
    color: Colors.cream,
    opacity: 0.8,
  },
  body: {
    flex: 1,
    padding: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
    gap: 10,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  clearBtn: {
    fontSize: 14,
    color: Colors.textSecondary,
    paddingHorizontal: 4,
  },
  listContainer: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
    gap: 16,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardBanner: {
    width: '100%',
    height: 150,
    backgroundColor: Colors.backgroundSecondary,
  },
  cardContent: {
    padding: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    height: 44,
  },
  cardDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDetailText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  viewBtn: {
    marginTop: 8,
    backgroundColor: Colors.orange,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewBtnText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 13,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
})
