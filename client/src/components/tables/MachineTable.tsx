import {FC, useMemo} from 'react';
import {AgGridReact} from 'ag-grid-react';
import {AllCommunityModule, ModuleRegistry, ICellRendererParams, themeMaterial} from 'ag-grid-community';
import AG_GRID_LOCALE_RU from '../../locale/AG_GRID_LOCALE_RU.ts';
import {MachineTableProps} from '../../types/machine.types';
import '../../styles/Main.css';
import {Link} from "react-router-dom";
import {
    deleteSelectedRows,
    createOptionsFromDictionary,
    createSimpleColumn,
    createDateColumn,
    createReferenceColumn,
    createCompanyColumn,
    saveNewRow,
    updateRow,
    keepNewRowAtBottom
} from "./Helpers.tsx";
import {useLoadingError} from "../context/LoadingErrorContext.tsx";

ModuleRegistry.registerModules([AllCommunityModule]);

export const MachineTable: FC<MachineTableProps> = ({
                                                        machines,
                                                        dictionaries,
                                                        permissions,
                                                        isAuthenticated
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
            '/api/machines',
            permissions.can_delete,
            setLoading,
            handleError
        )
    }), [permissions]);

    const createEmptyRow = () => {
        return {
            id: -2,
            modelId: -2,
            serialNumber: '',
            engineModelId: -2,
            engineSerialNumber: '',
            transmissionModelId: -2,
            transmissionSerialNumber: '',
            driveAxleModelId: -2,
            driveAxleSerialNumber: '',
            steeringAxleModelId: -2,
            steeringAxleSerialNumber: '',
            shipmentDate: '',
            clientId: -2,
            consignee: '',
            deliveryAddress: '',
            equipment: '',
            serviceCompanyId: -2
        };
    }

    const rowData = useMemo(() => {
        const preparedData = machines.map((machine) => {
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
        if (permissions.can_create) {
            preparedData.push(createEmptyRow());
        }
        return preparedData;
    }, [machines, isAuthenticated, permissions.can_create]);

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
            urlPrefix: '/steering-axle-models'
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
            width: 70,
            editable: false,
            cellRenderer: (params: ICellRendererParams) => {
                if (params.data?.id === -2) {
                    return null;
                }
                const value = params?.node?.rowIndex !== null ? params.node.rowIndex + 1 : params.value;
                return params.data?.serialNumber ? (
                    <Link to={`/machines/${params.data?.serialNumber}`}>{value}</Link>
                ) : value;
            }
        },
        ...baseColumnDefs,
        createDateColumn('Дата отгрузки с завода', 'shipmentDate'),
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

    const convertData = (data: any) => {
        return {
            id: data.id,
            model: data.modelId,
            serial_number: data.serialNumber,
            engine_model: data.engineModelId,
            engine_serial_number: data.engineSerialNumber,
            transmission_model: data.transmissionModelId,
            transmission_serial_number: data.transmissionSerialNumber,
            drive_axle_model: data.driveAxleModelId,
            drive_axle_serial_number: data.driveAxleSerialNumber,
            steering_axle_model: data.steeringAxleModelId,
            steering_axle_serial_number: data.steeringAxleSerialNumber,
            shipment_date: data.shipmentDate,
            client: data.clientId,
            consignee: data.consignee,
            delivery_address: data.deliveryAddress,
            equipment: data.equipment,
            service_company: data.serviceCompanyId,
        };
    }

    const checkRequiredFields = (data: any) => {
        return data.modelId !== -2 &&
            data.serialNumber !== '' &&
            data.engineModelId !== -2 &&
            data.engineSerialNumber !== '' &&
            data.transmissionModelId !== -2 &&
            data.transmissionSerialNumber !== '' &&
            data.driveAxleModelId !== -2 &&
            data.driveAxleSerialNumber !== '' &&
            data.steeringAxleModelId !== -2 &&
            data.steeringAxleSerialNumber !== '' &&
            data.shipmentDate !== '' &&
            data.clientId !== -2 &&
            data.consignee !== '' &&
            data.deliveryAddress !== '' &&
            data.serviceCompanyId !== -2;
    }

    const onCellValueChanged = (params: any) => {
        const {data, node, newValue, oldValue, api} = params;

        if (data.id !== -2) {
            const convertedData = convertData(data);
            updateRow('/api/machines', api, convertedData, oldValue, newValue, setLoading, handleError);
            return;
        }

        if (checkRequiredFields(data)) {
            const convertedData = convertData(data);
            saveNewRow('/api/machines/', api, convertedData, node, createEmptyRow(), setLoading, handleError);
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