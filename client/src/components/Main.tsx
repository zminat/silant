import "../styles/Main.css";
import { useState } from "react";

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
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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
                controlledAxleSerialNumber: responseData.steering_axle_serial_number || ''
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
            </div>
    );
}

export default Main;
