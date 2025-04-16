import {FC, useMemo} from 'react';
import {AgGridReact} from 'ag-grid-react';
import {AllCommunityModule, ModuleRegistry, themeMaterial} from 'ag-grid-community';
import AG_GRID_LOCALE_RU from '../../locale/AG_GRID_LOCALE_RU.ts';
import {ClaimTableProps} from '../../types/machine.types';
import '../../styles/Main.css';
import {
    createOptionsFromDictionary,
    createReferenceColumn,
    createSerialNumberColumn,
    createSerialNumberOptionsFromDictionary,
    createSimpleColumn
} from "./Helpers.tsx";

ModuleRegistry.registerModules([AllCommunityModule]);

export const ClaimTable: FC<ClaimTableProps> = ({
                                                    claims,
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
        return claims.map((claim, index) => ({
            index: index + 1,
            machineId: claim.machine_id,
            failureDate: claim.failure_date,
            operatingTime: claim.operating_time,
            failureNodeId: claim.failure_node_id,
            failureDescription: claim.failure_description,
            recoveryMethodId: claim.recovery_method_id,
            sparePartsUsed: claim.spare_parts_used,
            recoveryDate: claim.recovery_date,
            downtimeDays: claim.downtime
        }));
    }, [claims]);

    const machineOptions = useMemo(() =>
            createSerialNumberOptionsFromDictionary(dictionaries.machines),
        [dictionaries.machines]
    );

    const failureNodeOptions = useMemo(() =>
            createOptionsFromDictionary(dictionaries.failure_nodes),
        [dictionaries.failure_nodes]
    );

    const recoveryMethodOptions = useMemo(() =>
            createOptionsFromDictionary(dictionaries.recovery_methods),
        [dictionaries.recovery_methods]
    );

    const columnDefs = useMemo(() => [
        createSerialNumberColumn({
            headerName: 'Зав. № машины',
            field: 'machineId',
            options: machineOptions,
            urlPrefix: '/machines'
        }),
        createSimpleColumn('Дата отказа', 'failureDate'),
        createSimpleColumn('Наработка, м/час', 'operatingTime'),
        createReferenceColumn({
            headerName: 'Узел отказа',
            field: 'failureNodeId',
            options: failureNodeOptions,
            urlPrefix: '/failure-nodes'
        }),
        createSimpleColumn('Описание отказа', 'failureDescription'),
        createReferenceColumn({
            headerName: 'Способ восстановления',
            field: 'recoveryMethodId',
            options: recoveryMethodOptions,
            urlPrefix: '/failure-nodes'
        }),
        createSimpleColumn('Используемые запасные части', 'sparePartsUsed'),
        createSimpleColumn('Дата восстановления', 'recoveryDate'),
        {
            headerName: 'Время простоя техники',
            editable: false,
            valueGetter: (params) => {
                if (params.data.recoveryDate && params.data.failureDate) {
                    const endDate = new Date(params.data.recoveryDate);
                    const startDate = new Date(params.data.failureDate);
                    const diffTime = endDate.getTime() - startDate.getTime();
                    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                }
                return null;
            }
        }
    ], [machineOptions, failureNodeOptions, recoveryMethodOptions]);

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