import { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors } from '../../../../constants/colors'
import { registrationService } from '../../../../services/registrationService'
import { tournamentService } from '../../../../services/tournamentService'
import { adminService } from '../../../../services/adminService'
import { Tournament } from '../../../../types/tournament'
import CustomModal from '../../../../components/ui/Modal'

export default function OfficialRegistrationsScreen() {
  const { tournamentId, official_id, contingent_name } = useLocalSearchParams()
  const router = useRouter()
  
  const [registrations, setRegistrations] = useState<any[]>([])
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const [modal, setModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
  })

  useEffect(() => {
    fetchData()
  }, [tournamentId, official_id, contingent_name])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [regData, tData] = await Promise.all([
        registrationService.getRegistrationsByOfficial(
            Number(tournamentId), 
            Number(official_id), 
            contingent_name as string
        ),
        tournamentService.getById(Number(tournamentId)),
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
    const url = registrationService.getExportUrl(
        Number(tournamentId), 
        Number(official_id), 
        contingent_name as string
    )
    Linking.openURL(url).catch((err) => {
      setModal({
        visible: true,
        title: 'Error',
        message: 'Gagal membuka link download: ' + err.message,
        type: 'error',
      })
    })
  }

  const handlePaymentUpdate = async (status: 'paid' | 'failed') => {
    try {
      setUpdating(true)
      await adminService.updatePaymentStatus({
        official_id: Number(official_id),
        tournament_id: Number(tournamentId),
        contingent_name: contingent_name as string,
        payment_status: status,
      })
      await fetchData()
      setModal({
        visible: true,
        title: 'Sukses',
        message: `Status pembayaran kontingen berhasil diupdate menjadi ${status.toUpperCase()}`,
        type: 'success',
      })
    } catch (error: any) {
      setModal({
        visible: true,
        title: 'Error',
        message: error.response?.data?.message || 'Gagal update status pembayaran',
        type: 'error',
      })
    } finally {
      setUpdating(false)
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
          <Text style={styles.title}>{contingent_name}</Text>
          <Text style={styles.subtitle}>{tournament?.name}</Text>
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Kembali</Text>
        </TouchableOpacity>
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={{ flex: 1 }}>
            <Text style={styles.stats}>{registrations.length} Atlit</Text>
            <Text style={{ fontSize: 10, color: Colors.textSecondary }}>Official: {registrations[0]?.official_name}</Text>
        </View>
        
        <View style={styles.actionButtons}>
            <TouchableOpacity 
                style={[styles.payBtn, { backgroundColor: Colors.success }]} 
                onPress={() => handlePaymentUpdate('paid')}
                disabled={updating}
            >
                <Text style={styles.btnText}>Set LUNAS</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.payBtn, { backgroundColor: Colors.danger }]} 
                onPress={() => handlePaymentUpdate('failed')}
                disabled={updating}
            >
                <Text style={styles.btnText}>Set GAGAL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
                <Text style={styles.btnText}>📥 Excel</Text>
            </TouchableOpacity>
        </View>
      </View>

      {/* Table - Matching Excel Format */}
      <ScrollView horizontal>
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { width: 40 }]}>No</Text>
            <Text style={[styles.headerCell, { width: 150 }]}>Nama Atlit</Text>
            <Text style={[styles.headerCell, { width: 130 }]}>NIK</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Tgl Lahir</Text>
            <Text style={[styles.headerCell, { width: 120 }]}>Kategori</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Tingkat</Text>
            <Text style={[styles.headerCell, { width: 60 }]}>BB</Text>
            <Text style={[styles.headerCell, { width: 60 }]}>TB</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Pembayaran</Text>
            <Text style={[styles.headerCell, { width: 100 }]}>Status Reg</Text>
          </View>
          <ScrollView style={{ flex: 1 }}>
            {registrations.map((item, index) => (
              <View key={item.id} style={[styles.tableRow, index % 2 === 1 && styles.rowAlt]}>
                <Text style={[styles.cell, { width: 40 }]}>{index + 1}</Text>
                <Text style={[styles.cell, { width: 150, fontWeight: 'bold', textAlign: 'left' }]}>{item.athlete_name}</Text>
                <Text style={[styles.cell, { width: 130 }]}>{item.nik}</Text>
                <Text style={[styles.cell, { width: 100 }]}>{item.birth_date ? new Date(item.birth_date).toLocaleDateString('id-ID') : '-'}</Text>
                <Text style={[styles.cell, { width: 120 }]}>{item.category_name}</Text>
                <Text style={[styles.cell, { width: 100 }]}>{item.category_tingkat}</Text>
                <Text style={[styles.cell, { width: 60 }]}>{item.weight}kg</Text>
                <Text style={[styles.cell, { width: 60 }]}>{item.height}cm</Text>
                <Text style={[styles.cell, { width: 100, fontWeight: 'bold', color: item.payment_status === 'paid' ? Colors.success : Colors.danger }]}>
                    {(item.payment_status || 'pending').toUpperCase()}
                </Text>
                <Text style={[styles.cell, { width: 100, fontWeight: 'bold' }]}>
                    {(item.status_reg || 'pending').toUpperCase()}
                </Text>
              </View>
            ))}
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
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stats: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
  actionButtons: { flexDirection: 'row', gap: 6 },
  payBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6 },
  exportBtn: { backgroundColor: '#10B981', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 10 },
  
  tableHeader: { flexDirection: 'row', backgroundColor: Colors.primaryLight, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerCell: { paddingHorizontal: 10, fontSize: 11, fontWeight: 'bold', color: Colors.textLight, textAlign: 'center' },
  tableRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border, alignItems: 'center', backgroundColor: Colors.background },
  rowAlt: { backgroundColor: Colors.backgroundSecondary },
  cell: { paddingHorizontal: 10, fontSize: 11, color: Colors.text, textAlign: 'center' },
})
