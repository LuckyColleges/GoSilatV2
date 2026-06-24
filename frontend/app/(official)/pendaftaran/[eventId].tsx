import { useEffect, useState, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors } from '../../../constants/colors'
import { athleteService } from '../../../services/athleteService'
import { tournamentService } from '../../../services/tournamentService'
import { registrationService } from '../../../services/registrationService'
import { useSelectionStore } from '../../../store/selectionStore'
import { Tournament } from '../../../types/tournament'
import CustomModal from '../../../components/ui/Modal'

const SCREEN_WIDTH = Dimensions.get('window').width

interface AthleteRow {
  id?: number
  _tempId: string
  full_name: string
  birth_place: string
  birth_date: string
  gender: 'male' | 'female'
  nik: string
  weight: string
  height: string
  cat_type_id: string
  category_id: string
  school_name: string
}

interface RegistrationTable {
  id: string
  tingkat: string
  rows: AthleteRow[]
}

const generateId = () => Math.random().toString(36).substring(2, 11);

const EMPTY_ROW = (): AthleteRow => ({
  _tempId: generateId(),
  full_name: '',
  birth_place: '',
  birth_date: '',
  gender: 'male',
  nik: '',
  weight: '',
  height: '',
  cat_type_id: '1',
  category_id: '',
  school_name: '',
})

