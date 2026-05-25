import React, { useState, useEffect, useRef } from 'react';

const SelectorBar = ({
                         selectedDate,
                         onDateChange,
                         currentRole,
                         groupsBySpecialty,
                         allGroups,
                         teachers,
                         selectedGroup,
                         onGroupChange,
                         selectedTeacher,
                         onTeacherChange,

                         // Поиск групп
                         groupSearchQuery,
                         groupSearchResults,
                         groupSearching,
                         searchGroups,

                         // Поиск преподавателей
                         teacherSearchQuery,
                         teacherSearchResults,
                         teacherSearching,
                         searchTeachers
                     }) => {
    const [showGroupSearch, setShowGroupSearch] = useState(false);
    const [showTeacherSearch, setShowTeacherSearch] = useState(false);


    const groupSearchRef = useRef(null);
    const teacherSearchRef = useRef(null);

    // Закрытие поиска групп при клике вне
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (groupSearchRef.current && !groupSearchRef.current.contains(event.target)) {
                setShowGroupSearch(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Закрытие поиска преподавателей при клике вне
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (teacherSearchRef.current && !teacherSearchRef.current.contains(event.target)) {
                setShowTeacherSearch(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleGroupSearchChange = (e) => {
        const query = e.target.value;
        searchGroups(query);
    };

    const handleSelectGroup = (groupId, groupName) => {
        onGroupChange(groupId);
        setShowGroupSearch(false);
        searchGroups(''); // Очищаем поиск
    };

    const handleTeacherSearchChange = (e) => {
        const query = e.target.value;
        searchTeachers(query);
    };

    const handleSelectTeacher = (teacherId, teacherFullName) => {
        onTeacherChange(teacherId);
        setShowTeacherSearch(false);
        searchTeachers(''); // Очищаем поиск
    };

    // Функция для получения кода специальности
    const getSpecialtyCode = (specialty) => {
        if (!specialty) return '';
        if (typeof specialty === 'object' && specialty.code) return specialty.code;
        if (typeof specialty === 'string') {
            const codeMatch = specialty.match(/^(\d{2}\.\d{2}\.\d{2})/);
            return codeMatch ? codeMatch[1] : specialty.slice(0, 8) + '…';
        }
        return specialty;
    };

    return (
        <div className="selector-bar">
            <div className="date-selector">
                <label>Дата:</label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => onDateChange(e.target.value)}
                />
            </div>

            {currentRole === 'student' && (
                <div className="entity-selector" ref={groupSearchRef}>
                    <label>Группа:</label>
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Поиск группы..."
                            value={groupSearchQuery}
                            onChange={handleGroupSearchChange}
                            onFocus={() => setShowGroupSearch(true)}
                        />

                        {showGroupSearch && (
                            <div className="search-results">
                                {groupSearching && (
                                    <div className="search-loading">Поиск...</div>
                                )}

                                {!groupSearching && groupSearchResults.length > 0 && (
                                    <>
                                        <div className="search-results-header">
                                            Найдено групп: {groupSearchResults.length}
                                        </div>
                                        {groupSearchResults.map(group => (
                                            <div
                                                key={group.id}
                                                className="search-result-item"
                                                onClick={() => handleSelectGroup(group.id, group.name)}
                                            >
                                                <span className="group-name">{group.name}</span>
                                                <span className="group-specialty-code">
                                                    {getSpecialtyCode(group.specialty)}
                                                </span>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {!groupSearching && groupSearchQuery.length >= 2 && groupSearchResults.length === 0 && (
                                    <div className="search-no-results">Группы не найдены</div>
                                )}

                                {!groupSearchQuery && groupsBySpecialty.map((specialtyGroup, idx) => (
                                    <div key={idx} className="specialty-group">
                                        <div className="specialty-header">
                                            {specialtyGroup.specialty}
                                        </div>
                                        {specialtyGroup.groups.map(group => (
                                            <div
                                                key={group.id}
                                                className={`search-result-item ${selectedGroup === group.id ? 'active' : ''}`}
                                                onClick={() => handleSelectGroup(group.id, group.name)}
                                            >
                                                <span className="group-name">{group.name}</span>
                                                <span className="group-course">{group.course} курс</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}


            {currentRole === 'teacher' && (
                <div className="entity-selector" ref={teacherSearchRef}>
                    <label>Преподаватель:</label>
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Поиск преподавателя..."
                            value={teacherSearchQuery}
                            onChange={handleTeacherSearchChange}
                            onFocus={() => setShowTeacherSearch(true)}
                        />

                        {showTeacherSearch && (
                            <div className="search-results">
                                {teacherSearching && (
                                    <div className="search-loading">Поиск...</div>
                                )}

                                {!teacherSearching && teacherSearchResults.length > 0 && (
                                    <>
                                        <div className="search-results-header">
                                            Найдено преподавателей: {teacherSearchResults.length}
                                        </div>
                                        {teacherSearchResults.map(teacher => (
                                            <div
                                                key={teacher.id}
                                                className={`search-result-item ${selectedTeacher === teacher.id ? 'active' : ''}`}
                                                onClick={() => handleSelectTeacher(teacher.id, teacher.full_name)}
                                            >
                                                <span className="teacher-name">{teacher.full_name}</span>
                                                {/* Убрали teacher-short */}
                                            </div>
                                        ))}
                                    </>
                                )}

                                {!teacherSearching && teacherSearchQuery.length >= 2 && teacherSearchResults.length === 0 && (
                                    <div className="search-no-results">Преподаватели не найдены</div>
                                )}

                                {!teacherSearchQuery && (
                                    <>
                                        <div className="search-results-header">
                                            Все преподаватели ({teachers.length})
                                        </div>
                                        {teachers.map(teacher => (
                                            <div
                                                key={teacher.id}
                                                className={`search-result-item ${selectedTeacher === teacher.id ? 'active' : ''}`}
                                                onClick={() => handleSelectTeacher(teacher.id, teacher.full_name)}
                                            >
                                                <span className="teacher-name">{teacher.full_name}</span>
                                                {/* Убрали teacher-short */}
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SelectorBar;