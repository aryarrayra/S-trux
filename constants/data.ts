import { Wrench, Shield, Clock } from 'lucide-react-native';

// Navigation Links dengan ID untuk smooth scroll
export const NAV_LINKS = [
  { label: 'Beranda', id: 'beranda' },
  { label: 'Alat Berat', id: 'alat-berat' },
  { label: 'Keunggulan', id: 'keunggulan' },
  { label: 'Kontak', id: 'kontak' },
];
export const STATS = [
  { value: '30+', label: 'UNIT TERSEDIA' },
  { value: '24/7', label: 'SUPPORT' },
  { value: '100+', label: 'PROYEK SELESAI' },
];

export const FLEET = [
  {
    name: 'Excavator',
    category: 'Penggalian & Perataan',
    image: 'https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/4a40/1fca/6bac06224212cd0f6aecc5b0fb7616b9?Expires=1762732800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=DKQ1ch6vPHclU9-PssmwanGYVWIOPKv1OOJSMpXs4wMUt1TiIs7yLwG5p~oQy8zsyHE1XN~rTF1DIxi1O~GbZCPhi8cgyDODc4cccj8z~lc3IBZixfxtWBXJO-rGqF1GLi86lEQEM8Qls8Km1XKS-IQ44WcTlQBjMwcii0W-IlXtL0JFVdUQSgdSmK9UMc9tWOs4a2AfHCmHuElw7dgNrFZeV6ari1YTz205t6YbP5nSnzJ0VR7hTBjNRypOseFNiFzXJHGxYDvo6~t6Ayq~W2yO5ZP7cM41CernzoGA8iYA16eBGpC4-wuPFIGKbvUmDihPZWr2AIgbUVxuVLBVFw__',
    features: [
      { icon: Wrench, text: 'Kapasitas bucket 0.5-2.0 m³' },
      { icon: Shield, text: 'Asuransi & maintenance included' },
      { icon: Clock, text: 'Siap operasional 24 jam' },
    ],
    price: 'Mulai 2.5JT/ hari',
  },
  {
    name: 'Bulldozer',
    category: 'Perataan Tanah',
    image: 'https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/237a/aa05/3e3a9c53dee4f3fc757e2217f4b3119f?Expires=1762732800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=RZvmpdC-91hXLQmOq4l7jb53JuOyMOlMVHbJbfKQtgf7-zLaCsDgefKZ7V9Sv2RBJyPvvX3UKtTIozn4JITdvLTManVZilMxHfFV4ASaH7VCLECsVqBlRw2GUjl9GzUlnUVYBkEs~hije8HCKSo4UC0yYQdznBLGt5Q5Fm8AsG7BwM7WCZWscXcEXOQu24dk5enEv9tzDvWnLmlqs58Dkmwww9dNvZeTcq0B6Lrrhkq7k~PB~f3Tzc7HJ3cX4s0lQL-SeVpJrfWU1VKfEqiMTo18OYCk5u~SLNKVWZEXHEMFVxdRB9Hu5H~JYNmYWui14b1gCjWLd781-xLByD~7Xw__',
    features: [
      { icon: Wrench, text: 'Kapasitas bucket 0.5-2.0 m³' },
      { icon: Shield, text: 'Asuransi & maintenance included' },
      { icon: Clock, text: 'Siap operasional 24 jam' },
    ],
    price: 'Mulai 2.5JT/ hari',
  },
  {
    name: 'Wheel Loader',
    category: 'Penggalian & Perataan',
    image: 'https://img-wrapper.vercel.app/image?url=https://s3-alpha-sig.figma.com/img/9147/1aad/9fc5c67e34f77fb896bf210f0eb1db9e?Expires=1762732800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=uI0GgPM2caa35v7zDmdY6nZV3iZ3IAXijLAUuRrk1uBacCtxa7hinFbxdHFFs9JtgpW9VlPS6ybGD57jMkvktdyR9efoNBvw7OEGXe4LTeJhMgjrGDWAkszEuSmeudU3DuGdM6ooDYOk4~npfSVKyk65KyWtAvPYJOPtXdEu-ubjrc4SDcGSosuTKnnesHVaR~8zE1r86W7bq0wmc~~zxfvgV4OWyw~CejlSpN-zz4I1b34MNaq8XTeOJUP04UM6-f2q3HMS~zqrD5Gik50wlqMXY4yefoCJnFIFnVooQvQmFT0DFB1pY12elw4I0~HsUkLJB96miktDcPNFUfY19A__',
    features: [
      { icon: Wrench, text: 'Kapasitas bucket 0.5-2.0 m³' },
      { icon: Shield, text: 'Asuransi & maintenance included' },
      { icon: Clock, text: 'Siap operasional 24 jam' },
    ],
    price: 'Mulai 2.5JT/ hari',
  },
];

export const ADVANTAGES = [
  {
    title: 'Proses Booking Cepat',
    description: 'Sistem booking online yang mudah dan cepat. Dapatkan konfirmasi dalam hitungan menit.',
  },
  {
    title: 'Armada Terawat',
    description: 'Semua alat berat kami dalam kondisi prima dengan maintenance rutin dan asuransi lengkap.',
  },
  {
    title: 'Operator Berpengalaman',
    description: 'Tim operator profesional dengan sertifikasi dan pengalaman lebih dari 5 tahun.',
  },
  {
    title: 'Harga Kompetitif',
    description: 'Tarif sewa yang terjangkau dengan berbagai paket menarik sesuai kebutuhan proyek.',
  },
  {
    title: 'Support 24/7',
    description: 'Layanan pelanggan siap membantu Anda kapan saja, termasuk support teknis di lapangan.',
  },
  {
    title: 'Dokumentasi Lengkap',
    description: 'Semua unit dilengkapi dokumen legal, STNK, dan asuransi untuk keamanan proyek Anda.',
  },
];

export const MILESTONES = [
  { value: '10+', label: 'Tahun pengalaman' },
  { value: '30+', label: 'Unit Alat Berat' },
  { value: '100+', label: 'Proyek Selesai' },
  { value: '97%', label: 'Pelanggan Puas' },
];