import { FC, useState } from 'react';
import {MachineTable} from './tables/MachineTable.tsx';
import {MachineTableProps, MaintenanceTableProps, ClaimTableProps} from '../types/machine.types';
import '../styles/MachineInfoTabs.css';
import { MaintenanceTable } from "./tables/MaintenanceTable.tsx";
import {ClaimTable} from "./tables/ClaimTable.tsx";

type TabType = 'machines' | 'maintenances' | 'claims';

interface MachineInfoTabsProps {
    machines: MachineTableProps;
    maintenances: MaintenanceTableProps;
    claims: ClaimTableProps;
}

export const MachineInfoTabs: FC<MachineInfoTabsProps> = ({ machines, maintenances, claims }) => {
    const [activeTab, setActiveTab] = useState<TabType>('machines');

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
                    className={getTabClassName('maintenances')}
                    onClick={() => setActiveTab('maintenances')}
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
                {activeTab === 'machines' && <MachineTable machines={machines.machines} dictionaries={machines.dictionaries} permissions={machines.permissions} isAuthenticated={true}/>}
                {activeTab === 'maintenances' && <MaintenanceTable maintenances={maintenances.maintenances} dictionaries={maintenances.dictionaries} permissions={maintenances.permissions}/>}
                {activeTab === 'claims' && <ClaimTable claims={claims.claims} dictionaries={claims.dictionaries} permissions={claims.permissions}/>}
            </div>
        </div>
    );
};