import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyRequests.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const MyRequests = ({ teacherId, isOpen, onClose }) => {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Пагинация
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Фильтры
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Модальное окно для просмотра деталей
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const fetchRequests = async () => {
        if (!teacherId) return;

        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/requests/teacher/${teacherId}`);
            console.log('Requests response:', response.data);

            if (response.data.success && response.data.data) {
                setRequests(response.data.data);
                setFilteredRequests(response.data.data);
            } else if (Array.isArray(response.data.data)) {
                setRequests(response.data.data);
                setFilteredRequests(response.data.data);
            } else if (Array.isArray(response.data)) {
                setRequests(response.data);
                setFilteredRequests(response.data);
            } else {
                setRequests([]);
                setFilteredRequests([]);
            }
        } catch (err) {
            console.error('Error fetching requests:', err);
            setError('Ошибка загрузки заявок');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && teacherId) {
            fetchRequests();
        }
    }, [isOpen, teacherId]);

    // Применение фильтров
    useEffect(() => {
        let filtered = [...requests];

        // Фильтр по статусу
        if (filterStatus !== 'all') {
            filtered = filtered.filter(r => r.status === filterStatus);
        }

        // Фильтр по типу
        if (filterType !== 'all') {
            filtered = filtered.filter(r => r.request_type === filterType);
        }

        // Поиск по названию и описанию
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(r =>
                r.title.toLowerCase().includes(query) ||
                r.description.toLowerCase().includes(query)
            );
        }

        setFilteredRequests(filtered);
        setCurrentPage(1); // Сбрасываем на первую страницу при изменении фильтров
    }, [requests, filterStatus, filterType, searchQuery]);

    // Пагинация
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return 'status-pending';
            case 'approved': return 'status-approved';
            case 'rejected': return 'status-rejected';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'pending': return 'На рассмотрении';
            case 'approved': return 'Одобрено';
            case 'rejected': return 'Отклонено';
            case 'cancelled': return 'Отменено';
            default: return status;
        }
    };

    const getRequestTypeText = (type) => {
        switch(type) {
            case 'new': return 'Новая пара';
            case 'replacement': return 'Замена';
            case 'reschedule': return 'Перенос';
            case 'cancel': return 'Отмена';
            case 'wish': return 'Пожелание';
            default: return type;
        }
    };

    const getRequestTypeIcon = (type) => {
        switch(type) {
            case 'new': return '➕';
            case 'replacement': return '🔄';
            case 'reschedule': return '⏱';
            case 'cancel': return '❌';
            case 'wish': return '💭';
            default: return '📋';
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Прокрутка к началу списка
        document.querySelector('.requests-list')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setShowDetailsModal(true);
    };

    if (!isOpen) return null;

    return (
        <div className="my-requests-overlay" onClick={onClose}>
            <div className="my-requests-modal" onClick={(e) => e.stopPropagation()}>
                <div className="my-requests-header">
                    <h2>Мои заявки</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="my-requests-filters">
                    <div className="filter-group">
                        <input
                            type="text"
                            placeholder="Поиск по заявкам..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="filter-group">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">Все статусы</option>
                            <option value="pending">На рассмотрении</option>
                            <option value="approved">Одобрено</option>
                            <option value="rejected">Отклонено</option>
                            <option value="cancelled">Отменено</option>
                        </select>

                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">Все типы</option>
                            <option value="new">Новые пары</option>
                            <option value="replacement">Замены</option>
                            <option value="reschedule">Переносы</option>
                            <option value="cancel">Отмены</option>
                            <option value="wish">Пожелания</option>
                        </select>
                    </div>

                    <div className="filter-info">
                        Найдено: {filteredRequests.length} заявок
                        {filteredRequests.length > 0 && (
                            <span className="items-per-page">
                                Показывать:
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    className="items-select"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </span>
                        )}
                    </div>
                </div>

                <div className="my-requests-body">
                    {loading && (
                        <div className="loading-spinner">Загрузка...</div>
                    )}

                    {error && (
                        <div className="error-message">{error}</div>
                    )}

                    {!loading && !error && filteredRequests.length === 0 && (
                        <div className="empty-state">
                            <p>Заявки не найдены</p>
                            <p className="empty-hint">Попробуйте изменить параметры фильтрации</p>
                        </div>
                    )}

                    {!loading && !error && filteredRequests.length > 0 && (
                        <>
                            <div className="requests-list">
                                {currentItems.map(request => (
                                    <div key={request.id} className="request-card" onClick={() => handleViewDetails(request)}>
                                        <div className="request-header">
                                            <div className="request-title">
                                                <span className="request-type-icon">{getRequestTypeIcon(request.request_type)}</span>
                                                {getRequestTypeText(request.request_type)}: {request.title}
                                            </div>
                                            <div className={`request-status ${getStatusColor(request.status)}`}>
                                                {getStatusText(request.status)}
                                            </div>
                                        </div>

                                        <div className="request-date">
                                            {new Date(request.created_at).toLocaleString('ru-RU')}
                                        </div>

                                        <div className="request-description">
                                            {request.description.length > 100
                                                ? `${request.description.substring(0, 100)}...`
                                                : request.description}
                                        </div>

                                        {request.requested_date && (
                                            <div className="request-detail">
                                                Предлагаемая дата: {new Date(request.requested_date).toLocaleDateString('ru-RU')}
                                            </div>
                                        )}

                                        {request.requested_pair_number && (
                                            <div className="request-detail">
                                                Предлагаемая пара: {request.requested_pair_number}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Пагинация */}
                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="page-btn"
                                    >
                                        ←
                                    </button>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="page-btn"
                                    >
                                        →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Модальное окно с деталями заявки */}
                {showDetailsModal && selectedRequest && (
                    <div className="details-modal-overlay" onClick={() => setShowDetailsModal(false)}>
                        <div className="details-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="details-modal-header">
                                <h3>Детали заявки</h3>
                                <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
                            </div>
                            <div className="details-modal-body">
                                <div className="detail-row">
                                    <span className="detail-label">Тип:</span>
                                    <span className="detail-value">{getRequestTypeText(selectedRequest.request_type)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Название:</span>
                                    <span className="detail-value">{selectedRequest.title}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Статус:</span>
                                    <span className={`detail-status ${getStatusColor(selectedRequest.status)}`}>
                                        {getStatusText(selectedRequest.status)}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Дата создания:</span>
                                    <span className="detail-value">
                                        {new Date(selectedRequest.created_at).toLocaleString('ru-RU')}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Описание:</span>
                                    <span className="detail-value">{selectedRequest.description}</span>
                                </div>
                                {selectedRequest.requested_date && (
                                    <div className="detail-row">
                                        <span className="detail-label">Предлагаемая дата:</span>
                                        <span className="detail-value">
                                            {new Date(selectedRequest.requested_date).toLocaleDateString('ru-RU')}
                                        </span>
                                    </div>
                                )}
                                {selectedRequest.requested_pair_number && (
                                    <div className="detail-row">
                                        <span className="detail-label">Предлагаемая пара:</span>
                                        <span className="detail-value">{selectedRequest.requested_pair_number}</span>
                                    </div>
                                )}
                                {selectedRequest.requested_teacher && (
                                    <div className="detail-row">
                                        <span className="detail-label">Заменяющий преподаватель:</span>
                                        <span className="detail-value">
                                            {selectedRequest.requested_teacher.last_name} {selectedRequest.requested_teacher.first_name?.charAt(0)}.
                                            {selectedRequest.requested_teacher.middle_name ? selectedRequest.requested_teacher.middle_name.charAt(0) + '.' : ''}
                                        </span>
                                    </div>
                                )}
                                {selectedRequest.requested_room_id && (
                                    <div className="detail-row">
                                        <span className="detail-label">Кабинет:</span>
                                        <span className="detail-value">{selectedRequest.requested_room_id}</span>
                                    </div>
                                )}
                                {selectedRequest.subject && (
                                    <div className="detail-row">
                                        <span className="detail-label">Предмет:</span>
                                        <span className="detail-value">{selectedRequest.subject.name}</span>
                                    </div>
                                )}
                                {selectedRequest.group && (
                                    <div className="detail-row">
                                        <span className="detail-label">Группа:</span>
                                        <span className="detail-value">{selectedRequest.group.name}</span>
                                    </div>
                                )}
                                {selectedRequest.subgroup && (
                                    <div className="detail-row">
                                        <span className="detail-label">Подгруппа:</span>
                                        <span className="detail-value">{selectedRequest.subgroup.name}</span>
                                    </div>
                                )}
                                {selectedRequest.rejection_reason && (
                                    <div className="detail-row">
                                        <span className="detail-label">Причина отказа:</span>
                                        <span className="detail-value rejection-text">{selectedRequest.rejection_reason}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyRequests;