import { useState } from "react";
import "../styles/LoginModal.css";
import { useAuth } from "./AuthContext.tsx";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (success: boolean) => void;
}

function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoginError("");
        const formData = new FormData(e.currentTarget);

        const result = await login(formData);

        if (result.success) {
            onLogin(true);
            setUsername("");
            setPassword("");
            onClose();
        } else {
            setLoginError(result.error || "Ошибка при попытке входа");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Авторизация</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Имя пользователя:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Пароль:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {loginError && (
                        <div className="error-message">{loginError}</div>
                    )}
                    <div className="modal-footer">
                        <button type="submit" className="login-submit-button">Войти</button>
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onClose}
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginModal;