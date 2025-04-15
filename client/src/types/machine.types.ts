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
        can_create: boolean;
        can_edit: boolean;
        can_delete: boolean;
    };
    isAuthenticated?: boolean;
}

export interface MaintenanceData {
    id: number;
    machine_id: number;
    maintenance_type_id: number;
    maintenance_date: string;
    operating_time: number;
    order_number: string;
    order_date: string;
    organization_id: string;
}

export interface MaintenanceTableProps {
    maintenances: MaintenanceData[];
    dictionaries: {
        machines: any[];
        maintenance_types: any[];
        organizations: any[];
    };
    permissions: {
        can_create: boolean;
        can_edit: boolean;
        can_delete: boolean;
    };
}

export interface ClaimData {
    id: number;
    machine_id: number;
    failure_date: string;
    operating_time: number;
    failure_node_id: number;
    failure_description: string;
    recovery_method_id: number;
    spare_parts_used: string;
    recovery_date: string;
    downtime: number;
}

export interface ClaimTableProps {
    claims: ClaimData[];
    dictionaries: {
        machines: any[];
        failure_nodes: any[];
        recovery_methods: any[];
    };
    permissions: {
        can_create: boolean;
        can_edit: boolean;
        can_delete: boolean;
    };
}