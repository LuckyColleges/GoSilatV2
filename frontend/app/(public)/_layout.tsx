import { Slot } from 'expo-router'
import { View, ScrollView, StyleSheet } from 'react-native'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { usePathname } from 'expo-router'

export default function PublicLayout() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.contentContainer,
          !isHome && { paddingTop: 70 }
        ]}
        showsVerticalScrollIndicator={true}
      >
        <Slot />
        <Footer />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    maxWidth: '100vw',
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
})