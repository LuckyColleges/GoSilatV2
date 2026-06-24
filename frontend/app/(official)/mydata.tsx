import { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView
} from 'react-native'

import { useRouter } from 'expo-router'

import { Colors } from '../../constants/colors'
import { Athlete } from '../../types/athlete'
import { athleteService } from '../../services/athleteService'
import { formatDateToID, formatDateToDB } from '../../utils/dateFormatter'

export default function MyDataScreen() {
  const router = useRouter()

  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [sortAsc, setSortAsc] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const ITEMS_PER_PAGE = 10

  // EDIT
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedAthleteId, setSelectedAthleteId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    full_name: '',
    birth_place: '',
    birth_date: '',
    gender: 'male',
    nik: '',
  })

  // DELETE
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  // FETCH
  const fetchAthletes = async () => {
    try {
      setLoading(true)
      const response = await athleteService.getMyAthletes()
      setAthletes(response.data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAthletes()
  }, [])

  // EDIT
  const handleEdit = (athlete: Athlete) => {
    setSelectedAthleteId(athlete.id)
    setEditForm({
      full_name: athlete.full_name,
      birth_place: athlete.birth_place,
      birth_date: formatDateToID(athlete.birth_date),
      gender: athlete.gender,
      nik: athlete.nik,
    })
    setModalVisible(true)
  }

  // SAVE EDIT
  const handleSaveAthlete = async () => {
    try {
      if (!selectedAthleteId) return

      const payload = {
        ...editForm,
        birth_date: formatDateToDB(editForm.birth_date) || '',
      }

      await athleteService.updateAthlete(selectedAthleteId, payload)

      setAthletes((prev) =>
        prev.map((a) =>
          a.id === selectedAthleteId ? { ...a, ...payload } : a
        )
      )
      setModalVisible(false)
      setSelectedAthleteId(null)
    } catch (err: any) {
      console.log(err.response?.data)
    }
  }

  // DELETE
  const handleDelete = (id: number) => {
    setDeleteId(id)
    setDeleteModalVisible(true)
  }

  const confirmDelete = async () => {
    if (!deleteId) return

    try {
      await athleteService.deleteAthlete(deleteId)

      // updated data setelah delete
      const updatedAthletes = athletes.filter(
        (a) => a.id !== deleteId
      )

      setAthletes(updatedAthletes)

      // hitung total page baru
      const updatedTotalPages = Math.ceil(
        updatedAthletes.length / ITEMS_PER_PAGE
      )

      // kalau current page lebih besar dari total page baru
      if (
        currentPage > updatedTotalPages &&
        updatedTotalPages > 0
      ) {
        setCurrentPage(updatedTotalPages)
      }

      // kalau data habis total
      if (updatedAthletes.length === 0) {
        setCurrentPage(1)
      }

      setDeleteModalVisible(false)
      setDeleteId(null)

    } catch (err) {
      console.log(err)
    }
  }

  // FILTER
  const filteredAthletes = athletes
    .filter((item) =>
      item.full_name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortAsc) {
        return a.full_name.localeCompare(b.full_name)
      }
      return b.full_name.localeCompare(a.full_name)
    })

  // PAGINATION
  const totalPages = Math.ceil(filteredAthletes.length / ITEMS_PER_PAGE)
  const paginatedAthletes = filteredAthletes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>MyData Athlete</Text>
        <Text style={styles.pageSubtitle}>
          {athletes.length} athlete terdaftar
        </Text>
      </View>

      {/* TOOLBAR */}
      <View style={[styles.toolbar, { flexDirection: 'row', gap: 10 }]}>
        <TouchableOpacity
          style={[styles.btnAdd, { backgroundColor: Colors.primary, flex: 1 }]}
          onPress={() => router.push('/(official)/myregistrations')}
        >
          <Text style={styles.btnAddText}>📋 Riwayat Registrasi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnAdd, { flex: 1 }]}
          onPress={() => router.push('/(official)/mydatacreate')}
        >
          <Text style={styles.btnAddText}>+ Tambah Athlete</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH + SORT */}
      <View style={styles.tableTools}>
        <TextInput
          placeholder="Cari Nama athlete..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={(text) => {
            setSearch(text)
            setCurrentPage(1)
          }}
          style={styles.searchInput}
        />
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortAsc(!sortAsc)}
        >
          <Text style={styles.sortButtonText}>
            {sortAsc ? 'A-Z' : 'Z-A'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : athletes.length === 0 ? (
        <Text style={styles.empty}>Belum ada athlete.</Text>
      ) : (
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* TABLE CONTAINER */}
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={styles.tableWrapper}>
              
              {/* TABLE HEADER */}
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.colNo]}>No</Text>
                <Text style={[styles.headerCell, styles.colName]}>Nama</Text>
                <Text style={[styles.headerCell, styles.colNik]}>NIK</Text>
                <Text style={[styles.headerCell, styles.colPlace]}>Tempat Lahir</Text>
                <Text style={[styles.headerCell, styles.colDate]}>Tanggal Lahir</Text>
                <Text style={[styles.headerCell, styles.colGender]}>Gender</Text>
                <Text style={[styles.headerCell, styles.colAction, { textAlign: 'center' }]}>Action</Text>
              </View>

              {/* TABLE ROWS */}
              {paginatedAthletes.map((item, index) => (
                <View key={item.id.toString()}>
                  <View style={[
                    styles.tableRow,
                    index % 2 === 0 && styles.tableRowAlt,
                  ]}>
                    {/* NO */}
                    <Text style={[styles.bodyCell, styles.colNo, styles.textCenter, { fontWeight: 'bold', color: Colors.primary }]}>
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </Text>

                    {/* NAME */}
                    <Text style={[styles.bodyCell, styles.colName]} numberOfLines={1}>
                      {item.full_name}
                    </Text>

                    {/* NIK */}
                    <Text style={[styles.bodyCell, styles.colNik]} numberOfLines={1}>
                      {item.nik}
                    </Text>

                    {/* TEMPAT */}
                    <Text style={[styles.bodyCell, styles.colPlace]} numberOfLines={1}>
                      {item.birth_place}
                    </Text>

                    {/* TANGGAL */}
                    <Text style={[styles.bodyCell, styles.colDate]}>
                      {formatDateToID(item.birth_date)}
                    </Text>

                    {/* GENDER */}
                    <View style={[styles.bodyCell, styles.colGender, styles.genderCell]}>
                      <View style={[
                        styles.genderBadge,
                        item.gender === 'male' ? styles.badgeMale : styles.badgeFemale,
                      ]}>
                        <Text style={styles.genderText}>
                          {item.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                        </Text>
                      </View>
                    </View>

                    {/* ACTION */}
                    <View style={[styles.bodyCell, styles.colAction, styles.actionCell]}>
                      <TouchableOpacity style={styles.iconEdit} onPress={() => handleEdit(item)}>
                        <Text style={styles.iconText}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconDelete} onPress={() => handleDelete(item.id)}>
                        <Text style={styles.iconText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.tableDivider} />
                </View>
              ))}

            </View>
          </ScrollView>

          {/* PAGINATION */}
          <View style={styles.pagination}>
            <TouchableOpacity
              disabled={currentPage === 1}
              style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
              onPress={() => setCurrentPage((prev) => prev - 1)}
            >
              <Text style={styles.pageButtonText}>Prev</Text>
            </TouchableOpacity>
            <Text style={styles.pageInfo}>
              Page {currentPage} / {totalPages || 1}
            </Text>
            <TouchableOpacity
              disabled={currentPage === totalPages || totalPages === 0}
              style={[styles.pageButton, (currentPage === totalPages || totalPages === 0) && styles.pageButtonDisabled]}
              onPress={() => setCurrentPage((prev) => prev + 1)}
            >
              <Text style={styles.pageButtonText}>Next</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      )}

      {/* EDIT MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Athlete</Text>

            <Text style={styles.inputLabel}>Nama Lengkap</Text>
            <TextInput
              placeholder="Nama Lengkap"
              placeholderTextColor="#999"
              style={styles.modalInput}
              value={editForm.full_name}
              onChangeText={(text) => setEditForm({ ...editForm, full_name: text })}
            />

            <Text style={styles.inputLabel}>Tempat Lahir</Text>
            <TextInput
              placeholder="Tempat Lahir"
              placeholderTextColor="#999"
              style={styles.modalInput}
              value={editForm.birth_place}
              onChangeText={(text) => setEditForm({ ...editForm, birth_place: text })}
            />

            <Text style={styles.inputLabel}>Tanggal lahir</Text>
            <TextInput
              placeholder="Tanggal Lahir (DD-MM-YYYY)/(31-12-2001)"
              placeholderTextColor="#999"
              style={styles.modalInput}
              value={editForm.birth_date}
              onChangeText={(text) => setEditForm({ ...editForm, birth_date: text })}
            />

            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.genderWrapper}>
              <TouchableOpacity
                style={[
                  styles.genderBtn,
                  editForm.gender === 'male' && styles.genderMaleActive
                ]}
                onPress={() =>
                  setEditForm({
                    ...editForm,
                    gender: 'male'
                  })
                }
              >
                <Text
                  style={[
                    styles.genderText,
                    editForm.gender === 'male' &&
                      styles.genderTextMale
                  ]}
                >
                  Laki-Laki
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderBtn,
                  editForm.gender === 'female' &&
                    styles.genderFemaleActive
                ]}
                onPress={() =>
                  setEditForm({
                    ...editForm,
                    gender: 'female'
                  })
                }
              >
                <Text
                  style={[
                    styles.genderText,
                    editForm.gender === 'female' &&
                      styles.genderTextFemale
                  ]}
                >
                  Perempuan
                </Text>
              </TouchableOpacity>
            </View>
              
            <Text style={styles.inputLabel}>NIK</Text>
            <TextInput
              placeholder="NIK"
              placeholderTextColor="#999"
              style={styles.modalInput}
              value={editForm.nik}
              onChangeText={(text) => setEditForm({ ...editForm, nik: text })}
            />

            <TouchableOpacity style={styles.btnAdd} onPress={handleSaveAthlete}>
              <Text style={styles.btnAddText}>Update Athlete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtnModal}
              onPress={() => {
                setModalVisible(false)
                setSelectedAthleteId(null)
                setEditForm({
                  full_name: '',
                  birth_place: '',
                  birth_date: '',
                  gender: 'male',
                  nik: '',
                })
              }}
            >
              <Text style={styles.cancelBtnModalText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* DELETE MODAL */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModal}>
            <Text style={styles.deleteTitle}>Hapus Athlete</Text>
            <Text style={styles.deleteText}>Yakin ingin menghapus athlete ini?</Text>
            <View style={styles.deleteActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setDeleteModalVisible(false)
                  setDeleteId(null)
                }}
              >
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirmDelete}>
                <Text style={styles.confirmText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: 24,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  pageSubtitle: {
    fontSize: 13,
    color: Colors.cream,
    opacity: 0.8,
    marginTop: 4,
  },
  toolbar: {
    padding: 16,
  },
  btnAdd: {
    backgroundColor: Colors.orange,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center',
    minWidth: 180,
    alignItems: 'center',
  },
  btnAddText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 14,
  },
  tableTools: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
  },
  sortButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortButtonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  tableWrapper: {
    borderWidth: 5,
    borderColor: Colors.border,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.background,
    // minWidth: '100vh',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 14 ,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  headerCell: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 14,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
  },
  tableRowAlt: {
    backgroundColor: Colors.backgroundSecondary,
  },
  bodyCell: {
    fontSize: 14,
    color: Colors.text,
    paddingHorizontal: 4,
  },
  tableDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  textCenter: {
    textAlign: 'center',
  },
  
  // Sizing per columns (Fix Rata & Konsisten)
  colNo: {
    width: 50,
  },
  colName: {
    width: 300,
  },
  colNik: {
    width: 280,
  },
  colPlace: {
    width: 120,
  },
  colDate: {
    width: 110,
  },
  colGender: {
    width: 110,
  },
  colAction: {
    width: 90,
  },

  genderCell: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  genderBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeMale: {
    backgroundColor: '#DBEAFE',
  },
  badgeFemale: {
    backgroundColor: '#FCE7F3',
  },
  genderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  actionCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  iconEdit: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconDelete: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 12,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    marginTop: 20,
    marginBottom: 24,
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
  empty: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 60,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  cancelBtnModal: {
    marginTop: 12,
    alignItems: 'center',
  },
  cancelBtnModalText: {
    color: Colors.danger,
    fontWeight: 'bold',
  },
  deleteModal: {
    width: 320,
    backgroundColor: Colors.background,
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
  },
  deleteText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  deleteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: Colors.backgroundSecondary,
  },
  cancelText: {
    color: Colors.text,
    fontWeight: '600',
  },
  confirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: Colors.danger,
  },
  confirmText: {
    color: Colors.textLight,
    fontWeight: 'bold',
  },


  // gender edit styling
  genderWrapper: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },

  genderBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },

  genderMaleActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#60A5FA',
  },

  genderFemaleActive: {
    backgroundColor: '#FCE7F3',
    borderColor: '#F472B6',
  },

  genderTextMale: {
    color: '#1D4ED8',
    fontWeight: 'bold',
  },

  genderTextFemale: {
    color: '#BE185D',
    fontWeight: 'bold',
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
    marginTop: 6,
    textAlign: 'center'
  },
})