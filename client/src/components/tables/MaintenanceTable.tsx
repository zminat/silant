import {FC, useMemo} from 'react';
import {AgGridReact} from 'ag-grid-react';
import {AllCommunityModule, ModuleRegistry, themeMaterial} from 'ag-grid-community';
import AG_GRID_LOCALE_RU from '../../locale/AG_GRID_LOCALE_RU.ts';
import {MaintenanceTableProps} from '../../types/machine.types';
import '../../styles/Main.css';
import {
    deleteSelectedRows,
    createSerialNumberOptionsFromDictionary,
    createOptionsFromDictionary,
    createSimpleColumn,
    createDateColumn,
    createSerialNumberColumn,
    createReferenceColumn,
    createCompanyColumn,
    saveNewRow,
    updateRow,
    keepNewRowAtBottom
} from "./Helpers.tsx";
import {useLoadingError} from "../context/LoadingErrorContext.tsx";

ModuleRegistry.registerModules([AllCommunityModule]);

export const MaintenanceTable: FC<MaintenanceTableProps> = ({
                                                                maintenances,
                                                                dictionaries,
                                                                permissions
                                                            }) => {

    const { setLoading, handleError } = useLoadingError();

    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        filterParams: {
            buttons: ['reset', 'apply'],
            closeOnApply: true
        },
        wrapText: true,
        autoHeight: true,
        autoHeaderHeight: true,
        resizable: true,
        editable: permissions.can_edit,
        suppressKeyboardEvent: deleteSelectedRows(
            '/api/maintenances',
            permissions.can_delete,
            setLoading,
            handleError
        )
    }), [permissions]);

    const createEmptyRow = () => {
        return {
            id: -2,
            machineId: -2,
            maintenanceTypeId: -2,
            maintenanceDate: '',
            operatingTime: undefined,
            orderNumber: '',
            orderDate: '',
            organizationId: -2,
        };
    }

    const rowData = useMemo(() => {
        const preparedData = maintenances.map((maintenance) => ({
            id: maintenance.id,
            machineId: maintenance.machine_id,
            maintenanceTypeId: maintenance.maintenance_type_id,
            maintenanceDate: maintenance.maintenance_date,
            operatingTime: maintenance.operating_time,
            orderNumber: maintenance.order_number,
            orderDate: maintenance.order_date,
            organizationId: maintenance.organization_id ?? -1
        }));
        if (permissions.can_create) {
            preparedData.push(createEmptyRow());
        }
        return preparedData;
    }, [maintenances, permissions.can_create]);

    const machineOptions = useMemo(() =>
            createSerialNumberOptionsFromDictionary(dictionaries.machines),
        [dictionaries.machines]
    );

    const maintenanceTypeOptions = useMemo(() =>
            createOptionsFromDictionary(dictionaries.maintenance_types),
        [dictionaries.maintenance_types]
    );

    const organizationOptions = useMemo(() =>
            createOptionsFromDictionary(dictionaries.organizations),
        [dictionaries.organizations]
    );

    const columnDefs = useMemo(() => [
        createSerialNumberColumn({
            headerName: 'Зав. № машины',
            field: 'machineId',
            options: machineOptions,
            urlPrefix: '/machines'
        }),
        createReferenceColumn({
            headerName: 'Вид ТО',
            field: 'maintenanceTypeId',
            options: maintenanceTypeOptions,
            urlPrefix: '/maintenance-types'
        }),
        createDateColumn('Дата проведения ТО', 'maintenanceDate'),
        createSimpleColumn('Наработка, м/час', 'operatingTime'),
        createSimpleColumn('№ заказ-наряда', 'orderNumber'),
        createDateColumn('Дата заказ-наряда', 'orderDate'),
        createCompanyColumn('Организация, проводившая ТО', 'organizationId', organizationOptions, '/service-companies')
    ], [machineOptions, maintenanceTypeOptions, organizationOptions]);

    const convertData = (data: any) => {
        return {
            id: data.id,
            machine: data.machineId,
            maintenance_type: data.maintenanceTypeId,
            maintenance_date: data.maintenanceDate,
            operating_time: data.operatingTime,
            order_number: data.orderNumber,
            order_date: data.orderDate,
            organization: data.organizationId !== -1 ? data.organizationId : null,
        };
    }

    const checkRequiredFields = (data: any) => {
        return data.machineId !== -2 &&
            data.maintenanceTypeId !== -2 &&
            data.maintenanceDate !== '' &&
            data.operatingTime !== undefined &&
            data.orderNumber !== '' &&
            data.orderDate !== -2 &&
            data.organizationId !== -2;
    }

    const onCellValueChanged = (params: any) => {
        const {data, node, newValue, oldValue, api} = params;

        if (data.id !== -2) {
            const convertedData = convertData(data);
            updateRow('/api/maintenances', api, convertedData, oldValue, newValue, setLoading, handleError);
            return;
        }

        if (checkRequiredFields(data)) {
            const convertedData = convertData(data);
            saveNewRow('/api/maintenances/', api, convertedData, node, createEmptyRow(), setLoading, handleError);
        }
    };

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
            rowSelection={{
                mode: 'multiRow',
                checkboxes: false,
                headerCheckbox: false,
                enableClickSelection: true
            }}
            onCellValueChanged={onCellValueChanged}
            postSortRows={keepNewRowAtBottom}
        />
    );
};