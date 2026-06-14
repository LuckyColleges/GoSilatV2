import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { Colors } from '../../constants/colors'
import { useRouter } from 'expo-router'
import { adminService } from '../../services/adminService'

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await adminService.getDashboardStats()
      setStats(res)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  const STAT_CARDS = [
    { label: 'Total User', value: stats?.users || 0, icon: '👤', color: '#3B82F6' },
    { label: 'Kejuaraan', value: stats?.tournaments || 0, icon: '🏆', color: '#10B981' },
    { label: 'Total Atlit', value: stats?.athletes || 0, icon: '🥋', color: '#F59E0B' },
    { label: 'Pendaftaran', value: stats?.registrations || 0, icon: '📄', color: '#8B5CF6' },
  ]

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Dashboard Admin</Text>
        <Text style={styles.pageSubtitle}>Ringkasan sistem hari ini</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {STAT_CARDS.map((stat, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aksi Cepat</Text>
        
        <QuickAction
          title="Approval Pendaftaran"
          desc={`${stats?.pendingRegistrations || 0} menunggu persetujuan`}
          icon="⏳"
          onPress={() => router.push('/(admin)/approval')}
        />
        
        <QuickAction
          title="Manage Kejuaraan"
          desc="Buat atau edit event baru"
          icon="🏅"
          onPress={() => router.push('/(admin)/kejuaraan')}
        />
        
        <QuickAction
          title="Manage Users"
          desc="Atur role dan akses pengguna"
          icon="👥"
          onPress={() => router.push('/(admin)/users')}
        />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

function QuickAction({ title, desc, icon, onPress }: { title: string; desc: string; icon: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={styles.actionIconContainer}>
        <Text style={{ fontSize: 24 }}>{icon}</Text>
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDesc}>{desc}</Text>
      </View>
      <Text style={styles.actionArrow}>→</Text>
    </TouchableOpacity>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    gap: 6,
  },
  statIcon: {
    fontSize: 28,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 1,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text,
  },
  actionDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionArrow: {
    fontSize: 20,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
})
