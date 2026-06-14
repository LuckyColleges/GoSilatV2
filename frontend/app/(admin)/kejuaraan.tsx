import { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Platform,
  Image,
} from 'react-native'
import { Colors } from '../../constants/colors'
import { Tournament, TournamentStatus } from '../../types/tournament'
import { tournamentService } from '../../services/tournamentService'
import CustomModal from '../../components/ui/Modal'
import { useRouter } from 'expo-router'
import { Config } from '../../constants/config'
import { resolveImageUrl } from '../../utils/urlResolver'

const STATUS_COLOR: Record<string, string> = {
  coming_soon: Colors.statusComingSoon,
  registration_open: Colors.statusOpen,
  registration_closed: Colors.statusClosed,
  ongoing: Colors.statusOngoing,
  finished: Colors.statusFinished,
  open: Colors.statusOpen,
  closed: Colors.statusClosed,
}

const STATUS_LABEL: Record<string, string> = {
  coming_soon: 'Coming Soon',
  registration_open: 'Pendaftaran Dibuka',
  registration_closed: 'Pendaftaran Ditutup',
  ongoing: 'Berlangsung',
  finished: 'Selesai',
  open: 'Dibuka',
  closed: 'Ditutup',
}

const EMPTY_TOURNAMENT = (): Partial<Tournament> & { categories?: string[] } => ({
  name: '',
  location: '',
  description: '',
  banner_url: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: new Date().toISOString().split('T')[0],
  reg_open: new Date().toISOString().split('T')[0],
  reg_close: new Date().toISOString().split('T')[0],
  quota: 0,
  status: 'coming_soon' as TournamentStatus,
  contact_person: '',
  categories: [],
})

const CATEGORY_TINGKAT_OPTIONS = [
    { label: 'Usia Dini 1', value: 'usia_dini_1' },
    { label: 'Usia Dini 2', value: 'usia_dini_2' },
    { label: 'Pra Remaja', value: 'pra_remaja' },
    { label: 'Remaja', value: 'remaja' },
    { label: 'Dewasa', value: 'dewasa' },
]

