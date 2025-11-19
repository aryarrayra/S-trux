// services/penyewaanApi.ts
import { API_BASE_URL } from '@/constants/ApiConfig';

export type StatusPenyewaan = 'Menunggu' | 'Disetujui' | 'Ditolak';
export type StatusSewa = 'Menunggu Persetujuan' | 'Berjalan' | 'Selesai' | 'Dibatalkan';

export interface Penyewaan {
  id_sewa: number;
  id_pelanggan: number;
  id_alat: number;
  tanggal_sewa: string;
  tanggal_kembali?: string;
  total_harga: number;
  status_sewa: StatusSewa;
  status_persetujuan: StatusPenyewaan;
  alasan_penolakan?: string;
  disetujui_oleh?: number;
  tanggal_persetujuan?: string;
  nama_proyek?: string;
  lokasi_proyek?: string;
  deskripsi_proyek?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  ulasan?: string;
  created_at?: string;
  updated_at?: string;
  
  // Relations
  pelanggan?: any;
  alat?: any;
  pembayaran?: any[];
  dokumen?: any[];
  jadwal?: any[];
}

export interface CreatePenyewaanRequest {
  id_pelanggan: number;
  id_alat: number;
  tanggal_sewa: string;
  tanggal_kembali?: string;
  total_harga: number;
  nama_proyek?: string;
  lokasi_proyek?: string;
  deskripsi_proyek?: string;
  latitude?: number;
  longitude?: number;
}

export interface ApproveRejectRequest {
  status_persetujuan: 'Disetujui' | 'Ditolak';
  alasan_penolakan?: string;
}

export interface RatingRequest {
  rating: number;
  ulasan?: string;
}

class PenyewaanApiService {
  private baseUrl = `${API_BASE_URL}/penyewaan`;

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // ✅ GET ALL PENYEWAAN
  async getAllPenyewaan(): Promise<Penyewaan[]> {
    try {
      const response = await fetch(this.baseUrl);
      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Error fetching penyewaan:', error);
      throw error;
    }
  }

  // ✅ GET PERSETUJUAN PINJAMAN (Status Menunggu)
  async getPersetujuanPinjaman(): Promise<Penyewaan[]> {
    try {
      const response = await fetch(`${this.baseUrl}/persetujuan-pinjaman`);
      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Error fetching persetujuan pinjaman:', error);
      throw error;
    }
  }

  // ✅ GET BY ID
  async getPenyewaanById(id: number): Promise<Penyewaan> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error(`Error fetching penyewaan ${id}:`, error);
      throw error;
    }
  }

  // ✅ GET BY PELANGGAN
  async getPenyewaanByPelanggan(idPelanggan: number): Promise<Penyewaan[]> {
    try {
      const response = await fetch(`${this.baseUrl}/pelanggan/${idPelanggan}`);
      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error(`Error fetching penyewaan pelanggan ${idPelanggan}:`, error);
      throw error;
    }
  }

  // ✅ CREATE PENYEWAAN
  async createPenyewaan(data: CreatePenyewaanRequest): Promise<Penyewaan> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Error creating penyewaan:', error);
      throw error;
    }
  }

  // ✅ APPROVE/REJECT PENYEWAAN
  async approveRejectPenyewaan(id: number, data: ApproveRejectRequest): Promise<Penyewaan> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error(`Error approve/reject penyewaan ${id}:`, error);
      throw error;
    }
  }

  // ✅ UPDATE PENYEWAAN
  async updatePenyewaan(id: number, data: Partial<Penyewaan>): Promise<Penyewaan> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error(`Error updating penyewaan ${id}:`, error);
      throw error;
    }
  }

  // ✅ DELETE PENYEWAAN
  async deletePenyewaan(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      await this.handleResponse(response);
    } catch (error) {
      console.error(`Error deleting penyewaan ${id}:`, error);
      throw error;
    }
  }

  // ✅ ADD RATING
  async addRating(id: number, data: RatingRequest): Promise<Penyewaan> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error(`Error adding rating to penyewaan ${id}:`, error);
      throw error;
    }
  }

  // ✅ GET STATUS BADGE INFO
  getStatusBadgeInfo(status: StatusPenyewaan | StatusSewa) {
    switch (status) {
      case 'Disetujui':
      case 'Berjalan':
        return { color: '#10B981', text: 'Disetujui' }; // hijau
      
      case 'Menunggu':
      case 'Menunggu Persetujuan':
        return { color: '#F59E0B', text: 'Menunggu' }; // kuning
      
      case 'Ditolak':
      case 'Dibatalkan':
        return { color: '#EF4444', text: 'Ditolak' }; // merah
      
      case 'Selesai':
        return { color: '#3B82F6', text: 'Selesai' }; // biru
      
      default:
        return { color: '#6B7280', text: status }; // abu-abu
    }
  }
}

export const penyewaanApi = new PenyewaanApiService();