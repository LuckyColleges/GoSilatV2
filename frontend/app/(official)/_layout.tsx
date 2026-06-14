import { useEffect, useState } from 'react'
import { Slot, useRouter, usePathname } from 'expo-router'
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { useAuthStore } from '../../store/authStore'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { Colors } from '@/constants/colors'

export default function OfficialLayout() {
  const { isAuthenticated, user } = useAuthStore()
  const { loadFromStorage } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const init = async () => {
      await loadFromStorage()
      setIsReady(true)
    }
    init()
  },[])

  useEffect(() => {
    if(!isReady) return //biar kaga lanjut ke sono
    if(!isAuthenticated || user?.role_id !== 2){
      router.replace('/(auth)/login')
    }
  },[isReady, isAuthenticated, user])

  if(!isReady) {
    return(
      <View style={styles.loading}>
        <ActivityIndicator size={"large"} color={Colors.primary}/>
      </View>
    )
  }

  if (!isAuthenticated || user?.role_id !== 2) return null

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          !isHome && { paddingTop: 70 }
        ]}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.content}>
          <Slot />
        </View>
        <Footer />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // ← transparent biar background keliatan
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
    loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})