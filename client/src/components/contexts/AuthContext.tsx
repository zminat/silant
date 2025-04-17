import {createContext, useContext, useState, useEffect, ReactNode} from "react";
import {getCookie} from "../../utils/utils.ts";
import {NavigateFunction} from "react-router-dom";

interface UserInfo {
    username: string;
    userType: 'client' | 'service_company' | 'manager' | null;
    organizationName: string | null;
}

interface AuthContextType {
    isLoggedIn: boolean;
    setIsLoggedIn: (value: boolean) => void;
    userInfo: UserInfo | null;
    setUserInfo: (value: UserInfo | null) => void;
    login: (formData: FormData) => Promise<{ success: boolean, error?: string }>;
    checkAuthStatus: () => Promise<boolean>;
    logout: (redirectCallback?: NavigateFunction) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    const login = async (formData: FormData): Promise<{ success: boolean, error?: string }> => {
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
                await fetchUserInfo();
                return {success: true};
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

    const fetchUserInfo = async () => {
        try {
            const response = await fetch('/api/auth/user/info/', {
                headers: {
                    'X-CSRFToken': getCookie('csrftoken') || '',
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setUserInfo(data);
            }
        } catch (error) {
            console.error("Ошибка получения информации о пользователе:", error);
        }
    };

    const checkAuthStatus = async (): Promise<boolean> => {
        try {
            const response = await fetch('/api/auth/user/', {
                headers: {
                    'X-CSRFToken': getCookie('csrftoken') || '',
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                const isAuthenticated = Boolean(data?.username);
                setIsLoggedIn(isAuthenticated);

                if (isAuthenticated) {
                    await fetchUserInfo();
                }

                return isAuthenticated;
            } else {
                setIsLoggedIn(false);
                setUserInfo(null);
                return false;
            }
        } catch (error) {
            setIsLoggedIn(false);
            setUserInfo(null);
            return false;
        }
    };

    const logout = async (redirectCallback?: NavigateFunction) => {
        try {
            const response = await fetch('/api/auth/logout/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken') || '',
                },
            });

            if (response.ok) {
                setIsLoggedIn(false);
                setUserInfo(null);

                if (redirectCallback) {
                    redirectCallback('/');
                }
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
            userInfo,
            setUserInfo,
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