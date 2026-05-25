import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import SelectorBar from './components/SelectorBar';
import ScheduleHeader from './components/ScheduleHeader';
import LessonList from './components/LessonList';
import Footer from './components/Footer';
import RequestModal from './components/RequestModal';
import TeacherPinModal from './components/TeacherPinModal';
import MyRequests from './components/MyRequests';
import Toast from './components/Toast';
import { useToast } from './hooks/useToast';
import { useScheduleData } from './hooks/useScheduleData';
import { useEntities } from './hooks/useEntities';
import { formatDate } from './utils/dateUtils';
import './App.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

function App() {
    const [currentRole, setCurrentRole] = useState('student');
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState(null);

    const [showPinModal, setShowPinModal] = useState(false);
    const [pendingRole, setPendingRole] = useState(null);

    const [showRequestsModal, setShowRequestsModal] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);

    const { toasts, addToast, removeToast } = useToast();

    const {
        groupsBySpecialty,
        allGroups,
        teachers,
        allSubjects,
        teacherSubjects,
        loading: entitiesLoading,
        error: entitiesError,
        fetchTeacherSubjects,
        fetchGroupsBySubjectAndTeacher,
        groupsBySubject,

        groupSearchQuery,
        groupSearchResults,
        groupSearching,
        searchGroups,

        teacherSearchQuery,
        teacherSearchResults,
        teacherSearching,
        searchTeachers,
    } = useEntities();

    const [selectedGroup, setSelectedGroup] = useState({ id: null, name: '' });
    const [selectedTeacher, setSelectedTeacher] = useState({ id: null, name: '' });

    const loadPendingRequests = async () => {
        if (!selectedTeacher.id) return;
        try {
            const response = await axios.get(`${API_BASE_URL}/requests/teacher/${selectedTeacher.id}`);
            const pending = response.data.data?.filter(r => r.status === 'pending' || r.status === 'draft') || [];
            setPendingRequests(pending);
        } catch (err) {
            console.error('Error loading pending requests:', err);
        }
    };

    useEffect(() => {
        if (allGroups.length > 0 && !selectedGroup.id) {
            setSelectedGroup({ id: allGroups[0].id, name: allGroups[0].name });
        }
    }, [allGroups]);

    useEffect(() => {
        if (teachers.length > 0 && !selectedTeacher.id) {
            setSelectedTeacher({
                id: teachers[0].id,
                name: teachers[0].full_name,
                full_name: teachers[0].full_name,
                short_name: teachers[0].short_name,
                last_name: teachers[0].last_name,
                first_name: teachers[0].first_name,
                middle_name: teachers[0].middle_name
            });
        }
    }, [teachers]);

    useEffect(() => {
        if (currentRole === 'teacher' && selectedTeacher.id) {
            loadPendingRequests();
        }
    }, [currentRole, selectedTeacher.id]);

    const shouldFetch = (currentRole === 'student' && selectedGroup.id) ||
        (currentRole === 'teacher' && selectedTeacher.id);

    const { scheduleData, loading: scheduleLoading, error: scheduleError } = useScheduleData(
        shouldFetch ? selectedDate : null,
        currentRole,
        selectedGroup.id,
        selectedTeacher.id
    );

    const handleRoleChange = (role) => {
        if (role === 'teacher') {
            setPendingRole(role);
            setShowPinModal(true);
        } else {
            setCurrentRole(role);
        }
    };

    const handlePinSuccess = () => {
        setShowPinModal(false);
        setCurrentRole('teacher');
        setPendingRole(null);
        addToast('Доступ к вкладке преподавателя открыт', 'success', 3000);
    };

    const handlePinClose = () => {
        setShowPinModal(false);
        setPendingRole(null);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleGroupChange = (groupId) => {
        const group = allGroups.find(g => g.id === parseInt(groupId));
        if (group) {
            setSelectedGroup({ id: group.id, name: group.name });
        }
    };

    const handleTeacherChange = (teacherId) => {
        const teacher = teachers.find(t => t.id === parseInt(teacherId));
        if (teacher) {
            setSelectedTeacher({
                id: teacher.id,
                name: teacher.full_name,
                full_name: teacher.full_name,
                short_name: teacher.short_name,
                last_name: teacher.last_name,
                first_name: teacher.first_name,
                middle_name: teacher.middle_name
            });
        }
    };

    const handleLessonRequest = (lesson) => {
        if (currentRole !== 'teacher') {
            setPendingRole('teacher');
            setShowPinModal(true);
            return;
        }
        setSelectedLesson(lesson);
        setModalOpen(true);
    };

    const handleRequestSubmit = async (requestData) => {
        console.log('Заявка отправлена:', requestData);
        await loadPendingRequests();
        addToast('Заявка успешно отправлена!', 'success', 3000);
    };

    const formattedDate = formatDate(selectedDate);

    if (entitiesLoading) {
        return <div className="container"><div className="loading">Загрузка данных...</div></div>;
    }

    if (entitiesError) {
        return <div className="container"><div className="error">Ошибка: {entitiesError}</div></div>;
    }

    return (
        <div className="container">
            <Header
                currentRole={currentRole}
                onRoleChange={handleRoleChange}
                onShowRequests={() => setShowRequestsModal(true)}
            />

            <SelectorBar
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                currentRole={currentRole}
                groupsBySpecialty={groupsBySpecialty}
                allGroups={allGroups}
                teachers={teachers}
                selectedGroup={selectedGroup.id}
                onGroupChange={handleGroupChange}
                selectedTeacher={selectedTeacher.id}
                onTeacherChange={handleTeacherChange}

                groupSearchQuery={groupSearchQuery}
                groupSearchResults={groupSearchResults}
                groupSearching={groupSearching}
                searchGroups={searchGroups}

                teacherSearchQuery={teacherSearchQuery}
                teacherSearchResults={teacherSearchResults}
                teacherSearching={teacherSearching}
                searchTeachers={searchTeachers}
            />

            {scheduleData?.fullRemote && (
                <div className="group-remote-badge">
                    🏠 Вся группа на дистанционном обучении
                </div>
            )}

            <ScheduleHeader
                entityName={currentRole === 'student' ? selectedGroup.name : selectedTeacher.name}
                formattedDate={formattedDate}
                selectedDate={selectedDate}
            />

            {scheduleLoading && <div className="loading">Загрузка расписания...</div>}
            {scheduleError && <div className="error">Ошибка: {scheduleError}</div>}

            {!scheduleLoading && !scheduleError && (
                <LessonList
                    lessons={scheduleData?.lessons || []}
                    role={currentRole}
                    onLessonRequest={handleLessonRequest}
                    selectedDate={selectedDate}
                    pendingRequests={pendingRequests}
                />
            )}

            <Footer />

            <RequestModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                teacher={selectedTeacher}
                selectedLesson={selectedLesson}
                onSubmit={handleRequestSubmit}
                allTeachers={teachers}
                allGroups={allGroups}
                fetchTeacherSubjects={fetchTeacherSubjects}
                teacherSubjects={teacherSubjects}
                fetchGroupsBySubjectAndTeacher={fetchGroupsBySubjectAndTeacher}
                selectedDate={selectedDate}
            />

            <TeacherPinModal
                isOpen={showPinModal}
                onSuccess={handlePinSuccess}
                onClose={handlePinClose}
            />

            <MyRequests
                teacherId={selectedTeacher.id}
                isOpen={showRequestsModal}
                onClose={() => setShowRequestsModal(false)}
            />

            {/*<LessonList*/}
            {/*    lessons={scheduleData?.lessons || []}*/}
            {/*    role={currentRole}*/}
            {/*    onLessonRequest={handleLessonRequest}*/}
            {/*    selectedDate={selectedDate}*/}
            {/*    pendingRequests={pendingRequests}*/}
            {/*    selectedGroup={selectedGroup.id}*/}
            {/*/>*/}
            {/* Toast уведомления */}
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}

export default App;