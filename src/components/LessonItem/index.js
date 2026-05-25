import React, { useState, useEffect } from 'react';
import ChangesColumn from '../ChangesColumn';

const LessonItem = ({ lesson, role, onRequest, selectedDate, pendingRequests = [], selectedGroup }) => {
    const [hasPendingRequest, setHasPendingRequest] = useState(false);

    const cancelledClass = lesson.status === 'cancelled' ? 'cancelled' : '';
    const isEmpty = lesson.isEmpty;

    const today = new Date().toISOString().split('T')[0];
    const isToday = selectedDate === today;
    const isPast = selectedDate < today;
    const canRequest = role === 'teacher' && !isToday && !isPast && !hasPendingRequest;

    // Обогащаем lesson дополнительными полями для заявок
    const enrichedLesson = {
        ...lesson,
        subject_id: lesson.subject_id || lesson.id || null,
        group_id: lesson.group_id || selectedGroup || null,
        subject_name: lesson.name || lesson.subject,
        teacher_name: lesson.teacher
    };

    console.log('🔍 enrichedLesson в LessonItem:', enrichedLesson);

    // Проверяем, есть ли уже заявка на это занятие
    useEffect(() => {
        if (pendingRequests && lesson.id) {
            const hasRequest = pendingRequests.some(req =>
                req.timetable_entry_id === lesson.id &&
                (req.status === 'pending' || req.status === 'draft')
            );
            setHasPendingRequest(hasRequest);
        }
    }, [pendingRequests, lesson.id]);

    const formatTimeDisplay = (time) => {
        if (time && typeof time === 'object' && time.range) {
            return time.range;
        }
        if (time && typeof time === 'string' && time.includes(' - ')) {
            return time;
        }
        return time || '';
    };

    // Для пустых слотов
    if (isEmpty) {
        return (
            <div className="lesson-item empty-slot">
                <div className="lesson-time">
                    <span className="lesson-number">{lesson.number} пара</span>
                    <span className="lesson-time-range">
                        {lesson.time?.range || lesson.time}
                    </span>
                </div>
                <div className="lesson-info" />
                <div className="lesson-actions">
                    {role === 'teacher' && canRequest && (
                        <button
                            className="request-btn add-btn active"
                            onClick={() => onRequest?.(enrichedLesson)}
                            title="Добавить новую пару"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M12 4V20M20 12H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <span>Добавить пару</span>
                        </button>
                    )}
                    {hasPendingRequest && (
                        <button className="request-btn disabled" disabled>
                            ⏳ Заявка отправлена
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Для отмененных
    if (lesson.status === 'cancelled') {
        return (
            <div className={`lesson-item ${cancelledClass}`}>
                <div className="lesson-time">
                    <span className="lesson-number">{lesson.number} пара</span>
                    <span className="lesson-time-range">
                        {formatTimeDisplay(lesson.time)}
                    </span>
                </div>
                <div className="lesson-info">
                    <div className="lesson-name-wrapper">
                        <span className="lesson-name">{lesson.name}</span>
                    </div>
                    <div className="lesson-meta">{lesson.meta}</div>
                </div>
                <ChangesColumn changes={{ type: 'cancelled' }} />
            </div>
        );
    }

    // Для обычных занятий
    return (
        <div className="lesson-item">
            <div className="lesson-time">
                <span className="lesson-number">{lesson.number} пара</span>
                <span className="lesson-time-range">
                    {formatTimeDisplay(lesson.time)}
                </span>
            </div>
            <div className="lesson-info">
                <div className="lesson-name-wrapper">
                    <span className="lesson-name">{lesson.name}</span>
                </div>
                <div className="lesson-meta">{lesson.meta}</div>
                {lesson.place && <div className="lesson-meta">{lesson.place}</div>}
            </div>
            <div className="lesson-actions">
                <ChangesColumn changes={lesson.changes} />
                {role === 'teacher' && canRequest && lesson.status !== 'cancelled' && (
                    <button
                        className="request-btn active"
                        onClick={() => onRequest?.(enrichedLesson)}
                        title="Подать заявку на замену"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M12 4V20M20 12H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                        <span>Заявка</span>
                    </button>
                )}
                {hasPendingRequest && (
                    <button className="request-btn disabled" disabled>
                        ⏳ Заявка отправлена
                    </button>
                )}
            </div>
        </div>
    );
};

export default LessonItem;