import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Colors } from '../../constants/colors'
import { athleteService } from '../../services/athleteService'
import { formatDateToDB } from '../../utils/dateFormatter'

const SCREEN_WIDTH = Dimensions.get('window').width

const EMPTY_ROW = {
  full_name: '',
  birth_place: '',
  birth_date: '',
  gender: 'male',
  nik: '',
}

export default function MyDataCreateScreen() {
  const router = useRouter()
  const [rows, setRows] = useState([{ ...EMPTY_ROW }])
  const [modalMsg, setModalMsg] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'error' | 'success'>('error')

  const showAlert = (message: string, type: 'error' | 'success' = 'error') => {
    setModalMsg(message)
    setModalType(type)
    setShowModal(true)
  }

  const updateRow = (index: number, field: string, value: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    )
  }

  const addRow = () => setRows((prev) => [...prev, { ...EMPTY_ROW }])

  const deleteRow = (index: number) => {
    if (rows.length === 1) return showAlert('Minimal 1 atlit harus ada.')
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSaveAll = async () => {
    const emptyRows: number[] = []
    rows.forEach((r, index) => {
      if (!r.full_name || !r.nik || !r.birth_date || !r.birth_place) {
        emptyRows.push(index + 1)
      }
    })

    if (emptyRows.length > 0) {
      return showAlert(`Lengkapi data pada baris: ${emptyRows.join(', ')}`)
    }

    try {
      for (const athlete of rows) {
        const payload = {
          ...athlete,
          birth_date: formatDateToDB(athlete.birth_date) || '',
        }
        await athleteService.createAthlete(payload)
      }
      showAlert(`${rows.length} atlit berhasil ditambahkan! 🎉`, 'success')
    } catch (err: any) {
      console.log(err.response?.data)
      showAlert('Gagal menyimpan atlit, coba lagi.')
    }
  }

  return (
    <View style={styles.container}>

      {/* CUSTOM MODAL */}
      {showModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalIcon}>
              {modalType === 'success' ? '✅' : '⚠️'}
            </Text>
            <Text style={styles.modalTitle}>
              {modalType === 'success' ? 'Berhasil!' : 'Data Belum Lengkap'}
            </Text>
            <Text style={styles.modalMessage}>{modalMsg}</Text>
            <TouchableOpacity
              style={[
                styles.modalBtn,
                modalType === 'success' && styles.modalBtnSuccess,
              ]}
              onPress={() => {
                setShowModal(false)
                if (modalType === 'success') router.back()
              }}
            >
              <Text style={styles.modalBtnText}>
                {modalType === 'success' ? 'Selesai' : 'OK, Mengerti'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Tambah Atlit</Text>
          <Text style={styles.subtitle}>
            {rows.length} atlit · isi semua kolom lalu simpan
          </Text>
        </View>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Kembali</Text>
        </TouchableOpacity>
      </View>

      {/* TABLE */}
      <View style={styles.tableWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ minWidth: SCREEN_WIDTH - 28 }}>

            {/* TABLE HEADER */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.colNo]}>No</Text>
              <Text style={[styles.headerCell, styles.colName]}>Nama Lengkap</Text>
              <Text style={[styles.headerCell, styles.colPlace]}>Tempat Lahir</Text>
              <Text style={[styles.headerCell, styles.colDate]}>Tanggal Lahir</Text>
              <Text style={[styles.headerCell, styles.colGender]}>Gender</Text>
              <Text style={[styles.headerCell, styles.colNik]}>NIK</Text>
              <Text style={[styles.headerCell, styles.colAction]}>Aksi</Text>
            </View>

            {/* TABLE BODY */}
            <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>
              {rows.map((row, index) => (
                <View
                  key={index}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 && styles.tableRowAlt,
                  ]}
                >
                  {/* NO */}
                  <View style={[styles.colNo, styles.centerCell]}>
                    <Text style={styles.noText}>{index + 1}</Text>
                  </View>

                  {/* NAMA */}
                  <TextInput
                    placeholder="Nama lengkap"
                    placeholderTextColor={Colors.textSecondary}
                    value={row.full_name}
                    onChangeText={(v) => updateRow(index, 'full_name', v)}
                    style={[styles.tableInput, styles.colName]}
                  />

                  {/* TEMPAT LAHIR */}
                  <TextInput
                    placeholder="Kota"
                    placeholderTextColor={Colors.textSecondary}
                    value={row.birth_place}
                    onChangeText={(v) => updateRow(index, 'birth_place', v)}
                    style={[styles.tableInput, styles.colPlace]}
                  />

                  {/* TANGGAL LAHIR */}
                  <TextInput
                    placeholder="DD-MM-YYYY"
                    placeholderTextColor={Colors.textSecondary}
                    value={row.birth_date}
                    onChangeText={(v) => updateRow(index, 'birth_date', v)}
                    style={[styles.tableInput, styles.colDate]}
                  />

                  {/* GENDER */}
                  <View style={[styles.genderWrapper, styles.colGender]}>
                    <TouchableOpacity
                      style={[
                        styles.genderBtn,
                        row.gender === 'male' && styles.genderMaleActive,
                      ]}
                      onPress={() => updateRow(index, 'gender', 'male')}
                    >
                      <Text style={[
                        styles.genderText,
                        row.gender === 'male' && styles.genderTextMale,
                      ]}>♂ L</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.genderBtn,
                        row.gender === 'female' && styles.genderFemaleActive,
                      ]}
                      onPress={() => updateRow(index, 'gender', 'female')}
                    >
                      <Text style={[
                        styles.genderText,
                        row.gender === 'female' && styles.genderTextFemale,
                      ]}>♀ P</Text>
                    </TouchableOpacity>
                  </View>

                  {/* NIK */}
                  <TextInput
                    placeholder="16 digit NIK"
                    placeholderTextColor={Colors.textSecondary}
                    value={row.nik}
                    keyboardType="numeric"
                    maxLength={16}
                    onChangeText={(v) => updateRow(index, 'nik', v)}
                    style={[styles.tableInput, styles.colNik]}
                  />

                  {/* DELETE */}
                  <View style={[styles.colAction, styles.centerCell]}>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => deleteRow(index)}
                    >
                      <Text style={styles.deleteIcon}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

          </View>
        </ScrollView>
      </View>

      {/* BOTTOM ACTIONS */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.addBtn} onPress={addRow}>
          <Text style={styles.addBtnText}>+ Tambah Baris</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAll}>
          <Text style={styles.saveBtnText}>💾 Simpan {rows.length} Atlit</Text>
        </TouchableOpacity>
      </View>

    </View>
  )
}

