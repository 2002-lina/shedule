import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const useEntities = () => {
    const [groupsBySpecialty, setGroupsBySpecialty] = useState([]);
    const [allGroups, setAllGroups] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);
    const [teacherSubjects, setTeacherSubjects] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Для поиска групп
    const [groupSearchQuery, setGroupSearchQuery] = useState('');
    const [groupSearchResults, setGroupSearchResults] = useState([]);
    const [groupSearching, setGroupSearching] = useState(false);

    // Для поиска преподавателей
    const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
    const [teacherSearchResults, setTeacherSearchResults] = useState([]);
    const [teacherSearching, setTeacherSearching] = useState(false);

    useEffect(() => {
        const fetchEntities = async () => {
            try {
                console.log('Fetching groups, teachers and subjects...');

                const [groupsRes, teachersRes, subjectsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/groups`),
                    axios.get(`${API_BASE_URL}/teachers`),
                    axios.get(`${API_BASE_URL}/subjects`)
                ]);

                console.log('Groups response:', groupsRes.data);
                console.log('Teachers response:', teachersRes.data);
                console.log('Subjects response:', subjectsRes.data);

                setGroupsBySpecialty(groupsRes.data.data || []);
                setAllGroups(groupsRes.data.all_groups || []);
                setTeachers(teachersRes.data.data || []);
                setAllSubjects(subjectsRes.data.data || []);

            } catch (err) {
                console.error('Error fetching entities:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEntities();
    }, []);

    // Загрузка предметов преподавателя
    const fetchTeacherSubjects = async (teacherId) => {
        if (!teacherId) return [];

        // Если уже загружены, возвращаем из кэша
        if (teacherSubjects[teacherId]) {
            return teacherSubjects[teacherId];
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/teachers/${teacherId}/subjects`);
            const subjectsList = response.data.data || [];

            setTeacherSubjects(prev => ({
                ...prev,
                [teacherId]: subjectsList
            }));

            return subjectsList;
        } catch (err) {
            console.error('Error fetching teacher subjects:', err);
            return [];
        }
    };

    // Поиск групп
    const searchGroups = async (query) => {
        setGroupSearchQuery(query);

        if (!query || query.length < 2) {
            setGroupSearchResults([]);
            return;
        }

        setGroupSearching(true);
        try {
            const results = allGroups.filter(group =>
                group.name.toLowerCase().includes(query.toLowerCase()) ||
                (group.specialty && group.specialty.toLowerCase().includes(query.toLowerCase()))
            );
            setGroupSearchResults(results.slice(0, 10));
        } catch (err) {
            console.error('Group search error:', err);
        } finally {
            setGroupSearching(false);
        }
    };

    // Поиск преподавателей
    const searchTeachers = async (query) => {
        setTeacherSearchQuery(query);

        if (!query || query.length < 2) {
            setTeacherSearchResults([]);
            return;
        }

        setTeacherSearching(true);
        try {
            const results = teachers.filter(teacher =>
                teacher.full_name.toLowerCase().includes(query.toLowerCase()) ||
                teacher.short_name.toLowerCase().includes(query.toLowerCase()) ||
                teacher.last_name.toLowerCase().includes(query.toLowerCase())
            );
            setTeacherSearchResults(results.slice(0, 10));
        } catch (err) {
            console.error('Teacher search error:', err);
        } finally {
            setTeacherSearching(false);
        }
    };
    const [groupsBySubject, setGroupsBySubject] = useState({});

// Загрузка групп по выбранному предмету и преподавателю
    const fetchGroupsBySubjectAndTeacher = async (teacherId, subjectId) => {
        if (!teacherId || !subjectId) return [];

        const cacheKey = `${teacherId}_${subjectId}`;

        // Если уже загружены, возвращаем из кэша
        if (groupsBySubject[cacheKey]) {
            return groupsBySubject[cacheKey];
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/groups/by-subject-and-teacher`, {
                params: { teacher_id: teacherId, subject_id: subjectId }
            });

            const data = response.data.data;
            const groupsList = [...data.groups, ...data.subgroups];

            setGroupsBySubject(prev => ({
                ...prev,
                [cacheKey]: groupsList
            }));

            return groupsList;
        } catch (err) {
            console.error('Error fetching groups by subject:', err);
            return [];
        }
    };

    return {
        groupsBySpecialty,
        allGroups,
        teachers,
        allSubjects,
        teacherSubjects,
        loading,
        error,
        fetchTeacherSubjects,

        // Для групп
        groupSearchQuery,
        groupSearchResults,
        groupSearching,
        searchGroups,

        // Для преподавателей
        teacherSearchQuery,
        teacherSearchResults,
        teacherSearching,
        searchTeachers,


        fetchGroupsBySubjectAndTeacher,
        groupsBySubject
    };
};