export default function PendaftaranScreen() {
  const { eventId } = useLocalSearchParams()
  const router = useRouter()

  const { selectedAthletes, clearSelection } = useSelectionStore()

  // Search State
  const [searchText, setSearchText] = useState('')

  // Category Types
  const [categoryTypes, setCategoryTypes] = useState<any[]>([])

  // Alert Modal State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean
    title: string
    message: string
    type: 'success' | 'error' | 'info'
    onConfirm?: () => void
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  })

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info', onConfirm?: () => void) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      onConfirm,
    })
  }

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }))
    if (alertConfig.onConfirm && alertConfig.type === 'success') {
      alertConfig.onConfirm()
    }
  }

  //modal pengambilan data atlit di mydata atlit
  const [showSelectAthletes, setShowSelectAthletes] = useState(false)
  const [allAthletes, setAllAthletes] = useState<any[]>([])
  const [searchAthlete, setSearchAthlete] = useState('')
  const [loadingAthletes, setLoadingAthletes] = useState(false)

  const [contingentName, setContingentName] = useState('')
  const [tables, setTables] = useState<RegistrationTable[]>([])

  const [activeTableIndex, setActiveTableIndex] = useState<number | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [fetchingData, setFetchingData] = useState(true)

  const [tingkatOptions, setTingkatOptions] = useState<string[]>([])
  const [showTingkatModal, setShowTingkatModal] = useState(false)

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingRowData, setEditingRowData] = useState<AthleteRow | null>(null)

  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false)

  // ambil info tur
  const [tournament, setTournament] = useState<Tournament | null>(null)

  const autoMatchCategory = (tingkat: string, gender: string, weight: string) => {
    if (!weight || isNaN(parseFloat(weight))) return ''
    const w = parseFloat(weight)
    
    // Filter categories by tingkat, gender, and type 'fight' (cat_type_id: 1)
    const match = categories.find(c => 
        c.tingkat === tingkat && 
        c.gender === gender && 
        Number(c.cat_type_id) === 1 &&
        w >= parseFloat(c.min_weight) && 
        w <= parseFloat(c.max_weight)
    )
    
    return match ? String(match.id) : ''
  }

  useEffect(() => {
    const initData = async () => {
      try {
        const tourRes = await tournamentService.getById(Number(eventId))
        setTournament(tourRes || null)

        const categoriesRes = await tournamentService.getCategories(Number(eventId))
        setCategories(categoriesRes || [])

        const tingkatRes = await tournamentService.getTingkatOptions(Number(eventId))
        setTingkatOptions(tingkatRes || [])

        const catTypesRes = await tournamentService.getCategoryTypes()
        setCategoryTypes(catTypesRes || [])

        // CHECK IF ALREADY REGISTERED
        const existingRegRes = await registrationService.getByTournament(Number(eventId))
        if (existingRegRes.data && existingRegRes.data.length > 0) {
          setIsAlreadyRegistered(true)
          
          // GROUP BY TINGKAT
          const grouped: Record<string, AthleteRow[]> = {}
          let contingent = existingRegRes.data[0].contingent_name
          
          existingRegRes.data.forEach((reg: any) => {
            const tingkat = reg.category_tingkat
            
            if (!grouped[tingkat]) grouped[tingkat] = []
            
            // Find category to get its type
            const catObj = (categoriesRes || []).find((c: any) => String(c.id) === String(reg.category_id))

            grouped[tingkat].push({
              id: reg.athlete_id,
              _tempId: generateId(),
              full_name: reg.full_name,
              birth_place: reg.birth_place,
              birth_date: reg.birth_date,
              gender: reg.gender,
              nik: reg.nik,
              weight: reg.weight ? String(reg.weight) : '',
              height: reg.height ? String(reg.height) : '',
              cat_type_id: catObj ? String(catObj.cat_type_id) : '1',
              category_id: reg.category_id ? String(reg.category_id) : '',
              school_name: reg.school_name || '',
            })
          })

          setContingentName(contingent)
          const newTables: RegistrationTable[] = Object.keys(grouped).map(tingkat => ({
            id: generateId(),
            tingkat,
            rows: grouped[tingkat]
          }))
          setTables(newTables)
          if (newTables.length > 0) setActiveTableIndex(0)
        }
      } catch (e) {
        console.error('Failed to fetch categories or existing registration', e)
      } finally {
        setFetchingData(false)
      }
    }
    initData()

  }, [eventId])

  useEffect(() => {
    if (tables.length > 0 && activeTableIndex === null) {
      setActiveTableIndex(0)
    }
  }, [tables, activeTableIndex])

  // Watch for selected athletes from the other screen
  useEffect(() => {
    if (
        selectedAthletes.length > 0 &&
        activeTableIndex !== null &&
        tables[activeTableIndex]
        )
       {
      const newRows: AthleteRow[] = selectedAthletes.map((a) => ({
        id: a.id,
        _tempId: generateId(),
        full_name: a.full_name,
        birth_place: a.birth_place || '',
        birth_date: a.birth_date || '',
        gender: a.gender || 'male',
        nik: a.nik || '',
        weight: '',
        height: '',
        cat_type_id: '1',
        category_id: '',
        school_name: a.school_name || '',
      }))

      setTables((prev) =>
        prev.map((table, i) =>
          i === activeTableIndex
            ? { ...table, rows: [...table.rows, ...newRows] }
            : table
        )
      )
      clearSelection()
    }
  }, [selectedAthletes, activeTableIndex])

  const addTable = (tingkat: string) => {
    // Check if table for this tingkat already exists
    const exists = tables.some((t) => t.tingkat === tingkat)
    if (exists) {
      return showAlert('Gagal', `Tabel untuk kategori ${tingkat.replace(/_/g, ' ')} sudah ada.`, 'error')
    }

    const newTable: RegistrationTable = {
      id: generateId(),
      tingkat,
      rows: [], // Start empty, must add from selection
    }
    setTables((prev) => {
      const updated = [...prev, newTable]
      setActiveTableIndex(updated.length - 1)
      return updated
    })
    setShowTingkatModal(false)
  }

  const deleteTable = (index: number) => {
    setTables((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      
      // Update activeTableIndex to prevent out of bounds or pointing to wrong table
      if (updated.length === 0) {
        setActiveTableIndex(null)
      } else if (activeTableIndex === index) {
        // If we delete the current active tab, focus the first one
        setActiveTableIndex(0)
      } else if (activeTableIndex !== null && activeTableIndex > index) {
        // If we delete a tab to the left, shift the index left
        setActiveTableIndex(activeTableIndex - 1)
      }
      return updated
    })
  }

  const deleteRow = (tableIndex: number, tempId: string) => {
    setTables((prev) =>
      prev.map((table, i) => {
        if (i === tableIndex) {
          const newRows = table.rows.filter((r) => r._tempId !== tempId)
          return { ...table, rows: newRows }
        }
        return table
      })
    )
  }

  const updateRow = (tableIndex: number, tempId: string, field: keyof AthleteRow, value: string) => {
    setTables((prev) =>
      prev.map((table, i) =>
        i === tableIndex
          ? {
              ...table,
              rows: table.rows.map((row) =>
                row._tempId === tempId ? { ...row, [field]: value } : row
              ),
            }
          : table
      )
    )
  }

  /// fungsi untuk sinkron data ke modal penambahan atlit
  const openSelectAthletes = async () => {
    setShowSelectAthletes(true)
    setLoadingAthletes(true)
    try {
      const response = await athleteService.getMyAthletes()
      setAllAthletes(response.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingAthletes(false)
    }
  }


  const toggleSelectAthlete = (athlete: any) => {
    if (activeTableIndex === null) return

    // CEK APAKAH ATLIT SUDAH ADA DI TABEL MANAPUN (agar tidak dobel tingkat)
    const isAlreadyInAnyTable = tables.some(table => 
        table.rows.some(r => r.nik === athlete.nik)
    )

    if (isAlreadyInAnyTable) {
        return showAlert('Gagal', `Atlit ${athlete.full_name} sudah didaftarkan pada salah satu tingkat kategori.`, 'error')
    }

    const newRow: AthleteRow = {
      id: athlete.id,
      _tempId: generateId(),
      full_name: athlete.full_name,
      birth_place: athlete.birth_place || '',
      birth_date: athlete.birth_date || '',
      gender: athlete.gender || 'male',
      nik: athlete.nik || '',
      weight: '',
      height: '',
      cat_type_id: '1',
      category_id: '',
      school_name: athlete.school_name || '',
    }

    setTables((prev) =>
      prev.map((table, i) =>
        i === activeTableIndex
          ? { ...table, rows: [...table.rows, newRow] }
          : table
      )
    )
  }
  //====================== 


  const openEditModal = (tableIndex: number, tempId: string) => {
    const row = tables[tableIndex].rows.find(r => r._tempId === tempId)
    if (!row) return
    setEditingRowData({ ...row })
    setEditModalVisible(true)
  }

  const saveEdit = () => {
    if (activeTableIndex !== null && editingRowData) {
      setTables((prev) =>
        prev.map((table, i) =>
          i === activeTableIndex
            ? {
                ...table,
                rows: table.rows.map((row) =>
                  row._tempId === editingRowData._tempId ? editingRowData : row
                ),
              }
            : table
        )
      )
      setEditModalVisible(false)
    }
  }

  const handleSubmit = async () => {
    if (!contingentName.trim()) {
      return showAlert('Error', 'Nama kontingen wajib diisi.', 'error')
    }

    const allRows = tables.flatMap((t) => t.rows)
    if (allRows.length === 0) {
      return showAlert('Error', 'Tambahkan minimal 1 tabel dan atlit.', 'error')
    }

    const invalid = allRows.some(
      (r) => !r.full_name || !r.nik
    )
    if (invalid) {
      return showAlert('Error', 'Lengkapi Nama dan NIK untuk semua atlit.', 'error')
    }

    setLoading(true)
    try {
      await registrationService.createBatch({
        tournament_id: Number(eventId),
        contingent_name: contingentName,
        athletes: allRows,
      })
      showAlert('Berhasil! 🎉', 'Pendaftaran berhasil dikirim.', 'success', () => {
        router.replace('/(official)/myregistrations')
      })
    } catch (e: any) {
      showAlert('Error', e?.response?.data?.message ?? 'Pendaftaran gagal.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const totalAthletes = useMemo(() => {
    return tables.reduce((acc, table) => acc + table.rows.length, 0)
  }, [tables])

  const filteredRows = useMemo(() => {
    if (activeTableIndex === null || !tables[activeTableIndex]) return []
    if (!searchText.trim()) return tables[activeTableIndex].rows

    const s = searchText.toLowerCase()
    return tables[activeTableIndex].rows.filter(row => {
      const athleteMatch = row.full_name.toLowerCase().includes(s)
      const schoolMatch = row.school_name.toLowerCase().includes(s)
      
      // Find category name
      const category = categories.find(c => String(c.id) === String(row.category_id))
      const categoryMatch = category ? category.name.toLowerCase().includes(s) : false
      
      return athleteMatch || schoolMatch || categoryMatch
    })
  }, [tables, activeTableIndex, searchText, categories])

  const getFilteredCategories = (tingkat: string, gender: string) => {
    return categories.filter((c) => c.tingkat === tingkat && c.gender === gender)
  }

  if (fetchingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    )
  }

  return (
  <>
    <View style={styles.container}>
      {/* ALERT MODAL */}
      <CustomModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={hideAlert}
        onConfirm={alertConfig.onConfirm ? hideAlert : undefined}
      />

      {/* Tingkat Selection Modal */}
      <Modal visible={showTingkatModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Pilih Tingkat Kategori</Text>
            {tingkatOptions.map((t) => (
              <TouchableOpacity
                key={t}
                style={styles.optionItem}
                onPress={() => addTable(t)}
              >
                <Text style={styles.optionText}>{t.replace(/_/g, ' ').toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowTingkatModal(false)}>
              <Text style={styles.closeBtnText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Row Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Data Pendaftaran</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {editingRowData && (
                <>
                  <Text style={styles.inputLabel}>BB (kg)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editingRowData.weight}
                    keyboardType="numeric"
                    onChangeText={(v) => setEditingRowData({ ...editingRowData, weight: v })}
                  />
                  <Text style={styles.inputLabel}>TB (cm)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editingRowData.height}
                    keyboardType="numeric"
                    onChangeText={(v) => setEditingRowData({ ...editingRowData, height: v })}
                  />
                </>
              )}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtnModal} onPress={saveEdit}>
                <Text style={styles.saveBtnText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Pendaftaran</Text>
          <Text style={styles.title2}>Event {tournament?.name}</Text>
        </View>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Kembali</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contingentBox}>
        <Text style={styles.label}>Nama Kontingen</Text>
        <TextInput
          style={styles.contingentInput}
          placeholder="Contoh: DKI Depok"
          value={contingentName}
          onChangeText={setContingentName}
        />
        {isAlreadyRegistered && (
          <Text style={{ fontSize: 14, color: Colors.orange, marginTop: 4 }}>
            💡 Anda sedang mengedit pendaftaran yang sudah ada.
          </Text>
        )}
      </View>

      {/* TABS (Tables) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {tables.map((table, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.tab, activeTableIndex === index && styles.activeTab]}
            onPress={() => setActiveTableIndex(index)}
          >
            <Text style={[styles.tabText, activeTableIndex === index && styles.activeTabText]}>
              {table.tingkat.replace(/_/g, ' ')}
            </Text>
            <TouchableOpacity 
              onPress={() => deleteTable(index)}
              style={styles.closeTab}
            >
              <Text style={styles.closeTabText}>×</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* TABLE */}
      {activeTableIndex !== null && tables[activeTableIndex] ? (
        <View style={styles.tableWrapper}>
          <View style={styles.tableHeaderActions}>
              <TouchableOpacity 
                style={styles.addExistingBtn}
                onPress={openSelectAthletes}
              >
                <Text style={styles.addExistingText}>
                   + Tambahkan Atlit
                </Text>
              </TouchableOpacity>

              <View style={styles.searchTableWrapper}>
                <TextInput
                    style={styles.searchTableInput}
                    placeholder="🔍 Cari nama atlit, sekolah, atau kategori yang sudah di daftarkan..."
                    placeholderTextColor={Colors.textSecondary}
                    value={searchText}
                    onChangeText={setSearchText}
                />
                {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearSearchBtn}>
                        <Text style={styles.clearSearchText}>✕</Text>
                    </TouchableOpacity>
                )}
              </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* TABLE HEADER */}
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.colNo]}>No</Text>
                <Text style={[styles.headerCell, styles.colName]}>Nama Lengkap</Text>
                <Text style={[styles.headerCell, styles.colCatType]}>Kategori</Text>
                <Text style={[styles.headerCell, styles.colCategory]}>Kelas</Text>
                <Text style={[styles.headerCell, styles.colPlace]}>Tempat Lahir</Text>
                <Text style={[styles.headerCell, styles.colDate]}>Tgl Lahir</Text>
                <Text style={[styles.headerCell, styles.colGender]}>Gender</Text>
                <Text style={[styles.headerCell, styles.colNik]}>NIK</Text>
                <Text style={[styles.headerCell, styles.colWeight]}>BB "KG"</Text>
                <Text style={[styles.headerCell, styles.colHeight]}>TB "CM"</Text>
                <Text style={[styles.headerCell, styles.colSchool]}>Asal Sekolah</Text>
                <Text style={[styles.headerCell, styles.colAction]}>Aksi</Text>
              </View>

              {/* TABLE BODY */}
              <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
                {filteredRows.map((row, index) => {
                  // AUTO MATCH CLASS FOR FIGHT
                  const currentTingkat = tables[activeTableIndex!].tingkat
                  if (row.cat_type_id === '1' && row.weight) {
                      const matchedId = autoMatchCategory(currentTingkat, row.gender, row.weight)
                      if (matchedId && row.category_id !== matchedId) {
                          // Update state immediately if mismatch found
                          setTimeout(() => updateRow(activeTableIndex!, row._tempId, 'category_id', matchedId), 0)
                      }
                  }

                  return (
                  <View
                    key={row._tempId}
                    style={[
                      styles.tableRow,
                      index % 2 === 0 && styles.tableRowAlt,
                    ]}
                  >
                    <View style={[styles.colNo, styles.centerCell]}>
                      <Text style={styles.noText}>{index + 1}</Text>
                    </View>

                    <TextInput
                      placeholder="Nama..."
                      value={row.full_name}
                      style={[styles.tableInput, styles.colName, styles.inputReadOnly]}
                      editable={false}
                    />

                    {/* KATEGORI (TYPE) DROPDOWN */}
                    <View style={[styles.colCatType]}>
                      <ScrollView style={styles.catPicker}>
                        {categoryTypes.map((type) => (
                          <TouchableOpacity
                            key={type.id}
                            onPress={() => {
                                updateRow(activeTableIndex!, row._tempId, 'cat_type_id', type.id.toString())
                                // Clear class if changing type
                                if (type.id.toString() !== '1') {
                                    updateRow(activeTableIndex!, row._tempId, 'category_id', '')
                                }
                            }}
                            style={[
                              styles.catItem,
                              row.cat_type_id === type.id.toString() && styles.catItemActive
                            ]}
                          >
                            <Text style={[styles.catItemText, row.cat_type_id === type.id.toString() && styles.catItemTextActive]}>
                              {type.type_name.toUpperCase()}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    {/* KELAS (CLASS) DROPDOWN */}
                    <View style={[styles.colCategory]}>
                        {String(row.cat_type_id) === '1' ? (
                            // AUTO FILL FOR FIGHT
                            <View style={styles.autoFilledClass}>
                                <Text style={styles.autoFilledText}>
                                    {categories.find(c => String(c.id) === String(row.category_id))?.name || 'Harap isi berat badan'}
                                </Text>
                            </View>
                        ) : (
                            // MANUAL FOR OTHERS
                            <ScrollView style={styles.catPicker}>
                                {categories
                                    .filter(c => 
                                        c.tingkat === currentTingkat && 
                                        c.gender === row.gender && 
                                        String(c.cat_type_id) === String(row.cat_type_id)
                                    )
                                    .map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        onPress={() => {
                                            const newValue = String(row.category_id) === String(cat.id) ? '' : String(cat.id)
                                            updateRow(activeTableIndex!, row._tempId, 'category_id', newValue)
                                        }}
                                        style={[
                                        styles.catItem,
                                        String(row.category_id) === String(cat.id) && styles.catItemActive
                                        ]}
                                    >
                                        <Text style={[styles.catItemText, String(row.category_id) === String(cat.id) && styles.catItemTextActive]}>
                                        {cat.name}
                                        </Text>
                                    </TouchableOpacity>
                                    ))}
                            </ScrollView>
                        )}
                    </View>

                    <TextInput
                      placeholder="Kota"
                      value={row.birth_place}
                      style={[styles.tableInput, styles.colPlace, styles.inputReadOnly]}
                      editable={false}
                    />

                    <TextInput
                      placeholder="YYYY-MM-DD"
                      value={row.birth_date}
                      style={[styles.tableInput, styles.colDate, styles.inputReadOnly]}
                      editable={false}
                    />

                    <View style={[styles.genderWrapper, styles.colGender, styles.inputReadOnly]}>
                      <View style={[styles.genderBtn, row.gender === 'male' && styles.genderMaleActive]}>
                        <Text style={[styles.genderText, row.gender === 'male' && styles.genderTextMale]}>L</Text>
                      </View>
                      <View style={[styles.genderBtn, row.gender === 'female' && styles.genderFemaleActive]}>
                        <Text style={[styles.genderText, row.gender === 'female' && styles.genderTextFemale]}>P</Text>
                      </View>
                    </View>

                    <TextInput
                      placeholder="NIK"
                      value={row.nik}
                      style={[styles.tableInput, styles.colNik, styles.inputReadOnly]}
                      editable={false}
                    />

                    <TextInput
                      placeholder="BB"
                      value={row.weight}
                      keyboardType="numeric"
                      onChangeText={(v) => updateRow(activeTableIndex!, row._tempId, 'weight', v)}
                      style={[styles.tableInput, styles.colWeight]}
                    />

                    <TextInput
                      placeholder="TB"
                      value={row.height}
                      keyboardType="numeric"
                      onChangeText={(v) => updateRow(activeTableIndex!, row._tempId, 'height', v)}
                      style={[styles.tableInput, styles.colHeight]}
                    />

                    <TextInput
                      placeholder="Sekolah"
                      value={row.school_name}
                      onChangeText={(v) => updateRow(activeTableIndex!, row._tempId, 'school_name', v)}
                      style={[styles.tableInput, styles.colSchool]}
                    />

                    <View style={[styles.colAction, styles.centerCell, { flexDirection: 'row', gap: 4 }]}>
                      <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(activeTableIndex!, row._tempId)}>
                        <Text style={styles.editIcon}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteRow(activeTableIndex!, row._tempId)}>
                        <Text style={styles.deleteIcon}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )})}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      ) : (
        <View style={styles.emptyTable}>
          <Text style={styles.emptyTableText}>Belum ada tabel pendaftaran. Silahkan buat tabel baru per kategori.</Text>
        </View>
      )}

      {/* BOTTOM ACTIONS */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.addTableBtn} onPress={() => setShowTingkatModal(true)}>
          <Text style={styles.addTableBtnText}>+ Tambahkan Tabel Baru</Text>
        </TouchableOpacity>
        
        {tables.length > 0 && (
          <TouchableOpacity
            style={[styles.saveBtn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textLight} />
            ) : (
              <Text style={styles.saveBtnText}>
                {isAlreadyRegistered ? '💾 Update Pendaftaran' : '💾 Kirim Pendaftaran'} ({totalAthletes} Atlit)
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>

        {/* SELECT ATHLETES MODAL */}
    <Modal visible={showSelectAthletes} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalBox, { maxHeight: '80%' }]}>
          
          {/* HEADER */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.modalTitle}>Pilih Atlit</Text>
            <TouchableOpacity onPress={() => setShowSelectAthletes(false)}>
              <Text style={{ color: Colors.danger, fontWeight: 'bold', fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* SEARCH */}
          <TextInput
            style={styles.modalInput}
            placeholder="Cari nama atlit..."
            placeholderTextColor={Colors.textSecondary}
            value={searchAthlete}
            onChangeText={setSearchAthlete}
          />

          {/* LIST */}
          {loadingAthletes ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
          ) : allAthletes.length == 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🥋</Text>
              <Text style={styles.emptyStateTitle}>Belum Ada Data Atlit</Text>
              <Text style={styles.emptyStateText}>
                Kamu belum memiliki atlit. Harap membuat data atlit baru untuk mendaftarkan atlit ke pertandingan!
              </Text>
              <TouchableOpacity
                style={styles.createAthleteBtn}
                onPress={() => router.push('/(official)/mydata')}
              >
                <Text style={styles.createAthleteBtnText}>+ Buat Data Atlit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={{ marginTop: 10 }}>
              {allAthletes
                .filter((a) =>
                  a.full_name.toLowerCase().includes(searchAthlete.toLowerCase())
                )
                .map((athlete) => {
                  const alreadyAdded = activeTableIndex !== null &&
                    tables[activeTableIndex]?.rows.some((r) => r.nik === athlete.nik)

                  return (
                    <TouchableOpacity
                      key={athlete.id}
                      style={[
                        styles.optionItem,
                        alreadyAdded && { opacity: 0.4 }
                      ]}
                      onPress={() => {
                        if (!alreadyAdded) toggleSelectAthlete(athlete)
                      }}
                      disabled={alreadyAdded}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: 'bold', color: Colors.text, fontSize: 13 }}>
                          {athlete.full_name}
                        </Text>
                        <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>
                          NIK: {athlete.nik} · {athlete.gender === 'male' ? '♂ L' : '♀ P'}
                        </Text>
                      </View>
                      {alreadyAdded ? (
                        <Text style={{ fontSize: 11, color: Colors.textSecondary }}>Sudah ditambah</Text>
                      ) : (
                        <Text style={{ fontSize: 18, color: Colors.primary }}>+</Text>
                      )}
                    </TouchableOpacity>
                  )
                })}
            </ScrollView>
          )}

          {/* DONE BUTTON */}
          <TouchableOpacity
            style={[styles.saveBtnModal, { marginTop: 12 }]}
            onPress={() => {
              setShowSelectAthletes(false)
              setSearchAthlete('')
            }}
          >
            <Text style={styles.saveBtnText}>Selesai</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  </>
  )
}

