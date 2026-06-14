import { useEffect, useRef, useState } from 'react'
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native'
import { Colors } from '../../constants/colors'

// Nanti ganti dengan foto asli GoSilat
const SLIDES = [
  { id: 1, image: require('../../assets/images/carousel/imgc1.jpg') },
  { id: 2, image: require('../../assets/images/carousel/imgc2.jpg') },
  { id: 3, image: require('../../assets/images/carousel/imgc3.jpg') },
  { id: 4, image: require('../../assets/images/carousel/imgc4.jpeg') },
  { id: 5, image: require('../../assets/images/carousel/imgc5.jpeg') },
  { id: 6, image: require('../../assets/images/carousel/imgc6.jpeg') }
]

export default function Carousel() {
  const { width } = useWindowDimensions()
  const scrollRef = useRef<ScrollView>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const carouselHeight = width < 768 ? 400 : 600;

  // Auto scroll setiap 3 detik
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % SLIDES.length
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true })
      setActiveIndex(nextIndex)
    }, 3000)
    return () => clearInterval(interval)
  }, [activeIndex])

  const handleScroll = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width)
    setActiveIndex(index)
  }

  return (
    <View style={[styles.container,{height: carouselHeight}]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
      >
        {SLIDES.map((slide) => (
          <Image
            key={slide.id}
            source={slide.image}
            style={[styles.image,{width,height:carouselHeight + 80,transform:[{translateY : 50}]}]}
            // itu style transform buat ke bawahin gamabar aja
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* Dot indicators */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  image: {
// gadi pake soalnya stylingnya manual di atas
  },
  dots: {
    position: 'absolute',
    bottom: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textLight,
    opacity: 0.5,
  },
  dotActive: {
    opacity: 1,
    backgroundColor: Colors.yellow,
    width: 20,
  },
})  