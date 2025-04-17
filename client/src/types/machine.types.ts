interface dictionary {
    id: number;
    name: string;
}

interface permissions {
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
}

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
        models: dictionary[];
        engine_models: dictionary[];
        transmission_models: dictionary[];
        drive_axle_models: dictionary[];
        steering_axle_models: dictionary[];
        service_companies?: dictionary[];
        clients?: dictionary[];
    };
    permissions: permissions;
    isAuthenticated?: boolean;
}

export interface MaintenanceData {
    id: number;
    machine_id: number;
    maintenance_type_id: number;
    maintenance_date: string;
    operating_time?: number;
    order_number: string;
    order_date: string;
    organization_id?: number;
}

export interface MaintenanceTableProps {
    maintenances: MaintenanceData[];
    dictionaries: {
        machines: dictionary[];
        maintenance_types: dictionary[];
        organizations: dictionary[];
    };
    permissions: permissions;
}

export interface ClaimData {
    id: number;
    machine_id: number;
    failure_date: string;
    operating_time?: number;
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
        machines: dictionary[];
        failure_nodes: dictionary[];
        recovery_methods: dictionary[];
    };
    permissions: permissions;
}