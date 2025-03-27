import React, { useState } from 'react';
import axios from 'axios';
import { FaUpload, FaDownload, FaSpinner } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3050/api';

const ProductBulkUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type !== 'text/csv') {
            setError('Lütfen CSV formatında bir dosya seçin');
            setFile(null);
            e.target.value = null;
            return;
        }
        setFile(selectedFile);
        setError('');
        setResult(null);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Lütfen bir dosya seçin');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            setError('');
            const response = await axios.post(`${API_URL}/products/bulk/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setResult(response.data);
            setFile(null);
            e.target.reset();
        } catch (error) {
            console.error('Dosya yüklenirken hata oluştu:', error);
            setError(error.response?.data?.message || 'Dosya yüklenirken bir hata oluştu');
            if (error.response?.data?.errors) {
                setResult({
                    errors: error.response.data.errors,
                    success: false
                });
            }
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = async () => {
        try {
            const response = await axios.get(`${API_URL}/products/bulk/template`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'urun_sablonu.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Şablon indirilirken hata oluştu:', error);
            setError('Şablon dosyası indirilirken bir hata oluştu');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Toplu Ürün Yükleme</h2>
                </div>

                <div className="p-6">
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-2">Nasıl Çalışır?</h3>
                        <ol className="list-decimal list-inside space-y-2 text-gray-600">
                            <li>Aşağıdaki "Şablon İndir" butonunu kullanarak örnek CSV dosyasını indirin</li>
                            <li>İndirdiğiniz şablonu Excel veya benzeri bir program ile düzenleyin</li>
                            <li>Düzenlediğiniz dosyayı CSV formatında kaydedin</li>
                            <li>Kaydettiğiniz dosyayı seçin ve "Yükle" butonuna tıklayın</li>
                        </ol>
                    </div>

                    <div className="mb-8">
                        <button
                            onClick={downloadTemplate}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
                        >
                            <FaDownload className="mr-2" /> Şablon İndir
                        </button>
                    </div>

                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                CSV Dosyası Seçin
                            </label>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                disabled={uploading}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        {result?.errors && (
                            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                                <p className="font-bold mb-2">Yükleme sırasında hatalar oluştu:</p>
                                <ul className="list-disc list-inside">
                                    {result.errors.map((err, index) => (
                                        <li key={index}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {result?.success && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                                {result.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!file || uploading}
                            className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                !file || uploading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                        >
                            {uploading ? (
                                <>
                                    <FaSpinner className="animate-spin mr-2" />
                                    Yükleniyor...
                                </>
                            ) : (
                                <>
                                    <FaUpload className="mr-2" />
                                    Yükle
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductBulkUpload; 