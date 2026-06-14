import { useEffect, useState, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  TextInput,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors } from '../../../constants/colors'
import { registrationService } from '../../../services/registrationService'
import { tournamentService } from '../../../services/tournamentService'
import { Tournament } from '../../../types/tournament'
import CustomModal from '../../../components/ui/Modal'

export default function TournamentRegistrationsScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [registrations, setRegistrations] = useState<any[]>([])
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [modal, setModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
  })

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [regData, tData] = await Promise.all([
        registrationService.getTournamentRegistrations(Number(id)),
        tournamentService.getById(Number(id)),
      ])
      setRegistrations(regData.data || [])
      setTournament(tData)
    } catch (error: any) {
      setModal({
        visible: true,
        title: 'Error',
        message: error.response?.data?.message || 'Gagal mengambil data',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    const url = registrationService.getExportUrl(Number(id))
    Linking.openURL(url).catch((err) => {
      setModal({
        visible: true,
        title: 'Error',
        message: 'Gagal membuka link download: ' + err.message,
        type: 'error',
      })
    })
  }

  const filteredRegistrations = useMemo(() => {
    if (!search) return registrations
    const s = search.toLowerCase()
    return registrations.filter(r => 
        r.athlete_name?.toLowerCase().includes(s) ||
        r.contingent_name?.toLowerCase().includes(s) ||
        r.category_name?.toLowerCase().includes(s) ||
        r.official_name?.toLowerCase().includes(s) ||
        r.school_name?.toLowerCase().includes(s)
    )
  }, [registrations, search])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return Colors.success
      case 'rejected': return Colors.danger
      default: return Colors.orange
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
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
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Data Pendaftar</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{tournament?.name || 'Kejuaraan'}</Text>
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Kembali</Text>
        </TouchableOpacity>
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={{ flex: 1, marginRight: 12 }}>
            <TextInput 
                style={styles.searchInput}
                placeholder="Cari atlit, kontingen, kategori..."
                value={search}
                onChangeText={setSearch}
            />
        </View>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
          <Text style={styles.exportBtnText}>📥 Export Excel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
         <Text style={styles.stats}>{filteredRegistrations.length} dari {registrations.length} Atlit ditemukan</Text>
      </View>

      {/* Table */}
      <ScrollView horizontal>
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { width: 40 }]}>No</Text>
            <Text style={[styles.headerCell, { width: 150 }]}>Nama Atlit</Text>
            <Text style={[styles.headerCell, { width: 130 }]}>NIK</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Tgl Lahir</Text>
            <Text style={[styles.headerCell, { width: 130 }]}>Kontingen</Text>
            <Text style={[styles.headerCell, { width: 120 }]}>Kategori</Text>
            <Text style={[styles.headerCell, { width: 110 }]}>Tingkat</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Official</Text>
            <Text style={[styles.headerCell, { width: 80 }]}>BB</Text>
            <Text style={[styles.headerCell, { width: 70 }]}>TB</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Status Reg</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Pembayaran</Text>
          </View>
          <ScrollView style={{ flex: 1 }}>
            {filteredRegistrations.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Belum ada pendaftar / data tidak ditemukan.</Text>
              </View>
            ) : (
              filteredRegistrations.map((item, index) => (
                <View key={item.id} style={[styles.tableRow, index % 2 === 1 && styles.rowAlt]}>
                  <Text style={[styles.cell, { width: 40 }]}>{index + 1}</Text>
                  <Text style={[styles.cell, { width: 150, fontWeight: 'bold', textAlign: 'left' }]}>{item.athlete_name}</Text>
                  <Text style={[styles.cell, { width: 130 }]}>{item.nik}</Text>
                  <Text style={[styles.cell, { width: 100 }]}>{item.birth_date ? new Date(item.birth_date).toLocaleDateString('id-ID') : '-'}</Text>
                  <Text style={[styles.cell, { width: 130, color: Colors.primaryLight }]}>{item.contingent_name}</Text>
                  <Text style={[styles.cell, { width: 120 }]}>{item.category_name || '-'}</Text>
                  <Text style={[styles.cell, { width: 110 }]}>{item.category_tingkat || '-'}</Text>
                  <Text style={[styles.cell, { width: 100 }]}>{item.official_name}</Text>
                  <Text style={[styles.cell, { width: 80 }]}>{item.weight} kg</Text>
                  <Text style={[styles.cell, { width: 70 }]}>{item.height} cm</Text>
                  <Text style={[styles.cell, { width: 100, color: getStatusColor(item.status_reg), fontWeight: 'bold' }]}>
                    {(item.status_reg || 'pending').toUpperCase()}
                  </Text>
                  <Text style={[styles.cell, { width: 100, color: item.payment_status === 'paid' ? Colors.success : Colors.orange }]}>
                    {(item.payment_status || 'pending').toUpperCase()}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: Colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: Colors.textLight, fontSize: 20, fontWeight: 'bold' },
  subtitle: { color: Colors.cream, fontSize: 12, opacity: 0.8, marginTop: 2 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  backBtnText: { color: Colors.textLight, fontSize: 13, fontWeight: 'bold' },
  toolbar: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 14,
  },
  statsRow: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.cream },
  stats: { fontSize: 12, fontWeight: 'bold', color: Colors.textSecondary },
  exportBtn: { backgroundColor: Colors.success, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, elevation: 2 },
  exportBtnText: { color: Colors.textLight, fontWeight: 'bold', fontSize: 14 },
  tableHeader: { flexDirection: 'row', backgroundColor: Colors.primaryLight, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerCell: { paddingHorizontal: 10, fontSize: 12, fontWeight: 'bold', color: Colors.textLight, textAlign: 'center' },
  tableRow: { flexDirection: 'row', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border, alignItems: 'center', backgroundColor: Colors.background },
  rowAlt: { backgroundColor: Colors.backgroundSecondary },
  cell: { paddingHorizontal: 10, fontSize: 12, color: Colors.text, textAlign: 'center' },
  empty: { padding: 40, alignItems: 'center', width: 800 },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },
})
