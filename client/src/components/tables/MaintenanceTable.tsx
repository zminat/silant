import {FC, useMemo} from 'react';
import {AgGridReact} from 'ag-grid-react';
import {AllCommunityModule, ModuleRegistry, ICellRendererParams, themeMaterial} from 'ag-grid-community';
import AG_GRID_LOCALE_RU from '../../locale/AG_GRID_LOCALE_RU.ts';
import {MaintenanceTableProps} from '../../types/machine.types';
import '../../styles/Main.css';
import {
    createReferenceColumn,
    createOptionsFromDictionary,
    createSimpleColumn,
    createCompanyColumn
} from "./columnHelpers.tsx";
import {Link} from "react-router-dom";

ModuleRegistry.registerModules([AllCommunityModule]);

export const MaintenanceTable: FC<MaintenanceTableProps> = ({
                                                                maintenances,
                                                                dictionaries,
                                                                permissions,
                                                            }) => {
    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        filterParams: {
            buttons: ['reset', 'apply'],
            closeOnApply: true
        },
        wrapText: true,
        autoHeight: true,
        editable: permissions.can_edit,
    }), [permissions.can_edit]);

    const rowData = useMemo(() => {
        return maintenances.map((maintenance) => ({
            id: maintenance.id,
            machineId: maintenance.machine_id,
            maintenanceTypeId: maintenance.maintenance_type_id,
            maintenanceDate: maintenance.maintenance_date,
            operatingTime: maintenance.operating_time,
            orderNumber: maintenance.order_number,
            orderDate: maintenance.order_date,
            organizationId: maintenance.organization_id
        }));
    }, [maintenances]);

    const machineOptions = useMemo(() =>
            dictionaries.machines.map(item => ({
                value: item.id,
                label: item.serial_number
            })),
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
        {
            headerName: 'Зав. № машины',
            field: 'machineId',
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: machineOptions.map(option => option.value),
                cellRenderer: (params: any) => {
                    const model = machineOptions.find(m => m.value === params.value);
                    return model ? model.label : '';
                }
            } as any,
            valueFormatter: (params) => {
                if (params.value === undefined || params.value === null) return '';
                const option = machineOptions.find(opt => opt.value === params.value);
                return option ? option.label : params.value;
            },
            filter: 'agTextColumnFilter',
            filterValueGetter: params => {
                const option = machineOptions.find(option => option.value === params.data.machineId);
                return option ? option.label : '';
            },
            cellRenderer: (params: ICellRendererParams) => {
                if (!params.data?.machineId) return '';
                const option = machineOptions.find(option => option.value === params.value);
                const displayValue = option ? option.label : '';
                return (
                    <Link to={`/machines/${displayValue}`}>{displayValue}</Link>
                );
            }
        },
        createReferenceColumn({
            headerName: 'Вид ТО',
            field: 'maintenanceTypeId',
            options: maintenanceTypeOptions,
            urlPrefix: '/maintenance-types/'
        }),
        createSimpleColumn('Дата проведения ТО', 'maintenanceDate'),
        createSimpleColumn('Наработка, м/час', 'operatingTime'),
        createSimpleColumn('№ заказ-наряда', 'orderNumber'),
        createSimpleColumn('Дата заказ-наряда', 'orderDate'),
        createCompanyColumn('Организация, проводившая ТО', 'organizationId', organizationOptions, '/service-companies')
    ], [machineOptions, maintenanceTypeOptions, organizationOptions]);

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