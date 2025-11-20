// File: app/service-alat/page.tsx  (atau di components/ServiceAlat.tsx)
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Package, Wrench, Calendar, LogOut } from 'lucide-react';

export default function ServiceAlat() {
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Data dummy sesuai screenshot
    const services = Array(6).fill({
        type: 'EXCAVATOR KOMATSU',
        unit: '2 unit',
        service: 'service tahunan',
        date: '05 November 2025',
        price: 'Rp 7.000.000'
    });

    return (
        <div className="flex h-screen bg-gray-100">
            {/* SIDEBAR */}
            <div className="w-64 bg-gradient-to-b from-black to-gray-900 text-white flex flex-col">
                <div className="p-6 text-2xl font-bold text-yellow-500 text-center">ST | S-Trux</div>

                <nav className="flex-1 px-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4 py-4 px-6 rounded-lg hover:bg-yellow-500/20 cursor-pointer text-gray-300">
                            <Package size={20} /> Dashboard
                        </div>
                        <div className="flex items-center gap-4 py-4 px-6 rounded-lg hover:bg-yellow-500/20 cursor-pointer text-gray-300">
                            <Calendar size={20} /> Pengingat
                        </div>
                        <div className="flex items-center gap-4 py-4 px-6 rounded-lg bg-yellow-500 text-black font-semibold cursor-pointer">
                            <Wrench size={20} /> Service Alat
                        </div>
                        <div className="flex items-center gap-4 py-4 px-6 rounded-lg hover:bg-yellow-500/20 cursor-pointer text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Riwayat bayar
                        </div>
                    </div>
                </nav>

                <div className="p-6 flex items-center gap-3 text-yellow-500 cursor-pointer hover:text-yellow-400">
                    <LogOut size={20} /> Logout
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 overflow-y-auto">
                {/* HEADER */}
                <div className="bg-white shadow-sm px-8 py-5 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">Service unit</h1>
                        <p className="text-sm text-gray-500">atur penjadwalan maintenance alat berat</p>
                    </div>
                    <div className="text-right">
                        <p className="text-yellow-500 font-semibold">Rabu 28 Oktober 2025</p>
                        <p className="text-2xl font-bold text-yellow-500">{currentTime}</p>
                        <p className="text-sm text-gray-500">18.08 WIB</p>
                    </div>
                </div>

                {/* SEARCH + FILTER + ADD BUTTON */}
                <div className="px-8 pt-6 flex gap-4 items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Temukan"
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500"
                        />
                    </div>

                    <select className="px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700">
                        <option>Semua Tipe</option>
                    </select>

                    <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition">
                        <Plus size={20} />
                        Tambahkan Jadwal
                    </button>
                </div>

                {/* CARD GRID */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((item, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden border-t-4 border-yellow-500">
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-yellow-500 mb-4">{item.type}</h3>

                                <div className="space-y-3 text-gray-600">
                                    <div className="flex items-center gap-3">
                                        <Package size={18} className="text-gray-500" />
                                        <span>{item.unit}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Wrench size={18} className="text-gray-500" />
                                        <span>{item.service}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar size={18} className="text-gray-500" />
                                        <span>{item.date}</span>
                                    </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-gray-200">
                                    <p className="text-lg font-bold text-gray-800">
                                        total biaya <span className="text-yellow-600">{item.price}</span>
                                    </p>
                                </div>

                                <div className="flex justify-end gap-4 mt-4">
                                    <button className="text-yellow-500 hover:text-yellow-600">
                                        <Edit2 size={20} />
                                    </button>
                                    <button className="text-red-500 hover:text-red-600">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}