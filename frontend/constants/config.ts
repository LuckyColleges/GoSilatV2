export const Config = {
  APP_NAME: 'GoSilat Indonesia Manajemen',
  APP_URL: 'https://gosilat.com',

  // Ganti sesuai IP/URL backend kamui
  API_BASE_URL: 'http://localhost:3000/api',//TOLONG KALO BEDA WIFI / Internet GANTI PLS ini semua gara2 DHCP

  // Social media
  INSTAGRAM: 'https://instagram.com/go_silat',
  YOUTUBE: 'https://www.youtube.com/@Gosilatindonesia',
  TIKTOK: 'https://tiktok.com/@gosilatofficial',

  // Contact
  EMAIL: 'admin@gosilat.com',
  CONTACT_PERSON: '+62 812 3456 7890',

  //Partnerships
  PARTNERS : [
    { id: 1, name: 'Badan Narkotika Nasional', logo: require('../assets/images/partnerships/bnn.png') },
    { id: 2, name: 'BPJSTK', logo: require('../assets/images/partnerships/bpjs.png') },
    { id: 3, name: 'Rumah Sakit Mitra Keluarga', logo: require('../assets/images/partnerships/mk.png') },
    { id: 4, name: 'Rumah Karya', logo: require('../assets/images/partnerships/rk.png') },
  ]
}