import { View, Text, Image, ScrollView, StyleSheet } from 'react-native'
import { Colors } from '../../constants/colors'
import { Config } from '@/constants/config'

export default function PartnershipBox() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Our Partnerships</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {Config.PARTNERS.map((partner) => (
          <View key={partner.id} style={styles.card}>
            <Image
              source={partner.logo}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.name}>{partner.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: Colors.cream,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  scroll: {
    gap: 16,
    paddingHorizontal: 8,
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    width: 140,
  },
  logo: {
    width: 100,
    height: 50,
  },
  name: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
})