import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
  Image,
  Animated,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Colors } from '../../constants/colors'
import { Config } from '../../constants/config'
import { useAuthStore } from '../../store/authStore'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'

const BREAKPOINT = 768

export default function Header() {
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { width: nativeWidth } = useWindowDimensions() // ← tambah ini
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Web: pakai window.innerWidth
      const check = () => setIsMobile(window.innerWidth < BREAKPOINT)
      check()
      window.addEventListener('resize', check)
      return () => window.removeEventListener('resize', check)
    } else {
      // Native HP: pakai useWindowDimensions
      setIsMobile(nativeWidth < BREAKPOINT)
    }
  }, [nativeWidth]) // ← nativeWidth jadi dependency

  useEffect(() => {
    if (!isMobile) setMenuOpen(false)
  }, [isMobile])

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    router.replace('/(auth)/login')
  }

  const navTo = (path: string) => {
    setMenuOpen(false)
    router.push(path as any)
  }

  const NAV_ITEMS = [
    { label: 'Beranda', path: '/(public)' },
    { label: 'Tentang', path: '/(public)/tentang' },
    { label: 'Pertandingan', path: '/(public)/pertandingan' },
    { label: 'Daftar Pemenang', path: '/(public)/pemenang' },
    ...(isAuthenticated && user?.role_id === 2
      ? [{ label: 'MyData', path: '/(official)/mydata' }]
      : []),
    ...(isAuthenticated && user?.role_id === 1
      ? [{ label: 'Dashboard', path: '/(admin)/dashboard' }]
      : []),
  ]

  //  Buat styling logo doang
    const glowAnim = useState(
      new Animated.Value(0.7)
    )[0]

    useEffect(() => {

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: false,
          }),

          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 1200,
            useNativeDriver: false,
          }),
        ])
      ).start()

    }, [])
  // Styling logo done

  return (
    <View style={styles.container}>

      <BlurView
      intensity={35}
      tint='dark'
      style={styles.blurContainer}
      >
        {/* MAIN HEADER BAR */}
        <LinearGradient
          colors={[
            Colors.primary,
            Colors.primaryLightTransparant,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.header}
        >

          {/* LOGO */}
          <TouchableOpacity
            onPress={() => navTo('/(public)')}
            style={styles.logoWrapper}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Animated.Image
              source={require('../../assets/images/GoSilatIcon.png')}
              style={[
                styles.logoImage,
                {
                  shadowOpacity: glowAnim,

                  shadowRadius:
                    glowAnim.interpolate({
                      inputRange: [0.5, 1],
                      outputRange: [18, 45],
                    }),

                  opacity:
                    glowAnim.interpolate({
                      inputRange: [0.5, 1],
                      outputRange: [0.92, 1],
                    }),

                  ...(Platform.OS === 'web'
                    ? {
                        filter:
                          'drop-shadow(0px 0px 22px #ddff00)',
                      }
                    : {}),
                },
              ]}
              resizeMode="contain"
            />

            <Text style={styles.logo}>GoSilat</Text>
            </View>
          </TouchableOpacity>



          {/* DESKTOP NAV */}
          {!isMobile && (
            <View style={styles.nav}>
              {NAV_ITEMS.map((item) => (
                <TouchableOpacity key={item.path} onPress={() => navTo(item.path)}>
                  <Text style={styles.navItem}>{item.label}</Text>
                </TouchableOpacity>
              ))}
              {isAuthenticated ? (
                <View style={styles.authGroup}>
                  <TouchableOpacity onPress={handleLogout} style={styles.btnLogout}>
                    <Text style={styles.btnText}>Logout</Text>
                  </TouchableOpacity>
                  <Text style={styles.welcomeText}>Hallo {user?.name} !</Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => navTo('/(auth)/login')}
                  style={styles.btnLogin}
                >
                  <Text style={styles.btnText}>Login</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* HAMBURGER — mobile only */}
          {isMobile && (
            <TouchableOpacity
              style={styles.hamburger}
              activeOpacity={0.7}
              onPress={() => setMenuOpen((prev) => !prev)}
            >
              <View style={[styles.bar, menuOpen && styles.barTop]} />
              <View style={[styles.bar, menuOpen && styles.barMid]} />
              <View style={[styles.bar, menuOpen && styles.barBot]} />
            </TouchableOpacity>
          )}

        </LinearGradient>
      </BlurView>

      {/* MOBILE DROPDOWN */}
      {isMobile && menuOpen && (
        <View style={styles.mobileMenu}>
          {NAV_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.path}
              style={styles.mobileNavItem}
              onPress={() => navTo(item.path)}
            >
              <Text style={styles.mobileNavText}>{item.label}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.mobileDivider} />

          {isAuthenticated ? (
            <View style={styles.mobileAuthGroup}>
              <TouchableOpacity style={styles.mobileLogoutBtn} onPress={handleLogout}>
                <Text style={styles.mobileLogoutText}>Logout</Text>
              </TouchableOpacity>
              <Text style={styles.mobileWelcomeText}>Hallo {user?.name} !</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.mobileLoginBtn}
              onPress={() => navTo('/(auth)/login')}
            >
              <Text style={styles.mobileLoginText}>Login / Sign Up</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    zIndex: 99,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },

  blurContainer: {
    overflow: 'hidden',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.08)'
    
  },
  logo: {
    color: Colors.textLight,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  logoWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
 
  logoImage: {
    width: 60,
    height: 42,
    resizeMode: 'contain',
    shadowColor: '#eaff00',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 35,
    elevation: 40,
    overflow: 'visible',
  },


  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  navItem: {
    color: Colors.textLight,
    fontSize: 14,
  },
  btnLogin: {
    backgroundColor: Colors.orange,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnLogout: {
    backgroundColor: Colors.danger,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 14,
  },
  hamburger: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 30,
    gap: 5,
  },
  bar: {
    width: 24,
    height: 3,
    backgroundColor: Colors.textLight,
    borderRadius: 2,
  },
  barTop: {
    transform: [{ translateY: 8 }, { rotate: '45deg' }],
  },
  barMid: {
    opacity: 0,
  },
  barBot: {
    transform: [{ translateY: -8 }, { rotate: '-45deg' }],
  },
  mobileMenu: {
    backgroundColor: Colors.primaryDark,
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 99,
  },
  mobileNavItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  mobileNavText: {
    color: Colors.textLight,
    fontSize: 15,
  },
  mobileDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 8,
  },
  mobileLoginBtn: {
    backgroundColor: Colors.orange,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 8,
  },
  mobileLoginText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 14,
  },
  mobileLogoutBtn: {
    backgroundColor: 'rgba(220,53,69,0.15)',
    borderWidth: 1,
    borderColor: Colors.danger,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 8,
  },
  mobileLogoutText: {
    color: Colors.danger,
    fontWeight: 'bold',
    fontSize: 14,
  },
  authGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  welcomeText: {
    color: Colors.textLight,
    fontSize: 13,
    fontWeight: '500',
    maxWidth: 120,        // ← biar tidak terlalu panjang
    // numberOfLines: 1,     // ← ini di JSX bukan style, skip aja
  },
  mobileAuthGroup: {
    flexDirection: 'column',
    marginVertical: 8,
    gap: 4,
  },
  mobileWelcomeText: {
    color: Colors.textLight,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },


})