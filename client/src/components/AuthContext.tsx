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

    const login = async (formData: FormData): Promise<{success: boolean, error?: string}> => {
        try {
            const response = await fetch('/api/login/', {
                method: 'POST',
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
            const response = await fetch('/api/check-auth/', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                const isAuthenticated = data.authenticated;
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