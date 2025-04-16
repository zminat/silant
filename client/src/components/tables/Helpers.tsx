import {ColDef, ICellRendererParams, SuppressKeyboardEventParams} from 'ag-grid-community';
import {Link} from 'react-router-dom';
import {getCookie} from "../../utils/utils.ts";

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
        value: item.id ?? -1,
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
    return {
        headerName,
        field,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
            values: options.map(option => option.value),
            cellRenderer: (params: any) => {
                const option = options?.find(opt => opt.value === params.value);
                return option ? option.label : '';
            }
        },
        valueFormatter: (params) => {
            if (params.value === undefined || params.value === null) return '';
            const option = options?.find(opt => opt.value === params.value);
            return option ? option.label : params.value;
        },
        filter: 'agTextColumnFilter',
        filterValueGetter: params => {
            const option = options?.find(option => option.value === params.data[field]);
            return option ? option.label : '';
        },
        cellRenderer: (params: ICellRendererParams) => {
            if (!params.data || !(field in params.data)) return '';
            const option = options?.find(option => option.value === params.value);
            const displayValue = option ? option.label : '';
            if (urlPrefix && params.data[field] !== -1) {
                return <Link to={`${urlPrefix}/${params.data[field]}`}>{displayValue}</Link>;
            }

            return displayValue;
        }
    };
};

export const deleteRows = (
    baseUrl: string,
    canDelete: boolean,
    confirmMessage: string = "Вы уверены, что хотите удалить выбранные записи?"
): (params: SuppressKeyboardEventParams) => boolean => {
    return (params: SuppressKeyboardEventParams): boolean => {
        if (params.event.key !== "Delete" || !params.event.shiftKey || !canDelete) {
            return false;
        }

        const api = params.api;
        const selectedNodes = api.getSelectedNodes();

        if (!selectedNodes || selectedNodes.length === 0) {
            return true;
        }

        const selectedIds = selectedNodes.map(node => node.data.id);

        if (!window.confirm(confirmMessage)) {
            return true;
        }

        selectedIds.forEach(id => {
            const deleteUrl = `${baseUrl}/${id}/`;

            fetch(deleteUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') || '',
                },
                credentials: 'include',
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Ошибка удаления записи с ID ${id}: ${response.status}`);
                    }

                    api.applyTransaction({
                        remove: selectedNodes.map(node => node.data)
                    });

                    api.deselectAll();
                    api.refreshCells()

                })
                .catch(error => {
                    console.error('Ошибка удаления:', error);
                });
        });

        return true;
    };
};