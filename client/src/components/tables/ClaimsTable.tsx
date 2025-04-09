import { FC } from 'react';
import { ClaimsData } from '../../types/machine.types';
import '../../styles/Main.css';

interface ClaimsTableProps {
    claim: ClaimsData[];
}

export const ClaimsTable: FC<ClaimsTableProps> = ({ claim }) => {
    return (
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
                        <td>{claim.machine?.serial_number}</td>
                        <td>{claim.failure_date}</td>
                        <td>{claim.operating_time}</td>
                        <td>{claim.failure_node?.name}</td>
                        <td>{claim.failure_description}</td>
                        <td>{claim.recovery_method?.name}</td>
                        <td>{claim.spare_parts_used}</td>
                        <td>{claim.recovery_date}</td>
                        <td>{claim.downtime}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};