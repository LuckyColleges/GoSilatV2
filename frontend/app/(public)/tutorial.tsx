import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '../../constants/colors'

export default function TutorialScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tutorial Daftar</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
  },
})