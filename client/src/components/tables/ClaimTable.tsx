import {FC, useMemo} from 'react';
import {AgGridReact} from 'ag-grid-react';
import {AllCommunityModule, ModuleRegistry, themeMaterial} from 'ag-grid-community';
import AG_GRID_LOCALE_RU from '../../locale/AG_GRID_LOCALE_RU.ts';
import {ClaimTableProps} from '../../types/machine.types';
import '../../styles/Main.css';
import {
    deleteSelectedRows,
    createSerialNumberOptionsFromDictionary,
    createOptionsFromDictionary,
    createSimpleColumn,
    createDateColumn,
    createSerialNumberColumn,
    createReferenceColumn,
    saveNewRow,
    updateRow,
    keepNewRowAtBottom
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
        suppressKeyboardEvent: deleteSelectedRows(
            '/api/claims',
            permissions.can_delete)
    }), [permissions]);

    const createEmptyRow = () => {
        return {
            id: -2,
            machineId: -2,
            failureDate: '',
            operatingTime: undefined,
            failureNodeId: -2,
            failureDescription: '',
            recoveryMethodId: -2,
            sparePartsUsed: '',
            recoveryDate: '',
        };
    }

    const rowData = useMemo(() => {
        const preparedData = claims.map((claim) => ({
            id: claim.id,
            machineId: claim.machine_id,
            failureDate: claim.failure_date,
            operatingTime: claim.operating_time,
            failureNodeId: claim.failure_node_id,
            failureDescription: claim.failure_description,
            recoveryMethodId: claim.recovery_method_id,
            sparePartsUsed: claim.spare_parts_used,
            recoveryDate: claim.recovery_date,
        }));
        if (permissions.can_create) {
            preparedData.push(createEmptyRow());
        }
        return preparedData;
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
        createDateColumn('Дата отказа', 'failureDate'),
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
            urlPrefix: '/recovery-methods'
        }),
        createSimpleColumn('Используемые запасные части', 'sparePartsUsed'),
        createDateColumn('Дата восстановления', 'recoveryDate'),
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

    const convertData = (data: any) => {
        return {
            id: data.id,
            machine: data.machineId,
            failure_date: data.failureDate,
            operating_time: data.operatingTime,
            failure_node: data.failureNodeId,
            failure_description: data.failureDescription,
            recovery_method: data.recoveryMethodId,
            spare_parts_used: data.sparePartsUsed,
            recovery_date: data.recoveryDate
        };
    }

    const checkRequiredFields = (data: any) => {
        return data.machineId !== -2 &&
            data.failureDate !== '' &&
            data.operatingTime !== undefined &&
            data.failureNodeId !== -2 &&
            data.failureDescription !== '' &&
            data.recoveryMethodId !== -2 &&
            data.recoveryDate !== '';
    }

    const onCellValueChanged = (params: any) => {
        const {data, node, newValue, oldValue, api} = params;

        if (data.id !== -2) {
            const convertedData = convertData(data);
            updateRow('/api/claims', api, convertedData, oldValue, newValue);
            return;
        }

        if (checkRequiredFields(data)) {
            const convertedData = convertData(data);
            saveNewRow('/api/claims/', api, convertedData, node, createEmptyRow());
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
            rowSelection='multiple'
            onCellValueChanged={onCellValueChanged}
            postSortRows={keepNewRowAtBottom}
        />
    );
};