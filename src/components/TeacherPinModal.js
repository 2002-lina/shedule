import React, { useState, useEffect, useRef } from 'react';
import './TeacherAuthModal.css';

const TeacherPinModal = ({ isOpen, onSuccess, onClose }) => {
    const [pin, setPin] = useState(['', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRefs = [useRef(), useRef(), useRef(), useRef()];

    // Секретный PIN-код (никто не видит в коде)
    const SECRET_PIN = '4829'; // <-- ТВОЙ НОВЫЙ PIN-КОД

    useEffect(() => {
        if (isOpen) {
            setPin(['', '', '', '']);
            setError('');
            setLoading(false);

            setTimeout(() => {
                inputRefs[0].current?.focus();
            }, 100);
        }
    }, [isOpen]);

    const handlePinChange = (index, value) => {
        if (value && !/^\d+$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value.slice(-1);
        setPin(newPin);

        if (value && index < 3) {
            inputRefs[index + 1].current?.focus();
        }

        if (error) setError('');
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const enteredPin = pin.join('');

        if (enteredPin.length !== 4) {
            setError('Введите 4-значный PIN-код');
            return;
        }

        setError('');
        setLoading(true);

        setTimeout(() => {
            if (enteredPin === SECRET_PIN) {
                onSuccess();
                onClose();
            } else {
                setError('Неверный PIN-код');
                setPin(['', '', '', '']);
                inputRefs[0].current?.focus();
            }
            setLoading(false);
        }, 500);
    };

    if (!isOpen) return null;

    return (
        <div className="teacher-auth-overlay" onClick={onClose}>
            <div className="teacher-auth-modal" onClick={(e) => e.stopPropagation()}>
                <div className="auth-header">
                    <div className="auth-icon">🔐</div>
                    <h2>Доступ преподавателя</h2>
                    <p>Введите 4-значный PIN-код</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="pin-inputs">
                        {[0, 1, 2, 3].map((index) => (
                            <input
                                key={index}
                                ref={inputRefs[index]}
                                type="password"
                                maxLength="1"
                                value={pin[index]}
                                onChange={(e) => handlePinChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className={`pin-digit ${error ? 'error' : ''}`}
                                autoComplete="off"
                                disabled={loading}
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="auth-error">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="auth-buttons">
                        <button type="button" className="auth-btn-cancel" onClick={onClose} disabled={loading}>
                            Отмена
                        </button>
                        <button type="submit" className="auth-btn-submit" disabled={loading}>
                            {loading ? 'Проверка...' : 'Войти'}
                        </button>
                    </div>
                </form>

                <div className="auth-footer">
                    <span>Только для преподавателей</span>
                </div>
            </div>
        </div>
    );
};

export default TeacherPinModal;