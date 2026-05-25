import React from 'react';

const ChangesColumn = ({ changes }) => {
    if (!changes) return <div className="changes-column"></div>;

    // Замена преподавателя/кабинета/предмета
    if (changes.type === 'replacement') {
        return (
            <div className="changes-column">
                <div className="change-badge change-replacement">
                    Замена
                </div>
                <div className="change-details">
                    {changes.now.teacher && changes.was.teacher && changes.now.teacher !== changes.was.teacher && (
                        <div className="change-detail-row">
                            <span className="change-detail-label">Преподаватель</span>
                            <span className="change-detail-value highlight">{changes.now.teacher}</span>
                        </div>
                    )}
                    {changes.now.subject && changes.was.subject && changes.now.subject !== changes.was.subject && (
                        <div className="change-detail-row">
                            <span className="change-detail-label">Предмет</span>
                            <span className="change-detail-value highlight">{changes.now.subject}</span>
                        </div>
                    )}
                    {changes.now.room && changes.was.room && changes.now.room !== changes.was.room && (
                        <div className="change-detail-row">
                            <span className="change-detail-label">Кабинет</span>
                            <span className="change-detail-value highlight">{changes.now.room}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Перенос пары
    if (changes.type === 'rescheduled') {
        return (
            <div className="changes-column">
                <div className="change-badge change-rescheduled">
                     Перенос
                </div>
                <div className="change-details">
                    <div className="change-detail-row">
                        <span className="change-detail-label">Перенесено на</span>
                        <span className="change-detail-value highlight">
                            {changes.now.number} пару ({changes.now.time})
                        </span>
                    </div>
                    {changes.now.teacher && changes.now.teacher !== changes.was?.teacher && (
                        <div className="change-detail-row">
                            <span className="change-detail-label">Преподаватель</span>
                            <span className="change-detail-value highlight">{changes.now.teacher}</span>
                        </div>
                    )}
                    {changes.now.room && changes.now.room !== changes.was?.room && (
                        <div className="change-detail-row">
                            <span className="change-detail-label">Кабинет</span>
                            <span className="change-detail-value highlight">{changes.now.room}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // НОВАЯ ПАРА - этот блок должен быть
    if (changes.type === 'new') {
        return (
            <div className="changes-column">
                <div className="change-badge change-new">
                    Новая пара
                </div>
                <div className="change-details">
                    <div className="change-detail-row">
                        <span className="change-detail-label">Время</span>
                        <span className="change-detail-value">
                            {changes.now.number} пара ({changes.now.time})
                        </span>
                    </div>
                    {changes.now.teacher && (
                        <div className="change-detail-row">
                            <span className="change-detail-label">Преподаватель</span>
                            <span className="change-detail-value">{changes.now.teacher}</span>
                        </div>
                    )}
                    {changes.now.subject && (
                        <div className="change-detail-row">
                            <span className="change-detail-label">Предмет</span>
                            <span className="change-detail-value">{changes.now.subject}</span>
                        </div>
                    )}
                    {changes.now.room && (
                        <div className="change-detail-row">
                            <span className="change-detail-label">Кабинет</span>
                            <span className="change-detail-value">{changes.now.room}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Отмена
    if (changes.type === 'cancelled') {
        return (
            <div className="changes-column">
                <div className="change-badge change-cancelled">
                     Отмена
                </div>
            </div>
        );
    }

    return <div className="changes-column"></div>;
};

export default ChangesColumn;