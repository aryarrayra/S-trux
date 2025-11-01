import {
  FileSignature,
  Map,
  History,
  Users,
  Wrench,
  BarChart2,
  Wallet,
  FileCog,
  LogOut,
} from 'lucide-react-native';

export const ADMIN_NAV_LINKS = [
  { text: 'Persetujuan Pinjaman', icon: FileSignature },
  { text: 'Pantau Peminjaman', icon: Map },
  { text: 'Histori Peminjaman', icon: History },
  { text: 'Kelola Karyawan', icon: Users },
];

export const ADMIN_STATS = [
  { icon: Wrench, value: '38', label: 'Total Alat Berat' },
  { icon: BarChart2, value: '20', label: 'Sewa Aktif' },
  { icon: Users, value: '15', label: 'Karyawan' },
  { icon: Wallet, value: '200.000.000+', label: 'Total Pendapatan' },
];

export const ACTIVITY_HISTORY = [
    { title: 'Excavator CAT 3200D disewa', company: 'PT. Makmur Jaya', time: '45 menit yang lalu' },
    { title: 'Dikembalikan: Dump Truck R900', company: 'PT. Makmur Jaya', time: '5 jam yang lalu' },
    { title: 'Bulldozer X390 CTX disewa', company: 'PT. Saruyakanca', time: '6 jam yang lalu' },
    { title: 'Dump Truck R991 disewa', company: 'PT. Merkada Wanara', time: '10 jam yang lalu' },
];

export const MAINTENANCE_SCHEDULE = [
    { name: 'Excavator Caterpillar CP0129', date: '4 november 2025', task: 'Ganti Oli' },
];
