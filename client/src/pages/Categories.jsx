import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3050/api';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parentCategory: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/categories`);
            setCategories(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Kategoriler yüklenirken hata oluştu:', error);
            setError('Kategoriler yüklenirken bir hata oluştu');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            setError('Kategori adı zorunludur');
            return;
        }

        try {
            if (editingCategory) {
                await axios.put(`${API_URL}/categories/${editingCategory._id}`, formData);
            } else {
                await axios.post(`${API_URL}/categories`, formData);
            }
            
            fetchCategories();
            setShowModal(false);
            setEditingCategory(null);
            setFormData({ name: '', description: '', parentCategory: '' });
        } catch (error) {
            console.error('Kategori kaydedilirken hata oluştu:', error);
            setError(error.response?.data?.message || 'Kategori kaydedilirken bir hata oluştu');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            parentCategory: category.parentCategory?._id || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/categories/${categoryId}`);
            fetchCategories();
        } catch (error) {
            console.error('Kategori silinirken hata oluştu:', error);
            alert(error.response?.data?.message || 'Kategori silinirken bir hata oluştu');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <FaSpinner className="animate-spin mx-auto h-8 w-8 text-gray-500" />
                    <p className="mt-2 text-gray-600">Kategoriler yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Kategoriler</h2>
                    <button 
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
                        onClick={() => {
                            setEditingCategory(null);
                            setFormData({ name: '', description: '', parentCategory: '' });
                            setShowModal(true);
                        }}
                    >
                        <FaPlus className="mr-2" /> Yeni Kategori
                    </button>
                </div>

                <div className="p-4">
                    {categories.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">Henüz hiç kategori bulunmuyor.</p>
                            <button 
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center mx-auto"
                                onClick={() => {
                                    setEditingCategory(null);
                                    setFormData({ name: '', description: '', parentCategory: '' });
                                    setShowModal(true);
                                }}
                            >
                                <FaPlus className="mr-2" /> İlk Kategoriyi Oluştur
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="py-2 px-4 border-b text-left">Kategori Adı</th>
                                        <th className="py-2 px-4 border-b text-left">Açıklama</th>
                                        <th className="py-2 px-4 border-b text-left">Üst Kategori</th>
                                        <th className="py-2 px-4 border-b text-left">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map(category => (
                                        <tr key={category._id} className="hover:bg-gray-50">
                                            <td className="py-2 px-4 border-b">
                                                <div className="flex items-center">
                                                    {category.parentCategory && (
                                                        <span className="text-gray-400 mr-2">└─</span>
                                                    )}
                                                    {category.name}
                                                </div>
                                            </td>
                                            <td className="py-2 px-4 border-b">{category.description || '-'}</td>
                                            <td className="py-2 px-4 border-b">
                                                {category.parentCategory?.name || '-'}
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(category)}
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-white p-1 rounded"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category._id)}
                                                        className="bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Kategori Ekleme/Düzenleme Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
                        <div className="p-4 border-b">
                            <h3 className="text-xl font-semibold text-gray-800">
                                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
                            </h3>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-4">
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    {error}
                                </div>
                            )}
                            
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Kategori Adı *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Açıklama
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Üst Kategori
                                </label>
                                <select
                                    name="parentCategory"
                                    value={formData.parentCategory}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Üst kategori seçin</option>
                                    {categories
                                        .filter(cat => cat._id !== editingCategory?._id)
                                        .map(category => (
                                            <option key={category._id} value={category._id}>
                                                {category.name}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                                >
                                    {editingCategory ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories; 