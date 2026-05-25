import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Время пар по умолчанию
const DEFAULT_PAIR_TIMES = {
    1: '08:00 - 09:30',
    2: '09:50 - 11:20',
    3: '11:40 - 13:10',
    4: '13:30 - 15:00',
    5: '15:10 - 16:40',
    6: '16:50 - 18:20'
};

export const useScheduleData = (date, role, groupId, teacherId) => {
    const [scheduleData, setScheduleData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSchedule = async () => {
            if (!date) {
                console.log('No date provided');
                return;
            }

            if (role === 'student' && !groupId) {
                console.log('No group selected yet');
                setScheduleData({ lessons: [] });
                return;
            }

            if (role === 'teacher' && !teacherId) {
                console.log('No teacher selected yet');
                setScheduleData({ lessons: [] });
                return;
            }

            setLoading(true);
            setError(null);

            try {
                let response;

                if (role === 'student') {
                    console.log('Fetching group schedule:', { groupId, date });
                    response = await axios.get(`${API_BASE_URL}/schedule/group`, {
                        params: {
                            group_id: groupId,
                            date: date
                        }
                    });
                } else {
                    console.log('Fetching teacher schedule:', { teacherId, date });
                    response = await axios.get(`${API_BASE_URL}/schedule/teacher`, {
                        params: {
                            teacher_id: teacherId,
                            date: date
                        }
                    });
                }

                console.log('API Response:', response.data);
                const transformedData = transformApiData(response.data, role);
                setScheduleData(transformedData);

            } catch (err) {
                console.error('API Error:', err);
                console.error('Error response:', err.response?.data);
                setError(err.response?.data?.message || err.message || 'Ошибка загрузки расписания');
                setScheduleData({ lessons: [] });
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [date, role, groupId, teacherId]);

    return { scheduleData, loading, error };
};

const transformApiData = (apiResponse, role) => {
    // Создаем массив всех возможных пар (1-6)
    const allPairSlots = [1, 2, 3, 4, 5, 6];

    // Получаем реальные уроки из API
    const existingLessons = apiResponse.lessons || [];

    // Создаем карту существующих уроков по номеру пары (чтобы не было дублей)
    const lessonsMap = new Map();
    existingLessons.forEach(lesson => {
        lessonsMap.set(lesson.number, lesson);
    });

    // Формируем полный список, заполняя пустые слоты
    const allLessons = allPairSlots.map(pairNumber => {
        const existingLesson = lessonsMap.get(pairNumber);

        if (existingLesson) {
            // Существующий урок - только один!
            return {
                number: existingLesson.number,
                time: existingLesson.time,
                name: existingLesson.name,
                teacher: existingLesson.teacher_full || existingLesson.teacher,
                group: existingLesson.group,
                group_id: existingLesson.group_id,
                subject_id: existingLesson.subject_id,
                room: existingLesson.room,
                meta: existingLesson.meta || '',
                place: existingLesson.place || '',
                status: existingLesson.status === 'cancelled' ? 'cancelled' : undefined,
                changes: existingLesson.changes,
                isEmpty: false
            };
        } else {
            // Пустой слот
            return {
                number: pairNumber,
                time: DEFAULT_PAIR_TIMES[pairNumber],
                name: '',
                teacher: '',
                group: '',
                room: '',
                meta: '',
                place: '',
                status: 'empty',
                changes: null,
                isEmpty: true
            };
        }
    });

    return {
        fullRemote: false,
        lessons: allLessons
    };
};

const formatMeta = (lesson) => {
    const parts = [];

    if (lesson.teacher) {
        parts.push(lesson.teacher);
    }

    if (lesson.room && !lesson.is_remote) {
        parts.push(`• ${lesson.room}`);
    }

    if (lesson.is_remote) {
        parts.push('• 🏠 Дистант');
    }

    return parts.join(' ');
};