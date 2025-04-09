export interface PublicMachineData {
    serial_number: string;
    model: {
        name: string;
        description: string;
    };
    engine_model: {
        name: string;
        description: string;
    };
    engine_serial_number: string;
    transmission_model: {
        name: string;
        description: string;
    };
    transmission_serial_number: string;
    drive_axle_model: {
        name: string;
        description: string;
    };
    drive_axle_serial_number: string;
    steering_axle_model: {
        name: string;
        description: string;
    };
    steering_axle_serial_number: string;
}

export interface FullMachineData extends PublicMachineData {
    id: number;
    shipment_date: string;
    client: {
        id: number;
        username: string;
        first_name: string;
    };
    consignee: string;
    delivery_address: string;
    equipment: string;
    service_company: {
        id: number;
        name: string;
        description: string;
    };
}


export interface MaintenanceData {
    id: number;
    machine: {
        serial_number: string;
        name: string;
        description: string;
    };
    maintenance_type: {
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
        serial_number: string;
        name: string;
        description: string;
    };
    failure_date: string;
    operating_time: number;
    failure_node: {
        name: string;
        description: string;
    };
    failure_description: string;
    recovery_method: {
        name: string;
        description: string;
    };
    spare_parts_used: string;
    recovery_date: string;
    downtime: number;
}