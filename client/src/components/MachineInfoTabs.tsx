import { FC, useState, useEffect } from 'react';
import { AuthenticatedMachineTable } from './tables/AuthenticatedMachineTable';
import {ClaimsData, FullMachineData, MaintenanceData} from '../types/machine.types';
import '../styles/MachineInfoTabs.css';
import { MaintenanceTable } from "./tables/MaintenanceTable.tsx";
import { useAuth } from './AuthContext.tsx';
import {ClaimsTable} from "./tables/ClaimsTable.tsx";

type TabType = 'machines' | 'maintenance' | 'claims';

interface MachineInfoTabsProps {
    machines: FullMachineData[];
    maintenance: MaintenanceData[];
    claim: ClaimsData[];
}

export const MachineInfoTabs: FC<MachineInfoTabsProps> = ({ machines, maintenance, claim }) => {
    const [activeTab, setActiveTab] = useState<TabType>('machines');
    const { isLoggedIn } = useAuth();
    const [filteredMaintenance, setFilteredMaintenance] = useState<MaintenanceData[]>(maintenance);
    const [filteredClaims, setFilteredClaims] = useState<ClaimsData[]>(claim);

    useEffect(() => {
        if (isLoggedIn && activeTab === 'maintenance') {
            const fetchFilteredMaintenance = async () => {
                try {
                    const response = await fetch('/api/user/maintenances');
                    if (response.ok) {
                        const data = await response.json();
                        setFilteredMaintenance(data);
                    } else {
                        // Если запрос не удался, используем данные, переданные через props
                        setFilteredMaintenance(maintenance);
                    }
                } catch (error) {
                    console.error('Ошибка при получении данных ТО:', error);
                    setFilteredMaintenance(maintenance);
                }
            };

            fetchFilteredMaintenance();
        } else {
            // Если пользователь не авторизован или не на вкладке ТО, используем данные из props
            setFilteredMaintenance(maintenance);
        }
    }, [isLoggedIn, activeTab, maintenance]);

    useEffect(() => {
        if (isLoggedIn && activeTab === 'claims') {
            const fetchFilteredClaims = async () => {
                try {
                    const response = await fetch('/api/user/claims');
                    if (response.ok) {
                        const data = await response.json();
                        setFilteredClaims(data);
                    } else {
                        // Если запрос не удался, используем данные, переданные через props
                        setFilteredClaims(claim);
                    }
                } catch (error) {
                    console.error('Ошибка при получении данных о рекламациях:', error);
                    setFilteredClaims(claim);
                }
            };

            fetchFilteredClaims();
        } else {
            // Если пользователь не авторизован или не на вкладке Рекламации, используем данные из props
            setFilteredClaims(claim);
        }
    }, [isLoggedIn, activeTab, claim]);

    const getTabClassName = (tabName: TabType) => {
        return `tab ${activeTab === tabName ? 'active' : ''}`;
    };

    return (
        <div className="machine-info">
            <div className="nav-tabs">
                <div
                    className={getTabClassName('machines')}
                    onClick={() => setActiveTab('machines')}
                >
                    Общая информация
                </div>
                <div
                    className={getTabClassName('maintenance')}
                    onClick={() => setActiveTab('maintenance')}
                >
                    ТО
                </div>
                <div
                    className={getTabClassName('claims')}
                    onClick={() => setActiveTab('claims')}
                >
                    Рекламации
                </div>
            </div>
            <div className="table-container">
                {activeTab === 'machines' && <AuthenticatedMachineTable machines={machines} />}
                {activeTab === 'maintenance' && <div><MaintenanceTable maintenance={filteredMaintenance} /></div>}
                {activeTab === 'claims' && <div><ClaimsTable claim={filteredClaims} /></div>}
            </div>
        </div>
    );
};