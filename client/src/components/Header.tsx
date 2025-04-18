import "../styles/Header.css";
import headerIconUrl from "../assets/img/logo-header.svg";
import logoIcon from "../assets/img/logo-icon.svg"
import {useState, useEffect} from "react";
import {useAuth} from "./contexts/AuthContext.tsx";
import LoginModal from "./LoginModal";
import {useNavigate} from "react-router-dom";

function Header() {
    const { isLoggedIn, setIsLoggedIn, logout } = useAuth();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 480);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    const handleLoginClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleLogin = () => {
        setIsLoggedIn(true);
        handleCloseModal();
    };

    const handleLogout = async () => {
        await logout(navigate);
        handleCloseModal();
    };

    return (
        <header className="header">
            <div className="main-container">
                <div className="left-side">
                    {!isMobile ? (
                        <img src={headerIconUrl} alt=""/>
                    ):(
                        <img src={logoIcon} alt=""/>
                        )}
                </div>
                <div className="right-side">
                    <div className="right_buttons_but">
                        <span className="header-telephone">+7-8352-20-12-09</span>
                        <a href="https://t.me/Silant_chzsa" target="_blank" rel="nofollow noopener" aria-label="telegram">
                            <svg className="sociallink" role="presentation" width="25px" height="25px" margin-right="40px"
                                 viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd"
                                      d="M50 100c27.614 0 50-22.386 50-50S77.614 0 50 0 0 22.386 0 50s22.386 50 50 50Zm21.977-68.056c.386-4.38-4.24-2.576-4.24-2.576-3.415 1.414-6.937 2.85-10.497 4.302-11.04 4.503-22.444 9.155-32.159 13.734-5.268 1.932-2.184 3.864-2.184 3.864l8.351 2.577c3.855 1.16 5.91-.129 5.91-.129l17.988-12.238c6.424-4.38 4.882-.773 3.34.773l-13.49 12.882c-2.056 1.804-1.028 3.35-.129 4.123 2.55 2.249 8.82 6.364 11.557 8.16.712.467 1.185.778 1.292.858.642.515 4.111 2.834 6.424 2.319 2.313-.516 2.57-3.479 2.57-3.479l3.083-20.226c.462-3.511.993-6.886 1.417-9.582.4-2.546.705-4.485.767-5.362Z"
                                      fill="#163d6c"></path>
                            </svg>
                        </a>
                    </div>
                    <div className="right_buttons_but">
                        { isLoggedIn ? (
                        <>
                            {/*<span className="username-display">{username}</span>*/}
                            <button className="login-button" onClick={handleLogout}>Выйти</button>
                        </>
                        ) : (
                            <button className="login-button" onClick={handleLoginClick}>Войти</button>
                        )}
                    </div>
                </div>
            </div>
            <div className="header-title">
                Электронная сервисная{'\u00A0'}книжка "Мой{'\u00A0'}Силант"
            </div>

            {/* Модальное окно авторизации */}
            <LoginModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onLogin={handleLogin}
            />
        </header>
    );
}

export default Header;