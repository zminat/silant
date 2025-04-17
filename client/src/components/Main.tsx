import "../styles/Main.css";
import {useEffect, useState} from "react";
import {useAuth} from "./context/AuthContext.tsx";
import {MachineInfoTabs} from './MachineInfoTabs';
import {Routes, Route} from "react-router-dom";
import ItemDetail from "./ItemDetail.tsx";
import {MachineTableProps, MaintenanceTableProps, ClaimTableProps} from '../types/machine.types';
import {MachineTable} from "./tables/MachineTable";
import {useLoadingError} from "./context/LoadingErrorContext";
import LoadingErrorDisplay from "./LoadingErrorDisplay";

const Main = () => {
    const {isLoggedIn} = useAuth();
    const {loading, error, setLoading, setError, resetStates, handleError} = useLoadingError();
    const [serialNumber, setSerialNumber] = useState<string>('');
    const [machines, setMachines] = useState<MachineTableProps | null>(null);
    const [maintenances, setMaintenances] = useState<MaintenanceTableProps | null>(null);
    const [claims, setClaims] = useState<ClaimTableProps | null>(null);

    const fetchData = async (url: string, errorMessage: string) => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(errorMessage);
        }
        return await response.json();
    };

    const fetchMachineData = async () => {
        try {
            setLoading(true);
            const data = await fetchData('/api/machines/', 'Ошибка при получении данных о машинах');
            setMachines(data);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMaintenanceData = async () => {
        try {
            setLoading(true);
            const data = await fetchData('/api/maintenances/', 'Ошибка при получении данных о ТО');
            setMaintenances(data);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchClaimData = async () => {
        try {
            setLoading(true);
            const data = await fetchData('/api/claims/', 'Ошибка при получении данных о рекламациях');
            setClaims(data);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    const resetDataStates = () => {
        resetStates();
        setMachines(null);
        setMaintenances(null);
        setClaims(null);
    };

    const handleLoading = async () => {
        resetDataStates();

        try {
            if (isLoggedIn) {
                setLoading(true);
                await Promise.all([
                    fetchMachineData(),
                    fetchMaintenanceData(),
                    fetchClaimData()
                ]);
            }
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = async () => {
        resetDataStates();

        try {
            if (!isLoggedIn) {
                setLoading(true);
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
            <Routes>
                <Route path="/" element={
                    <>
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

                        <LoadingErrorDisplay/>

                        {(isLoggedIn || machines) && !loading && (
                            <div className="result-container">
                                {isLoggedIn &&
                                    <h2>Информация о комплектации и технических характеристиках Вашей техники</h2>}

                                {!isLoggedIn && !error && machines && <h3>Результаты поиска:</h3>}

                                {!error && isLoggedIn && !(machines && maintenances && claims) &&
                                    <p>У вас пока нет машин</p>}

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
                    </>
                }/>
                <Route path="/" element={<Main/>}/>
                <Route path="/machine-models/:id/"
                       element={<ItemDetail type="machine-models" title="Модель техники"/>}/>
                <Route path="/engine-models/:id/"
                       element={<ItemDetail type="engine-models" title="Модель двигателя"/>}/>
                <Route path="/transmission-models/:id/"
                       element={<ItemDetail type="transmission-models" title="Модель трансмиссии"/>}/>
                <Route path="/drive-axle-models/:id/"
                       element={<ItemDetail type="drive-axle-models" title="Модель ведущего моста"/>}/>
                <Route path="/steering-axle-models/:id/"
                       element={<ItemDetail type="steering-axle-models" title="Модель управляемого моста"/>}/>
                <Route path="/maintenance-types/:id/" element={<ItemDetail type="maintenance-types" title="Вид ТО"/>}/>
                <Route path="/failure-nodes/:id/" element={<ItemDetail type="failure-nodes" title="Узел отказа"/>}/>
                <Route path="/recovery-methods/:id/"
                       element={<ItemDetail type="recovery-methods" title="Способ восстановления"/>}/>
                <Route path="/service-companies/:id/"
                       element={<ItemDetail type="service-companies" title="Сервисная компания"/>}/>
            </Routes>
        </div>
    );
};

export default Main;