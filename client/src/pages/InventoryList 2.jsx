import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Table, Modal, Form, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { FaPlus, FaClipboardList, FaTrash, FaEdit } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3050/api';

const InventoryList = () => {
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
            window.location.href = `/inventory/${response.data._id}`;
            
        } catch (error) {
            console.error('Stok sayımı oluşturulurken hata oluştu:', error);
            setFormError(error.response?.data?.message || 'Stok sayımı oluşturulurken bir hata oluştu.');
            setCreatingInventory(false);
        }
    };

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

    if (loading) {
        return (
            <Container className="my-4 text-center">
                <Spinner animation="border" />
                <p>Stok sayımları yükleniyor...</p>
            </Container>
        );
    }

    return (
        <Container className="my-4">
            <Card>
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h2>Stok Sayımları</h2>
                        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                            <FaPlus className="me-1" /> Yeni Sayım Başlat
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body>
                    {inventories.length === 0 ? (
                        <div className="text-center my-4">
                            <p>Henüz hiç stok sayımı bulunmuyor.</p>
                            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                                <FaPlus className="me-1" /> İlk Sayımı Başlat
                            </Button>
                        </div>
                    ) : (
                        <Table responsive striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Sayım Adı</th>
                                    <th>Durum</th>
                                    <th>Oluşturulma Tarihi</th>
                                    <th>Tamamlanma Tarihi</th>
                                    <th>İlerleme</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventories.map(inventory => {
                                    const countedItemsCount = inventory.items.filter(item => item.counted).length;
                                    const totalItemsCount = inventory.items.length;
                                    const progressPercentage = Math.round((countedItemsCount / totalItemsCount) * 100) || 0;
                                    
                                    return (
                                        <tr key={inventory._id}>
                                            <td>{inventory.name}</td>
                                            <td>{getStatusBadge(inventory.status)}</td>
                                            <td>{moment(inventory.createdAt).format('DD.MM.YYYY HH:mm')}</td>
                                            <td>
                                                {inventory.completedAt 
                                                    ? moment(inventory.completedAt).format('DD.MM.YYYY HH:mm') 
                                                    : '-'}
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="progress flex-grow-1 me-2" style={{ height: '20px' }}>
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
                                                    <span>{countedItemsCount}/{totalItemsCount}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <Link 
                                                    to={`/inventory/${inventory._id}`} 
                                                    className="btn btn-sm btn-info me-1"
                                                >
                                                    <FaClipboardList /> Görüntüle
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Yeni Sayım Oluşturma Modal */}
            <Modal show={showCreateModal} onHide={() => !creatingInventory && setShowCreateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Yeni Stok Sayımı</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {formError && (
                        <div className="alert alert-danger">{formError}</div>
                    )}
                    
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Sayım Adı *</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={newInventory.name}
                                onChange={handleInputChange}
                                placeholder="Örn: Aylık Sayım - Mart 2023"
                                disabled={creatingInventory}
                                required
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Notlar</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="notes"
                                rows={3}
                                value={newInventory.notes}
                                onChange={handleInputChange}
                                placeholder="İsteğe bağlı açıklama"
                                disabled={creatingInventory}
                            />
                        </Form.Group>
                    </Form>
                    
                    <p className="text-muted mt-3">
                        <small>* Zorunlu alanlar</small>
                    </p>
                    
                    <p className="small text-info">
                        <strong>Not:</strong> Sayımı başlattığınızda sistem, mevcut tüm ürünleri 
                        otomatik olarak sayım listesine ekleyecektir. Bu işlem, ürün sayısına bağlı olarak 
                        biraz zaman alabilir.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowCreateModal(false)}
                        disabled={creatingInventory}
                    >
                        İptal
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleCreateInventory}
                        disabled={creatingInventory}
                    >
                        {creatingInventory ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" className="me-1" />
                                Oluşturuluyor...
                            </>
                        ) : (
                            <>Sayımı Başlat</>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default InventoryList; 