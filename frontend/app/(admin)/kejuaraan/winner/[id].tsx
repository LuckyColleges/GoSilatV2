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
    Modal,
    Platform,
  } from 'react-native'
  import { useLocalSearchParams, useRouter } from 'expo-router'
  import { Colors } from '../../../../constants/colors'
  import { adminService } from '../../../../services/adminService'
  import { tournamentService } from '../../../../services/tournamentService'
  import { Tournament } from '../../../../types/tournament'
  import CustomModal from '../../../../components/ui/Modal'

  const CATEGORY_TINGKAT_OPTIONS = [
    { label: 'Usia Dini 1', value: 'usia_dini_1' },
    { label: 'Usia Dini 2', value: 'usia_dini_2' },
    { label: 'Pra Remaja', value: 'pra_remaja' },
    { label: 'Remaja', value: 'remaja' },
    { label: 'Dewasa', value: 'dewasa' },
  ]

  const RANK_OPTIONS = [
    { label: 'No Medal', value: 'no_medal' },
    { label: 'Juara 1', value: 1 },
    { label: 'Juara 2', value: 2 },
    { label: 'Juara 3', value: 3 },
  ]

  interface WinnerRow {
    registration_id: number
    tournament_id: number
    athlete_id: number
    athlete_name: string
    athlete_gender: string
    contingent_id: number
    contingent_name: string
    official_id: number
    official_name: string
    category_id: number
    category_name: string
    category_tingkat: string
    cat_type_id: number
    category_type_name: string
    winner_id: number | null
    rank: number | null
  }

  export default function TournamentWinnersScreen() {
    const { id } = useLocalSearchParams()
    const router = useRouter()

    const [registrations, setRegistrations] = useState<WinnerRow[]>([])
    const [tournament, setTournament] = useState<Tournament | null>(null)
    const [allCategories, setAllCategories] = useState<any[]>([])
    const [categoryTypes, setCategoryTypes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedTingkatFilter, setSelectedTingkatFilter] = useState<string>('all')

    // Inline editing state
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editingRow, setEditingRow] = useState<{
      registration_id: number
      category_id: number | null
      category_tingkat: string
      cat_type_id: number | null
      rank: number | null
    } | null>(null)
    const [savingId, setSavingId] = useState<number | null>(null)

    // Custom Modal for general alerts
    const [alertModal, setAlertModal] = useState({
      visible: false,
      title: '',
      message: '',
      type: 'info' as 'success' | 'error' | 'info',
    })

    // Dropdown Picker Modal
    const [pickerModal, setPickerModal] = useState<{
      visible: boolean
      title: string
      options: { label: string; value: any }[]
      onSelect: (val: any) => void
    } | null>(null)

    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
      setAlertModal({ visible: true, title, message, type })
    }

    const openPicker = (title: string, options: { label: string; value: any }[], onSelect: (val: any) => void) => {
      setPickerModal({ visible: true, title, options, onSelect })
    }

    useEffect(() => {
      if (id) {
        fetchData()
      }
    }, [id])

    const fetchData = async () => {
      try {
        setLoading(true)
        const [winnersData, tData, catData, typeData] = await Promise.all([
          adminService.getWinnersDetail(Number(id)),
          tournamentService.getById(Number(id)),
          adminService.getAllCategories(),
          adminService.getCategoryTypes(),
        ])
        setRegistrations(winnersData || [])
        setTournament(tData)
        setAllCategories(catData || [])
        setCategoryTypes(typeData || [])
      } catch (error: any) {
        showAlert('Error', error.response?.data?.message || 'Gagal mengambil data pemenang kejuaraan', 'error')
      } finally {
        setLoading(false)
      }
    }

    const handleExport = () => {
      const url = adminService.getExportWinnersUrl(Number(id))
      Linking.openURL(url).catch((err) => {
        showAlert('Error', 'Gagal membuka link download Excel: ' + err.message, 'error')
      })
    }

    const handleImport = () => {
      if (Platform.OS === 'web') {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.xlsx, .xls'
        input.onchange = async (e: any) => {
          const file = e.target.files[0]
          if (file) {
            try {
              setLoading(true)
              const res = await adminService.uploadWinners(Number(id), file)
              showAlert('Sukses', `Berhasil memproses pemenang: ${res.summary.success} berhasil, ${res.summary.failed} gagal.`, 'success')
              fetchData()
            } catch (error: any) {
              showAlert('Error', error.response?.data?.message || 'Gagal mengimpor file Excel', 'error')
            } finally {
              setLoading(false)
            }
          }
        }
        input.click()
      } else {
        showAlert('Info', 'Fitur import di mobile memerlukan library expo-document-picker. Silakan gunakan versi web untuk saat ini.', 'info')
      }
    }

    const startEdit = (item: WinnerRow) => {
      setEditingId(item.registration_id)
      setEditingRow({
        registration_id: item.registration_id,
        category_id: item.category_id,
        category_tingkat: item.category_tingkat,
        cat_type_id: item.cat_type_id,
        rank: item.rank,
      })
    }

    const cancelEdit = () => {
      setEditingId(null)
      setEditingRow(null)
    }

    const handleTingkatChange = (val: string, gender: string) => {
      if (!editingRow) return
      const matchingCats = allCategories.filter(
        (c) =>
          c.tingkat === val &&
          c.cat_type_id === editingRow.cat_type_id &&
          (c.gender === gender || !c.gender)
      )
      setEditingRow((prev: any) => ({
        ...prev,
        category_tingkat: val,
        category_id: matchingCats.length > 0 ? matchingCats[0].id : null,
      }))
    }

    const handleTypeChange = (val: number, gender: string) => {
      if (!editingRow) return
      const matchingCats = allCategories.filter(
        (c) =>
          c.tingkat === editingRow.category_tingkat &&
          c.cat_type_id === val &&
          (c.gender === gender || !c.gender)
      )
      setEditingRow((prev: any) => ({
        ...prev,
        cat_type_id: val,
        category_id: matchingCats.length > 0 ? matchingCats[0].id : null,
      }))
    }

    const handleClassChange = (val: number) => {
      if (!editingRow) return
      setEditingRow((prev: any) => ({
        ...prev,
        category_id: val,
      }))
    }

    const handleRankChange = (val: any) => {
      if (!editingRow) return
      setEditingRow((prev: any) => ({
        ...prev,
        rank: val === 'no_medal' ? null : val,
      }))
    }

    const handleSaveRow = async (item: WinnerRow) => {
      if (!editingRow) return
      if (!editingRow.category_id) {
        return showAlert('Error', 'Silakan pilih kelas pertandingan yang valid', 'error')
      }

      try {
        setSavingId(item.registration_id)
        const payload = {
          registration_id: editingRow.registration_id,
          athlete_id: item.athlete_id,
          contingent_id: item.contingent_id,
          category_id: editingRow.category_id,
          rank: editingRow.rank,
        }

        await adminService.updateWinnerDetail(Number(id), payload)
        showAlert('Sukses', 'Data pemenang berhasil diperbarui', 'success')

        // Update local state directly
        const updatedCat = allCategories.find((c) => c.id === editingRow.category_id)
        const updatedType = categoryTypes.find((t) => t.id === editingRow.cat_type_id)

        setRegistrations((prev) =>
          prev.map((r) =>
            r.registration_id === item.registration_id
              ? {
                  ...r,
                  category_id: editingRow.category_id!,
                  category_name: updatedCat ? updatedCat.name : r.category_name,
                  category_tingkat: editingRow.category_tingkat,
                  cat_type_id: editingRow.cat_type_id!,
                  category_type_name: updatedType ? updatedType.type_name : r.category_type_name,
                  rank: editingRow.rank,
                }
              : r
          )
        )

        setEditingId(null)
        setEditingRow(null)
      } catch (error: any) {
        showAlert('Error', error.response?.data?.message || 'Gagal menyimpan perubahan data', 'error')
      } finally {
        setSavingId(null)
      }
    }

    const availableTingkatFilters = useMemo(() => {
      const options = new Set<string>()
      registrations.forEach((r) => {
        if (r.category_tingkat) options.add(r.category_tingkat)
      })
      return ['all', ...Array.from(options)]
    }, [registrations])

    const filteredRegistrations = useMemo(() => {
      let result = registrations
      if (selectedTingkatFilter !== 'all') {
        result = result.filter((r) => r.category_tingkat === selectedTingkatFilter)
      }
      if (!search) return result
      const s = search.toLowerCase()
      return result.filter(
        (r) =>
          r.athlete_name?.toLowerCase().includes(s) ||
          r.contingent_name?.toLowerCase().includes(s) ||
          r.category_tingkat?.toLowerCase().includes(s) ||
          r.category_type_name?.toLowerCase().includes(s) ||
          r.category_name?.toLowerCase().includes(s) ||
          r.official_name?.toLowerCase().includes(s)
      )
    }, [registrations, search, selectedTingkatFilter])

    const filteredCategoryOptions = useMemo(() => {
      if (!editingRow) return []
      const gender = registrations.find((r) => r.registration_id === editingRow.registration_id)?.athlete_gender || ''
      return allCategories
        .filter(
          (c) =>
            c.tingkat === editingRow.category_tingkat &&
            c.cat_type_id === editingRow.cat_type_id &&
            (c.gender === gender || !c.gender)
        )
        .map((c) => ({
          label: c.name,
          value: c.id,
        }))
    }, [editingRow, allCategories, registrations])

    const groupedData = useMemo(() => {
      const groups: {
        [tingkat: string]: {
          [typeName: string]: {
            [className: string]: WinnerRow[]
          }
        }
      } = {}

      filteredRegistrations.forEach((r) => {
        const tingkat = r.category_tingkat || 'Tanpa Tingkat'
        const typeName = r.category_type_name || 'Tanpa Jenis'
        const className = r.category_name || 'Tanpa Kelas'

        if (!groups[tingkat]) groups[tingkat] = {}
        if (!groups[tingkat][typeName]) groups[tingkat][typeName] = {}
        if (!groups[tingkat][typeName][className]) groups[tingkat][typeName][className] = []

        groups[tingkat][typeName][className].push(r)
      })

      return Object.keys(groups).map((tingkat) => ({
        tingkat,
        types: Object.keys(groups[tingkat]).map((typeName) => ({
          typeName,
          classes: Object.keys(groups[tingkat][typeName]).map((className) => ({
            className,
            rows: groups[tingkat][typeName][className],
          })),
        })),
      }))
    }, [filteredRegistrations])

    // Render Display Values
    const getRankLabel = (rank: number | null) => {
      if (rank === 1) return 'Juara 1 🥇'
      if (rank === 2) return 'Juara 2 🥈'
      if (rank === 3) return 'Juara 3 🥉'
      return '-'
    }

    const getTingkatLabel = (tingkat: string) => {
      const found = CATEGORY_TINGKAT_OPTIONS.find((t) => t.value === tingkat)
      return found ? found.label : tingkat
    }

    const getCatTypeLabel = (typeId: number) => {
      const found = categoryTypes.find((t) => t.id === typeId)
      return found ? found.type_name.toUpperCase() : '-'
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
          visible={alertModal.visible}
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
          onClose={() => setAlertModal({ ...alertModal, visible: false })}
        />

        {/* Picker Modal */}
        {pickerModal?.visible && (
          <Modal visible={pickerModal.visible} animationType="fade" transparent>
            <View style={styles.pickerModalOverlay}>
              <View style={styles.pickerBox}>
                <Text style={styles.pickerTitle}>{pickerModal.title}</Text>
                <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
                  {pickerModal.options.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={styles.pickerItem}
                      onPress={() => {
                        pickerModal.onSelect(opt.value)
                        setPickerModal(null)
                      }}
                    >
                      <Text style={styles.pickerItemText}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity style={styles.pickerCancelBtn} onPress={() => setPickerModal(null)}>
                  <Text style={styles.pickerCancelBtnText}>Batal</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Update Pemenang</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {tournament?.name || 'Kejuaraan'}
            </Text>
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
              placeholder="Cari nama, kontingen, tingkat, jenis..."
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <View style={styles.toolbarButtons}>
            <TouchableOpacity style={styles.importBtn} onPress={handleImport}>
              <Text style={styles.importBtnText}>📤 Import Excel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
              <Text style={styles.exportBtnText}>📥 Export Excel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Kategori Tingkat */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {availableTingkatFilters.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.filterPill,
                  selectedTingkatFilter === t && styles.filterPillActive,
                ]}
                onPress={() => setSelectedTingkatFilter(t)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    selectedTingkatFilter === t && styles.filterPillTextActive,
                  ]}
                >
                  {t === 'all' ? 'Semua Kategori' : getTingkatLabel(t)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Text style={styles.stats}>
            {filteredRegistrations.length} dari {registrations.length} Atlit ditemukan
          </Text>
        </View>

        {/* Grouped Lists and Tables */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 30 }}>
          {groupedData.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Belum ada pendaftar / data tidak ditemukan.</Text>
            </View>
          ) : (
            groupedData.map((tingkatGroup) => (
              <View key={tingkatGroup.tingkat} style={styles.tingkatSection}>
                {/* 1. Header Tingkat */}
                <View style={styles.tingkatHeader}>
                  <Text style={styles.tingkatHeaderText}>
                    🏆 TINGKAT: {getTingkatLabel(tingkatGroup.tingkat).toUpperCase()}
                  </Text>
                </View>

                {tingkatGroup.types.map((typeGroup) => (
                  <View key={typeGroup.typeName} style={styles.typeSection}>
                    {/* 2. Header Jenis/Type */}
                    <View style={styles.typeHeader}>
                      <Text style={styles.typeHeaderText}>
                        ⚡ JENIS: {typeGroup.typeName.toUpperCase()}
                      </Text>
                    </View>

                    {typeGroup.classes.map((classGroup) => (
                      <View key={classGroup.className} style={styles.classSection}>
                        {/* 3. Header Kelas */}
                        <View style={styles.classHeader}>
                          <Text style={styles.classHeaderText}>
                            🥋 KELAS: {classGroup.className}
                          </Text>
                        </View>

                        {/* Table for this specific class */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                          <View style={styles.tableWrapper}>
                            <View style={styles.tableHeader}>
                              <Text style={[styles.headerCell, { width: 50 }]}>No</Text>
                              <Text style={[styles.headerCell, { width: 140 }]}>Kategori Tingkat</Text>
                              <Text style={[styles.headerCell, { width: 120 }]}>Kategori Jenis</Text>
                              <Text style={[styles.headerCell, { width: 150 }]}>Kelas Pertandingan</Text>
                              <Text style={[styles.headerCell, { width: 180 }]}>Nama Atlit</Text>
                              <Text style={[styles.headerCell, { width: 150 }]}>Kontingen</Text>
                              <Text style={[styles.headerCell, { width: 130 }]}>Official</Text>
                              <Text style={[styles.headerCell, { width: 120 }]}>Juara (Rank)</Text>
                              <Text style={[styles.headerCell, { width: 140 }]}>Aksi</Text>
                            </View>

                            {classGroup.rows.map((item, idx) => {
                              const isEditing = editingId === item.registration_id

                              return (
                                <View
                                  key={item.registration_id}
                                  style={[styles.tableRow, idx % 2 === 1 && styles.rowAlt]}
                                >
                                  <Text style={[styles.cell, { width: 50 }]}>{idx + 1}</Text>

                                  {/* Kategori Tingkat */}
                                  <View style={{ width: 140, paddingHorizontal: 10 }}>
                                    {isEditing && editingRow ? (
                                      <TouchableOpacity
                                        style={styles.pickerCellBtn}
                                        onPress={() =>
                                          openPicker('Pilih Tingkat', CATEGORY_TINGKAT_OPTIONS, (val) =>
                                            handleTingkatChange(val, item.athlete_gender)
                                          )
                                        }
                                      >
                                        <Text style={styles.pickerCellText} numberOfLines={1}>
                                          {getTingkatLabel(editingRow.category_tingkat)} ▾
                                        </Text>
                                      </TouchableOpacity>
                                    ) : (
                                      <Text style={[styles.cellText, { textAlign: 'center' }]}>
                                        {getTingkatLabel(item.category_tingkat)}
                                      </Text>
                                    )}
                                  </View>

                                  {/* Kategori Jenis */}
                                  <View style={{ width: 120, paddingHorizontal: 10 }}>
                                    {isEditing && editingRow ? (
                                      <TouchableOpacity
                                        style={styles.pickerCellBtn}
                                        onPress={() =>
                                          openPicker(
                                            'Pilih Jenis',
                                            categoryTypes.map((t) => ({
                                              label: t.type_name.toUpperCase(),
                                              value: t.id,
                                            })),
                                            (val) => handleTypeChange(val, item.athlete_gender)
                                          )
                                        }
                                      >
                                        <Text style={styles.pickerCellText} numberOfLines={1}>
                                          {getCatTypeLabel(editingRow.cat_type_id || 0)} ▾
                                        </Text>
                                      </TouchableOpacity>
                                    ) : (
                                      <Text style={[styles.cellText, { textAlign: 'center' }]}>
                                        {getCatTypeLabel(item.cat_type_id)}
                                      </Text>
                                    )}
                                  </View>

                                  {/* Kelas Pertandingan */}
                                  <View style={{ width: 150, paddingHorizontal: 10 }}>
                                    {isEditing && editingRow ? (
                                      <TouchableOpacity
                                        style={styles.pickerCellBtn}
                                        onPress={() => {
                                          if (filteredCategoryOptions.length === 0) {
                                            return showAlert(
                                              'Info',
                                              'Tidak ada kelas tanding yang cocok untuk kriteria tingkat, jenis, dan gender atlit ini.',
                                              'info'
                                            )
                                          }
                                          openPicker('Pilih Kelas', filteredCategoryOptions, handleClassChange)
                                        }}
                                      >
                                        <Text style={styles.pickerCellText} numberOfLines={1}>
                                          {editingRow.category_id
                                            ? allCategories.find((c) => c.id === editingRow.category_id)?.name ||
                                              'Pilih...'
                                            : 'Pilih...'} ▾
                                        </Text>
                                      </TouchableOpacity>
                                    ) : (
                                      <Text style={[styles.cellText, { textAlign: 'center' }]}>
                                        {item.category_name || '-'}
                                      </Text>
                                    )}
                                  </View>

                                  {/* Nama Atlit */}
                                  <Text style={[styles.cell, { width: 180, fontWeight: 'bold', textAlign: 'left' }]}>
                                    {item.athlete_name}
                                  </Text>

                                  {/* Kontingen */}
                                  <Text
                                    style={[
                                      styles.cell,
                                      { width: 150, color: Colors.primaryLight, textAlign: 'left' },
                                    ]}
                                  >
                                    {item.contingent_name}
                                  </Text>

                                  {/* Official */}
                                  <Text style={[styles.cell, { width: 130 }]}>{item.official_name}</Text>

                                  {/* Juara (Rank) */}
                                  <View style={{ width: 120, paddingHorizontal: 10 }}>
                                    {isEditing && editingRow ? (
                                      <TouchableOpacity
                                        style={styles.pickerCellBtn}
                                        onPress={() => openPicker('Pilih Juara', RANK_OPTIONS, handleRankChange)}
                                      >
                                        <Text style={styles.pickerCellText} numberOfLines={1}>
                                          {editingRow.rank === null ? 'No Medal' : `Juara ${editingRow.rank}`} ▾
                                        </Text>
                                      </TouchableOpacity>
                                    ) : (
                                      <Text
                                        style={[
                                          styles.cellText,
                                          { textAlign: 'center', fontWeight: item.rank ? 'bold' : 'normal' },
                                        ]}
                                      >
                                        {getRankLabel(item.rank)}
                                      </Text>
                                    )}
                                  </View>

                                  {/* Action */}
                                  <View
                                    style={{
                                      width: 140,
                                      flexDirection: 'row',
                                      justifyContent: 'center',
                                      gap: 6,
                                    }}
                                  >
                                    {isEditing ? (
                                      <>
                                        <TouchableOpacity
                                          style={styles.saveBtn}
                                          onPress={() => handleSaveRow(item)}
                                          disabled={savingId === item.registration_id}
                                        >
                                          {savingId === item.registration_id ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                          ) : (
                                            <Text style={styles.actionBtnText}>💾 Simpan</Text>
                                          )}
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
                                          <Text style={styles.actionBtnText}>Batal</Text>
                                        </TouchableOpacity>
                                      </>
                                    ) : (
                                      <TouchableOpacity style={styles.editBtn} onPress={() => startEdit(item)}>
                                        <Text style={styles.actionBtnText}>✏️ Edit</Text>
                                      </TouchableOpacity>
                                    )}
                                  </View>
                                </View>
                              )
                            })}
                          </View>
                        </ScrollView>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ))
          )}
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
    toolbarButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    exportBtn: {
      backgroundColor: Colors.success,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 8,
      elevation: 2,
    },
    exportBtnText: { color: Colors.textLight, fontWeight: 'bold', fontSize: 13 },
    importBtn: {
      backgroundColor: Colors.orange,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 8,
      elevation: 2,
    },
    importBtnText: { color: Colors.textLight, fontWeight: 'bold', fontSize: 13 },
    statsRow: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.cream },
    stats: { fontSize: 12, fontWeight: 'bold', color: Colors.textSecondary },

    tableHeader: {
      flexDirection: 'row',
      backgroundColor: Colors.primaryLight,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    headerCell: {
      paddingHorizontal: 10,
      fontSize: 12,
      fontWeight: 'bold',
      color: Colors.textLight,
      textAlign: 'center',
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
      alignItems: 'center',
      backgroundColor: Colors.background,
    },
    rowAlt: { backgroundColor: Colors.backgroundSecondary },
    cell: { paddingHorizontal: 10, fontSize: 12, color: Colors.text, textAlign: 'center' },
    cellText: { fontSize: 12, color: Colors.text },
    empty: { padding: 40, alignItems: 'center', width: 1100 },
    emptyText: { color: Colors.textSecondary, fontSize: 14 },

    // Edit / Save Buttons
    editBtn: {
      backgroundColor: Colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      minWidth: 60,
      alignItems: 'center',
    },
    saveBtn: {
      backgroundColor: Colors.success,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      minWidth: 65,
      alignItems: 'center',
    },
    cancelBtn: {
      backgroundColor: Colors.danger,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      minWidth: 55,
      alignItems: 'center',
    },
    actionBtnText: { color: Colors.textLight, fontSize: 11, fontWeight: 'bold' },

    // Filter Kategori Tingkat Styles
    filterContainer: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: Colors.background,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    filterScroll: {
      gap: 8,
      paddingRight: 16,
    },
    filterPill: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: 'white',
      borderWidth: 1,
      borderColor: Colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterPillActive: {
      backgroundColor: Colors.primary,
      borderColor: Colors.primary,
    },
    filterPillText: {
      fontSize: 12,
      color: Colors.textSecondary,
      fontWeight: '600',
    },
    filterPillTextActive: {
      color: 'white',
      fontWeight: 'bold',
    },

    // Grouping Sections
    tingkatSection: {
      marginTop: 20,
      marginHorizontal: 16,
      backgroundColor: 'white',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors.border,
      overflow: 'hidden',
      elevation: 2,
    },
    tingkatHeader: {
      backgroundColor: Colors.primaryDark,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    tingkatHeaderText: {
      color: 'white',
      fontSize: 15,
      fontWeight: 'bold',
    },
    typeSection: {
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    typeHeader: {
      backgroundColor: Colors.backgroundSecondary,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginVertical: 6,
      borderLeftWidth: 4,
      borderLeftColor: Colors.primary,
    },
    typeHeaderText: {
      color: Colors.primary,
      fontSize: 13,
      fontWeight: 'bold',
    },
    classSection: {
      marginLeft: 8,
      marginVertical: 10,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 8,
      overflow: 'hidden',
    },
    classHeader: {
      backgroundColor: '#f1f5f9',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    classHeaderText: {
      color: Colors.text,
      fontSize: 12,
      fontWeight: 'bold',
    },
    tableWrapper: {
      flexDirection: 'column',
    },


    // Dropdown cells
    pickerCellBtn: {
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 6,
      paddingVertical: 5,
      paddingHorizontal: 8,
      backgroundColor: 'white',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pickerCellText: { fontSize: 11, color: Colors.text },

    // Picker Modal styles
    pickerModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    pickerBox: {
      width: 280,
      maxHeight: 400,
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      elevation: 5,
    },
    pickerTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: Colors.primary,
      marginBottom: 12,
      textAlign: 'center',
    },
    pickerList: {
      marginBottom: 12,
    },
    pickerItem: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
      alignItems: 'center',
    },
    pickerItemText: {
      fontSize: 14,
      color: Colors.text,
    },
    pickerCancelBtn: {
      backgroundColor: Colors.backgroundSecondary,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: Colors.border,
    },
    pickerCancelBtnText: {
      color: Colors.text,
      fontWeight: 'bold',
      fontSize: 14,
    },
  })
