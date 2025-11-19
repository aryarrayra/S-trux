// Fungsi untuk memformat tanggal
export const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return date.toLocaleDateString('id-ID', options);
};

// ✅ FUNGSI BARU: Format tanggal untuk backend (YYYY-MM-DD)
export const formatDateForBackend = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ✅ FUNGSI: Convert string date ke backend format
export const convertToBackendDate = (dateString: string): string => {
  if (!dateString) return '';
  
  // Jika sudah format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Coba parse dari berbagai format
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.warn('⚠️ Format tanggal tidak dikenali:', dateString);
    return '';
  }
  
  return formatDateForBackend(date);
};

// Fungsi untuk menghitung durasi dalam hari
export const calculateDuration = (startDate: Date, endDate: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / oneDay));
  return diffDays;
};

// Fungsi untuk mendapatkan tanggal minimum (2 hari dari sekarang)
export const getMinStartDate = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return date;
};

// Fungsi untuk mendapatkan tanggal minimum end date (1 hari setelah start date)
export const getMinEndDate = (startDate: Date): Date => {
  const date = new Date(startDate);
  date.setDate(date.getDate() + 1);
  return date;
};