const COL = {
  no: 30,
  name: 150,
  catType: 120,
  category: 150,
  place: 100,
  date: 100,
  gender: 70,
  nik: 140,
  weight: 50,
  height: 50,
  school: 130,
  action: 70,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  title2: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primaryLight,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 12,
  },
  contingentBox: {
    marginBottom: 12,
    backgroundColor: Colors.backgroundSecondary,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contingentInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    fontSize: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    maxHeight: 50,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeTab: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    color: Colors.text,
    textTransform: 'capitalize',
  },
  activeTabText: {
    color: Colors.textLight,
    fontWeight: 'bold',
  },
  closeTab: {
    marginLeft: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeTabText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tableWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  tableHeaderActions: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary,
  },
  addExistingBtn: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addExistingText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 13,
  },
  searchTableWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    marginTop: 10,
    paddingHorizontal: 12,
  },
  searchTableInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.text,
  },
  clearSearchBtn: {
    padding: 4,
  },
  clearSearchText: {
    color: Colors.danger,
    fontWeight: 'bold',
    fontSize: 14,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  headerCell: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 11,
    textAlign: 'center',
    marginRight: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: Colors.backgroundSecondary,
  },
  centerCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 11,
    marginRight: 8,
    height: 36,
  },
  colNo: { width: COL.no },
  colName: { width: COL.name },
  colCatType: { width: COL.catType, marginRight: 8 },
  colCategory: { width: COL.category, marginRight: 8 },
  colPlace: { width: COL.place },
  colDate: { width: COL.date },
  colGender: { width: COL.gender },
  colNik: { width: COL.nik },
  colWeight: { width: COL.weight },
  colHeight: { width: COL.height },
  colSchool: { width: COL.school },
  colAction: { width: COL.action },

  noText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  catPicker: {
    height: 70,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
  },
  catItem: {
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  catItemActive: {
    backgroundColor: Colors.primary,
  },
  catItemText: {
    fontSize: 9,
    color: Colors.text,
  },
  catItemTextActive: {
    color: Colors.textLight,
    fontWeight: 'bold',
  },
  autoFilledClass: {
    height: 36,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 6,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  autoFilledText: {
    fontSize: 10,
    color: '#166534',
    fontWeight: 'bold',
  },
  genderWrapper: {
    flexDirection: 'row',
    gap: 4,
    marginRight: 8,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  genderMaleActive: { backgroundColor: '#DBEAFE', borderColor: '#60A5FA' },
  genderFemaleActive: { backgroundColor: '#FCE7F3', borderColor: '#F472B6' },
  genderText: { fontSize: 10, color: Colors.textSecondary },
  genderTextMale: { color: '#1D4ED8', fontWeight: 'bold' },
  genderTextFemale: { color: '#BE185D', fontWeight: 'bold' },
  inputReadOnly: {
    backgroundColor: '#F9FAFB',
    color: Colors.textSecondary,
  },
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
  editIcon: { fontSize: 10 },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  deleteIcon: { fontSize: 10 },
  emptyTable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTableText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 14,
  },
  bottomActions: {
    marginTop: 16,
    gap: 10,
    marginBottom: 20,
  },
  addTableBtn: {
    backgroundColor: Colors.orange,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  addTableBtnText: { color: Colors.textLight, fontWeight: 'bold', fontSize: 15 },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: { color: Colors.textLight, fontWeight: 'bold', fontSize: 15 },
  btnDisabled: { opacity: 0.6 },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: Colors.textSecondary,
    borderColor: '#E5E7EB',
  },

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
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.primary, marginBottom: 15 },
  optionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeBtn: {
    marginTop: 15,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeBtnText: { color: Colors.danger, fontWeight: 'bold' },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginTop: 10,
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: Colors.backgroundSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
  },
  cancelBtnText: { fontWeight: 'bold', color: Colors.text },
  saveBtnModal: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },

    // styling blm ad atlit ceritanya
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyStateIcon: {
    fontSize: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  createAthleteBtn: {
    backgroundColor: Colors.orange,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginTop: 8,
  },
  createAthleteBtnText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 15,
  },
})
