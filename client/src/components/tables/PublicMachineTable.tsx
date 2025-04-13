import {FC, useMemo} from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, ColDef, ICellRendererParams, CellClickedEvent, themeMaterial } from 'ag-grid-community';
import { useNavigate } from 'react-router-dom';
import AG_GRID_LOCALE_RU from '../../locale/AG_GRID_LOCALE_RU.ts';
import { PublicMachineData } from '../../types/machine.types';
import '../../styles/Main.css';

ModuleRegistry.registerModules([AllCommunityModule]);

interface PublicMachineTableProps {
    machine: PublicMachineData | null;
}

export const PublicMachineTable: FC<PublicMachineTableProps> = ({ machine }) => {
    if (!machine) return null;

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

    const navigate = useNavigate();

    const rowData = useMemo(() => {
        return [
            {
                modelName: machine.model?.name || '',
                modelWithDescription: !!machine.model?.description,
                modelId: machine.model?.id,
                serialNumber: machine.serial_number,
                engineModelName: machine.engine_model?.name || '',
                engineModelWithDescription: !!machine.engine_model?.description,
                engineModelId: machine.engine_model?.id,
                engineSerialNumber: machine.engine_serial_number,
                transmissionModelName: machine.transmission_model?.name || '',
                transmissionModelWithDescription: !!machine.transmission_model?.description,
                transmissionModelId: machine.transmission_model?.id,
                transmissionSerialNumber: machine.transmission_serial_number,
                driveAxleModelName: machine.drive_axle_model?.name || '',
                driveAxleModelWithDescription: !!machine.drive_axle_model?.description,
                driveAxleModelId: machine.drive_axle_model?.id,
                driveAxleSerialNumber: machine.drive_axle_serial_number,
                steeringAxleModelName: machine.steering_axle_model?.name || '',
                steeringAxleModelWithDescription: !!machine.steering_axle_model?.description,
                steeringAxleModelId: machine.steering_axle_model?.id,
                steeringAxleSerialNumber: machine.steering_axle_serial_number
            }
        ];
    }, [machine]);

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
                if (params.data?.modelWithDescription && params.data.modelId) {
                    navigate(`/machine-models/${params.data.modelId}`);
                }
            }
        },
        { headerName: 'Зав. № машины', field: 'serialNumber' },
        {
            headerName: 'Модель двигателя',
            field: 'engineModelName',
            cellRenderer: (params: ICellRendererParams<(typeof rowData)[0]>) => {
                const hasDescription = params.data?.engineModelWithDescription;
                return hasDescription ?
                    <span className="clickable">{params.value}</span> :
                    params.value;
            },
            cellStyle: { cursor: 'pointer' },
            onCellClicked: (params: CellClickedEvent<(typeof rowData)[0]>) => {
                if (params.data?.engineModelWithDescription && params.data.engineModelId) {
                    navigate(`/engine-models/${params.data.engineModelId}`);
                }
            }
        },
        { headerName: 'Зав. № двигателя', field: 'engineSerialNumber' },
        {
            headerName: 'Модель трансмиссии',
            field: 'transmissionModelName',
            cellRenderer: (params: ICellRendererParams<(typeof rowData)[0]>) => {
                const hasDescription = params.data?.transmissionModelWithDescription;
                return hasDescription ?
                    <span className="clickable">{params.value}</span> :
                    params.value;
            },
            cellStyle: { cursor: 'pointer' },
            onCellClicked: (params: CellClickedEvent<(typeof rowData)[0]>) => {
                if (params.data?.transmissionModelWithDescription && params.data.transmissionModelId) {
                    navigate(`/transmission-models/${params.data.transmissionModelId}`);
                }
            }
        },
        { headerName: 'Зав. № трансмиссии', field: 'transmissionSerialNumber' },
        {
            headerName: 'Модель ведущего моста',
            field: 'driveAxleModelName',
            cellRenderer: (params: ICellRendererParams<(typeof rowData)[0]>) => {
                const hasDescription = params.data?.driveAxleModelWithDescription;
                return hasDescription ?
                    <span className="clickable">{params.value}</span> :
                    params.value;
            },
            cellStyle: { cursor: 'pointer' },
            onCellClicked: (params: CellClickedEvent<(typeof rowData)[0]>) => {
                if (params.data?.driveAxleModelWithDescription && params.data.driveAxleModelId) {
                    navigate(`/drive-axle-models/${params.data.driveAxleModelId}`);
                }
            }
        },
        { headerName: 'Зав. № ведущего моста', field: 'driveAxleSerialNumber' },
        {
            headerName: 'Модель управляемого моста',
            field: 'steeringAxleModelName',
            cellRenderer: (params: ICellRendererParams<(typeof rowData)[0]>) => {
                const hasDescription = params.data?.steeringAxleModelWithDescription;
                return hasDescription ?
                    <span className="clickable">{params.value}</span> :
                    params.value;
            },
            cellStyle: { cursor: 'pointer' },
            onCellClicked: (params: CellClickedEvent<(typeof rowData)[0]>) => {
                if (params.data?.steeringAxleModelWithDescription && params.data.steeringAxleModelId) {
                    navigate(`/steering-axle-models/${params.data.steeringAxleModelId}`);
                }
            }
        },
        { headerName: 'Зав. № управляемого моста', field: 'steeringAxleSerialNumber' }
    ], [navigate]);

    return (
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
    );
};