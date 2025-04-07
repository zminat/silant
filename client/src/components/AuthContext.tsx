import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
    isLoggedIn: boolean;
    setIsLoggedIn: (value: boolean) => void;
    checkAuthStatus: () => Promise<boolean>;
    getCookie: (name:string) => string;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const checkAuthStatus = async (): Promise<boolean> => {
        try {
            const response = await fetch('/api/check-auth/', {
                credentials: 'include'
            });

            const isAuthenticated = response.ok;
            setIsLoggedIn(isAuthenticated);
            return isAuthenticated;
        } catch (error) {
            console.error('Ошибка при проверке авторизации:', error);
            setIsLoggedIn(false);
            return false;
        }
    };

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

    const logout = async () => {
        try {
            const response = await fetch('/api/logout/', {
                method: 'GET'
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
            checkAuthStatus,
            getCookie,
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