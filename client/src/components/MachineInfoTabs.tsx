import { FC, useState } from 'react';
import { AuthenticatedMachineTable } from './tables/AuthenticatedMachineTable';
import { FullMachineData } from '../types/machine.types';
import '../styles/MachineInfoTabs.css';

type TabType = 'general' | 'maintenance' | 'complaints';

interface MachineInfoTabsProps {
    machines: FullMachineData[];
}

export const MachineInfoTabs: FC<MachineInfoTabsProps> = ({ machines }) => {
    const [activeTab, setActiveTab] = useState<TabType>('general');

    const getTabClassName = (tabName: TabType) => {
        return `tab ${activeTab === tabName ? 'active' : ''}`;
    };

    return (
        <div className="machine-info">
            <div className="nav-tabs">
                <div
                    className={getTabClassName('general')}
                    onClick={() => setActiveTab('general')}
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
                    className={getTabClassName('complaints')}
                    onClick={() => setActiveTab('complaints')}
                >
                    Рекламации
                </div>
            </div>
            <div className="table-container">
                {activeTab === 'general' && <AuthenticatedMachineTable machines={machines} />}
                {activeTab === 'maintenance' && <div>Таблица ТО (в разработке)</div>}
                {activeTab === 'complaints' && <div>Таблица рекламаций (в разработке)</div>}
            </div>
        </div>
    );
};