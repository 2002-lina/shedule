import React from 'react';

const Header = ({ currentRole, onRoleChange, onShowRequests }) => {
    return (
        <div className="header">
            <div className="logo-area">
                <div className="brand-mark">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4H20V20H4V4Z" stroke="#4F46E5" strokeWidth="1.2" strokeLinejoin="round"/>
                        <path d="M8 8H16" stroke="#4F46E5" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M8 12H14" stroke="#4F46E5" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M8 16H12" stroke="#4F46E5" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                </div>
                <div className="logo-text">
                    <h1>SHEDULIX</h1>
                    <p>Расписание НГК</p>
                </div>
            </div>

            <div className="role-tabs">
                <button
                    className={`role-tab ${currentRole === 'student' ? 'active' : ''}`}
                    onClick={() => onRoleChange('student')}
                >
                    Студент
                </button>
                <button
                    className={`role-tab ${currentRole === 'teacher' ? 'active' : ''}`}
                    onClick={() => onRoleChange('teacher')}
                >
                    Преподаватель
                </button>
                {currentRole === 'teacher' && (
                    <button
                        className="role-tab"
                        onClick={onShowRequests}
                    >
                        Мои заявки
                    </button>
                )}
            </div>
        </div>
    );
};

export default Header;