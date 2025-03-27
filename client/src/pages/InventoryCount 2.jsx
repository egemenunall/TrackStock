import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Row, Col, Form, Button, Table, Alert, Badge, Modal, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { FaBarcode, FaSearch, FaSave, FaCheck, FaArrowLeft } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3050/api';

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
    
    // Sayım detaylarını yükle
    useEffect(() => {
        if (id) {
            fetchInventoryCount();
        }
    }, [id]);
    
    // Arama terimine göre filtreleme
    useEffect(() => {
        if (inventory) {
            filterItems();
        }
    }, [searchTerm, inventory, filterCounted, sortField, sortDirection]);
    
    // Barkod modunda giriş alanına odaklan
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
                type: 'danger',
                text: 'Sayım verileri yüklenirken bir hata oluştu.'
            });
            setLoading(false);
        }
    };
    
    const filterItems = () => {
        if (!inventory) return;
        
        let filtered = [...inventory.items];
        
        // Sayım durumuna göre filtrele
        if (filterCounted === 'counted') {
            filtered = filtered.filter(item => item.counted);
        } else if (filterCounted === 'notCounted') {
            filtered = filtered.filter(item => !item.counted);
        } else if (filterCounted === 'difference') {
            filtered = filtered.filter(item => item.counted && item.difference !== 0);
        }
        
        // Arama terimine göre filtrele
        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(item => 
                item.product.name?.toLowerCase().includes(term) || 
                item.product.barcode?.toLowerCase().includes(term)
            );
        }
        
        // Sıralama
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
            
            if (sortDirection === 'asc') {
                return fieldA > fieldB ? 1 : -1;
            } else {
                return fieldA < fieldB ? 1 : -1;
            }
        });
        
        setFilteredItems(filtered);
    };
    
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };
    
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };
    
    const toggleScanMode = () => {
        setScanMode(!scanMode);
        setProductToCount('');
        setQuantity(1);
        setMessage({ type: '', text: '' });
        
        // Barkod moduna geçince otomatik olarak odaklan
        if (!scanMode) {
            setTimeout(() => {
                if (barcodeInputRef.current) {
                    barcodeInputRef.current.focus();
                }
            }, 100);
        }
    };
    
    const handleProductInputChange = (e) => {
        setProductToCount(e.target.value);
    };
    
    const handleQuantityChange = (e) => {
        setQuantity(e.target.value);
    };
    
    const handleProductInputKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            countProduct();
        }
    };
    
    const countProduct = async () => {
        if (!productToCount.trim()) {
            setMessage({
                type: 'warning',
                text: 'Lütfen bir barkod veya ürün ID girin.'
            });
            return;
        }
        
        try {
            const response = await axios.post(`${API_URL}/inventory/${id}/count`, {
                productIdentifier: productToCount.trim(),
                countedQuantity: quantity
            });
            
            // Sayımı güncelle
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
            
            // Formu sıfırla ve barkod girişine odaklan
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
                type: 'danger',
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
            
            // Sayımı güncelle
            fetchInventoryCount();
            
            setMessage({
                type: 'success',
                text: `${item.product.name} sayımı kaydedildi.`
            });
            
        } catch (error) {
            console.error('Sayım güncellenirken hata oluştu:', error);
            setMessage({
                type: 'danger',
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
                type: 'danger',
                text: error.response?.data?.message || 'Sayım tamamlanırken bir hata oluştu.'
            });
            setShowCompleteModal(false);
        }
    };
    
    // Sayım durumuna göre renk belirleme
    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft':
                return <Badge bg="secondary">Taslak</Badge>;
            case 'in_progress':
                return <Badge bg="primary">Devam Ediyor</Badge>;
            case 'completed':
                return <Badge bg="success">Tamamlandı</Badge>;
            default:
                return <Badge bg="secondary">{status}</Badge>;
        }
    };
    
    // Fark değerine göre renk belirleme
    const getDifferenceClass = (difference) => {
        if (difference > 0) return 'text-success';
        if (difference < 0) return 'text-danger';
        return '';
    };
    
    if (loading) {
        return (
            <Container className="my-4 text-center">
                <Spinner animation="border" />
                <p>Yükleniyor...</p>
            </Container>
        );
    }
    
    if (!inventory) {
        return (
            <Container className="my-4">
                <Alert variant="danger">
                    Sayım bulunamadı veya yüklenirken bir hata oluştu.
                </Alert>
                <Button variant="secondary" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Geri Dön
                </Button>
            </Container>
        );
    }
    
    const countedItemsCount = inventory.items.filter(item => item.counted).length;
    const totalItemsCount = inventory.items.length;
    const progressPercentage = Math.round((countedItemsCount / totalItemsCount) * 100);
    
    return (
        <Container fluid className="my-4">
            <Card className="mb-4">
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h2>Stok Sayımı: {inventory.name}</h2>
                        <div>
                            {getStatusBadge(inventory.status)}
                        </div>
                    </div>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <p><strong>Oluşturulma Tarihi:</strong> {moment(inventory.createdAt).format('DD.MM.YYYY HH:mm')}</p>
                            {inventory.completedAt && (
                                <p><strong>Tamamlanma Tarihi:</strong> {moment(inventory.completedAt).format('DD.MM.YYYY HH:mm')}</p>
                            )}
                            {inventory.notes && (
                                <p><strong>Notlar:</strong> {inventory.notes}</p>
                            )}
                        </Col>
                        <Col md={6}>
                            <div className="text-end mb-3">
                                <p><strong>İlerleme:</strong> {countedItemsCount} / {totalItemsCount} ürün sayıldı ({progressPercentage}%)</p>
                                <div className="progress">
                                    <div 
                                        className="progress-bar" 
                                        role="progressbar" 
                                        style={{ width: `${progressPercentage}%` }} 
                                        aria-valuenow={progressPercentage} 
                                        aria-valuemin="0" 
                                        aria-valuemax="100">
                                        {progressPercentage}%
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    
                    {inventory.status !== 'completed' && (
                        <Row className="mb-4">
                            <Col md={6}>
                                <Card>
                                    <Card.Header>
                                        <h5 className="mb-0">
                                            <Button 
                                                variant={scanMode ? "primary" : "outline-primary"} 
                                                className="me-2" 
                                                onClick={toggleScanMode}
                                            >
                                                <FaBarcode className="me-1" /> {scanMode ? "Barkod Tarama Modu" : "Barkod Tarama Modunu Etkinleştir"}
                                            </Button>
                                        </h5>
                                    </Card.Header>
                                    
                                    {scanMode && (
                                        <Card.Body>
                                            <Form>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Ürün Barkodu / ID</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Barkod okutun veya ürün ID'si girin"
                                                        value={productToCount}
                                                        onChange={handleProductInputChange}
                                                        onKeyPress={handleProductInputKeyPress}
                                                        ref={barcodeInputRef}
                                                    />
                                                </Form.Group>
                                                
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Adet</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        value={quantity}
                                                        onChange={handleQuantityChange}
                                                        ref={quantityInputRef}
                                                    />
                                                </Form.Group>
                                                
                                                <div className="d-grid">
                                                    <Button variant="primary" onClick={countProduct}>
                                                        <FaSave className="me-1" /> Kaydet
                                                    </Button>
                                                </div>
                                            </Form>
                                        </Card.Body>
                                    )}
                                </Card>
                            </Col>
                            
                            <Col md={6}>
                                {message.text && (
                                    <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
                                        {message.text}
                                    </Alert>
                                )}
                                
                                {inventory.status !== 'completed' && (
                                    <div className="d-grid gap-2">
                                        <Button 
                                            variant="success" 
                                            onClick={() => setShowCompleteModal(true)}
                                            disabled={countedItemsCount === 0}
                                        >
                                            <FaCheck className="me-1" /> Sayımı Tamamla
                                        </Button>
                                    </div>
                                )}
                            </Col>
                        </Row>
                    )}
                    
                    <hr />
                    
                    <div className="mb-3 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <Form.Group className="me-3">
                                <Form.Label>Filtrele</Form.Label>
                                <Form.Select 
                                    value={filterCounted} 
                                    onChange={(e) => setFilterCounted(e.target.value)}
                                >
                                    <option value="all">Tüm Ürünler</option>
                                    <option value="counted">Sayılanlar</option>
                                    <option value="notCounted">Sayılmayanlar</option>
                                    <option value="difference">Fark Olanlar</option>
                                </Form.Select>
                            </Form.Group>
                        </div>
                        
                        <div className="d-flex align-items-center">
                            <div className="input-group">
                                <span className="input-group-text">
                                    <FaSearch />
                                </span>
                                <Form.Control
                                    type="text"
                                    placeholder="Ürün ara (isim veya barkod)"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="table-responsive">
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                                        Ürün Adı {sortField === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                                    </th>
                                    <th onClick={() => handleSort('barcode')} style={{ cursor: 'pointer' }}>
                                        Barkod {sortField === 'barcode' && (sortDirection === 'asc' ? '▲' : '▼')}
                                    </th>
                                    <th onClick={() => handleSort('systemQuantity')} style={{ cursor: 'pointer' }}>
                                        Sistem Stok {sortField === 'systemQuantity' && (sortDirection === 'asc' ? '▲' : '▼')}
                                    </th>
                                    <th onClick={() => handleSort('countedQuantity')} style={{ cursor: 'pointer' }}>
                                        Sayılan {sortField === 'countedQuantity' && (sortDirection === 'asc' ? '▲' : '▼')}
                                    </th>
                                    <th onClick={() => handleSort('difference')} style={{ cursor: 'pointer' }}>
                                        Fark {sortField === 'difference' && (sortDirection === 'asc' ? '▲' : '▼')}
                                    </th>
                                    {inventory.status !== 'completed' && (
                                        <th>İşlem</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={inventory.status !== 'completed' ? 6 : 5} className="text-center">
                                            Gösterilecek ürün bulunamadı.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item, index) => (
                                        <tr key={item.product._id} className={item.counted ? '' : 'table-secondary'}>
                                            <td>{item.product.name}</td>
                                            <td>{item.product.barcode}</td>
                                            <td>{item.systemQuantity}</td>
                                            <td>
                                                {inventory.status !== 'completed' ? (
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        value={item.countedQuantity}
                                                        onChange={(e) => handleItemQuantityChange(e, index)}
                                                        className={item.counted ? 'bg-light' : ''}
                                                    />
                                                ) : (
                                                    item.countedQuantity
                                                )}
                                            </td>
                                            <td className={getDifferenceClass(item.difference)}>
                                                {item.difference > 0 ? '+' : ''}{item.difference}
                                            </td>
                                            {inventory.status !== 'completed' && (
                                                <td>
                                                    <Button 
                                                        variant="primary" 
                                                        size="sm"
                                                        onClick={() => saveItemCount(item)}
                                                    >
                                                        <FaSave /> Kaydet
                                                    </Button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
                <Card.Footer>
                    <Button variant="secondary" onClick={() => navigate(-1)}>
                        <FaArrowLeft /> Geri Dön
                    </Button>
                </Card.Footer>
            </Card>
            
            {/* Sayımı Tamamlama Modal */}
            <Modal show={showCompleteModal} onHide={() => setShowCompleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Sayımı Tamamla</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Sayımı tamamlamak istediğinizden emin misiniz?</p>
                    <p>Sayım tamamlandıktan sonra değişiklik yapılamaz.</p>
                    
                    <Form.Check 
                        type="checkbox"
                        id="update-stock-checkbox"
                        label="Stok miktarlarını sayım değerleriyle güncelle"
                        checked={updateStock}
                        onChange={(e) => setUpdateStock(e.target.checked)}
                        className="mt-3"
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCompleteModal(false)}>
                        İptal
                    </Button>
                    <Button variant="success" onClick={completeInventoryCount}>
                        Sayımı Tamamla
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default InventoryCount; 