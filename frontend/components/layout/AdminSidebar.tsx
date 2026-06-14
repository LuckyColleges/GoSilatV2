import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Colors } from '../../constants/colors'
import { Config } from '../../constants/config'
import { useAuthStore } from '../../store/authStore'

interface AdminSidebarProps {
  isMobile?: boolean
  onClose?: () => void
}

export default function AdminSidebar({ isMobile, onClose }: AdminSidebarProps) {
  const router = useRouter()
  const { logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.replace('/(auth)/login')
  }

  const handleNav = (route: string) => {
    router.push(route as any)
    if (isMobile && onClose) onClose()
  }

  const navItems = [
    { label: 'Dashboard', route: '/(admin)/dashboard' },
    { label: 'Manage Users', route: '/(admin)/users' },
    { label: 'Manage Kejuaraan', route: '/(admin)/kejuaraan' },
    { label: 'Approval', route: '/(admin)/approval' },
  ]

  return (
    <View style={[styles.sidebar, isMobile && styles.sidebarMobile]}>
      <View style={styles.headerRow}>
        <View>
            <Text style={styles.logo}>{Config.APP_NAME}</Text>
            <Text style={styles.adminLabel}>Admin Panel</Text>
        </View>
        {isMobile && (
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
        )}
      </View>

      <View style={styles.nav}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={styles.navItem}
            onPress={() => handleNav(item.route)}
          >
            <Text style={styles.navText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
        <Text style={styles.btnText}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    backgroundColor: Colors.primaryDark,
    paddingVertical: 32,
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
    gap: 8,
  },
  sidebarMobile: {
    width: 280,
    height: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  closeBtn: {
    padding: 8,
  },
  closeText: {
    color: Colors.textLight,
    fontSize: 20,
    fontWeight: 'bold',
  },
  logo: {
    color: Colors.textLight,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  adminLabel: {
    color: Colors.secondary,
    fontSize: 11,
    marginBottom: 24,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nav: {
    flex: 1,
    gap: 4,
  },
  navItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  navText: {
    color: Colors.textLight,
    fontSize: 14,
  },
  btnLogout: {
    backgroundColor: Colors.danger,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  btnText: {
    color: Colors.textLight,
    fontWeight: 'bold',
  },
})