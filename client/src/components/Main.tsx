import "../styles/Main.css";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { MachineInfoTabs } from './MachineInfoTabs';
import {MachineTableProps, MaintenanceTableProps, ClaimTableProps} from '../types/machine.types';
import {MachineTable} from "./tables/MachineTable.tsx";

const Main = () => {
    const { isLoggedIn } = useAuth();
    const [serialNumber, setSerialNumber] = useState<string>('');
    const [machines, setMachines] = useState<MachineTableProps | null>(null);
    const [maintenances, setMaintenances] = useState<MaintenanceTableProps | null>(null);
    const [claims, setClaims] = useState<ClaimTableProps | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const fetchData = async (url: string, errorMessage: string) => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(errorMessage);
        }
        return await response.json();
    };

    const fetchMachineData = async () => {
        try {
            const data = await fetchData('/api/machines/', 'Ошибка при получении данных о машинах');
            setMachines(data);
        } catch (err) {
            console.error('Ошибка при получении данных о машинах:', err);
        }
    };

    const fetchMaintenanceData = async () => {
        try {
            const data = await fetchData('/api/maintenances/', 'Ошибка при получении данных о ТО');
            setMaintenances(data);
        } catch (err) {
            console.error('Ошибка при получении данных о ТО:', err);
        }
    };

    const fetchClaimData = async () => {
        try {
            const data = await fetchData('/api/claims/', 'Ошибка при получении данных о рекламациях');
            setClaims(data);
        } catch (err) {
            console.error('Ошибка при получении данных о рекламациях:', err);
        }
    };

    const resetStates = () => {
        setLoading(true);
        setError('');
        setMachines(null);
        setMaintenances(null);
        setClaims(null);
    };

    // Общая функция для обработки ошибок
    const handleError = (err: unknown) => {
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
    };

    const handleLoading = async() => {
        resetStates();

        try {
            if (isLoggedIn) {
                await fetchMachineData();
                await fetchMaintenanceData();
                await fetchClaimData();
            }
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = async () => {
        resetStates();

        try {
            if (!isLoggedIn) {
                if (!serialNumber.trim()) {
                    setError('Введите заводской номер');
                    return;
                }

                const data = await fetchData(
                    `/api/machines/public_info/?serial_number=${serialNumber}`,
                    'Машина не найдена'
                );

                if (!data.machines.length) {
                    setError('Машина не найдена');
                    return;
                }

                setMachines(data);
            }
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    useEffect(() => {
        handleLoading();
    }, [isLoggedIn]);

    return (
        <div className="page-container">
            {!isLoggedIn && (
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
                                onKeyDown={handleKeyDown}
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
                </>
            )}

            {loading && <p>Загрузка данных...</p>}
            {!loading && error && <div className="error-message">{error}</div>}

            {(isLoggedIn || machines) && !loading && (
                <div className="result-container">
                    {isLoggedIn && <h2>Информация о комплектации и технических характеристиках Вашей техники</h2>}

                    {!isLoggedIn && !error && machines && <h3>Результаты поиска:</h3>}

                    {!error && isLoggedIn && !(machines && maintenances && claims) && <p>У вас пока нет машин</p>}

                    {!error && (
                        <div className="table-container">
                            {isLoggedIn && machines && maintenances && claims && (
                                <MachineInfoTabs
                                    machines={machines}
                                    maintenances={maintenances}
                                    claims={claims}
                                />
                            )}

                            {!isLoggedIn && machines && (
                                <MachineTable
                                    machines={machines.machines}
                                    dictionaries={machines.dictionaries}
                                    permissions={machines.permissions}
                                    isAuthenticated={false}
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Main;