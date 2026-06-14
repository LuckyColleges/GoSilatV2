import { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import { Colors } from '../../constants/colors'
import { User, UserRole } from '../../types/user'
import { adminService } from '../../services/adminService'
import CustomModal from '../../components/ui/Modal'

const FILTERS: { label: string; value: number | 'all' }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Official', value: 2 },
  { label: 'Admin', value: 1 },
]

const ROLE_COLOR: Record<number, string> = {
  2: Colors.orange,
  1: Colors.danger,
}

const ROLE_LABEL: Record<number, string> = {
  2: 'Official',
  1: 'Admin',
}

export default function ManageUsersScreen() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<number | 'all'>('all')

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
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await adminService.getUsers()
      setUsers(res.data)
    } catch (error: any) {
      showAlert('Error', error.response?.data?.message || 'Gagal mengambil data user', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filtered = users.filter((u) => {
    const matchRole = activeFilter === 'all' || u.role_id === activeFilter
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  const handleToggleRole = (user: any) => {
    const newRole = user.role_id === 1 ? 2 : 1
    const roleName = newRole === 1 ? 'Admin' : 'Official'
    
    showConfirm(
      'Ubah Role',
      `Ubah role ${user.name} menjadi ${roleName}?`,
      async () => {
        setModal({ ...modal, visible: false })
        try {
          await adminService.updateUserRole(user.id, newRole)
          setUsers((prev) =>
            prev.map((u) => (u.id === user.id ? { ...u, role_id: newRole } : u))
          )
          showAlert('Sukses', `Role ${user.name} berhasil diubah`, 'success')
        } catch (error: any) {
          showAlert('Error', error.response?.data?.message || 'Gagal mengubah role', 'error')
        }
      }
    )
  }

  const handleDelete = (id: number) => {
    showConfirm(
      'Hapus User',
      'Yakin ingin menghapus user ini?',
      async () => {
        setModal({ ...modal, visible: false })
        try {
          await adminService.deleteUser(id)
          setUsers((prev) => prev.filter((u) => u.id !== id))
          showAlert('Sukses', 'User berhasil dihapus', 'success')
        } catch (error: any) {
          showAlert('Error', error.response?.data?.message || 'Gagal menghapus user', 'error')
        }
      }
    )
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
        <Text style={styles.pageTitle}>Manage Users</Text>
        <Text style={styles.pageSubtitle}>{filtered.length} user ditemukan</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama atau email..."
          placeholderTextColor={Colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[
              styles.filterTab,
              activeFilter === f.value && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(f.value)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === f.value && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* User List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item, index }) => (
          <View style={[styles.userCard, index % 2 === 0 && styles.rowAlt]}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
              {item.phone_number && (
                <Text style={styles.userPhone}>📞 {item.phone_number}</Text>
              )}
              <Text style={styles.userJoined}>📅 Bergabung: {new Date(item.created_at).toLocaleDateString()}</Text>
            </View>

            <View style={styles.userActions}>
              <TouchableOpacity
                style={[styles.roleBadge, { backgroundColor: ROLE_COLOR[item.role_id] || Colors.primary }]}
                onPress={() => handleToggleRole(item)}
              >
                <Text style={styles.roleBadgeText}>{ROLE_LABEL[item.role_id] || 'Unknown'}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={styles.btnDelete}
              >
                <Text style={styles.btnDeleteText}>🗑️ Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Tidak ada user ditemukan.</Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  pageHeader: { backgroundColor: Colors.primary, padding: 24 },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.textLight },
  pageSubtitle: { fontSize: 13, color: Colors.cream, opacity: 0.8, marginTop: 4 },
  searchContainer: { padding: 16, backgroundColor: Colors.backgroundSecondary },
  searchInput: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 13, color: Colors.textSecondary },
  filterTextActive: { color: Colors.textLight, fontWeight: 'bold' },
  userCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  rowAlt: { backgroundColor: Colors.backgroundSecondary },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: 'bold', color: Colors.text },
  userEmail: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  userPhone: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  userJoined: { fontSize: 11, color: '#999', marginTop: 4 },
  userActions: { alignItems: 'flex-end', gap: 10 },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: { color: Colors.textLight, fontSize: 11, fontWeight: 'bold' },
  btnDelete: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  btnDeleteText: { color: Colors.danger, fontSize: 11, fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 40, color: Colors.textSecondary },
})