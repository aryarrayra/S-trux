// services/pembayaranService.js
const API_BASE_URL = 'http://localhost:8000/api'; // Sesuaikan dengan URL Laravel Anda

export const pembayaranService = {
  // Get semua data pembayaran
  async getAllPayments() {
    try {
      const response = await fetch(`${API_BASE_URL}/pembayaran`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Gagal mengambil data pembayaran');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  // Get detail pembayaran by ID
  async getPaymentById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/pembayaran/${id}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Gagal mengambil detail pembayaran');
      }
    } catch (error) {
      console.error('Error fetching payment detail:', error);
      throw error;
    }
  },

  // Update status pembayaran
  async updatePaymentStatus(id, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/pembayaran/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status_pembayaran: status
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Gagal mengupdate status pembayaran');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  // Get URL untuk gambar bukti bayar
  getBuktiBayarUrl(buktiBayarPath) {
    if (!buktiBayarPath) return null;
    return `${API_BASE_URL}/storage/${buktiBayarPath}`;
  }
};