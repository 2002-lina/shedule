import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RequestModal.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const RequestModal = ({
                          isOpen,
                          onClose,
                          teacher,
                          selectedLesson,
                          onSubmit,
                          allTeachers,
                          allGroups,
                          fetchTeacherSubjects,
                          teacherSubjects,
                          fetchGroupsBySubjectAndTeacher,
                          selectedDate
                      }) => {
    const [formData, setFormData] = useState({
        request_type: 'replacement',
        timetable_entry_id: null,
        title: '',
        description: '',
        requested_teacher_id: '',
        requested_room_id: '',
        requested_date: '',
        requested_pair_number: '',
        priority: 'normal',
        subject_name: '',
        subject_id: '',
        group_id: '',
        group_type: 'group',
        subgroup_id: ''
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [teacherSubjectsList, setTeacherSubjectsList] = useState([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [availableGroups, setAvailableGroups] = useState([]);
    const [availableSubgroups, setAvailableSubgroups] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(false);

    const isEmptySlot = selectedLesson?.isEmpty === true;
    const currentTeacherId = teacher?.id ? teacher.id.toString() : null;

    // Загружаем предметы когда выбран преподаватель
    useEffect(() => {
        const loadSubjects = async () => {
            if (currentTeacherId) {
                setLoadingSubjects(true);
                const subjects = await fetchTeacherSubjects(currentTeacherId);
                setTeacherSubjectsList(subjects);
                setLoadingSubjects(false);
            } else {
                setTeacherSubjectsList([]);
            }
        };

        loadSubjects();
    }, [currentTeacherId, fetchTeacherSubjects]);

    // Загружаем группы когда выбраны преподаватель и предмет
    useEffect(() => {
        const loadGroups = async () => {
            if (formData.subject_id && currentTeacherId) {
                setLoadingGroups(true);
                const groups = await fetchGroupsBySubjectAndTeacher(currentTeacherId, formData.subject_id);

                const onlyGroups = groups.filter(g => g.type === 'group');
                const onlySubgroups = groups.filter(g => g.type === 'subgroup');

                setAvailableGroups(onlyGroups);
                setAvailableSubgroups(onlySubgroups);
                setLoadingGroups(false);

                setFormData(prev => ({ ...prev, group_id: '', subgroup_id: '' }));
            } else {
                setAvailableGroups([]);
                setAvailableSubgroups([]);
            }
        };

        loadGroups();
    }, [formData.subject_id, currentTeacherId, fetchGroupsBySubjectAndTeacher]);

    // При открытии модалки устанавливаем выбранного преподавателя
    useEffect(() => {
        if (isOpen && currentTeacherId) {
            setFormData(prev => ({
                ...prev,
                requested_teacher_id: currentTeacherId
            }));
        }
    }, [isOpen, currentTeacherId]);

    // ✅ ОСНОВНОЙ useEffect для инициализации формы при открытии
    useEffect(() => {
        if (selectedLesson && isOpen) {
            console.log('🔍 Инициализация формы, selectedLesson:', selectedLesson);

            // Получаем subject_id и group_id
            const subjectId = selectedLesson.subject_id || selectedLesson.id || null;
            const groupId = selectedLesson.group_id || null;

            console.log('🔍 subjectId:', subjectId);
            console.log('🔍 groupId:', groupId);

            if (isEmptySlot) {
                setFormData(prev => ({
                    ...prev,
                    request_type: 'new',
                    timetable_entry_id: null,
                    title: 'Добавление новой пары',
                    description: `Предлагаю добавить пару на ${selectedLesson.number} пару (${selectedLesson.time})`,
                    requested_date: selectedDate || new Date().toISOString().split('T')[0],
                    requested_pair_number: selectedLesson.number,
                    subject_name: '',
                    subject_id: '',
                    group_id: '',
                    subgroup_id: ''
                }));
            } else {
                // Для всех типов заявок сохраняем subject_id и group_id
                setFormData(prev => ({
                    ...prev,
                    request_type: prev.request_type || 'replacement',
                    timetable_entry_id: selectedLesson.id,
                    title: prev.request_type === 'cancel'
                        ? `Отмена: ${selectedLesson.name}`
                        : `Замена: ${selectedLesson.name}`,
                    description: prev.request_type === 'cancel'
                        ? `Предлагаю отменить пару "${selectedLesson.name}" (${selectedLesson.time})`
                        : `Предлагаю заменить пару "${selectedLesson.name}" (${selectedLesson.time})`,
                    requested_date: selectedDate || new Date().toISOString().split('T')[0],
                    requested_pair_number: selectedLesson.number,
                    subject_name: selectedLesson.name || '',
                    subject_id: subjectId || '',
                    group_id: groupId || '',
                    subgroup_id: ''
                }));
            }

            // Очищаем ошибки
            setErrors({});
        }
    }, [selectedLesson, isOpen, isEmptySlot, selectedDate]);

    // ✅ При изменении типа заявки на "cancel", обновляем title и description
    useEffect(() => {
        if (selectedLesson && formData.request_type === 'cancel') {
            setFormData(prev => ({
                ...prev,
                title: `Отмена: ${selectedLesson.name}`,
                description: `Предлагаю отменить пару "${selectedLesson.name}" (${selectedLesson.time})`,
                // Сохраняем subject_id и group_id если они были
                subject_id: prev.subject_id || selectedLesson.subject_id || selectedLesson.id,
                group_id: prev.group_id || selectedLesson.group_id,
            }));
        } else if (selectedLesson && formData.request_type === 'replacement') {
            setFormData(prev => ({
                ...prev,
                title: `Замена: ${selectedLesson.name}`,
                description: `Предлагаю заменить пару "${selectedLesson.name}" (${selectedLesson.time})`,
            }));
        } else if (selectedLesson && formData.request_type === 'reschedule') {
            setFormData(prev => ({
                ...prev,
                title: `Перенос: ${selectedLesson.name}`,
                description: `Предлагаю перенести пару "${selectedLesson.name}" (${selectedLesson.time})`,
            }));
        }
    }, [formData.request_type, selectedLesson]);

    // ✅ Принудительная установка subject_id и group_id перед отправкой
    useEffect(() => {
        if (isOpen && selectedLesson && (formData.request_type === 'cancel' || formData.request_type === 'replacement')) {
            if (!formData.subject_id && (selectedLesson.subject_id || selectedLesson.id)) {
                setFormData(prev => ({ ...prev, subject_id: selectedLesson.subject_id || selectedLesson.id }));
            }
            if (!formData.group_id && selectedLesson.group_id) {
                setFormData(prev => ({ ...prev, group_id: selectedLesson.group_id }));
            }
        }
    }, [isOpen, selectedLesson, formData.request_type, formData.subject_id, formData.group_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (name === 'subject_id') {
            const selectedSubject = teacherSubjectsList.find(s => s.id.toString() === value);
            if (selectedSubject) {
                setFormData(prev => ({ ...prev, subject_name: selectedSubject.name }));
            }
        }

        if (name === 'group_type') {
            setFormData(prev => ({ ...prev, group_id: '', subgroup_id: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        // ✅ ПРИНУДИТЕЛЬНО УСТАНАВЛИВАЕМ subject_id ЕСЛИ ОН ПУСТОЙ
        if (!formData.subject_id && selectedLesson) {
            formData.subject_id = selectedLesson.subject_id || selectedLesson.id || 1;
            console.log('🔍 Принудительно установили subject_id:', formData.subject_id);
        }

        if (!formData.group_id && selectedLesson) {
            formData.group_id = selectedLesson.group_id || 1;
            console.log('🔍 Принудительно установили group_id:', formData.group_id);
        }

        if (!formData.title.trim()) {
            newErrors.title = 'Укажите название заявки';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Опишите предлагаемые изменения';
        }

        if (isEmptySlot) {
            // ... валидация для пустого слота
        } else {
            // Для всех типов проверяем subject_id
            if (!formData.subject_id) {
                newErrors.subject_id = 'Выберите предмет';
            }

            if (formData.request_type === 'replacement' && !formData.requested_teacher_id) {
                newErrors.requested_teacher_id = 'Укажите заменяющего преподавателя';
            }
            if (formData.request_type === 'reschedule' && !formData.requested_pair_number) {
                newErrors.requested_pair_number = 'Укажите номер пары для переноса';
            }
            if (formData.request_type === 'cancel' && !formData.group_id) {
                newErrors.group_id = 'Укажите группу';
            }
        }

        setErrors(newErrors);
        console.log('Validation errors:', newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        console.log('handleSubmit called');

        // ✅ Принудительно устанавливаем значения перед отправкой
        if (!formData.subject_id && selectedLesson) {
            formData.subject_id = selectedLesson.subject_id || selectedLesson.id || 1;
        }
        if (!formData.group_id && selectedLesson) {
            formData.group_id = selectedLesson.group_id || 1;
        }

        console.log('formData после принудительной установки:', formData);

        if (!validate()) {
            console.log('Validation failed');
            return;
        }

        setSubmitting(true);

        const requestData = {
            teacher_id: teacher?.id,
            request_type: formData.request_type,
            timetable_entry_id: formData.timetable_entry_id,
            title: formData.title,
            description: formData.description,
            requested_teacher_id: formData.requested_teacher_id || null,
            requested_room_id: formData.requested_room_id || null,
            requested_date: formData.requested_date || null,
            requested_pair_number: formData.requested_pair_number ? parseInt(formData.requested_pair_number) : null,
            subject_id: formData.subject_id || null,
            group_id: formData.group_id || null,
            subgroup_id: formData.group_type === 'subgroup' ? formData.subgroup_id : null,
            priority: formData.priority,
            selected_date: selectedDate
        };

        console.log('Отправляемые данные:', requestData);

        try {
            const response = await axios.post(`${API_BASE_URL}/requests`, requestData);

            if (response.data.success) {
                onSubmit?.(response.data.data);
                onClose();
            } else {
                alert(response.data.message || '❌ Ошибка при отправке заявки');
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            alert(error.response?.data?.message || '❌ Ошибка при отправке заявки');
        } finally {
            setSubmitting(false);
        }
    };


    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEmptySlot ? 'Добавление новой пары' : 'Заявка на замену'}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {!isEmptySlot && (
                        <div className="form-group">
                            <label>Тип заявки</label>
                            <select
                                name="request_type"
                                value={formData.request_type}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="replacement">Замена преподавателя</option>
                                <option value="reschedule">Перенос пары</option>
                                <option value="cancel">Отмена пары</option>
                                <option value="wish">Пожелание</option>
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Название заявки</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Краткое описание"
                            className={`form-input ${errors.title ? 'error' : ''}`}
                        />
                        {errors.title && <span className="error-message">{errors.title}</span>}
                    </div>

                    <div className="form-group">
                        <label>Описание</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Подробно опишите предлагаемые изменения..."
                            rows={4}
                            className={`form-textarea ${errors.description ? 'error' : ''}`}
                        />
                        {errors.description && <span className="error-message">{errors.description}</span>}
                    </div>

                    <div className="form-group">
                        <label>Преподаватель</label>
                        <input
                            type="text"
                            value={teacher?.full_name || teacher?.name || 'Не выбран'}
                            disabled
                            className="form-input"
                            style={{ background: '#f5f5f5' }}
                        />
                    </div>

                    {/* Контент для пустого слота */}
                    {isEmptySlot && (
                        <div className="form-group">
                            <label>Предмет *</label>
                            <select
                                name="subject_id"
                                value={formData.subject_id}
                                onChange={handleChange}
                                className={`form-select ${errors.subject_id ? 'error' : ''}`}
                                disabled={loadingSubjects}
                            >
                                <option value="">Выберите предмет</option>
                                {teacherSubjectsList.map(subject => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                            {errors.subject_id && <span className="error-message">{errors.subject_id}</span>}
                        </div>
                    )}

                    {!isEmptySlot && formData.request_type === 'replacement' && (
                        <div className="form-group">
                            <label>Заменяющий преподаватель</label>
                            <select
                                name="requested_teacher_id"
                                value={formData.requested_teacher_id}
                                onChange={handleChange}
                                className={`form-select ${errors.requested_teacher_id ? 'error' : ''}`}
                            >
                                <option value="">Выберите преподавателя</option>
                                {allTeachers?.map(teacher => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.full_name}
                                    </option>
                                ))}
                            </select>
                            {errors.requested_teacher_id && <span className="error-message">{errors.requested_teacher_id}</span>}
                        </div>
                    )}

                    {!isEmptySlot && formData.request_type === 'reschedule' && (
                        <>
                            <div className="form-group">
                                <label>Дата переноса</label>
                                <input
                                    type="date"
                                    name="requested_date"
                                    value={formData.requested_date}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Номер пары</label>
                                <select
                                    name="requested_pair_number"
                                    value={formData.requested_pair_number}
                                    onChange={handleChange}
                                    className={`form-select ${errors.requested_pair_number ? 'error' : ''}`}
                                >
                                    <option value="">Выберите пару</option>
                                    <option value="1">1 пара (08:00 - 09:30)</option>
                                    <option value="2">2 пара (09:50 - 11:20)</option>
                                    <option value="3">3 пара (11:40 - 13:10)</option>
                                    <option value="4">4 пара (13:30 - 15:00)</option>
                                    <option value="5">5 пара (15:10 - 16:40)</option>
                                    <option value="6">6 пара (16:50 - 18:20)</option>
                                </select>
                                {errors.requested_pair_number && <span className="error-message">{errors.requested_pair_number}</span>}
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Приоритет</label>
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="low">Низкий</option>
                            <option value="normal">Обычный</option>
                            <option value="high">Высокий</option>
                            <option value="urgent">Срочный</option>
                        </select>
                    </div>

                    {selectedLesson && (
                        <div className="selected-lesson-info">
                            <div className="info-title">
                                {isEmptySlot ? 'Свободное окно:' : 'Выбранное занятие:'}
                            </div>
                            <div className="info-content">
                                <span>{selectedLesson.number} пара</span>
                                <span>{selectedLesson.time}</span>
                                {!isEmptySlot && selectedLesson.name && (
                                    <span>{selectedLesson.name}</span>
                                )}
                                {!isEmptySlot && selectedLesson.teacher && (
                                    <span>{selectedLesson.teacher}</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose} disabled={submitting}>
                        Отмена
                    </button>
                    <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Отправка...' : (isEmptySlot ? 'Добавить пару' : 'Отправить заявку')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RequestModal;