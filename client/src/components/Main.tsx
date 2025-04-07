import "../styles/Main.css";
import {useEffect, useState} from "react";
import {useAuth} from "./AuthContext.tsx";

// Интерфейс для публичных данных о машине
interface PublicMachineData {
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

// Интерфейс для полных данных о машине (для авторизованных пользователей)
interface FullMachineData extends PublicMachineData {
    id: number;
    shipment_date: string;
    client: {
        id: number;
        username: string;
        first_name: string;
        // last_name: string;
        // email: string;
        // phone_number: string;
        // is_active: boolean;
        // is_staff: boolean;
        // is_superuser: boolean;
        // date_joined: string;
        // last_login: string;
        // groups: {}
    };
    consignee: string;
    delivery_address: string;
    equipment: string;
    service_company: {
        id: number;
        name: string;
    };
}

// Компонент таблицы для публичных данных
const PublicMachineTable = ({ machine }: { machine: PublicMachineData | null }) => {
    if (!machine) return null;

    return (
        <table>
            <thead>
            <tr>
                <th>Модель техники</th>
                <th>Зав. № машины</th>
                <th>Модель двигателя</th>
                <th>Зав. № двигателя</th>
                <th>Модель трансмиссии</th>
                <th>Зав. № трансмиссии</th>
                <th>Модель ведущего моста</th>
                <th>Зав. № ведущего моста</th>
                <th>Модель управляемого моста</th>
                <th>Зав. № управляемого моста</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>{machine.model?.name}</td>
                <td>{machine.serial_number}</td>
                <td>{machine.engine_model?.name}</td>
                <td>{machine.engine_serial_number}</td>
                <td>{machine.transmission_model?.name}</td>
                <td>{machine.transmission_serial_number}</td>
                <td>{machine.drive_axle_model?.name}</td>
                <td>{machine.drive_axle_serial_number}</td>
                <td>{machine.steering_axle_model?.name}</td>
                <td>{machine.steering_axle_serial_number}</td>
            </tr>
            </tbody>
        </table>
    );
};

// Компонент таблицы для авторизованных пользователей
const AuthenticatedMachineTable = ({ machines }: { machines: FullMachineData[] }) => {
    return (
        <table>
            <thead>
            <tr>
                <th>№ п/п</th>
                <th>Модель техники</th>
                <th>Зав. № машины</th>
                <th>Модель двигателя</th>
                <th>Зав. № двигателя</th>
                <th>Модель трансмиссии</th>
                <th>Зав. № трансмиссии</th>
                <th>Модель ведущего моста</th>
                <th>Зав. № ведущего моста</th>
                <th>Модель управляемого моста</th>
                <th>Зав. № управляемого моста</th>
                <th>Дата отгрузки с завода</th>
                <th>Покупатель</th>
                <th>Грузополучатель (конечный потребитель)</th>
                <th>Адрес поставки (эксплуатации)</th>
                <th>Комплектация (доп. опции)</th>
                <th>Сервисная компания</th>
            </tr>
            </thead>
            <tbody>
            {machines.map((machine, index) => (
                <tr key={machine.id}>
                    <td>{index + 1}</td>
                    <td>{machine.model?.name}</td>
                    <td>{machine.serial_number}</td>
                    <td>{machine.engine_model?.name}</td>
                    <td>{machine.engine_serial_number}</td>
                    <td>{machine.transmission_model?.name}</td>
                    <td>{machine.transmission_serial_number}</td>
                    <td>{machine.drive_axle_model?.name}</td>
                    <td>{machine.drive_axle_serial_number}</td>
                    <td>{machine.steering_axle_model?.name}</td>
                    <td>{machine.steering_axle_serial_number}</td>
                    <td>{machine.shipment_date}</td>
                    <td>{machine.client?.first_name}</td>
                    <td>{machine.consignee}</td>
                    <td>{machine.delivery_address}</td>
                    <td>{machine.equipment}</td>
                    <td>{machine.service_company?.name}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};


function Main() {
    const [serialNumber, setSerialNumber] = useState("");
    const [machineData, setMachineData] = useState<PublicMachineData | null>(null);
    const [userMachines, setUserMachines] = useState<FullMachineData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { isLoggedIn } = useAuth();


    // Получение списка машин пользователя при загрузке компонента
    useEffect(() => {
        if (isLoggedIn) {
            fetchUserMachines();
        }
    }, [isLoggedIn]);

    // Функция для получения списка машин пользователя
    const fetchUserMachines = async () => {
        try {
            const response = await fetch('/api/machines', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Не удалось получить список машин');
            }

            const data = await response.json();
            setUserMachines(data.map((machine: any) => ({
                serial_number: machine.serial_number,
                model: machine.model || '',
                engine_model: machine.engine_model || '',
                engine_serial_number: machine.engine_serial_number || '',
                transmission_model: machine.transmission_model || '',
                transmission_serial_number: machine.transmission_serial_number || '',
                drive_axle_model: machine.drive_axle_model || '',
                drive_axle_serial_number: machine.drive_axle_serial_number || '',
                steering_axle_model: machine.steering_axle_model || '',
                steering_axle_serial_number: machine.steering_axle_serial_number || '',
                shipment_date: machine.shipment_date || '',
                client: machine.client || '',
                consignee: machine.consignee || '',
                delivery_address: machine.delivery_address || '',
                equipment: machine.equipment || '',
                service_company: machine.service_company || '',
            })));
        } catch (err) {
            console.error("Ошибка при получении списка машин:", err);
            setError("Не удалось загрузить список машин");
        }
    };


    // Обработчик отправки формы
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Проверка на пустой ввод
        if (!serialNumber.trim()) {
            setError("Пожалуйста, выберите заводской номер машины");
            setMachineData(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/public-machine-info/?serial_number=${serialNumber}`);
            console.log('Статус ответа:', response.status);
            const responseText = await response.text();
            console.log('Текст ответа:', responseText);

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status} - ${responseText}`);
            }

            const responseData = JSON.parse(responseText);

            const formattedData: PublicMachineData = {
                serial_number: responseData.serial_number,
                model: responseData.model || '',
                engine_model: responseData.engine_model || '',
                engine_serial_number: responseData.engine_serial_number || '',
                transmission_model: responseData.transmission_model || '',
                transmission_serial_number: responseData.transmission_serial_number || '',
                drive_axle_model: responseData.drive_axle_model || '',
                drive_axle_serial_number: responseData.drive_axle_serial_number || '',
                steering_axle_model: responseData.steering_axle_model || '',
                steering_axle_serial_number: responseData.steering_axle_serial_number || '',
            };

            setMachineData(formattedData);
        } catch (err) {
            console.error("Подробная ошибка:", err);
            setError("Нет информации о машине с таким заводским номером.");
            setMachineData(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            {isLoggedIn ? (
                <div className="result-container">
                    <h2>Информация о комплектации и технических характеристиках Вашей техники</h2>
                    {userMachines.length > 0 ? (
                        <AuthenticatedMachineTable machines={userMachines} />
                    ) : (
                            <p>У вас пока нет машин в системе</p>
                            )}
                </div>
                ) : (
                <>
                    <h1>Проверьте комплектацию и технические характеристики техники Силант</h1>
                    <form className="wrapper-form" onSubmit={handleSubmit}>
                        <label className="label-block">
                            Заводской номер:
                            <input className="input-block"
                                   aria-label="serialNumber"
                                   type="text"
                                   name="serialNumber"
                                   value={serialNumber}
                                   onChange={(e) => setSerialNumber(e.target.value)}
                                   placeholder="0000"/>
                        </label>
                        <button type="submit" className="search-btn" disabled={loading || !serialNumber}>
                            {loading ? "Поиск..." : "Поиск"}
                        </button>
                    </form>
                    {loading && (
                        <div className="result-container">
                            <h3>Результаты поиска: </h3>
                            <div className="error-message">
                                <p>Загрузка данных...</p>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="result-container">
                            <h3>Результаты поиска: </h3>
                            <div className="error-message">
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    {machineData && (
                        <div className="result-container">
                            <h3>Результаты поиска: </h3>
                            <h2>Информация о комплектации и технических характеристиках Вашей техники</h2>
                            <PublicMachineTable machine={machineData} />
                        </div>
                    )}
                </>
                )}
            </div>
    );
}

export default Main;
