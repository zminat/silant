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

    const fetchMachinesData = async () => {
        try {

            const response = await fetch('/api/machines/');
            if (!response.ok) {
                setError('Ошибка при получении данных');
            }
            const data = await response.json();
            setMachines(data);
        } catch (err) {
            console.error('Ошибка при получении данных о машинах:', err);
        }
    };

    const fetchMaintenanceData = async () => {
        try {
            const response = await fetch('/api/maintenances/');
            if (!response.ok) {
                setError('Ошибка при получении данных');
            }
            const data = await response.json();
            setMaintenances(data);
        } catch (err) {
            console.error('Ошибка при получении данных о ТО:', err);
        }
    };

    const fetchClaimsData = async () => {
        try {
            const response = await fetch('/api/claims/');
            if (!response.ok) {
                setError('Ошибка при получении данных');
            }
            const data = await response.json();
            setClaims(data);
        } catch (err) {
            console.error('Ошибка при получении данных о рекламациях:', err);
        }
    };

    const handleLoading = async() => {
        setLoading(true);
        setError('');
        setMachines(null);
        setMaintenances(null);
        setClaims(null);

        try {
            if (isLoggedIn) {
                await fetchMachinesData();
                await fetchMaintenanceData();
                await fetchClaimsData();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка');
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        setMachines(null);
        setMaintenances(null);
        setClaims(null);

        try {
            if (!isLoggedIn) {
                if (!serialNumber.trim()) {
                    setError('Введите заводской номер');
                    return;
                }

                const response = await fetch(`/api/machines/public_info/?serial_number=${serialNumber}`);
                if (!response.ok) {
                    setError('Машина не найдена');
                    return;
                }

                const data = await response.json();
                setMachines(data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка');
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
            {isLoggedIn ? (
                <div className="result-container">
                    <h2>Информация о комплектации и технических характеристиках Вашей техники</h2>
                    {loading ? (
                        <p>Загрузка данных...</p>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : machines && maintenances && claims ? (
                        <div className="table-container">
                            <MachineInfoTabs machines={machines} maintenances={maintenances} claims={claims}/>
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

                    {loading && (
                        <p>Загрузка данных...</p>
                    )}

                    {!loading && error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {!loading && machines && (
                        <div className="result-container">
                            <h3>Результаты поиска:</h3>
                            <div className="table-container">
                                <MachineTable machines={machines.machines} dictionaries={machines.dictionaries} permissions={machines.permissions} isAuthenticated={false} />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Main;