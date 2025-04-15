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

export const createOptionsFromDictionary = (items: any[]) =>
    items.map(item => ({
        value: item.id,
        label: item.name
    }));

export const createModelColumn = ({headerName, field, options, urlPrefix}: ModelColumnConfig): ColDef => {
    return {
        headerName,
        field,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
            values: options.map(option => option.value),
            cellRenderer: (params: any) => {
                const model = options.find(m => m.value === params.value);
                return model ? model.label : '';
            }
        } as any,
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

export const createSerialNumberColumn = (headerName: string, field: string): ColDef => {
    return {
        headerName,
        field,
    };
};