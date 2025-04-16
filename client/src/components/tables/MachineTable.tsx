import {FC, useMemo} from 'react';
import {AgGridReact} from 'ag-grid-react';
import {AllCommunityModule, ModuleRegistry, ICellRendererParams, themeMaterial} from 'ag-grid-community';
import AG_GRID_LOCALE_RU from '../../locale/AG_GRID_LOCALE_RU.ts';
import {MachineTableProps} from '../../types/machine.types';
import '../../styles/Main.css';
import {
    createReferenceColumn,
    createOptionsFromDictionary,
    createSimpleColumn,
    createCompanyColumn
} from "./Helpers.tsx";
import {Link} from "react-router-dom";

ModuleRegistry.registerModules([AllCommunityModule]);

export const MachineTable: FC<MachineTableProps> = ({
                                                        machines,
                                                        dictionaries,
                                                        permissions,
                                                        isAuthenticated
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
        return machines.map((machine, index) => {
            const data = {
                modelId: machine.model_id,
                serialNumber: machine.serial_number,
                engineModelId: machine.engine_model_id,
                engineSerialNumber: machine.engine_serial_number,
                transmissionModelId: machine.transmission_model_id,
                transmissionSerialNumber: machine.transmission_serial_number,
                driveAxleModelId: machine.drive_axle_model_id,
                driveAxleSerialNumber: machine.drive_axle_serial_number,
                steeringAxleModelId: machine.steering_axle_model_id,
                steeringAxleSerialNumber: machine.steering_axle_serial_number,
            };

            if (isAuthenticated) {
                return {
                    index: index + 1,
                    id: machine.id,
                    ...data,
                    shipmentDate: machine.shipment_date,
                    clientId: machine.client_id,
                    consignee: machine.consignee,
                    deliveryAddress: machine.delivery_address,
                    equipment: machine.equipment,
                    serviceCompanyId: machine.service_company_id,
                };
            }

            return data;
        });
    }, [machines, isAuthenticated]);

    const modelOptions = useMemo(() =>
            createOptionsFromDictionary(dictionaries.models),
        [dictionaries.models]
    );

    const engineModelOptions = useMemo(() =>
            createOptionsFromDictionary(dictionaries.engine_models),
        [dictionaries.engine_models]
    );

    const transmissionModelOptions = useMemo(() =>
            createOptionsFromDictionary(dictionaries.transmission_models),
        [dictionaries.transmission_models]
    );

    const driveAxleModelOptions = useMemo(() =>
            createOptionsFromDictionary(dictionaries.drive_axle_models),
        [dictionaries.drive_axle_models]
    );

    const steeringAxleModelOptions = useMemo(() =>
            createOptionsFromDictionary(dictionaries.steering_axle_models),
        [dictionaries.steering_axle_models]
    );

    const clientOptions = useMemo(() =>
            isAuthenticated && dictionaries.clients ?
                createOptionsFromDictionary(dictionaries.clients) : [],
        [dictionaries.clients, isAuthenticated]
    );

    const serviceCompanyOptions = useMemo(() =>
            isAuthenticated && dictionaries.service_companies ?
                createOptionsFromDictionary(dictionaries.service_companies) : [],
        [dictionaries.service_companies, isAuthenticated]
    );

    const baseColumnDefs = useMemo(() => [
        createReferenceColumn({
            headerName: 'Модель техники',
            field: 'modelId',
            options: modelOptions,
            urlPrefix: '/machine-models'
        }),
        {
            headerName: 'Зав. № машины',
            field: 'serialNumber',
            cellRenderer: (params: ICellRendererParams) => {
                if (!isAuthenticated)
                    return params.value;
                return params.value ? (
                    <Link to={`/machines/${params.value}`}>{params.value}</Link>
                ) : '';
            },
            onCellValueChanged: (params) => {
                if (params.node) {
                    params.api.refreshCells({
                        rowNodes: [params.node],
                        columns: ['index'],
                        force: true
                    });
                }
            }
        },
        createReferenceColumn({
            headerName: 'Модель двигателя',
            field: 'engineModelId',
            options: engineModelOptions,
            urlPrefix: '/engine-models'
        }),
        createSimpleColumn('Зав. № двигателя', 'engineSerialNumber'),
        createReferenceColumn({
            headerName: 'Модель трансмиссии',
            field: 'transmissionModelId',
            options: transmissionModelOptions,
            urlPrefix: '/transmission-models'
        }),
        createSimpleColumn('Зав. № трансмиссии', 'transmissionSerialNumber'),
        createReferenceColumn({
            headerName: 'Модель ведущего моста',
            field: 'driveAxleModelId',
            options: driveAxleModelOptions,
            urlPrefix: '/drive-axle-models'
        }),
        createSimpleColumn('Зав. № ведущего моста', 'driveAxleSerialNumber'),
        createReferenceColumn({
            headerName: 'Модель управляемого моста',
            field: 'steeringAxleModelId',
            options: steeringAxleModelOptions,
            urlPrefix: '/machine-models'
        }),
        createSimpleColumn('Зав. № управляемого моста', 'steeringAxleSerialNumber'),
    ], [
        modelOptions,
        engineModelOptions,
        transmissionModelOptions,
        driveAxleModelOptions,
        steeringAxleModelOptions
    ]);

    const advancedColumnDefs = useMemo(() => [
        {
            headerName: '№',
            field: 'index',
            width: 60,
            editable: false,
            cellRenderer: (params: ICellRendererParams) => {
                return params.value && params.data?.serialNumber ? (
                    <Link to={`/machines/${params.data?.serialNumber}`}>{params.value}</Link>
                ) : '';
            }
        },
        ...baseColumnDefs,
        {
            headerName: 'Дата отгрузки с завода',
            field: 'shipmentDate',
        },
        createCompanyColumn('Покупатель', 'clientId', clientOptions),
        {
            headerName: 'Грузополучатель (конечный потребитель)',
            field: 'consignee',
        },
        {
            headerName: 'Адрес поставки (эксплуатации)',
            field: 'deliveryAddress',
        },
        {
            headerName: 'Комплектация (доп. опции)',
            field: 'equipment',
        },
        createCompanyColumn('Сервисная компания', 'serviceCompanyId', serviceCompanyOptions, '/service-companies')
    ], [isAuthenticated, baseColumnDefs, clientOptions, serviceCompanyOptions]);

    const columnDefs = useMemo(() =>
            isAuthenticated ? advancedColumnDefs : baseColumnDefs,
        [isAuthenticated, baseColumnDefs, advancedColumnDefs]
    );

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