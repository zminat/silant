import "../styles/Main.css";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { PublicMachineTable } from './tables/PublicMachineTable';
import { MachineInfoTabs } from './MachineInfoTabs';
import {PublicMachineData, FullMachineData, MaintenanceData, ClaimsData} from '../types/machine.types';

const Main = () => {
    const { isLoggedIn } = useAuth();
    const [serialNumber, setSerialNumber] = useState<string>('');
    const [publicMachine, setPublicMachine] = useState<PublicMachineData | null>(null);
    const [userMachines, setUserMachines] = useState<FullMachineData[]>([]);
    const [maintenanceData, setMaintenanceData] = useState<MaintenanceData[]>([]);
    const [claimData, setClaimData] = useState<ClaimsData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const fetchMaintenanceData = async () => {
        try {
            const response = await fetch('/api/maintenances/');
            if (response.ok) {
                const data = await response.json();
                setMaintenanceData(data);
            }
        } catch (err) {
            console.error('Ошибка при получении данных о ТО:', err);
        }
    };

    const fetchClaimsData = async () => {
        try {
            const response = await fetch('/api/claims/');
            if (response.ok) {
                const data = await response.json();
                setClaimData(data);
            }
        } catch (err) {
            console.error('Ошибка при получении данных о рекламациях:', err);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        setPublicMachine(null);

        try {
            if (isLoggedIn) {
                const response = await fetch('/api/machines/');
                if (!response.ok) {
                    setError('Ошибка при получении данных');
                }
                const data = await response.json();
                setUserMachines(data);

                // Загружаем данные о ТО и рекламациях после загрузки машин
                await fetchMaintenanceData();
                await fetchClaimsData();
            } else {
                if (!serialNumber.trim()) {
                    setError('Введите заводской номер');
                }

                const response = await fetch(`/api/public-machine-info/?serial_number=${serialNumber}`);

                if (!response.ok) {
                    setError('Машина не найдена');
                }

                const data = await response.json();
                setPublicMachine(data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            handleSearch();
        }
    }, [isLoggedIn]);

    return (
        <div className="page-container">
            {isLoggedIn ? (
                <div className="result-container">
                    <h2>Информация о комплектации и технических характеристиках Вашей техники</h2>
                    {loading ? (
                        <p>Загрузка данных...</p>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : userMachines.length > 0 ? (
                        <div className="table-container">
                            <MachineInfoTabs machines={userMachines} maintenance={maintenanceData} claim={claimData}/>
                        </div>
                    ) : (
                        <p>У вас пока нет машин</p>
                    )}
                </div>
            ) : (
                <>
                    <h1>Проверьте комплектацию и технические характеристики техники Силант</h1>
                    <div className="wrapper-form">
                        <label className="label-block">
                            Заводской номер:
                            <input
                                className="input-block"
                                aria-label="serialNumber"
                                type="text"
                                name="serialNumber"
                                value={serialNumber}
                                onChange={(e) => setSerialNumber(e.target.value)}
                                placeholder="0000"
                            />
                        </label>
                        <button
                            onClick={handleSearch}
                            className="search-btn"
                            disabled={loading || !serialNumber.trim()}
                        >
                            {loading ? "Поиск..." : "Поиск"}
                        </button>
                    </div>

                    {loading && (
                        <p>Загрузка данных...</p>
                    )}

                    {!loading && error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {!loading && publicMachine && (
                        <div className="result-container">
                            <h3>Результаты поиска:</h3>
                            <div className="table-container">
                                <PublicMachineTable machine={publicMachine} />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Main;