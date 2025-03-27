import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { FaBarcode, FaSearch, FaSave, FaCheck, FaArrowLeft, FaSpinner } from 'react-icons/fa';

const API_URL =  'http://localhost:3050/api';

const InventoryCount = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [inventory, setInventory] = useState(null);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [scanMode, setScanMode] = useState(false);
    const [productToCount, setProductToCount] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [updateStock, setUpdateStock] = useState(true);
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [filterCounted, setFilterCounted] = useState('all');
    
    const barcodeInputRef = useRef(null);
    const quantityInputRef = useRef(null);

    useEffect(() => {
        if (id) {
            fetchInventoryCount();
        }
    }, [id]);

    useEffect(() => {
        if (inventory) {
            filterItems();
        }
    }, [searchTerm, inventory, filterCounted, sortField, sortDirection]);

    useEffect(() => {
        if (scanMode && barcodeInputRef.current) {
            barcodeInputRef.current.focus();
        }
    }, [scanMode]);

    const fetchInventoryCount = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/inventory/${id}`);
            setInventory(response.data);
            filterItems();
            setLoading(false);
        } catch (error) {
            console.error('Sayım yüklenirken hata oluştu:', error);
            setMessage({
                type: 'error',
                text: 'Sayım verileri yüklenirken bir hata oluştu.'
            });
            setLoading(false);
        }
    };

    const filterItems = () => {
        if (!inventory) return;
        
        let filtered = [...inventory.items];
        
        if (filterCounted === 'counted') {
            filtered = filtered.filter(item => item.counted);
        } else if (filterCounted === 'notCounted') {
            filtered = filtered.filter(item => !item.counted);
        } else if (filterCounted === 'difference') {
            filtered = filtered.filter(item => item.counted && item.difference !== 0);
        }
        
        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(item => 
                item.product.name?.toLowerCase().includes(term) || 
                item.product.barcode?.toLowerCase().includes(term)
            );
        }
        
        filtered.sort((a, b) => {
            let fieldA, fieldB;
            
            switch(sortField) {
                case 'name':
                    fieldA = a.product.name?.toLowerCase() || '';
                    fieldB = b.product.name?.toLowerCase() || '';
                    break;
                case 'barcode':
                    fieldA = a.product.barcode || '';
                    fieldB = b.product.barcode || '';
                    break;
                case 'systemQuantity':
                    fieldA = a.systemQuantity || 0;
                    fieldB = b.systemQuantity || 0;
                    break;
                case 'countedQuantity':
                    fieldA = a.countedQuantity || 0;
                    fieldB = b.countedQuantity || 0;
                    break;
                case 'difference':
                    fieldA = a.difference || 0;
                    fieldB = b.difference || 0;
                    break;
                default:
                    fieldA = a.product.name?.toLowerCase() || '';
                    fieldB = b.product.name?.toLowerCase() || '';
            }
            
            return sortDirection === 'asc' 
                ? fieldA > fieldB ? 1 : -1 
                : fieldA < fieldB ? 1 : -1;
        });
        
        setFilteredItems(filtered);
    };

    const handleSort = (field) => {
        setSortField(field);
        setSortDirection(sortField === field ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc');
    };

    const toggleScanMode = () => {
        setScanMode(!scanMode);
        setProductToCount('');
        setQuantity(1);
        setMessage({ type: '', text: '' });
    };

    const countProduct = async () => {
        if (!productToCount.trim()) {
            setMessage({
                type: 'error',
                text: 'Lütfen bir barkod veya ürün ID girin.'
            });
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/inventory/${id}/count`, {
                productIdentifier: productToCount.trim(),
                countedQuantity: quantity
            });

            setInventory(prev => {
                if (!prev) return null;
                
                const updatedItems = [...prev.items];
                const itemIndex = updatedItems.findIndex(
                    item => item.product._id === response.data.product._id
                );
                
                if (itemIndex !== -1) {
                    updatedItems[itemIndex] = {
                        ...updatedItems[itemIndex],
                        countedQuantity: response.data.countedQuantity,
                        difference: response.data.difference,
                        counted: true,
                        countedAt: response.data.countedAt
                    };
                }
                
                return {
                    ...prev,
                    items: updatedItems,
                    status: prev.status === 'draft' ? 'in_progress' : prev.status
                };
            });

            setMessage({
                type: 'success',
                text: `${response.data.product.name} sayımı kaydedildi.`
            });

            setProductToCount('');
            setQuantity(1);
            
            setTimeout(() => {
                if (barcodeInputRef.current) {
                    barcodeInputRef.current.focus();
                }
            }, 100);

        } catch (error) {
            console.error('Sayım güncellenirken hata oluştu:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Sayım güncellenirken bir hata oluştu.'
            });
        }
    };

    const handleItemQuantityChange = (e, itemIndex) => {
        const value = parseInt(e.target.value) || 0;
        const updatedItems = [...filteredItems];
        
        updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            countedQuantity: value,
            difference: value - updatedItems[itemIndex].systemQuantity
        };
        
        setFilteredItems(updatedItems);
    };

    const saveItemCount = async (item) => {
        try {
            await axios.post(`${API_URL}/inventory/${id}/count`, {
                productIdentifier: item.product._id,
                countedQuantity: item.countedQuantity
            });
            
            fetchInventoryCount();
            
            setMessage({
                type: 'success',
                text: `${item.product.name} sayımı kaydedildi.`
            });
            
        } catch (error) {
            console.error('Sayım güncellenirken hata oluştu:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Sayım güncellenirken bir hata oluştu.'
            });
        }
    };

    const completeInventoryCount = async () => {
        try {
            await axios.post(`${API_URL}/inventory/${id}/complete`, {
                updateStock
            });
            
            setShowCompleteModal(false);
            fetchInventoryCount();
            
            setMessage({
                type: 'success',
                text: 'Sayım başarıyla tamamlandı.'
            });
            
        } catch (error) {
            console.error('Sayım tamamlanırken hata oluştu:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Sayım tamamlanırken bir hata oluştu.'
            });
            setShowCompleteModal(false);
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

    const getDifferenceClass = (difference) => {
        if (difference > 0) return 'text-green-600';
        if (difference < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <FaSpinner className="animate-spin mx-auto h-8 w-8 text-gray-500" />
                    <p className="mt-2 text-gray-600">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!inventory) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    Sayım bulunamadı veya yüklenirken bir hata oluştu.
                </div>
                <button 
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center"
                    onClick={() => navigate(-1)}
                >
                    <FaArrowLeft className="mr-2" /> Geri Dön
                </button>
            </div>
        );
    }

    const countedItemsCount = inventory.items.filter(item => item.counted).length;
    const totalItemsCount = inventory.items.length;
    const progressPercentage = Math.round((countedItemsCount / totalItemsCount) * 100);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 border-b">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Stok Sayımı: {inventory.name}
                        </h2>
                        <div>
                            {getStatusBadge(inventory.status)}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600">
                                <span className="font-semibold">Oluşturulma Tarihi:</span>{' '}
                                {moment(inventory.createdAt).format('DD.MM.YYYY HH:mm')}
                            </p>
                            {inventory.completedAt && (
                                <p className="text-gray-600">
                                    <span className="font-semibold">Tamamlanma Tarihi:</span>{' '}
                                    {moment(inventory.completedAt).format('DD.MM.YYYY HH:mm')}
                                </p>
                            )}
                            {inventory.notes && (
                                <p className="text-gray-600">
                                    <span className="font-semibold">Notlar:</span> {inventory.notes}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-gray-600 mb-2">
                                <span className="font-semibold">İlerleme:</span>{' '}
                                {countedItemsCount} / {totalItemsCount} ürün sayıldı ({progressPercentage}%)
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div 
                                    className="bg-blue-500 h-4 rounded-full transition-all duration-300" 
                                    style={{ width: `${progressPercentage}%` }}>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {inventory.status !== 'completed' && (
                    <div className="p-4 border-b">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg border p-4">
                                <div className="mb-4">
                                    <button 
                                        className={`${
                                            scanMode 
                                                ? 'bg-blue-500 text-white' 
                                                : 'bg-white text-blue-500 border border-blue-500'
                                        } px-4 py-2 rounded-md flex items-center hover:bg-blue-600 hover:text-white transition-colors`}
                                        onClick={toggleScanMode}
                                    >
                                        <FaBarcode className="mr-2" />
                                        {scanMode ? "Barkod Tarama Modu" : "Barkod Tarama Modunu Etkinleştir"}
                                    </button>
                                </div>

                                {scanMode && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                                Ürün Barkodu / ID
                                            </label>
                                            <input
                                                type="text"
                                                value={productToCount}
                                                onChange={(e) => setProductToCount(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && countProduct()}
                                                ref={barcodeInputRef}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Barkod okutun veya ürün ID'si girin"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                                Adet
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                ref={quantityInputRef}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <button
                                            onClick={countProduct}
                                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
                                        >
                                            <FaSave className="mr-2" /> Kaydet
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                {message.text && (
                                    <div className={`mb-4 p-4 rounded ${
                                        message.type === 'success' 
                                            ? 'bg-green-100 border border-green-400 text-green-700' 
                                            : 'bg-red-100 border border-red-400 text-red-700'
                                    }`}>
                                        {message.text}
                                    </div>
                                )}

                                {inventory.status !== 'completed' && (
                                    <button 
                                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
                                        onClick={() => setShowCompleteModal(true)}
                                        disabled={countedItemsCount === 0}
                                    >
                                        <FaCheck className="mr-2" /> Sayımı Tamamla
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-4">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
                        <div className="w-full md:w-auto">
                            <select
                                value={filterCounted}
                                onChange={(e) => setFilterCounted(e.target.value)}
                                className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Tüm Ürünler</option>
                                <option value="counted">Sayılanlar</option>
                                <option value="notCounted">Sayılmayanlar</option>
                                <option value="difference">Fark Olanlar</option>
                            </select>
                        </div>

                        <div className="w-full md:w-auto flex items-center">
                            <div className="relative w-full md:w-64">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Ürün ara (isim veya barkod)"
                                    className="shadow appearance-none border rounded w-full py-2 pl-10 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th 
                                        className="py-2 px-4 border-b text-left cursor-pointer hover:bg-gray-200"
                                        onClick={() => handleSort('name')}
                                    >
                                        Ürün Adı {sortField === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                                    </th>
                                    <th 
                                        className="py-2 px-4 border-b text-left cursor-pointer hover:bg-gray-200"
                                        onClick={() => handleSort('barcode')}
                                    >
                                        Barkod {sortField === 'barcode' && (sortDirection === 'asc' ? '▲' : '▼')}
                                    </th>
                                    <th 
                                        className="py-2 px-4 border-b text-left cursor-pointer hover:bg-gray-200"
                                        onClick={() => handleSort('systemQuantity')}
                                    >
                                        Sistem Stok {sortField === 'systemQuantity' && (sortDirection === 'asc' ? '▲' : '▼')}
                                    </th>
                                    <th 
                                        className="py-2 px-4 border-b text-left cursor-pointer hover:bg-gray-200"
                                        onClick={() => handleSort('countedQuantity')}
                                    >
                                        Sayılan {sortField === 'countedQuantity' && (sortDirection === 'asc' ? '▲' : '▼')}
                                    </th>
                                    <th 
                                        className="py-2 px-4 border-b text-left cursor-pointer hover:bg-gray-200"
                                        onClick={() => handleSort('difference')}
                                    >
                                        Fark {sortField === 'difference' && (sortDirection === 'asc' ? '▲' : '▼')}
                                    </th>
                                    {inventory.status !== 'completed' && (
                                        <th className="py-2 px-4 border-b text-left">İşlem</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td 
                                            colSpan={inventory.status !== 'completed' ? 6 : 5} 
                                            className="text-center py-4 text-gray-500"
                                        >
                                            Gösterilecek ürün bulunamadı.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item, index) => (
                                        <tr 
                                            key={item.product._id} 
                                            className={`${
                                                item.counted ? '' : 'bg-gray-50'
                                            } hover:bg-gray-100 border-b transition-colors`}
                                        >
                                            <td className="py-2 px-4">{item.product.name}</td>
                                            <td className="py-2 px-4">{item.product.barcode}</td>
                                            <td className="py-2 px-4">{item.systemQuantity}</td>
                                            <td className="py-2 px-4">
                                                {inventory.status !== 'completed' ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={item.countedQuantity}
                                                        onChange={(e) => handleItemQuantityChange(e, index)}
                                                        className="shadow appearance-none border rounded w-24 py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    item.countedQuantity
                                                )}
                                            </td>
                                            <td className={`py-2 px-4 ${getDifferenceClass(item.difference)}`}>
                                                {item.difference > 0 ? '+' : ''}{item.difference}
                                            </td>
                                            {inventory.status !== 'completed' && (
                                                <td className="py-2 px-4">
                                                    <button 
                                                        onClick={() => saveItemCount(item)}
                                                        className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-md flex items-center"
                                                    >
                                                        <FaSave className="mr-1" /> Kaydet
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-4 border-t">
                    <button 
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center"
                        onClick={() => navigate(-1)}
                    >
                        <FaArrowLeft className="mr-2" /> Geri Dön
                    </button>
                </div>
            </div>

            {/* Sayımı Tamamlama Modal */}
            {showCompleteModal && (
                <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
                        <div className="p-4 border-b">
                            <h3 className="text-xl font-semibold text-gray-800">Sayımı Tamamla</h3>
                        </div>
                        
                        <div className="p-4">
                            <p className="mb-4">Sayımı tamamlamak istediğinizden emin misiniz?</p>
                            <p className="mb-4">Sayım tamamlandıktan sonra değişiklik yapılamaz.</p>
                            
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={updateStock}
                                    onChange={(e) => setUpdateStock(e.target.checked)}
                                    className="form-checkbox h-5 w-5 text-blue-500"
                                />
                                <span>Stok miktarlarını sayım değerleriyle güncelle</span>
                            </label>
                        </div>
                        
                        <div className="flex justify-end p-4 border-t space-x-2">
                            <button 
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                                onClick={() => setShowCompleteModal(false)}
                            >
                                İptal
                            </button>
                            <button 
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                                onClick={completeInventoryCount}
                            >
                                Sayımı Tamamla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryCount; 