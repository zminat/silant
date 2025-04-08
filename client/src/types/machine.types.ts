export interface PublicMachineData {
    serial_number: string;
    model: {
        name: string;
    };
    engine_model: {
        name: string;
    };
    engine_serial_number: string;
    transmission_model: {
        name: string;
    };
    transmission_serial_number: string;
    drive_axle_model: {
        name: string;
    };
    drive_axle_serial_number: string;
    steering_axle_model: {
        name: string;
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
    };
}