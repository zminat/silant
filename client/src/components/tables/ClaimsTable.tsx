import {FC, useState} from 'react';
import { ClaimsData } from '../../types/machine.types';
import '../../styles/Main.css';
import {InfoModal} from "../InfoModal.tsx";

interface ClaimsTableProps {
    claim: ClaimsData[];
}

export const ClaimsTable: FC<ClaimsTableProps> = ({ claim }) => {
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
                        <th>Дата отказа</th>
                        <th>Наработка, м/час</th>
                        <th>Узел отказа</th>
                        <th>Описание отказа</th>
                        <th>Способ восстановления</th>
                        <th>Используемые запасные части</th>
                        <th>Дата восстановления</th>
                        <th>Время простоя техники</th>
                    </tr>
                    </thead>
                    <tbody>
                    {claim.map((claim, index) => (
                        <tr key={claim.id}>
                            <td>{index + 1}</td>
                            <td
                                onClick={() => claim.machine?.serial_number &&
                                    handleTypeClick(claim.machine)}
                                className={claim.machine?.description ? 'clickable' : ''}
                            >{claim.machine?.serial_number}</td>
                            <td>{claim.failure_date}</td>
                            <td>{claim.operating_time}</td>
                            <td
                                onClick={() => claim.failure_node &&
                                    handleTypeClick(claim.failure_node)}
                                className={claim.failure_node?.description ? 'clickable' : ''}
                            >{claim.failure_node?.name}</td>
                            <td>{claim.failure_description}</td>
                            <td
                                onClick={() => claim.recovery_method &&
                                    handleTypeClick(claim.recovery_method)}
                                className={claim.recovery_method?.description ? 'clickable' : ''}
                            >{claim.recovery_method?.name}</td>
                            <td>{claim.spare_parts_used}</td>
                            <td>{claim.recovery_date}</td>
                            <td>{claim.downtime}</td>
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