import { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  useWindowDimensions,
} from 'react-native'

import { useRouter } from 'expo-router'

import { Colors } from '../../../constants/colors'

import {
  Tournament,
  TournamentStatus,
} from '../../../types/tournament'

import { tournamentService } from '../../../services/tournamentService'
import { formatDateToID } from '../../../utils/dateFormatter'
import { resolveImageUrl } from '../../../utils/urlResolver'

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

const FILTERS: {
  label: string
  value: TournamentStatus | 'all'
}[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Coming Soon', value: 'coming_soon' },
  {
    label: 'Dibuka',
    value: 'registration_open',
  },
  {
    label: 'Ditutup',
    value: 'registration_closed',
  },
  { label: 'Berlangsung', value: 'ongoing' },
  { label: 'Selesai', value: 'finished' },
]

const ITEMS_PER_PAGE = 10

export default function PertandinganScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  
  const isMobile = width < 768
  const COLUMN_COUNT = isMobile ? 1 : 2
  const LIST_PADDING = 24
  const GAP = 24
  
  const CARD_WIDTH = (width - (LIST_PADDING * 2) - (GAP * (COLUMN_COUNT - 1))) / COLUMN_COUNT

  const [tournaments, setTournaments] =
    useState<Tournament[]>([])

  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')

  const [activeFilter, setActiveFilter] =
    useState<TournamentStatus | 'all'>(
      'all'
    )

  const [currentPage, setCurrentPage] =
    useState(1)

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    try {
      setLoading(true)

      const data =
        await tournamentService.getAll()

      setTournaments(data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  // FILTER
  const filteredTournaments = useMemo(() => {
    let result = tournaments

    if (activeFilter !== 'all') {
      result = result.filter(
        (t) => t.status === activeFilter
      )
    }

    if (search.trim()) {
      result = result.filter((t) =>
        t.name
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    }

    return result
  }, [tournaments, activeFilter, search])

  // PAGINATION
  const totalPages = Math.ceil(
    filteredTournaments.length /
      ITEMS_PER_PAGE
  )

  const paginatedData =
    filteredTournaments.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    )

  // RESET PAGE
  useEffect(() => {
    setCurrentPage(1)
  }, [search, activeFilter])

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>
          Daftar Tournament
        </Text>

        <Text style={styles.pageSubtitle}>
          Temukan tournament silat terbaik
        </Text>
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Cari tournament..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* FILTER */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.filterList
        }
        style={{
          maxHeight: 50,
        }}
        data={FILTERS}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === item.value &&
                styles.filterButtonActive,
            ]}
            onPress={() =>
              setActiveFilter(item.value)
            }
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === item.value &&
                  styles.filterTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* CONTENT */}
      {loading ? (
        <Text style={styles.loading}>
          Loading tournament...
        </Text>
      ) : paginatedData.length === 0 ? (
        <Text style={styles.empty}>
          Tournament tidak ditemukan
        </Text>
      ) : (
        <>
          <FlatList
            data={paginatedData}
            keyExtractor={(item) =>
              item.id.toString()
            }
            numColumns={2}
            columnWrapperStyle={{
              justifyContent:
                'space-between',
            }}
            contentContainerStyle={
              styles.list
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.card, { width: CARD_WIDTH }]}
                onPress={() =>
                  router.push(
                    `/(public)/pertandingan/${item.id}`
                  )
                }
              >
                {/* BANNER */}
                <Image
                  source={{
                    uri:
                      resolveImageUrl(item.banner_url) ||
                      'https://placehold.co/600x400?text=No+Banner',
                  }}
                  style={styles.banner}
                  resizeMode="contain"
                />

                {/* STATUS */}
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        STATUS_COLOR[
                          item.status
                        ],
                    },
                  ]}
                >
                  <Text
                    style={styles.statusText}
                  >
                    {
                      STATUS_LABEL[
                        item.status
                      ]
                    }
                  </Text>
                </View>

                {/* CONTENT */}
                <View style={styles.cardBody}>
                  <Text
                    style={styles.cardTitle}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={
                      styles.cardLocation
                    }
                    numberOfLines={1}
                  >
                    📍 {item.location}
                  </Text>

                  <Text
                    style={styles.cardDate}
                  >
                    📅 {formatDateToID(item.start_date)}
                  </Text>

                  <Text
                    style={styles.cardDate}
                  >
                    👥 {item.registered_count} / {item.quota} peserta
                  </Text>

                  <TouchableOpacity
                    style={
                      styles.detailButton
                    }
                    onPress={() =>
                      router.push(
                        `/(public)/pertandingan/${item.id}`
                      )
                    }
                  >
                    <Text
                      style={
                        styles.detailButtonText
                      }
                    >
                      Lihat Detail
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />

          {/* PAGINATION */}
          <View style={styles.pagination}>
            <TouchableOpacity
              disabled={currentPage === 1}
              style={[
                styles.pageButton,
                currentPage === 1 &&
                  styles.pageButtonDisabled,
              ]}
              onPress={() =>
                setCurrentPage(
                  (prev) => prev - 1
                )
              }
            >
              <Text
                style={
                  styles.pageButtonText
                }
              >
                Prev
              </Text>
            </TouchableOpacity>

            <Text style={styles.pageInfo}>
              Page {currentPage} /{' '}
              {totalPages || 1}
            </Text>

            <TouchableOpacity
              disabled={
                currentPage ===
                  totalPages ||
                totalPages === 0
              }
              style={[
                styles.pageButton,
                (currentPage ===
                  totalPages ||
                  totalPages === 0) &&
                  styles.pageButtonDisabled,
              ]}
              onPress={() =>
                setCurrentPage(
                  (prev) => prev + 1
                )
              }
            >
              <Text
                style={
                  styles.pageButtonText
                }
              >
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      Colors.background,
      
  },

  pageHeader: {
    backgroundColor: Colors.primary,
    padding: 28,
    alignItems: 'center',
  },

  pageTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.textLight,
  },

  pageSubtitle: {
    fontSize: 14,
    color: Colors.cream,
    marginTop: 6,
  },

  searchContainer: {
    padding: 16,
  },

  searchInput: {
    backgroundColor:
      Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  filterList: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },

  filterButton: {
    backgroundColor:
      Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  filterText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },

  filterTextActive: {
    color: Colors.textLight,
    fontWeight: 'bold',
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 24,
  },

  card: {
    backgroundColor:
      Colors.background,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },

  banner: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.backgroundSecondary,
  },

  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    color: Colors.textLight,
    fontSize: 11,
    fontWeight: 'bold',
  },

  cardBody: {
    padding: 14,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
    minHeight: 40,
  },

  cardLocation: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },

  cardDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  detailButton: {
    marginTop: 14,
    backgroundColor: Colors.orange,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  detailButtonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 13,
  },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    marginBottom: 28,
  },

  pageButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  pageButtonDisabled: {
    opacity: 0.4,
  },

  pageButtonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
  },

  pageInfo: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  loading: {
    textAlign: 'center',
    marginTop: 40,
  },

  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: Colors.textSecondary,
  },
})
