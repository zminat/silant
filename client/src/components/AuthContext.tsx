import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
    isLoggedIn: boolean;
    setIsLoggedIn: (value: boolean) => void;
    login: (formData: FormData) => Promise<{success: boolean, error?: string}>;
    checkAuthStatus: () => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const getCookie = (name:string):string => {
        let cookieValue = '';
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith(`${name}=`)) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }

        return cookieValue;
    }

    const login = async (formData: FormData): Promise<{success: boolean, error?: string}> => {
        try {
            const response = await fetch('/api/auth/login/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken') || '',
                },
                credentials: 'include',
                body: formData
            });

            if (response.ok) {
                setIsLoggedIn(true);
                return { success: true };
            } else {
                return {
                    success: false,
                    error: "Неверное имя пользователя или пароль"
                };
            }
        } catch (error) {
            console.error("Ошибка авторизации:", error);
            return {
                success: false,
                error: "Ошибка при попытке входа"
            };
        }
    };

    const checkAuthStatus = async (): Promise<boolean> => {
        try {
            const response = await fetch('/api/auth/user/', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                const isAuthenticated = Boolean(data?.username);
                setIsLoggedIn(isAuthenticated);
                return isAuthenticated;
            } else {
                console.error('Ошибка при проверке авторизации:', response.statusText);
                setIsLoggedIn(false);
                return false;
            }
        } catch (error) {
            console.error('Ошибка при проверке авторизации:', error);
            setIsLoggedIn(false);
            return false;
        }
    };

    const logout = async () => {
        try {
            const response = await fetch('/api/auth/logout/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken') || '',
                },
            });

            if (response.ok) {
                setIsLoggedIn(false);
            } else {
                console.error('Ошибка при выходе из системы');
            }
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    return (
        <AuthContext.Provider value={{
            isLoggedIn,
            setIsLoggedIn,
            login,
            checkAuthStatus,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};