import { useEffect, useState } from 'react'
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Image,
  useWindowDimensions,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors } from '../../../constants/colors'
import { Tournament, TournamentStatus } from '../../../types/tournament'
import { tournamentService } from '../../../services/tournamentService'
import { useAuthStore } from '../../../store/authStore'
import CustomModal from '../../../components/ui/Modal'
import { formatDateToID } from '../../../utils/dateFormatter'
import { resolveImageUrl } from '../../../utils/urlResolver'

const STATUS_LABEL: Record<TournamentStatus, string> = {
  coming_soon: 'Coming Soon',
  registration_open: 'Pendaftaran Dibuka',
  registration_closed: 'Pendaftaran Ditutup',
  ongoing: 'Berlangsung',
  finished: 'Selesai',
}

const STATUS_COLOR: Record<TournamentStatus, string> = {
  coming_soon: Colors.statusComingSoon,
  registration_open: Colors.statusOpen,
  registration_closed: Colors.statusClosed,
  ongoing: Colors.statusOngoing,
  finished: Colors.statusFinished,
}

export default function DetailKejuaraanScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const { width } = useWindowDimensions()
  const isNarrow = width < 600

  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Refactored Modal State
  const [modal, setModal] = useState<{
    visible: boolean
    title: string
    message: string
    type: 'success' | 'error' | 'info'
    onConfirm?: () => void
    confirmText?: string
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info'
  })

  useEffect(() => {
    fetchTournament()
  }, [id])

  const fetchTournament = async () => {
    try {
      setLoading(true)
      const data = await tournamentService.getById(Number(id))
      setTournament(data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDaftar = () => {
    if (!tournament) return

    // 1. Cek Login
    if (!isAuthenticated) {
      setModal({
        visible: true,
        title: 'Login Diperlukan',
        message: 'Silakan login terlebih dahulu untuk melakukan pendaftaran.',
        type: 'info',
        confirmText: 'Login Sekarang',
        onConfirm: () => {
          setModal(prev => ({ ...prev, visible: false }))
          router.push('/(auth)/login')
        }
      })
      return
    }

    // 2. Cek Status Pertandingan
    if (tournament.status === 'registration_open') {
        router.push(`/(official)/pendaftaran/${id}`)
    } else {
        const isComingSoon = tournament.status === 'coming_soon'
        const statusMsg = isComingSoon ? 'belum di buka' : 'sudah di tutup'
        
        setModal({
            visible: true,
            title: 'Pendaftaran Terkunci',
            message: `Pendaftaran untuk pertandingan "${tournament.name}" ini ${statusMsg}. harap hubungi admin/contact person untuk informasi lebih lanjut.`,
            type: 'info',
            confirmText: 'Tutup',
            onConfirm: undefined // Only show one button
        })
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Memuat data kejuaraan...</Text>
      </View>
    )
  }

  if (!tournament) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Kejuaraan tidak ditemukan.</Text>
      </View>
    )
  }

  const CARDS = [
    {
      icon: '📍',
      title: 'Lokasi & Kontak',
      items: [
        { label: 'Lokasi', value: tournament.location || '-' },
        { label: 'Contact Person', value: tournament.contact_person || '-' },
      ],
    },
    {
      icon: '📅',
      title: 'Jadwal',
      items: [
        { label: 'Mulai', value: formatDateToID(tournament.start_date) },
        { label: 'Selesai', value: formatDateToID(tournament.end_date) },
        { label: 'Daftar Dibuka', value: formatDateToID(tournament.reg_open) },
        { label: 'Daftar Ditutup', value: formatDateToID(tournament.reg_close) },
      ],
    },
    {
      icon: '👥',
      title: 'Peserta',
      items: [
        { label: 'Kuota', value: `${tournament.quota || 0} atlet` },
        { label: 'Terdaftar', value: `${tournament.registered_count || 0} atlet` },
        // {
        //   label: 'Sisa Slot',
        //   value: `${(tournament.quota || 0) - (tournament.registered_count || 0)} atlet`,
        // },
      ],
    },
  ]

  const DOCS = [
    {
      url: tournament.thb_url,
      label: 'Technical Handbook',
      short: 'THB',
      icon: '📄',
      color: Colors.primary,
    },
    {
      url: tournament.rekom_url,
      label: 'Surat Rekomendasi',
      short: 'REKOM',
      icon: '📑',
      color: Colors.orange,
    },
  ]

  // Hitung lebar card kalau 3 kolom
  const cardWidth = (width - 40 - 24) / 3  // padding 20 kiri kanan, gap 12 x2

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <CustomModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal(prev => ({ ...prev, visible: false }))}
        onConfirm={modal.onConfirm}
        confirmText={modal.confirmText}
      />

      {/* BANNER */}
      <View style={styles.bannerWrapper}>
        <Image
          source={{ uri: resolveImageUrl(tournament.banner_url) || 'https://placehold.co/600x400?text=No+Banner' }}
          style={styles.bannerImage}
        />
        <View style={styles.overlay}>
          <Text style={styles.bannerTitle}>{tournament.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[tournament.status] }]}>
            <Text style={styles.statusText}>{STATUS_LABEL[tournament.status]}</Text>
          </View>
        </View>
      </View>

      {/* INFO CARDS */}
      <View style={styles.section}>


        {/* TOMBOL KEMBALI */}
        <TouchableOpacity
          style={styles.btnBack}
          onPress={() => router.back()}
        >
          <Text style={styles.btnBackText}>← Kembali</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Informasi Kejuaraan</Text>

        {isNarrow ? (
          // MOBILE: 1 kolom, full width
          <View style={styles.cardsColumn}>
            {CARDS.map((card, i) => (
              <View key={i} style={styles.infoCardFull}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>{card.icon}</Text>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                </View>
                <View style={styles.cardBody}>
                  {card.items.map((item, j) => (
                    <View key={j} style={styles.cardItem}>
                      <Text style={styles.cardLabel}>{item.label}</Text>
                      <Text style={styles.cardValue}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ) : (
          // DESKTOP: 3 kolom dengan lebar fix
          <View style={styles.cardsRow}>
            {CARDS.map((card, i) => (
              <View key={i} style={[styles.infoCard, { width: cardWidth }]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>{card.icon}</Text>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                </View>
                <View style={styles.cardBody}>
                  {card.items.map((item, j) => (
                    <View key={j} style={styles.cardItem}>
                      <Text style={styles.cardLabel}>{item.label}</Text>
                      <Text style={styles.cardValue}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* DOWNLOAD DOKUMEN */}
      {DOCS.some((d) => d.url) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dokumen</Text>
          <View style={[
            isNarrow ? styles.docsColumn : styles.docsRow
          ]}>
            {DOCS.filter((d) => d.url).map((doc, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.docCard,
                  { borderTopColor: doc.color },
                  !isNarrow && { flex: 1 }
                ]}
                onPress={() => Linking.openURL(doc.url!)}
              >
                <View style={[styles.docIconWrapper, { backgroundColor: doc.color }]}>
                  <Text style={styles.docIcon}>{doc.icon}</Text>
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docShort}>{doc.short}</Text>
                  <Text style={styles.docLabel}>{doc.label}</Text>
                </View>
                <View style={[styles.docDownloadBtn, { backgroundColor: doc.color }]}>
                  <Text style={styles.docDownloadText}>↓</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* DESKRIPSI */}
      {tournament.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deskripsi</Text>
          <Text style={styles.description}>{tournament.description}</Text>
        </View>
      )}

      {/* AKSI */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lihat daftar Pemenang / Daftarkan Atlit anda</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.btnAction, styles.btnWinner]}
            onPress={() => router.push(`/(public)/pemenang/${id}`)}
          >
            <Text style={styles.btnActionText}>🏆 Daftar Pemenang</Text>
          </TouchableOpacity>
          
          {tournament.status !== 'finished' && (
            <TouchableOpacity
              style={[styles.btnAction, styles.btnPrimaryAction]}
              onPress={handleDaftar}
            >
              <Text style={styles.btnActionText}>📝 Daftar Sekarang</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.actions, { marginTop: 12 }]}>
          {isAuthenticated && user?.role === 'official' && (
            <TouchableOpacity
              style={styles.btnOutline}
              onPress={() => router.push('/(official)/mydata')}
            >
              <Text style={styles.btnOutlineText}>👤 Lihat Data Saya</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    color: Colors.textSecondary,
    fontSize: 14,
  },

  // BANNER
  bannerWrapper: {
    position: 'relative',
    height: 260,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: 24,
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.textLight,
    marginBottom: 10,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 12,
  },

  // SECTION
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },

  // CARDS — DESKTOP (row)
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },

  // CARDS — MOBILE (column)
  cardsColumn: {
    flexDirection: 'column',
    gap: 15,
  },

  // Card full width (mobile)
  infoCardFull: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },

  // Card fixed width (desktop)
  infoCard: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },

  cardHeader: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  cardIcon: {
    fontSize: 16,
  },
  cardTitle: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 13,
  },
  cardBody: {
    padding: 14,
    gap: 10,
  },
  cardItem: {
    gap: 3,
  },
  cardLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600',
  },

  // DOCS
  docsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  docsColumn: {
    flexDirection: 'column',
    gap: 12,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopWidth: 3,
    padding: 12,
    gap: 12,
  },
  docIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docIcon: {
    fontSize: 18,
  },
  docInfo: {
    flex: 1,
  },
  docShort: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
  },
  docLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  docDownloadBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docDownloadText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 16,
  },

  // DESCRIPTION
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.text,
  },

  // ACTIONS
  actions: {
    gap: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  btnAction: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  btnWinner: {
    backgroundColor: Colors.primary,
  },
  btnPrimaryAction: {
    backgroundColor: Colors.orange,
  },
  btnActionText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 13,
  },
  btnPrimary: {
    backgroundColor: Colors.orange,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 15,
  },
  btnSecondary: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 14,
  },
  btnOutline: {
    borderWidth: 2,
    borderColor: Colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnOutlineText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },


  // style button back
  btnBack: {
    alignSelf: 'flex-start',  // ← flex start
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  btnBackText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 13,
  },
})
