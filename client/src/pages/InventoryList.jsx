import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { FaPlus, FaClipboardList, FaSpinner, FaTimes } from 'react-icons/fa';

const API_URL = 'http://localhost:3050/api';

const InventoryList = () => {
    const navigate = useNavigate();
    const [inventories, setInventories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newInventory, setNewInventory] = useState({
        name: '',
        notes: ''
    });
    const [formError, setFormError] = useState('');
    const [creatingInventory, setCreatingInventory] = useState(false);

    useEffect(() => {
        fetchInventories();
    }, []);

    const fetchInventories = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/inventory`);
            setInventories(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Stok sayımları yüklenirken hata oluştu:', error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewInventory({ ...newInventory, [name]: value });
        setFormError(''); // Input değiştiğinde hata mesajını temizle
    };

    const handleCreateInventory = async () => {
        if (!newInventory.name.trim()) {
            setFormError('Sayım adı zorunludur.');
            return;
        }

        try {
            setCreatingInventory(true);
            setFormError('');
            
            const response = await axios.post(`${API_URL}/inventory`, {
                ...newInventory,
                createdBy: 'Sistem Kullanıcısı' // Bu kısmı kullanıcı yönetimi entegre edildiğinde güncelleyebilirsiniz
            });
            
            setInventories([response.data, ...inventories]);
            setShowCreateModal(false);
            setNewInventory({ name: '', notes: '' });
            setCreatingInventory(false);
            
            // Sayım sayfasına yönlendir
            navigate(`/inventory/${response.data._id}`);
            
        } catch (error) {
            console.error('Stok sayımı oluşturulurken hata oluştu:', error);
            setFormError(error.response?.data?.message || 'Stok sayımı oluşturulurken bir hata oluştu.');
            setCreatingInventory(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800">Taslak</span>;
            case 'in_progress':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-200 text-blue-800">Devam Ediyor</span>;
            case 'completed':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-800">Tamamlandı</span>;
            default:
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800">{status}</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <FaSpinner className="animate-spin mx-auto h-8 w-8 text-gray-500" />
                    <p className="mt-2 text-gray-600">Stok sayımları yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Stok Sayımları</h2>
                    <button 
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <FaPlus className="mr-2" /> Yeni Sayım Başlat
                    </button>
                </div>
                
                <div className="p-4">
                    {inventories.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">Henüz hiç stok sayımı bulunmuyor.</p>
                            <button 
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center mx-auto"
                                onClick={() => setShowCreateModal(true)}
                            >
                                <FaPlus className="mr-2" /> İlk Sayımı Başlat
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="py-2 px-4 border-b text-left">Sayım Adı</th>
                                        <th className="py-2 px-4 border-b text-left">Durum</th>
                                        <th className="py-2 px-4 border-b text-left">Oluşturulma Tarihi</th>
                                        <th className="py-2 px-4 border-b text-left">Tamamlanma Tarihi</th>
                                        <th className="py-2 px-4 border-b text-left">İlerleme</th>
                                        <th className="py-2 px-4 border-b text-left">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventories.map(inventory => {
                                        const countedItemsCount = inventory.items?.filter(item => item.counted)?.length || 0;
                                        const totalItemsCount = inventory.items?.length || 0;
                                        const progressPercentage = totalItemsCount > 0 
                                            ? Math.round((countedItemsCount / totalItemsCount) * 100) 
                                            : 0;
                                        
                                        return (
                                            <tr key={inventory._id} className="hover:bg-gray-50 border-b">
                                                <td className="py-2 px-4">{inventory.name}</td>
                                                <td className="py-2 px-4">{getStatusBadge(inventory.status)}</td>
                                                <td className="py-2 px-4">{moment(inventory.createdAt).format('DD.MM.YYYY HH:mm')}</td>
                                                <td className="py-2 px-4">
                                                    {inventory.completedAt 
                                                        ? moment(inventory.completedAt).format('DD.MM.YYYY HH:mm') 
                                                        : '-'}
                                                </td>
                                                <td className="py-2 px-4">
                                                    <div className="flex items-center">
                                                        <div className="w-48 bg-gray-200 rounded-full h-4 mr-2">
                                                            <div 
                                                                className="bg-blue-500 h-4 rounded-full transition-all duration-300" 
                                                                style={{ width: `${progressPercentage}%` }}>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-gray-600">
                                                            {progressPercentage}% ({countedItemsCount}/{totalItemsCount})
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-2 px-4">
                                                    <button 
                                                        onClick={() => navigate(`/inventory/${inventory._id}`)}
                                                        className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm px-3 py-1 rounded-md inline-flex items-center"
                                                    >
                                                        <FaClipboardList className="mr-1" /> Görüntüle
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Yeni Sayım Oluşturma Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-xl font-semibold text-gray-800">Yeni Stok Sayımı</h3>
                            <button 
                                onClick={() => !creatingInventory && setShowCreateModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                                disabled={creatingInventory}
                            >
                                <FaTimes className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <div className="p-4">
                            {formError && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    {formError}
                                </div>
                            )}
                            
                            <form onSubmit={(e) => { e.preventDefault(); handleCreateInventory(); }}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                        Sayım Adı *
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={newInventory.name}
                                        onChange={handleInputChange}
                                        placeholder="Örn: Aylık Sayım - Mart 2024"
                                        disabled={creatingInventory}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                                        Notlar
                                    </label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        rows={3}
                                        value={newInventory.notes}
                                        onChange={handleInputChange}
                                        placeholder="İsteğe bağlı açıklama"
                                        disabled={creatingInventory}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            
                                <p className="text-gray-500 text-sm mt-3">
                                    * Zorunlu alanlar
                                </p>
                                
                                <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md mt-3">
                                    <span className="font-semibold">Not:</span> Sayımı başlattığınızda sistem, mevcut tüm ürünleri 
                                    otomatik olarak sayım listesine ekleyecektir. Bu işlem, ürün sayısına bağlı olarak 
                                    biraz zaman alabilir.
                                </p>
                            
                                <div className="flex justify-end mt-6 space-x-2">
                                    <button 
                                        type="button"
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                                        onClick={() => !creatingInventory && setShowCreateModal(false)}
                                        disabled={creatingInventory}
                                    >
                                        İptal
                                    </button>
                                    <button 
                                        type="submit"
                                        className={`bg-blue-500 text-white font-bold py-2 px-4 rounded flex items-center ${
                                            creatingInventory ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-600'
                                        }`}
                                        disabled={creatingInventory}
                                    >
                                        {creatingInventory ? (
                                            <>
                                                <FaSpinner className="animate-spin mr-2" />
                                                Oluşturuluyor...
                                            </>
                                        ) : (
                                            <>
                                                <FaPlus className="mr-2" />
                                                Sayımı Başlat
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryList; 