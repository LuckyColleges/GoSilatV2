import { useEffect, useState, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors } from '../../../constants/colors'
import { tournamentService } from '../../../services/tournamentService'
import { getWinnersByTournament } from '../../../services/winnerService'
import { Tournament } from '../../../types/tournament'
import { Winner } from '../../../types/winner'

const RANK_COLOR: Record<number, string> = {
  1: '#FFD700',
  2: '#A8A8A8',
  3: '#CD7F32',
}

const RANK_LABEL: Record<number, string> = {
  1: '🥇 Juara 1',
  2: '🥈 Juara 2',
  3: '🥉 Juara 3',
}

export default function WinnerDetailScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isNarrow = width < 768

  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [winners, setWinners] = useState<Winner[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      try {
        setLoading(true)
        const [tData, wData] = await Promise.all([
          tournamentService.getById(Number(id)),
          getWinnersByTournament(Number(id)),
        ])
        setTournament(tData)
        setWinners(wData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const filteredWinners = useMemo(() => {
    return winners.filter(
      (w) =>
        w.athlete_name?.toLowerCase().includes(search.toLowerCase()) ||
        w.contingent_name?.toLowerCase().includes(search.toLowerCase()) ||
        w.category_name?.toLowerCase().includes(search.toLowerCase())
    )
  }, [winners, search])

  const groupedWinners = useMemo(() => {
    return filteredWinners.reduce((acc, winner) => {
      const key = `${winner.category_name} (${winner.category_type})`
      if (!acc[key]) acc[key] = []
      acc[key].push(winner)
      return acc
    }, {} as Record<string, Winner[]>)
  }, [filteredWinners])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Memuat data pemenang...</Text>
      </View>
    )
  }

  if (!tournament) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Pertandingan tidak ditemukan.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.tournamentTitle}>{tournament.name}</Text>
        <View style={styles.headerDetails}>
          <Text style={styles.headerDetailText}>📅 {tournament.start_date}</Text>
          <Text style={styles.headerDetailText}>👥 {tournament.registered_count || 0} / {tournament.quota || 0} Kuota</Text>
          <Text style={styles.headerDetailText}>📍 {tournament.location}</Text>
        </View>
      </View>

      <View style={styles.body}>
        {/* SEARCH WINNER */}
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🥋</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari atlit, kontingen, kategori..."
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

        {/* WINNERS TABLE */}
        {filteredWinners.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏅</Text>
            <Text style={styles.emptyText}>
              {search ? 'Tidak ada data pemenang yang sesuai pencarian.' : 'Belum ada data pemenang untuk pertandingan ini.'}
            </Text>
          </View>
        ) : (
          Object.keys(groupedWinners).map((categoryKey) => (
            <View key={categoryKey} style={styles.categoryGroup}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{categoryKey}</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  {/* TABLE HEADER */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.thCell, { width: 110 }]}>Rank</Text>
                    <Text style={[styles.thCell, { width: 200 }]}>Nama Atlit</Text>
                    <Text style={[styles.thCell, { width: 150 }]}>Kontingen</Text>
                    <Text style={[styles.thCell, { width: 100 }]}>Gender</Text>
                    <Text style={[styles.thCell, { width: 160 }]}>Kategori</Text>
                    <Text style={[styles.thCell, { width: 100 }]}>Min BB</Text>
                    <Text style={[styles.thCell, { width: 100 }]}>Max BB</Text>
                    <Text style={[styles.thCell, { width: 130 }]}>Jenis</Text>
                  </View>

                  {/* TABLE ROWS */}
                  {groupedWinners[categoryKey].map((winner, i) => (
                    <View
                      key={winner.id}
                      style={[
                        styles.tableRow,
                        i % 2 === 0 && styles.tableRowAlt,
                      ]}
                    >
                      <View style={[styles.tdCell, { width: 110 }]}>
                        <View style={[
                          styles.rankBadge,
                          { backgroundColor: RANK_COLOR[winner.rank] ?? Colors.border }
                        ]}>
                          <Text style={styles.rankText}>
                            {RANK_LABEL[winner.rank] ?? `#${winner.rank}`}
                          </Text>
                        </View>
                      </View>

                      <Text style={[styles.tdText, { width: 200 }]}>
                        {winner.athlete_name ?? '-'}
                      </Text>

                      <Text style={[styles.tdText, { width: 150 }]}>
                        {winner.contingent_name ?? '-'}
                      </Text>

                      <View style={[styles.tdCell, { width: 100 }]}>
                        <View style={[
                          styles.genderBadge,
                          winner.athlete_gender === 'male' ? styles.genderMale : styles.genderFemale
                        ]}>
                          <Text style={styles.genderText}>
                            {winner.athlete_gender === 'male' ? '♂ L' : '♀ P'}
                          </Text>
                        </View>
                      </View>

                      <Text style={[styles.tdText, { width: 160 }]}>
                        {winner.category_name ?? '-'}
                      </Text>

                      <Text style={[styles.tdText, { width: 100 }]}>
                        {winner.min_weight ? `${winner.min_weight} kg` : '-'}
                      </Text>

                      <Text style={[styles.tdText, { width: 100 }]}>
                        {winner.max_weight ? `${winner.max_weight} kg` : '-'}
                      </Text>

                      <Text style={[styles.tdText, { width: 130 }]}>
                        {winner.category_type ?? '-'}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          ))
        )}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backBtnText: {
    color: Colors.textLight,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 24,
    paddingTop: 40,
  },
  backLink: {
    alignSelf: 'flex-start',  // ← flex start
    backgroundColor: Colors.orange,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  backLinkText: {
    color: Colors.cream,
    fontSize: 14,
    fontWeight: '600',
  },
  tournamentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textLight,
    marginBottom: 12,
  },
  headerDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  headerDetailText: {
    fontSize: 13,
    color: Colors.cream,
    opacity: 0.9,
  },
  body: {
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
    marginBottom: 24,
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
  categoryGroup: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryHeader: {
    backgroundColor: Colors.yellow,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.brown,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  thCell: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 12,
    paddingRight: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  tableRowAlt: {
    backgroundColor: Colors.backgroundSecondary,
  },
  tdCell: {
    justifyContent: 'center',
    paddingRight: 8,
  },
  tdText: {
    fontSize: 13,
    color: Colors.text,
    paddingRight: 8,
  },
  rankBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  rankText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.brown,
  },
  genderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  genderMale: {
    backgroundColor: '#DBEAFE',
  },
  genderFemale: {
    backgroundColor: '#FCE7F3',
  },
  genderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.text,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: '80%',
  },
})
