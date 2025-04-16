import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { Link } from 'react-router-dom';

export type OptionType = {
    value: string | number;
    label: string;
};

export type ModelColumnConfig = {
    headerName: string;
    field: string;
    options: OptionType[];
    urlPrefix: string;
};

export const createSerialNumberOptionsFromDictionary = (items: any[]) =>
    items.map(item => ({
        value: item.id,
        label: item.serial_number
    }));

export const createOptionsFromDictionary = (items: any[]) =>
    items.map(item => ({
        value: item.id,
        label: item.name
    }));

export const createSimpleColumn = (headerName: string, field: string): ColDef => {
    return {
        headerName,
        field,
    };
};

export const createDateColumn = (headerName: string, field: string) => {
    return {
        headerName,
        field,
        minWidth: 150,
        valueFormatter: (params: any) => {
            if (!params.value) return '';

            try {
                if (typeof params.value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(params.value)) {
                    const [year, month, day] = params.value.split('-').map(Number);
                    const date = new Date(year, month - 1, day);
                    return date.toLocaleDateString();
                }

                const date = new Date(params.value);
                return date.toLocaleDateString();
            } catch (e) {
                console.error('Ошибка при форматировании даты:', e);
                return params.value;
            }
        }
    };
};


export const createSerialNumberColumn = ({headerName, field, options, urlPrefix}: ModelColumnConfig): ColDef => {
    return {
        headerName,
        field,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
            values: options.map(option => option.value),
            cellRenderer: (params: any) => {
                const option = options.find(opt => opt.value === params.value);
                return option ? option.label : '';
            }
        } as any,
        valueFormatter: (params) => {
            if (params.value === undefined || params.value === null) return '';
            const option = options.find(opt => opt.value === params.value);
            return option ? option.label : params.value;
        },
        filter: 'agTextColumnFilter',
        filterValueGetter: params => {
            const option = options.find(opt => opt.value === params.data?.[field]);
            return option ? option.label : '';
        },
        cellRenderer: (params: ICellRendererParams) => {
            if (!params.data?.[field]) return '';
            const option = options.find(opt => opt.value === params.value);
            const displayValue = option ? option.label : '';
            return (
                <Link to={`${urlPrefix}/${displayValue}`}>{displayValue}</Link>
            );
        }
    };
};

export const createReferenceColumn = ({headerName, field, options, urlPrefix}: ModelColumnConfig): ColDef => {
    return {
        headerName,
        field,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
            values: options.map(option => option.value),
            cellRenderer: (params: any) => {
                const option = options.find(opt => opt.value === params.value);
                return option ? option.label : '';
            }
        },
        valueFormatter: (params) => {
            if (params.value === undefined || params.value === null) return '';
            const option = options.find(opt => opt.value === params.value);
            return option ? option.label : params.value;
        },
        filter: 'agTextColumnFilter',
        filterValueGetter: params => {
            const option = options.find(option => option.value === params.data[field]);
            return option ? option.label : '';
        },
        cellRenderer: (params: ICellRendererParams) => {
            if (!params.data?.[field]) return '';
            const option = options.find(option => option.value === params.value);
            const displayValue = option ? option.label : '';
            return (
                <Link to={`${urlPrefix}/${params.data[field]}`}>{displayValue}</Link>
            );
        }
    };
};

export const createCompanyColumn = (headerName: string, field: string, options: OptionType[], urlPrefix?: string): ColDef => {
    const fallbackOption = options.find(opt => opt.value === -1);

    return {
        headerName,
        field,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
            values: options.map(option => option.value),
            cellRenderer: (params: any) => {
                const company = options?.find(c => c.value === params.value);
                return company ? company.label : (fallbackOption ? fallbackOption.label : '');
            }
        },
        valueFormatter: (params) => {
            if (params.value === undefined || params.value === null) return '';
            const option = options?.find(opt => opt.value === params.value);
            return option ? option.label : (fallbackOption ? fallbackOption.label : params.value);
        },
        filter: 'agTextColumnFilter',
        filterValueGetter: params => {
            const option = options?.find(option => option.value === params.data[field]);
            return option ? option.label : (fallbackOption ? fallbackOption.label : '');
        },
        cellRenderer: (params: ICellRendererParams) => {
            if (!params.data || !(field in params.data)) return fallbackOption ? fallbackOption.label : '';
            const option = options?.find(option => option.value === params.value);
            if (fallbackOption && (!option || fallbackOption === option)) {
                return fallbackOption.label;
            }

            const displayValue = option ? option.label : '';
            if (urlPrefix && params.data[field]) {
                return <Link to={`${urlPrefix}/${params.data[field]}`}>{displayValue}</Link>;
            }

            return displayValue;
        }
    };
};