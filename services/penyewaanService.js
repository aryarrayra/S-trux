// services/penyewaanService.js
const API_BASE_URL = 'http://localhost:8000/api'; // Sesuaikan dengan URL Laravel Anda

export const penyewaanService = {
  // Get semua data penyewaan untuk dashboard
  async getPenyewaanForDashboard() {
    try {
      const response = await fetch(`${API_BASE_URL}/penyewaan`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Gagal mengambil data penyewaan');
      }
    } catch (error) {
      console.error('Error fetching penyewaan:', error);
      throw error;
    }
  },

  // Get data untuk chart (statistik)
  async getChartData() {
    try {
      const allData = await this.getPenyewaanForDashboard();
      
      // Hitung statistik berdasarkan status
      const stats = {
        masuk: 0,        // Menunggu Persetujuan
        dijadwalkan: 0,  // Dalam Pengantaran
        berjalan: 0,     // Berjalan
        dibatalkan: 0    // Dibatalkan
      };

      allData.forEach(penyewaan => {
        switch (penyewaan.status_sewa) {
          case 'Menunggu Persetujuan':
            stats.masuk++;
            break;
          case 'Dalam Pengantaran':
            stats.dijadwalkan++;
            break;
          case 'Berjalan':
            stats.berjalan++;
            break;
          case 'Dibatalkan':
            stats.dibatalkan++;
            break;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error generating chart data:', error);
      throw error;
    }
  },

  // Get data pengiriman hari ini (Dalam Pengantaran & Berjalan)
  async getTodayDeliveries() {
    try {
      const allData = await this.getPenyewaanForDashboard();
      const today = new Date().toISOString().split('T')[0];
      
      // Filter data yang statusnya "Dalam Pengantaran" atau "Berjalan"
      const deliveries = allData.filter(penyewaan => 
        penyewaan.status_sewa === 'Dalam Pengantaran' || 
        penyewaan.status_sewa === 'Berjalan'
      );

      // Format data untuk ditampilkan
      return deliveries.map(delivery => ({
        id_sewa: delivery.id_sewa,
        no: `STX${String(delivery.id_sewa).padStart(4, '0')}`,
        dest: delivery.lokasi_proyek || 'Lokasi tidak tersedia',
        company: delivery.pelanggan?.nama_perusahaan || 'Tidak ada perusahaan',
        status_sewa: delivery.status_sewa,
        tanggal_sewa: delivery.tanggal_sewa,
        alat_berat: delivery.alat?.nama_alat || 'Alat tidak tersedia'
      }));
    } catch (error) {
      console.error('Error fetching today deliveries:', error);
      throw error;
    }
  },

  // Get data untuk donut chart
  async getDonutChartData() {
    try {
      const allData = await this.getPenyewaanForDashboard();
      
      const diantar = allData.filter(p => 
        p.status_sewa === 'Dalam Pengantaran' || p.status_sewa === 'Berjalan'
      ).length;
      
      const menunggu = allData.filter(p => 
        p.status_sewa === 'Menunggu Persetujuan'
      ).length;

      const total = diantar + menunggu;
      
      return {
        diantar,
        menunggu,
        total,
        diantarPercentage: total > 0 ? Math.round((diantar / total) * 100) : 0,
        menungguPercentage: total > 0 ? Math.round((menunggu / total) * 100) : 0
      };
    } catch (error) {
      console.error('Error generating donut chart data:', error);
      throw error;
    }
  }
};