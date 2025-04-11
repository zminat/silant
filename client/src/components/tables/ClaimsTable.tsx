import {FC, useState, useMemo} from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, ColDef, ICellRendererParams, CellClickedEvent, themeMaterial } from 'ag-grid-community';
import AG_GRID_LOCALE_RU from '../../locale/AG_GRID_LOCALE_RU.ts';
import { ClaimsData } from '../../types/machine.types';
import '../../styles/Main.css';
import {InfoModal} from "../InfoModal.tsx";

ModuleRegistry.registerModules([AllCommunityModule]);

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

    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        filterParams: {
            buttons: ['reset', 'apply'],
            closeOnApply: true
        },
        wrapText: true,
        autoHeight: true,
    }), []);

    // Преобразуем данные рекламаций в формат для AgGrid
    const rowData = useMemo(() => {
        return claim.map((claim, index) => ({
            index: index + 1,
            serialNumber: claim.machine?.serial_number || '',
            machineWithDescription: !!claim.machine?.description,
            failureDate: claim.failure_date,
            operatingTime: claim.operating_time,
            failureNodeName: claim.failure_node?.name || '',
            failureNodeWithDescription: !!claim.failure_node?.description,
            failureDescription: claim.failure_description,
            recoveryMethodName: claim.recovery_method?.name || '',
            recoveryMethodWithDescription: !!claim.recovery_method?.description,
            sparePartsUsed: claim.spare_parts_used,
            recoveryDate: claim.recovery_date,
            downtime: claim.downtime,
            // Сохраним оригинальные объекты для обработчиков нажатий
            machineObj: claim.machine,
            failureNodeObj: claim.failure_node,
            recoveryMethodObj: claim.recovery_method
        }));
    }, [claim]);

    // Определение столбцов для AgGrid
    const columnDefs = useMemo<ColDef<(typeof rowData)[0]>[]>(() => [
        { headerName: '№ п/п', field: 'index', width: 80 },
        {
            headerName: 'Зав. № машины',
            field: 'serialNumber',
            cellRenderer: (params: ICellRendererParams<(typeof rowData)[0]>) => {
                const hasDescription = params.data?.machineWithDescription;
                return hasDescription ?
                    <span className="clickable">{params.value}</span> :
                    params.value;
            },
            cellStyle: { cursor: 'pointer' },
            onCellClicked: (params: CellClickedEvent<(typeof rowData)[0]>) => {
                if (params.data?.machineWithDescription) {
                    handleTypeClick(params.data.machineObj);
                }
            }
        },
        { headerName: 'Дата отказа', field: 'failureDate' },
        { headerName: 'Наработка, м/час', field: 'operatingTime' },
        {
            headerName: 'Узел отказа',
            field: 'failureNodeName',
            cellRenderer: (params: ICellRendererParams<(typeof rowData)[0]>) => {
                const hasDescription = params.data?.failureNodeWithDescription;
                return hasDescription ?
                    <span className="clickable">{params.value}</span> :
                    params.value;
            },
            cellStyle: { cursor: 'pointer' },
            onCellClicked: (params: CellClickedEvent<(typeof rowData)[0]>) => {
                if (params.data?.failureNodeWithDescription) {
                    handleTypeClick(params.data.failureNodeObj);
                }
            }
        },
        { headerName: 'Описание отказа', field: 'failureDescription' },
        {
            headerName: 'Способ восстановления',
            field: 'recoveryMethodName',
            cellRenderer: (params: ICellRendererParams<(typeof rowData)[0]>) => {
                const hasDescription = params.data?.recoveryMethodWithDescription;
                return hasDescription ?
                    <span className="clickable">{params.value}</span> :
                    params.value;
            },
            cellStyle: { cursor: 'pointer' },
            onCellClicked: (params: CellClickedEvent<(typeof rowData)[0]>) => {
                if (params.data?.recoveryMethodWithDescription) {
                    handleTypeClick(params.data.recoveryMethodObj);
                }
            }
        },
        { headerName: 'Используемые запасные части', field: 'sparePartsUsed' },
        { headerName: 'Дата восстановления', field: 'recoveryDate' },
        { headerName: 'Время простоя техники', field: 'downtime' }
    ], []);

    return (
        <>
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                theme={themeMaterial}
                localeText={AG_GRID_LOCALE_RU}
                domLayout='autoHeight'
                rowHeight={40}
                headerHeight={40}
            />
            <InfoModal
                isOpen={modalInfo.isOpen}
                title={modalInfo.title}
                description={modalInfo.description}
                onClose={() => setModalInfo({ ...modalInfo, isOpen: false })}
            />
        </>
    );
};