const COL = {
  no: 44,
  name: 200,
  place: 140,
  date: 130,
  gender: 110,
  nik: 160,
  action: 56,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 14,
    paddingTop: 18,
    height: '100%',
    maxHeight: '100vh',
    minHeight: '90vh',
    overflow: 'hidden',
  },

  // MODAL
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalBox: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 28,
    marginHorizontal: 32,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    width: '85%',
  },
  modalIcon: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalBtn: {
    backgroundColor: Colors.danger,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 6,
    width: '100%',
    alignItems: 'center',
  },
  modalBtnSuccess: {
    backgroundColor: Colors.orange,
  },
  modalBtnText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 14,
  },

  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
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

  // TABLE
  tableWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.background,
    maxHeight:'68vh'
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  headerCell: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  tableRowAlt: {
    backgroundColor: Colors.backgroundSecondary,
  },
  centerCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // COLUMNS
  colNo: { width: COL.no },
  colName: { width: COL.name, marginRight: 8 },
  colPlace: { width: COL.place, marginRight: 8 },
  colDate: { width: COL.date, marginRight: 8 },
  colGender: { width: COL.gender, marginRight: 8 },
  colNik: { width: COL.nik, marginRight: 8 },
  colAction: { width: COL.action },

  noText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
  },

  // INPUT
  tableInput: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 12,
    color: Colors.text,
  },

  // GENDER
  genderWrapper: {
    flexDirection: 'row',
    gap: 5,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  genderMaleActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#60A5FA',
  },
  genderFemaleActive: {
    backgroundColor: '#FCE7F3',
    borderColor: '#F472B6',
  },
  genderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  genderTextMale: {
    color: '#1D4ED8',
  },
  genderTextFemale: {
    color: '#BE185D',
  },

  // DELETE
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 14,
  },

  // BOTTOM ACTIONS
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 14,
    marginBottom: 20,
  },
  addBtn: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  addBtnText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  saveBtn: {
    flex: 2,
    backgroundColor: Colors.orange,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 13,
  },
})