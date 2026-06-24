import { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Colors } from '../../../constants/colors'
import { Athlete } from '../../../types/athlete'
import { athleteService } from '../../../services/athleteService'
import { useSelectionStore } from '../../../store/selectionStore'

export default function SelectAthletesScreen() {
  const router = useRouter()
  const { tingkat } = useLocalSearchParams()
  const { addAthlete, removeAthlete, selectedAthletes, clearSelection } = useSelectionStore()

  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const fetchAthletes = async () => {
    try {
      setLoading(true)
      const response = await athleteService.getMyAthletes()
      setAthletes(response.data || [])
    console.log('response:', JSON.stringify(response))  // ← tambah ini
    console.log('response.data:', response.data)        // ← tambah ini
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAthletes()
  }, [])

  const filteredAthletes = athletes.filter((item) =>
    item.full_name.toLowerCase().includes(search.toLowerCase())
  )

  const isSelected = (id: number) => selectedAthletes.some((a) => a.id === id)

  const toggleSelection = (athlete: Athlete) => {
    if (isSelected(athlete.id)) {
      removeAthlete(athlete.id)
    } else {
      addAthlete(athlete)
    }
  }

  const handleDone = () => {
    router.back()
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.pageHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Pilih Atlit</Text>
        <Text style={styles.pageSubtitle}>
          {tingkat ? `Kategori: ${tingkat.toString().replace('_', ' ')}` : 'Semua Atlit'}
        </Text>
      </View>

      {/* SEARCH */}
      <View style={styles.toolbar}>
        <TextInput
          placeholder="Cari Nama atlit..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* CONTENT */}
      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : athletes.length == 0 ? ( 
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
        <FlatList
          data={filteredAthletes}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.athleteRow,
                index % 2 === 0 && styles.rowAlt,
                isSelected(item.id) && styles.rowSelected,
              ]}
              onPress={() => toggleSelection(item)}
            >
              <View style={styles.athleteInfo}>
                <Text style={styles.athleteName}>{item.full_name}</Text>
                <Text style={styles.athleteSub}>NIK: {item.nik} | {item.gender === 'male' ? 'L' : 'P'}</Text>
              </View>
              <View style={[styles.checkBtn, isSelected(item.id) && styles.checkBtnActive]}>
                <Text style={styles.checkIcon}>{isSelected(item.id) ? '✓' : '+'}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Tidak ada atlit ditemukan.</Text>}
        />
      )}

      {/* BOTTOM BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
          <Text style={styles.doneBtnText}>
            Tambahkan {selectedAthletes.length} Atlit
          </Text>
        </TouchableOpacity>
      </View>
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
    padding: 20,
    paddingTop: 40,
  },
  backText: {
    color: Colors.textLight,
    marginBottom: 10,
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
    textTransform: 'capitalize',
  },
  toolbar: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  athleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowAlt: {
    backgroundColor: Colors.backgroundSecondary,
  },
  rowSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#EFF6FF',
  },
  athleteInfo: {
    flex: 1,
  },
  athleteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  athleteSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkIcon: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  doneBtn: {
    backgroundColor: Colors.orange,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneBtnText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 16,
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