export default function ManageKejuaraanScreen() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingTournament, setEditingTournament] = useState<Partial<Tournament> & { categories?: string[] }>(EMPTY_TOURNAMENT())
  const [submitting, setSubmitting] = useState(false)
  const [uploadingId, setUploadingId] = useState<number | null>(null)

  const router = useRouter()
  const [activeUploadType, setActiveUploadType] = useState<'thb' | 'rekom' | 'schedule' | 'banner' | 'winner' | null>(null)

  // Custom Modal State
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
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    try {
      setLoading(true)
      const data = await tournamentService.getAll()
      setTournaments(data)
    } catch (error: any) {
      showAlert('Error', error.response?.data?.message || 'Gagal mengambil data kejuaraan', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: number) => {
    showConfirm(
      'Hapus Kejuaraan',
      'Yakin ingin menghapus kejuaraan ini?',
      async () => {
        setModal({ ...modal, visible: false })
        try {
          await tournamentService.delete(id)
          setTournaments((prev) => prev.filter((t) => t.id !== id))
          showAlert('Sukses', 'Kejuaraan berhasil dihapus', 'success')
        } catch (error: any) {
          showAlert('Error', error.response?.data?.message || 'Gagal menghapus kejuaraan', 'error')
        }
      }
    )
  }

  const handleOpenAdd = () => {
    setEditingTournament(EMPTY_TOURNAMENT())
    setModalVisible(true)
  }

  const handleOpenEdit = async (tournament: Tournament) => {
    try {
        setSubmitting(true)
        // Fetch fresh detail with categories
        const detail = await tournamentService.getById(tournament.id)
        setEditingTournament({
            ...detail,
            start_date: detail.start_date ? new Date(detail.start_date).toISOString().split('T')[0] : '',
            end_date: detail.end_date ? new Date(detail.end_date).toISOString().split('T')[0] : '',
            reg_open: detail.reg_open ? new Date(detail.reg_open).toISOString().split('T')[0] : '',
            reg_close: detail.reg_close ? new Date(detail.reg_close).toISOString().split('T')[0] : '',
        })
        setModalVisible(true)
    } catch (e: any) {
        showAlert('Error', 'Gagal memuat detail kejuaraan')
    } finally {
        setSubmitting(false)
    }
  }

  const handleSave = async () => {
    if (!editingTournament.name || !editingTournament.location) {
      return showAlert('Error', 'Nama dan lokasi wajib diisi', 'error')
    }

    if (!editingTournament.categories || editingTournament.categories.length === 0) {
        return showAlert('Error', 'Pilih minimal 1 kategori tingkat', 'error')
    }

    try {
      setSubmitting(true)
      if (editingTournament.id) {
        await tournamentService.update(editingTournament.id, editingTournament)
        showAlert('Sukses', 'Kejuaraan berhasil diupdate', 'success')
      } else {
        await tournamentService.create(editingTournament)
        showAlert('Sukses', 'Kejuaraan berhasil dibuat', 'success')
      }
      setModalVisible(false)
      fetchTournaments()
    } catch (error: any) {
      showAlert('Error', error.response?.data?.message || 'Gagal menyimpan kejuaraan', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleCategory = (tingkat: string) => {
    setEditingTournament(prev => {
        const current = prev.categories || []
        if (current.includes(tingkat)) {
            return { ...prev, categories: current.filter(c => c !== tingkat) }
        } else {
            return { ...prev, categories: [...current, tingkat] }
        }
    })
  }

  const triggerFileUpload = (id: number, type: 'thb' | 'rekom' | 'banner' | 'winner') => {
    if (Platform.OS === 'web') {
        const input = document.createElement('input')
        input.type = 'file'
        
        if (type === 'winner') {
            input.accept = '.xlsx, .xls'
        } else if (type === 'banner') {
            input.accept = 'image/*'
        } else {
            input.accept = 'application/pdf'
        }

        input.onchange = (e: any) => {
            const file = e.target.files[0]
            if (file) handleUpload(id, type, file)
        }
        input.click()
    } else {
        showAlert('Info', 'Fitur upload di mobile memerlukan library expo-document-picker. Silakan gunakan versi web untuk saat ini.')
    }
  }

  const handleUpload = async (id: number, type: 'thb' | 'rekom' | 'banner' | 'winner', file: any) => {
    try {
      setUploadingId(id)
      setActiveUploadType(type)
      setSubmitting(true)
      
      let res;
      if (type === 'winner') {
          res = await adminService.uploadWinners(id, file)
          showAlert('Sukses', `Berhasil memproses pemenang: ${res.summary.success} berhasil, ${res.summary.failed} gagal.`, 'success')
      } else {
          res = await tournamentService.uploadFile(id, type, file)
          // Update local state for immediate preview if modal is open
          if (modalVisible && editingTournament.id === id && type === 'banner') {
              setEditingTournament(prev => ({ ...prev, banner_url: res.url }))
          }
          showAlert('Sukses', `${type.toUpperCase()} berhasil diunggah`, 'success')
      }

      fetchTournaments()
    } catch (error: any) {
      showAlert('Error', error.response?.data?.message || 'Gagal mengunggah file', 'error')
    } finally {
      setSubmitting(false)
      setUploadingId(null)
      setActiveUploadType(null)
    }
  }

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
        <Text style={styles.pageTitle}>Manage Kejuaraan</Text>
        <Text style={styles.pageSubtitle}>{tournaments.length} kejuaraan</Text>
      </View>

      {/* Add Button */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.btnAdd} onPress={handleOpenAdd}>
          <Text style={styles.btnAddText}>+ Tambah Kejuaraan</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={tournaments}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] || Colors.primary }]}>
                <Text style={styles.statusText}>{STATUS_LABEL[item.status] || item.status}</Text>
              </View>
            </View>

            <Text style={styles.tournamentName}>{item.name}</Text>
            <Text style={styles.detail}>📍 {item.location}</Text>
            <Text style={styles.detail}>📅 {new Date(item.start_date).toLocaleDateString()} — {new Date(item.end_date).toLocaleDateString()}</Text>
            <Text style={styles.detail}>👥 {item.registered_count} / {item.quota} peserta</Text>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.btnEdit, { backgroundColor: Colors.primary }]} 
                onPress={() => router.push(`/(admin)/registrations/${item.id}`)}
              >
                <Text style={[styles.btnEditText, { color: Colors.textLight }]}>👥 Lihat Pendaftar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.btnEdit} onPress={() => handleOpenEdit(item)}>
                <Text style={styles.btnEditText}>✏️ Edit Detail</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnEdit} onPress={() => showAlert('Info', 'Fitur upload pemenang segera hadir.')}>
                <Text style={styles.btnEditText}>🏆 Upload Pemenang</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.btnEdit, uploadingId === item.id && activeUploadType === 'thb' && { opacity: 0.5 }]} 
                onPress={() => triggerFileUpload(item.id, 'thb')}
                disabled={submitting && uploadingId === item.id}
              >
                <Text style={styles.btnEditText}>
                    {uploadingId === item.id && activeUploadType === 'thb' ? ' Mengunggah...' : item.thb_url ? ' Update THB' : ' Upload THB'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btnEdit, uploadingId === item.id && activeUploadType === 'rekom' && { opacity: 0.5 }]} 
                onPress={() => triggerFileUpload(item.id, 'rekom')}
                disabled={submitting && uploadingId === item.id}
              >
                <Text style={styles.btnEditText}>
                    {uploadingId === item.id && activeUploadType === 'rekom' ? '⌛ Mengunggah...' : item.rekom_url ? '📑 Update Rekomendasi' : '📑 Upload Rekomendasi'}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.btnDelete}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.btnDeleteText}>🗑️ Hapus Kejuaraan</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* ADD/EDIT MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{editingTournament.id ? 'Edit Kejuaraan' : 'Tambah Kejuaraan'}</Text>
            <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Nama Kejuaraan</Text>
              <TextInput
                style={styles.input}
                value={editingTournament.name}
                onChangeText={(v) => setEditingTournament({ ...editingTournament, name: v })}
                placeholder="Contoh: Kejuaraan Silat Depok"
              />

              <Text style={styles.label}>Lokasi</Text>
              <TextInput
                style={styles.input}
                value={editingTournament.location}
                onChangeText={(v) => setEditingTournament({ ...editingTournament, location: v })}
                placeholder="Contoh: GOR Depok"
              />

              <Text style={styles.label}>Deskripsi</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={editingTournament.description}
                onChangeText={(v) => setEditingTournament({ ...editingTournament, description: v })}
                placeholder="Detail event..."
                multiline
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Tgl Mulai (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    value={editingTournament.start_date}
                    onChangeText={(v) => setEditingTournament({ ...editingTournament, start_date: v })}
                    placeholder="2026-01-01"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Tgl Selesai (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    value={editingTournament.end_date}
                    onChangeText={(v) => setEditingTournament({ ...editingTournament, end_date: v })}
                    placeholder="2026-01-05"
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Pendaftaran Dibuka</Text>
                  <TextInput
                    style={styles.input}
                    value={editingTournament.reg_open}
                    onChangeText={(v) => setEditingTournament({ ...editingTournament, reg_open: v })}
                    placeholder="2026-01-01"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Batas Waktu Pendaftaran</Text>
                  <TextInput
                    style={styles.input}
                    value={editingTournament.reg_close}
                    onChangeText={(v) => setEditingTournament({ ...editingTournament, reg_close: v })}
                    placeholder="2026-01-05"
                  />
                </View>
              </View>

              <Text style={styles.label}>Kategori Tingkat Pertandingan (Pilih Minimal 1)</Text>
              <View style={styles.checkboxContainer}>
                {CATEGORY_TINGKAT_OPTIONS.map((opt) => (
                    <TouchableOpacity 
                        key={opt.value} 
                        style={styles.checkboxItem}
                        onPress={() => toggleCategory(opt.value)}
                    >
                        <View style={[
                            styles.checkbox, 
                            editingTournament.categories?.includes(opt.value) && styles.checkboxActive
                        ]}>
                            {editingTournament.categories?.includes(opt.value) && <Text style={styles.checkIcon}>✓</Text>}
                        </View>
                        <Text style={styles.checkboxLabel}>{opt.label}</Text>
                    </TouchableOpacity>
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Kuota Peserta</Text>
                  <TextInput
                    style={styles.input}
                    value={editingTournament.quota?.toString()}
                    onChangeText={(v) => setEditingTournament({ ...editingTournament, quota: parseInt(v) || 0 })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.statusPicker}>
                    {(['coming_soon', 'registration_open', 'registration_closed', 'ongoing', 'finished'] as TournamentStatus[]).map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.statusOption, editingTournament.status === s && styles.statusOptionActive]}
                        onPress={() => setEditingTournament({ ...editingTournament, status: s })}
                      >
                        <Text style={[styles.statusOptionText, editingTournament.status === s && styles.statusOptionTextActive]}>{s.replace('_', ' ')}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <Text style={styles.label}>Kontak Person</Text>
              <TextInput
                style={styles.input}
                value={editingTournament.contact_person}
                onChangeText={(v) => setEditingTournament({ ...editingTournament, contact_person: v })}
                placeholder="0812..."
              />

              <Text style={styles.label}>Banner Pertandingan</Text>
              <View style={styles.bannerUploadSection}>
                {editingTournament.banner_url ? (
                    <Image 
                        source={{ uri: resolveImageUrl(editingTournament.banner_url) || undefined }} 
                        style={styles.bannerPreview} 
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.bannerPlaceholder}>
                        <Text style={styles.placeholderText}>Belum ada banner</Text>
                    </View>
                )}
                
                {editingTournament.id ? (
                    <TouchableOpacity 
                        style={styles.btnUploadBanner}
                        onPress={() => triggerFileUpload(editingTournament.id!, 'banner')}
                        disabled={submitting}
                    >
                        <Text style={styles.btnUploadBannerText}>
                            {submitting && activeUploadType === 'banner' ? '⌛ Mengunggah...' : '📷 Unggah Banner Baru'}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.hintText}>💡 Banner dapat diunggah setelah kejuaraan dibuat.</Text>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnSave, submitting && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={Colors.textLight} size="small" />
                ) : (
                  <Text style={styles.btnSaveText}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  pageHeader: { backgroundColor: Colors.primary, padding: 24 },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.textLight },
  pageSubtitle: { fontSize: 13, color: Colors.cream, opacity: 0.8, marginTop: 4 },
  toolbar: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  btnAdd: {
    backgroundColor: Colors.orange,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  btnAddText: { color: Colors.textLight, fontWeight: 'bold', fontSize: 14 },
  list: { padding: 16 },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
  },
  cardHeader: { marginBottom: 8 },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { color: Colors.textLight, fontSize: 11, fontWeight: 'bold' },
  tournamentName: { fontSize: 16, fontWeight: 'bold', color: Colors.primary, marginBottom: 8 },
  detail: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  btnEdit: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnEditText: { color: Colors.text, fontSize: 12, fontWeight: '600' },
  btnDelete: {
    marginTop: 10,
    backgroundColor: '#FEE2E2',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  btnDeleteText: { color: Colors.danger, fontWeight: 'bold', fontSize: 13 },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '90%',
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.backgroundSecondary,
  },
  statusPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  statusOption: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  statusOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusOptionText: {
    fontSize: 10,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  statusOptionTextActive: {
    color: Colors.textLight,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnCancelText: { color: Colors.text, fontWeight: 'bold' },
  btnSave: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  btnSaveText: { color: Colors.textLight, fontWeight: 'bold' },

  // CHECKBOX STYLES
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 10,
    padding: 10,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: '45%',
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
  },
  checkIcon: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 13,
    color: Colors.text,
    textTransform: 'capitalize',
  },

  // BANNER STYLES
  bannerUploadSection: {
    marginTop: 8,
    marginBottom: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  bannerPreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#eee',
  },
  bannerPlaceholder: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.textSecondary,
  },
  placeholderText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  btnUploadBanner: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnUploadBannerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  hintText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
})
