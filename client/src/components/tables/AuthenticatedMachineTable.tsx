import { FC } from 'react';
import { FullMachineData } from '../../types/machine.types';
import '../../styles/Main.css';

interface AuthenticatedMachineTableProps {
    machines: FullMachineData[];
}

export const AuthenticatedMachineTable: FC<AuthenticatedMachineTableProps> = ({ machines }) => {
    return (
        <div className="table-container">
            <table>
                <thead>
                <tr>
                    <th>№ п/п</th>
                    <th>Модель техники</th>
                    <th>Зав. № машины</th>
                    <th>Модель двигателя</th>
                    <th>Зав. № двигателя</th>
                    <th>Модель трансмиссии</th>
                    <th>Зав. № трансмиссии</th>
                    <th>Модель ведущего моста</th>
                    <th>Зав. № ведущего моста</th>
                    <th>Модель управляемого моста</th>
                    <th>Зав. № управляемого моста</th>
                    <th>Дата отгрузки с завода</th>
                    <th>Покупатель</th>
                    <th>Грузополучатель (конечный потребитель)</th>
                    <th>Адрес поставки (эксплуатации)</th>
                    <th>Комплектация (доп. опции)</th>
                    <th>Сервисная компания</th>
                </tr>
                </thead>
                <tbody>
                {machines.map((machine, index) => (
                    <tr key={machine.id}>
                        <td>{index + 1}</td>
                        <td>{machine.model?.name}</td>
                        <td>{machine.serial_number}</td>
                        <td>{machine.engine_model?.name}</td>
                        <td>{machine.engine_serial_number}</td>
                        <td>{machine.transmission_model?.name}</td>
                        <td>{machine.transmission_serial_number}</td>
                        <td>{machine.drive_axle_model?.name}</td>
                        <td>{machine.drive_axle_serial_number}</td>
                        <td>{machine.steering_axle_model?.name}</td>
                        <td>{machine.steering_axle_serial_number}</td>
                        <td>{machine.shipment_date}</td>
                        <td>{machine.client?.first_name}</td>
                        <td>{machine.consignee}</td>
                        <td>{machine.delivery_address}</td>
                        <td>{machine.equipment}</td>
                        <td>{machine.service_company?.name}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};