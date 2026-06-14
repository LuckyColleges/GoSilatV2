import { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  ScrollView,
  useWindowDimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Colors } from '../../constants/colors'
import { adminService } from '../../services/adminService'
import { tournamentService } from '../../services/tournamentService'
import { Tournament } from '../../types/tournament'
import CustomModal from '../../components/ui/Modal'

type ApprovalStatus = 'pending' | 'approved' | 'rejected'

interface RegistrationGroup {
  official_id: number
  official_name: string
  tournament_id: number
  event_name: string
  contingent_name: string
  athlete_count: number
  status_reg: ApprovalStatus
  submitted_at: string
}

const STATUS_COLOR: Record<ApprovalStatus, string> = {
  pending: Colors.warning,
  approved: Colors.success,
  rejected: Colors.danger,
}

const STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending: '⏳ Pending',
  approved: '✅ Approved',
  rejected: '❌ Rejected',
}

const PAGE_SIZE = 20

export default function ApprovalScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  
  const isMobile = width < 768
  const COLUMN_COUNT = isMobile ? 1 : 2
  const LIST_PADDING = 16
  const sidebarWidth = isMobile ? 0 : 240
  const CARD_GAP = 12
  
  const availableWidth = width - sidebarWidth - (LIST_PADDING * 2)
  const cardWidth = (availableWidth - (COLUMN_COUNT > 1 ? CARD_GAP : 0)) / COLUMN_COUNT

  const [registrations, setRegistrations] = useState<RegistrationGroup[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)

  // Filters
  const [activeStatusFilter, setActiveStatusFilter] = useState<ApprovalStatus | 'all'>('all')
  const [tournamentSearch, setTournamentSearch] = useState('')
  const [registrantSearch, setRegistrantSearch] = useState('')
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | 'all'>('all')
  const [showTournamentDropdown, setShowTournamentDropdown] = useState(false)

  // Modal State
  const [modal, setModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
    onConfirm: undefined as (() => void) | undefined,
  })

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setModal({ visible: true, title, message, type, onConfirm: undefined })
  }

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModal({ visible: true, title, message, type: 'info', onConfirm })
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [regRes, tRes] = await Promise.all([
        adminService.getRegistrations(),
        tournamentService.getAll()
      ])
      setRegistrations(regRes.data)
      setTournaments(tRes)
    } catch (error: any) {
      showAlert('Error', error.response?.data?.message || 'Gagal mengambil data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = (item: RegistrationGroup, status: ApprovalStatus) => {
    const actionLabel = status === 'approved' ? 'Setujui' : status === 'rejected' ? 'Tolak' : 'Pendingkan'
    showConfirm(
      status.toUpperCase(),
      `${actionLabel} pendaftaran dari ${item.contingent_name}?`,
      async () => {
        setModal({ ...modal, visible: false })
        try {
          await adminService.updateRegistrationStatus({
            official_id: item.official_id,
            tournament_id: item.tournament_id,
            contingent_name: item.contingent_name,
            status,
          })
          const regRes = await adminService.getRegistrations()
          setRegistrations(regRes.data)
          showAlert('Sukses', `Status berhasil diupdate menjadi ${status}`, 'success')
        } catch (error: any) {
          showAlert('Error', error.response?.data?.message || 'Gagal update status', 'error')
        }
      }
    )
  }

  const handlePaymentUpdate = (item: RegistrationGroup, paymentStatus: 'paid' | 'failed') => {
    showConfirm(
      'UPDATE PEMBAYARAN',
      `Tandai semua atlit ${item.contingent_name} sebagai ${paymentStatus.toUpperCase()}?`,
      async () => {
        setModal({ ...modal, visible: false })
        try {
          await adminService.updatePaymentStatus({
            official_id: item.official_id,
            tournament_id: item.tournament_id,
            contingent_name: item.contingent_name,
            payment_status: paymentStatus,
          })
          showAlert('Sukses', `Status pembayaran kontingen berhasil diupdate`, 'success')
        } catch (error: any) {
          showAlert('Error', error.response?.data?.message || 'Gagal update pembayaran', 'error')
        }
      }
    )
  }

  const allFiltered = useMemo(() => {
    return registrations.filter((r) => {
      if (activeStatusFilter !== 'all' && r.status_reg !== activeStatusFilter) return false
      if (selectedTournamentId !== 'all' && r.tournament_id !== selectedTournamentId) return false
      if (tournamentSearch && !r.event_name.toLowerCase().includes(tournamentSearch.toLowerCase())) return false
      if (registrantSearch) {
        const matchContingent = r.contingent_name.toLowerCase().includes(registrantSearch.toLowerCase())
        const matchOfficial = r.official_name.toLowerCase().includes(registrantSearch.toLowerCase())
        if (!matchContingent && !matchOfficial) return false
      }
      return true
    })
  }, [registrations, activeStatusFilter, tournamentSearch, registrantSearch, selectedTournamentId])

  const paginatedRegistrations = useMemo(() => {
    return allFiltered.slice(0, currentPage * PAGE_SIZE)
  }, [allFiltered, currentPage])

  const selectedTournamentName = useMemo(() => {
    if (selectedTournamentId === 'all') return 'Semua Pertandingan'
    return tournaments.find(t => t.id === selectedTournamentId)?.name || 'Pilih Pertandingan'
  }, [selectedTournamentId, tournaments])

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <CustomModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ ...modal, visible: false })}
        onConfirm={modal.onConfirm}
      />
      
      {/* Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Approval Pendaftaran</Text>
        <Text style={styles.pageSubtitle}>
          {allFiltered.length} data ditemukan
        </Text>
      </View>

      {/* SEARCH BARS */}
      <View style={styles.searchSection}>
        <View style={[
            styles.searchRow, 
            isMobile && { flexDirection: 'column', gap: 20 },
            { zIndex: showTournamentDropdown ? 100 : 1 } // Ensure whole row stays on top when dropdown open
        ]}>
            {/* TOURNAMENT FILTER */}
            <View style={[styles.searchGroup, { zIndex: showTournamentDropdown ? 100 : 1 }]}>
                <Text style={styles.searchLabel}>Cari Pertandingan</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Nama kejuaraan..."
                    value={tournamentSearch}
                    onChangeText={(t) => { setTournamentSearch(t); setCurrentPage(1); }}
                />
                <TouchableOpacity 
                    style={styles.dropdownTrigger}
                    onPress={() => setShowTournamentDropdown(!showTournamentDropdown)}
                >
                    <Text style={styles.dropdownText} numberOfLines={1}>{selectedTournamentName}</Text>
                    <Text style={{ fontSize: 10 }}>▼</Text>
                </TouchableOpacity>
                
                {showTournamentDropdown && (
                    <View style={styles.dropdownList}> 
                        <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                            <TouchableOpacity 
                                style={styles.dropdownItem}
                                onPress={() => { setSelectedTournamentId('all'); setShowTournamentDropdown(false); setCurrentPage(1); }}
                            >
                                <Text>Semua Pertandingan</Text>
                            </TouchableOpacity>
                            {tournaments.map(t => (
                                <TouchableOpacity 
                                    key={t.id}
                                    style={styles.dropdownItem}
                                    onPress={() => { setSelectedTournamentId(t.id); setShowTournamentDropdown(false); setCurrentPage(1); }}
                                >
                                    <Text>{t.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>

            {/* REGISTRANT FILTER */}
            <View style={[styles.searchGroup, { zIndex: 1 }]}>
                <Text style={styles.searchLabel}>Cari Pendaftar</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Kontingen / Official..."
                    value={registrantSearch}
                    onChangeText={(t) => { setRegistrantSearch(t); setCurrentPage(1); }}
                />
            </View>
        </View>

        {/* STATUS FILTER (BELOW SEARCH) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <TouchableOpacity
                key={f}
                style={[styles.filterTab, activeStatusFilter === f && styles.filterTabActive]}
                onPress={() => { setActiveStatusFilter(f); setCurrentPage(1); }}
            >
                <Text style={[styles.filterText, activeStatusFilter === f && styles.filterTextActive]}>
                {f === 'all' ? 'Semua' : STATUS_LABEL[f]}
                </Text>
            </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={paginatedRegistrations}
        numColumns={COLUMN_COUNT}
        key={COLUMN_COUNT} // Force re-render when column count changes
        keyExtractor={(item, index) => `${item.official_id}-${item.tournament_id}-${item.contingent_name}-${index}`}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Tidak ada pendaftaran yang sesuai kriteria.</Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { width: cardWidth }]}>
            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status_reg] }]}>
                <Text style={styles.statusText}>{STATUS_LABEL[item.status_reg]}</Text>
            </View>

            <Text style={styles.contingentName} numberOfLines={1}>{item.contingent_name}</Text>
            <Text style={styles.detail} numberOfLines={1}>👤 {item.official_name}</Text>
            <Text style={styles.detail} numberOfLines={1}>🏆 {item.event_name}</Text>
            <Text style={styles.detail}>🥋 {item.athlete_count} Atlit</Text>
            <Text style={styles.detail}>📅 {new Date(item.submitted_at).toLocaleDateString()}</Text>

            <View style={styles.divider} />

            {/* Main Actions */}
            <TouchableOpacity 
                style={[styles.btnAction, { backgroundColor: Colors.primary, marginBottom: 12 }]}
                onPress={() => router.push({
                    pathname: `/(admin)/registrations/official/[tournamentId]`,
                    params: { 
                        tournamentId: item.tournament_id,
                        official_id: item.official_id,
                        contingent_name: item.contingent_name
                    }
                })}
            >
                <Text style={styles.btnActionText}>👥 Lihat Atlit</Text>
            </TouchableOpacity>

            {/* Batch Payment Actions */}
            <View style={styles.batchContainer}>
                <Text style={styles.batchLabel}>Update Pembayaran:</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                    <TouchableOpacity 
                        style={[styles.miniBatchBtn, { backgroundColor: Colors.success }]}
                        onPress={() => handlePaymentUpdate(item, 'paid')}
                    >
                        <Text style={styles.miniBatchBtnText}>LUNAS</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.miniBatchBtn, { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: Colors.danger }]}
                        onPress={() => handlePaymentUpdate(item, 'failed')}
                    >
                        <Text style={[styles.miniBatchBtnText, { color: Colors.danger }]}>GAGAL</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Status Approval Actions */}
            <View style={[styles.batchContainer, { marginTop: 8 }]}>
                <Text style={styles.batchLabel}>Update Status Registrasi:</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                    <TouchableOpacity 
                        style={[styles.miniBatchBtn, { backgroundColor: Colors.success }]}
                        onPress={() => handleStatusUpdate(item, 'approved')}
                    >
                        <Text style={styles.miniBatchBtnText}>APPROVE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.miniBatchBtn, { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: Colors.danger }]}
                        onPress={() => handleStatusUpdate(item, 'rejected')}
                    >
                        <Text style={[styles.miniBatchBtnText, { color: Colors.danger }]}>REJECT</Text>
                    </TouchableOpacity>
                </View>
            </View>
          </View>
        )}
        onEndReached={() => {
            if (paginatedRegistrations.length < allFiltered.length) {
                setCurrentPage(prev => prev + 1)
            }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
            paginatedRegistrations.length < allFiltered.length ? (
                <ActivityIndicator style={{ marginVertical: 20 }} color={Colors.primary} />
            ) : null
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  pageHeader: { backgroundColor: Colors.primary, padding: 24 },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.textLight },
  pageSubtitle: { fontSize: 13, color: Colors.cream, opacity: 0.8, marginTop: 4 },
  
  searchSection: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 20, // Increased from 16
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    zIndex: 10,
  },
  searchRow: { flexDirection: 'row', gap: 16 }, // Increased gap from 12
  searchLabel: { fontSize: 11, fontWeight: 'bold', color: Colors.primary, marginBottom: 6 }, // Slightly larger and primary color
  searchInput: {
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dropdownTrigger: {
    marginTop: 8,
    backgroundColor: Colors.cream,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dropdownText: { fontSize: 11, color: Colors.primary, fontWeight: 'bold', flex: 1 },
  dropdownList: {
    position: 'absolute',
    top: 85, // Adjusted to appear below the dropdown trigger button (label + input + trigger)
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 100,
  },
  searchGroup: {
    flex: 1,
    position: 'relative', // Key for absolute positioning of dropdown inside
  },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },

  filterRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  filterTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 11, color: Colors.textSecondary },
  filterTextActive: { color: Colors.textLight, fontWeight: 'bold' },

  list: { padding: 16 },
  empty: { textAlign: 'center', marginTop: 40, color: Colors.textSecondary },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    marginBottom: 16,
    marginRight: 12, // Standard gap
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: { color: Colors.textLight, fontSize: 9, fontWeight: 'bold' },

  contingentName: { fontSize: 15, fontWeight: 'bold', color: Colors.primary, marginBottom: 6 },
  detail: { fontSize: 11, color: Colors.textSecondary, marginBottom: 3 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  
  btnAction: {
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActionText: { color: Colors.textLight, fontWeight: 'bold', fontSize: 12 },

  batchContainer: { 
    backgroundColor: Colors.backgroundSecondary, 
    padding: 8, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  batchLabel: { fontSize: 9, fontWeight: 'bold', color: Colors.textSecondary },
  miniBatchBtn: { flex: 1, paddingVertical: 6, borderRadius: 5, alignItems: 'center' },
  miniBatchBtnText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
})
