import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export function useNotification() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
    const [notification, setNotification] = useState(null);

    const showNotification = useCallback((message, type = 'info', duration = 5000) => {
        const id = Date.now();
        setNotification({ id, message, type });

        setTimeout(() => {
            setNotification(prev => (prev && prev.id === id ? null : prev));
        }, duration);
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.type === 'success' && <span className="material-symbols-outlined">check_circle</span>}
                    {notification.type === 'error' && <span className="material-symbols-outlined">error</span>}
                    {notification.type === 'warning' && <span className="material-symbols-outlined">warning</span>}
                    {notification.type === 'info' && <span className="material-symbols-outlined">info</span>}
                    <span>{notification.message}</span>
                </div>
            )}
        </NotificationContext.Provider>
    );
}
