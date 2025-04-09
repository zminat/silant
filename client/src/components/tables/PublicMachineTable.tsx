import {FC, useState} from 'react';
import { PublicMachineData } from '../../types/machine.types';
import '../../styles/Main.css';
import {InfoModal} from "../InfoModal.tsx";

interface PublicMachineTableProps {
    machine: PublicMachineData | null;
}

export const PublicMachineTable: FC<PublicMachineTableProps> = ({ machine }) => {
    if (!machine) return null;
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
                    <td
                        onClick={() => machine.model &&
                            handleTypeClick(machine.model)}
                        className={machine.model?.description ? 'clickable' : ''}
                    >{machine.model?.name}</td>
                    <td>{machine.serial_number}</td>
                    <td
                        onClick={() => machine.engine_model &&
                            handleTypeClick(machine.engine_model)}
                        className={machine.engine_model?.description ? 'clickable' : ''}
                    >{machine.engine_model?.name}</td>
                    <td>{machine.engine_serial_number}</td>
                    <td
                        onClick={() => machine.transmission_model &&
                            handleTypeClick(machine.transmission_model)}
                        className={machine.transmission_model?.description ? 'clickable' : ''}
                    >{machine.transmission_model?.name}</td>
                    <td>{machine.transmission_serial_number}</td>
                    <td
                        onClick={() => machine.drive_axle_model &&
                            handleTypeClick(machine.drive_axle_model)}
                        className={machine.drive_axle_model?.description ? 'clickable' : ''}
                    >{machine.drive_axle_model?.name}</td>
                    <td>{machine.drive_axle_serial_number}</td>
                    <td
                        onClick={() => machine.steering_axle_model &&
                            handleTypeClick(machine.steering_axle_model)}
                        className={machine.steering_axle_model?.description ? 'clickable' : ''}
                    >{machine.steering_axle_model?.name}</td>
                    <td>{machine.steering_axle_serial_number}</td>
                </tr>
                </tbody>
            </table>
            <InfoModal
                isOpen={modalInfo.isOpen}
                onClose={() => setModalInfo(prev => ({ ...prev, isOpen: false }))}
                title={modalInfo.title}
                description={modalInfo.description}
            />
        </>
    );
};