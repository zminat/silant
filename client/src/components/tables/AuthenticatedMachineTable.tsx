import {FC, useMemo} from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, ColDef, ICellRendererParams, CellClickedEvent, themeMaterial } from 'ag-grid-community';
import { useNavigate } from 'react-router-dom';
import AG_GRID_LOCALE_RU from '../../locale/AG_GRID_LOCALE_RU.ts';
import { FullMachineData } from '../../types/machine.types';
import '../../styles/Main.css';

ModuleRegistry.registerModules([AllCommunityModule]);

interface AuthenticatedMachineTableProps {
    machines: FullMachineData[];
}

export const AuthenticatedMachineTable: FC<AuthenticatedMachineTableProps> = ({ machines }) => {
    const navigate = useNavigate();

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

    const rowData = useMemo(() => {
        return machines.map((machine, index) => ({
            index: index + 1,
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
            steeringAxleSerialNumber: machine.steering_axle_serial_number,
            shipmentDate: machine.shipment_date,
            buyer: machine.client?.first_name || '',
            consignee: machine.consignee,
            deliveryAddress: machine.delivery_address,
            equipment: machine.equipment,
            serviceCompany: machine.service_company?.name || '',
        }));
    }, [machines]);

    const columnDefs = useMemo<ColDef<(typeof rowData)[0]>[]>(() => [
        { headerName: '№ п/п', field: 'index', width: 80 },
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
        { headerName: 'Зав. № управляемого моста', field: 'steeringAxleSerialNumber' },
        { headerName: 'Дата отгрузки с завода', field: 'shipmentDate' },
        { headerName: 'Покупатель', field: 'buyer' },
        { headerName: 'Грузополучатель (конечный потребитель)', field: 'consignee' },
        { headerName: 'Адрес поставки (эксплуатации)', field: 'deliveryAddress' },
        { headerName: 'Комплектация (доп. опции)', field: 'equipment' },
        { headerName: 'Сервисная компания', field: 'serviceCompany' }
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