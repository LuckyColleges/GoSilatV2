import { useEffect, useState } from 'react'
import { Slot, useRouter } from 'expo-router'
import { 
  View, 
  StyleSheet, 
  useWindowDimensions, 
  TouchableOpacity, 
  Text,
  Modal,
  SafeAreaView
} from 'react-native'
import { useAuthStore } from '../../store/authStore'
import AdminSidebar from '../../components/layout/AdminSidebar'
import { Colors } from '../../constants/colors'

export default function AdminLayout() {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isMobile = width < 768

  const [sidebarVisible, setSidebarVisible] = useState(false)

  useEffect(() => {
    // Kalau bukan admin → redirect ke login
    if (!isAuthenticated || user?.role_id !== 1) {
      router.replace('/(auth)/login')
    }
  }, [isAuthenticated, user])

  if (!isAuthenticated || user?.role_id !== 1) return null

  return (
    <SafeAreaView style={styles.container}>
      {/* SIDEBAR FOR DESKTOP */}
      {!isMobile && <AdminSidebar />}

      {/* MOBILE SIDEBAR MODAL */}
      {isMobile && (
        <Modal
          visible={sidebarVisible}
          animationType="none" // Standard animation can be tricky, using none for instant left dock
          transparent={true}
          onRequestClose={() => setSidebarVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.sidebarDrawer}>
                <AdminSidebar isMobile onClose={() => setSidebarVisible(false)} />
            </View>
            <TouchableOpacity 
              style={styles.overlayClose} 
              activeOpacity={1}
              onPress={() => setSidebarVisible(false)} 
            />
          </View>
        </Modal>
      )}

      <View style={styles.content}>
        {/* MOBILE HEADER */}
        {isMobile && (
          <View style={styles.mobileHeader}>
            <TouchableOpacity 
              onPress={() => setSidebarVisible(true)}
              style={styles.hamburger}
            >
              <Text style={styles.hamburgerLine}>☰</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Admin Panel</Text>
          </View>
        )}

        <View style={styles.slotWrapper}>
            <Slot />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.background,
  },
  content: { 
    flex: 1,
    height: '100%',
  },
  slotWrapper: {
    flex: 1,
  },
  mobileHeader: {
    height: 60,
    backgroundColor: Colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  headerTitle: {
    color: Colors.textLight,
    fontSize: 18,
    fontWeight: 'bold',
  },
  hamburger: {
    padding: 8,
  },
  hamburgerLine: {
    color: Colors.textLight,
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-start',
  },
  sidebarDrawer: {
    width: 280,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  overlayClose: {
    flex: 1,
    height: '100%',
  },
  })