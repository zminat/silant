import {FC, useMemo} from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, ColDef, ICellRendererParams, CellClickedEvent, themeMaterial } from 'ag-grid-community';
import { useNavigate } from 'react-router-dom';
import AG_GRID_LOCALE_RU from '../../locale/AG_GRID_LOCALE_RU.ts';
import { MaintenanceData } from '../../types/machine.types';
import '../../styles/Main.css';

ModuleRegistry.registerModules([AllCommunityModule]);

interface MaintenanceTableProps {
    maintenance: MaintenanceData[];
}

export const MaintenanceTable: FC<MaintenanceTableProps> = ({ maintenance }) => {
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

    // Преобразуем данные ТО в формат для AgGrid
    const rowData = useMemo(() => {
        return maintenance.map((item, index) => ({
            index: index + 1,
            serialNumber: item.machine?.serial_number || '',
            machineWithDescription: !!item.machine?.description,
            machineId: item.machine?.id,
            maintenanceType: item.maintenance_type?.name || '',
            maintenanceTypeWithDescription: !!item.maintenance_type?.description,
            maintenanceTypeId: item.maintenance_type?.id,
            maintenanceDate: item.maintenance_date,
            operatingTime: item.operating_time,
            orderNumber: item.order_number,
            orderDate: item.order_date,
            organization: item.organization
        }));
    }, [maintenance]);

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
                if (params.data?.machineWithDescription && params.data.machineId) {
                    navigate(`/machines/${params.data.machineId}`);
                }
            }
        },
        {
            headerName: 'Вид ТО',
            field: 'maintenanceType',
            cellRenderer: (params: ICellRendererParams<(typeof rowData)[0]>) => {
                const hasDescription = params.data?.maintenanceTypeWithDescription;
                return hasDescription ?
                    <span className="clickable">{params.value}</span> :
                    params.value;
            },
            cellStyle: { cursor: 'pointer' },
            onCellClicked: (params: CellClickedEvent<(typeof rowData)[0]>) => {
                if (params.data?.maintenanceTypeWithDescription && params.data.maintenanceTypeId) {
                    navigate(`/maintenance-types/${params.data.maintenanceTypeId}`);
                }
            }
        },
        { headerName: 'Дата проведения ТО', field: 'maintenanceDate' },
        { headerName: 'Наработка, м/час', field: 'operatingTime' },
        { headerName: '№ заказ-наряда', field: 'orderNumber' },
        { headerName: 'Дата заказ-наряда', field: 'orderDate' },
        { headerName: 'Организация, проводившая ТО', field: 'organization' }
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