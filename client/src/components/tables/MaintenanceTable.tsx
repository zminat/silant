import { FC, useState } from 'react';
import { MaintenanceData } from '../../types/machine.types';
import { InfoModal } from '../InfoModal';
import '../../styles/Main.css';

interface MaintenanceTableProps {
    maintenance: MaintenanceData[];
}

export const MaintenanceTable: FC<MaintenanceTableProps> = ({ maintenance }) => {
    const [modalInfo, setModalInfo] = useState<{ isOpen: boolean; title: string; description: string }>({
        isOpen: false,
        title: '',
        description: ''
    });

    const handleTypeClick = (type: { name: string; description: string }) => {
        if (type.description) {
            setModalInfo({
                isOpen: true,
                title: type.name,
                description: type.description
            });
        }
    };
    return (
        <>
            <div className="table-container">
                <table>
                    <thead>
                    <tr>
                        <th>№ п/п</th>
                        <th>Зав. № машины</th>
                        <th>Вид ТО</th>
                        <th>Дата проведения ТО</th>
                        <th>Наработка, м/час</th>
                        <th>№ заказ-наряда</th>
                        <th>дата заказ-наряда</th>
                        <th>Организация, проводившая ТО</th>
                    </tr>
                    </thead>
                    <tbody>
                    {maintenance.map((maintenance, index) => (
                        <tr key={maintenance.id}>
                            <td>{index + 1}</td>
                            <td
                                onClick={() => maintenance.machine?.serial_number &&
                                    handleTypeClick(maintenance.machine)}
                                className={maintenance.machine?.description ? 'clickable' : ''}
                            >{maintenance.machine?.serial_number}</td>
                            <td
                                onClick={() => maintenance.maintenance_type &&
                                    handleTypeClick(maintenance.maintenance_type)}
                                className={maintenance.maintenance_type?.description ? 'clickable' : ''}
                            >{maintenance.maintenance_type?.name}</td>
                            <td>{maintenance.maintenance_date}</td>
                            <td>{maintenance.operating_time}</td>
                            <td>{maintenance.order_number}</td>
                            <td>{maintenance.order_date}</td>
                            <td>{maintenance.organization}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <InfoModal
                isOpen={modalInfo.isOpen}
                onClose={() => setModalInfo(prev => ({ ...prev, isOpen: false }))}
                title={modalInfo.title}
                description={modalInfo.description}
            />
        </>
    );
};