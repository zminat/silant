import {FC, useState, useMemo} from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, ColDef, ICellRendererParams, CellClickedEvent, themeMaterial } from 'ag-grid-community';
import AG_GRID_LOCALE_RU from '../../locale/AG_GRID_LOCALE_RU.ts'
import { PublicMachineData } from '../../types/machine.types';
import '../../styles/Main.css';
import {InfoModal} from "../InfoModal.tsx";

ModuleRegistry.registerModules([AllCommunityModule]);

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


    // Преобразуем данные машины в формат для AgGrid
    const rowData = useMemo(() => {
        return [
            {
                modelName: machine.model?.name || '',
                modelWithDescription: !!machine.model?.description,
                serialNumber: machine.serial_number,
                engineModelName: machine.engine_model?.name || '',
                engineModelWithDescription: !!machine.engine_model?.description,
                engineSerialNumber: machine.engine_serial_number,
                transmissionModelName: machine.transmission_model?.name || '',
                transmissionModelWithDescription: !!machine.transmission_model?.description,
                transmissionSerialNumber: machine.transmission_serial_number,
                driveAxleModelName: machine.drive_axle_model?.name || '',
                driveAxleModelWithDescription: !!machine.drive_axle_model?.description,
                driveAxleSerialNumber: machine.drive_axle_serial_number,
                steeringAxleModelName: machine.steering_axle_model?.name || '',
                steeringAxleModelWithDescription: !!machine.steering_axle_model?.description,
                steeringAxleSerialNumber: machine.steering_axle_serial_number,
                // Сохраним оригинальные объекты для обработчиков нажатий
                modelObj: machine.model,
                engineModelObj: machine.engine_model,
                transmissionModelObj: machine.transmission_model,
                driveAxleModelObj: machine.drive_axle_model,
                steeringAxleModelObj: machine.steering_axle_model
            }
        ];
    }, [machine]);

    // Определение столбцов для AgGrid
    const columnDefs = useMemo<ColDef<(typeof rowData)[0]>[]>(() => [
        {
            headerName: 'Модель техники',
            field: 'modelName',
            cellRenderer: (params: ICellRendererParams<(typeof rowData)[0]>) => {
                const hasDescription = params.data?.modelWithDescription;
                return hasDescription ?
                    <span className="clickable">{params.value}</span> :
                    params.value;
            },
            cellStyle: { cursor: 'pointer' },
            onCellClicked: (params: CellClickedEvent<(typeof rowData)[0]>) => {
                if (params.data?.modelWithDescription) {
                    handleTypeClick(params.data.modelObj);
                }
            }
        },
        { headerName: 'Зав. № машины', field: 'serialNumber' },
        {
            headerName: 'Модель двигателя',
            field: 'engineModelName',
            cellRenderer: (params: any) => {
                const hasDescription = params.data.engineModelWithDescription;
                return hasDescription ?
                    <span className="clickable">{params.value}</span> :
                    params.value;
            },
            cellStyle: { cursor: 'pointer' },
            onCellClicked: (params: CellClickedEvent<(typeof rowData)[0]>) => {
                if (params.data?.engineModelWithDescription) {
                    handleTypeClick(params.data.engineModelObj);
                }
            }
        },
        { headerName: 'Зав. № двигателя', field: 'engineSerialNumber' },
        {
            headerName: 'Модель трансмиссии',
            field: 'transmissionModelName',
            cellRenderer: (params: any) => {
                const hasDescription = params.data.transmissionModelWithDescription;
                return hasDescription ?
                    <span className="clickable">{params.value}</span> :
                    params.value;
            },
            cellStyle: { cursor: 'pointer' },
            onCellClicked: (params: CellClickedEvent<(typeof rowData)[0]>) => {
                if (params.data?.transmissionModelWithDescription) {
                    handleTypeClick(params.data.transmissionModelObj);
                }
            }
        },
        { headerName: 'Зав. № трансмиссии', field: 'transmissionSerialNumber' },
        {
            headerName: 'Модель ведущего моста',
            field: 'driveAxleModelName',
            cellRenderer: (params: any) => {
                const hasDescription = params.data.driveAxleModelWithDescription;
                return hasDescription ?
                    <span className="clickable">{params.value}</span> :
                    params.value;
            },
            cellStyle: { cursor: 'pointer' },
            onCellClicked: (params: CellClickedEvent<(typeof rowData)[0]>) => {
                if (params.data?.driveAxleModelWithDescription) {
                    handleTypeClick(params.data.driveAxleModelObj);
                }
            }
        },
        { headerName: 'Зав. № ведущего моста', field: 'driveAxleSerialNumber' },
        {
            headerName: 'Модель управляемого моста',
            field: 'steeringAxleModelName',
            cellRenderer: (params: any) => {
                const hasDescription = params.data.steeringAxleModelWithDescription;
                return hasDescription ?
                    <span className="clickable">{params.value}</span> :
                    params.value;
            },
            cellStyle: { cursor: 'pointer' },
            onCellClicked: (params: CellClickedEvent<(typeof rowData)[0]>) => {
                if (params.data?.steeringAxleModelWithDescription) {
                    handleTypeClick(params.data.steeringAxleModelObj);
                }
            }
        },
        { headerName: 'Зав. № управляемого моста', field: 'steeringAxleSerialNumber' }
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