import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
    isLoggedIn: boolean;
    setIsLoggedIn: (value: boolean) => void;
    checkAuthStatus: () => Promise<boolean>;
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