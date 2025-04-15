export interface MachineData {
    id?: number;
    model_id: number;
    serial_number: string;
    engine_model_id: number;
    engine_serial_number: string;
    transmission_model_id: number;
    transmission_serial_number: string;
    drive_axle_model_id: number;
    drive_axle_serial_number: string;
    steering_axle_model_id: number;
    steering_axle_serial_number: string;
    shipment_date?: string;
    client_id?: number;
    consignee?: string;
    delivery_address?: string;
    equipment?: string;
    service_company_id?: number;
}

export interface MachineTableProps {
    machines: MachineData[];
    dictionaries: {
        models: any[];
        engine_models: any[];
        transmission_models: any[];
        drive_axle_models: any[];
        steering_axle_models: any[];
        service_companies?: any[];
        clients?: any[];
    };
    permissions: {
        can_edit: boolean;
        can_delete: boolean;
        can_create: boolean;
    };
    isAuthenticated?: boolean;
}

export interface MaintenanceData {
    id: number;
    machine: {
        id: Number;
        serial_number: string;
        name: string;
        description: string;
    };
    maintenance_type: {
        id: Number;
        name: string;
        description: string;
    };
    maintenance_date: string;
    operating_time: number;
    order_number: string;
    order_date: string;
    organization: string;
    service_company?: {
        id: number;
        name: string;
        description: string;
    };
}


export interface ClaimsData {
    id: number;
    machine: {
        id: Number;
        serial_number: string;
        name: string;
        description: string;
    };
    failure_date: string;
    operating_time: number;
    failure_node: {
        id: Number;
        name: string;
        description: string;
    };
    failure_description: string;
    recovery_method: {
        id: Number;
        name: string;
        description: string;
    };
    spare_parts_used: string;
    recovery_date: string;
    downtime: number;
}