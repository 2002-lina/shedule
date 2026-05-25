import React from 'react';
import LessonItem from '../LessonItem';

const LessonList = ({ lessons, role, onLessonRequest, selectedDate, pendingRequests, selectedGroup }) => {
    return (
        <div id={role === 'student' ? 'studentSchedule' : 'teacherSchedule'}>
            <div className="lessons-list">
                {lessons.map((lesson, index) => (
                    <LessonItem
                        key={index}
                        lesson={lesson}
                        role={role}
                        onRequest={onLessonRequest}
                        selectedDate={selectedDate}
                        pendingRequests={pendingRequests}
                        selectedGroup={selectedGroup}
                    />
                ))}
            </div>
        </div>
    );
};

export default LessonList;