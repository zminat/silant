import { FC } from 'react';
import { MaintenanceData } from '../../types/machine.types';
import '../../styles/Main.css';

interface MaintenanceTableProps {
    maintenance: MaintenanceData[];
}

export const MaintenanceTable: FC<MaintenanceTableProps> = ({ maintenance }) => {
    return (
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
                        <td>{maintenance.machine?.serial_number}</td>
                        <td>{maintenance.maintenance_type?.name}</td>
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
    );
};