import {useAuth} from "./contexts/AuthContext.tsx";
import {useLoadingError} from "./contexts/LoadingErrorContext.tsx";
import {useEffect, useState} from "react";
import {ClaimTableProps, MachineTableProps, MaintenanceTableProps} from "../types/machine.types.ts";
import {fetchData} from "../utils/utils.ts";
import {useParams} from "react-router-dom";
import LoadingErrorDisplay from "./LoadingErrorDisplay.tsx";
import {MachineInfoTabs} from "./MachineInfoTabs.tsx";

export const MachineDetailPage = () => {
    const {isLoggedIn} = useAuth();
    const {error, setLoading, handleError, resetStates} = useLoadingError();
    const [machines, setMachines] = useState<MachineTableProps | null>(null);
    const [maintenances, setMaintenances] = useState<MaintenanceTableProps | null>(null);
    const [claims, setClaims] = useState<ClaimTableProps | null>(null);
    const {serial_number} = useParams();

    const fetchMachineData = async () => {
        try {
            setLoading(true);
            const data = await fetchData(`/api/machines/?serial_number=${serial_number}`,
                'Ошибка при получении данных о машинах');
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
            const data = await fetchData(`/api/maintenances/?serial_number=${serial_number}`,
                'Ошибка при получении данных о ТО');
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
            const data = await fetchData(`/api/claims/?serial_number=${serial_number}`,
                'Ошибка при получении данных о рекламациях');
            setClaims(data);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    const loadData = async () => {
        resetStates();
        setMachines(null);
        setMaintenances(null);
        setClaims(null);

        if (isLoggedIn && serial_number) {
            try {
                setLoading(true);
                await Promise.all([
                    fetchMachineData(),
                    fetchMaintenanceData(),
                    fetchClaimData()
                ]);
            } catch (err) {
                handleError(err);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        loadData();
    }, [isLoggedIn, serial_number]);

    return (
        <div className="result-container">
            {isLoggedIn ? (
                <>
                    <h2>Информация о машине с серийным номером {serial_number}</h2>
                    <LoadingErrorDisplay />
                    {!error && machines && maintenances && claims && (
                        <MachineInfoTabs
                            machines={machines}
                            maintenances={maintenances}
                            claims={claims}
                        />
                    )}
                </>
            ) : (
                <div className="result-container">
                    <h2>Для просмотра детальной информации необходимо авторизоваться</h2>
                </div>
            )}
        </div>
    );
};