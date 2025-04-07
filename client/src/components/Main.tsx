import "../styles/Main.css";
import {useEffect, useState} from "react";
import {useAuth} from "./AuthContext.tsx";

// Интерфейс для данных о машине
interface MachineData {
    modelName: string;
    serialNumber: string;
    engineModel: string;
    engineSerialNumber: string;
    transmissionModel: string;
    transmissionSerialNumber: string;
    drivingAxleModel: string;
    drivingAxleSerialNumber: string;
    controlledAxleModel: string;
    controlledAxleSerialNumber: string;
}

function Main() {
    const [serialNumber, setSerialNumber] = useState("");
    const [machineData, setMachineData] = useState<MachineData | null>(null);
    const [userMachines, setUserMachines] = useState<MachineData[]>([]);
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
                serialNumber: machine.serial_number,
                modelName: machine.model?.name || '',
                engineModel: machine.engine_model?.name || '',
                engineSerialNumber: machine.engine_serial_number || '',
                transmissionModel: machine.transmission_model?.name || '',
                transmissionSerialNumber: machine.transmission_serial_number || '',
                drivingAxleModel: machine.drive_axle_model?.name || '',
                drivingAxleSerialNumber: machine.drive_axle_serial_number || '',
                controlledAxleModel: machine.steering_axle_model?.name || '',
                controlledAxleSerialNumber: machine.steering_axle_serial_number || '',
                shipmentDate: machine.shipment_date || '',
                client: machine.client?.name || '',
                consignee: machine.consignee || '',
                deliveryAddress: machine.delivery_address || '',
                equipment: machine.equipment || '',
                serviceCompany: machine.service_company?.name || '',
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

            const formattedData: MachineData = {
                serialNumber: responseData.serial_number,
                modelName: responseData.model?.name || '',
                engineModel: responseData.engine_model?.name || '',
                engineSerialNumber: responseData.engine_serial_number || '',
                transmissionModel: responseData.transmission_model?.name || '',
                transmissionSerialNumber: responseData.transmission_serial_number || '',
                drivingAxleModel: responseData.drive_axle_model?.name || '',
                drivingAxleSerialNumber: responseData.drive_axle_serial_number || '',
                controlledAxleModel: responseData.steering_axle_model?.name || '',
                controlledAxleSerialNumber: responseData.steering_axle_serial_number || '',
                // shipmentDate: responseData.shipment_date || '',
                // client: responseData.client?.name || '',
                // consignee: responseData.consignee || '',
                // deliveryAddress: responseData.delivery_address || '',
                // equipment: responseData.equipment || '',
                // serviceCompany: responseData.service_company?.name || '',
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
                                    {/*<th>Дата отгрузки с завода</th>*/}
                                    {/*<th>Покупатель</th>*/}
                                    {/*<th>Грузополучатель (конечный потребитель)</th>*/}
                                    {/*<th>Адрес поставки (эксплуатации)</th>*/}
                                    {/*<th>Комплектация (доп. опции)</th>*/}
                                    {/*<th>Сервисная компания</th>*/}
                                </tr>
                            </thead>
                            <tbody>
                            {userMachines.map((machine, index) => (
                                <tr key={index}>
                                    <td>{machine.modelName}</td>
                                    <td>{machine.serialNumber}</td>
                                    <td>{machine.engineModel}</td>
                                    <td>{machine.engineSerialNumber}</td>
                                    <td>{machine.transmissionModel}</td>
                                    <td>{machine.transmissionSerialNumber}</td>
                                    <td>{machine.drivingAxleModel}</td>
                                    <td>{machine.drivingAxleSerialNumber}</td>
                                    <td>{machine.controlledAxleModel}</td>
                                    <td>{machine.controlledAxleSerialNumber}</td>
                                    {/*<td>{machine.shipmentDate}</td>*/}
                                    {/*<td>{machine.client}</td>*/}
                                    {/*<td>{machine.consignee}</td>*/}
                                    {/*<td>{machine.deliveryAddress}</td>*/}
                                    {/*<td>{machine.equipment}</td>*/}
                                    {/*<td>{machine.serviceCompany}</td>*/}
                                </tr>
                            ))}
                            </tbody>

                        </table>
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
                                    <td>{machineData.modelName}</td>
                                    <td>{machineData.serialNumber}</td>
                                    <td>{machineData.engineModel}</td>
                                    <td>{machineData.engineSerialNumber}</td>
                                    <td>{machineData.transmissionModel}</td>
                                    <td>{machineData.transmissionSerialNumber}</td>
                                    <td>{machineData.drivingAxleModel}</td>
                                    <td>{machineData.drivingAxleSerialNumber}</td>
                                    <td>{machineData.controlledAxleModel}</td>
                                    <td>{machineData.controlledAxleSerialNumber}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
                )}
            </div>
    );
}

export default Main;
