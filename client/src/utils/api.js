import axios from "axios";

// API URL'ini buradan değiştirebilirsiniz
const API_URL = "http://localhost:3050/api";

// Ürünleri al
export const getProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  } catch (error) {
    console.error("Ürünleri alırken hata oluştu", error);
    throw new Error("Ürünler alınamadı. Lütfen tekrar deneyin.");
  }
};

// Satışları al
export const getSales = async () => {
  try {
    const response = await axios.get(`${API_URL}/sales`);
    return response.data;
  } catch (error) {
    console.error("Satışları alırken hata oluştu", error);
    throw new Error("Satış verileri alınamadı. Lütfen tekrar deneyin.");
  }
};

// Stok raporunu al
export const getStockReport = async () => {
  try {
    const response = await axios.get(`${API_URL}/reports/stock`);
    return response.data;
  } catch (error) {
    console.error("Stok raporu alınırken hata oluştu", error);
    throw new Error("Stok raporu alınamadı. Lütfen tekrar deneyin.");
  }
};

// Yeni ürün ekleme
export const addProduct = async (productData) => {
  if (!productData.name || !productData.price || !productData.stock) {
    throw new Error("Ürün adı, fiyat ve stok bilgileri zorunludur.");
  }
  try {
    const response = await axios.post(`${API_URL}/products`, productData);
    return response.data;
  } catch (error) {
    console.error("Ürün eklenirken hata oluştu", error);
    throw new Error("Ürün eklenirken hata oluştu.");
  }
};

// Ürün güncelleme
export const updateProduct = async (id, updatedData) => {
  if (!id || !updatedData) {
    throw new Error("Ürün ID'si ve güncellenen veriler gereklidir.");
  }
  try {
    const response = await axios.put(`${API_URL}/products/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Ürün güncellenirken hata oluştu", error);
    throw new Error("Ürün güncellenirken hata oluştu.");
  }
};

// Günlük satış verilerini al
export const getDailySales = async (date) => {
  try {
    const response = await axios.get(`${API_URL}/reports/sales/daily`, {
      params: date ? { date } : {}, // Tarih parametresi varsa ekle, yoksa ekleme
    });
    return response.data;
  } catch (error) {
    console.error("Günlük satış verisi alınırken hata oluştu", error);
    throw new Error("Günlük satış verisi alınamadı.");
  }
};

// Toplam ciroyu al
export const getRevenue = async () => {
  try {
    const response = await axios.get(`${API_URL}/reports/revenue`);
    return response.data;
  } catch (error) {
    console.error("Ciro verisi alınırken hata oluştu", error);
    throw new Error("Ciro verisi alınamadı.");
  }
};

// Barkod ile ürün ara
export const getProductByBarcode = async (barcode) => {
  try {
    const response = await axios.get(`${API_URL}/products/barcode/${barcode}`);
    return response.data;
  } catch (error) {
    console.error("Ürün aranırken hata oluştu", error);
    throw new Error("Ürün bulunamadı.");
  }
};

// Satış iptali
export const cancelSale = async (saleId, reason) => {
  try {
    const response = await axios.post(`${API_URL}/sales/${saleId}/cancel`, { reason });
    return response.data;
  } catch (error) {
    console.error("Satış iptal edilirken hata oluştu", error);
    throw new Error("Satış iptal edilirken bir hata oluştu.");
  }
};
