import { FC } from 'react';
import { PublicMachineData } from '../../types/machine.types';
import '../../styles/Main.css';

interface PublicMachineTableProps {
    machine: PublicMachineData | null;
}

export const PublicMachineTable: FC<PublicMachineTableProps> = ({ machine }) => {
    if (!machine) return null;

    return (
        <table>
            <thead>
            <tr>
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
            </tr>
            </thead>
            <tbody>
            <tr>
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
            </tr>
            </tbody>
        </table>
    );
};