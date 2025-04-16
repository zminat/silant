import {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';

interface ReferenceItem {
    id: number;
    name: string;
    description: string;
}

interface ReferenceDetailProps {
    type: string;
    title: string;
}

const ReferenceDetail = ({type, title}: ReferenceDetailProps) => {
    const {id} = useParams<{ id: string }>();
    const [item, setItem] = useState<ReferenceItem | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/${type}/${id}/`);
                if (response.ok) {
                    const data = await response.json();
                    setItem(data);
                } else {
                    setError('Не удалось загрузить данные');
                }
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Произошла ошибка');
                setLoading(false);
            }
        };

        fetchData();
    }, [type, id]);

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div>Ошибка: {error}</div>;
    }

    if (!item) {
        return <div>Информация не найдена</div>;
    }

    return (
        <div className="reference-detail">
            <h2>{title}: {item.name}</h2>
            <div className="reference-card">
                <div className="reference-field">{item.description || 'Описание отсутствует'}</div>
            </div>
        </div>
    );
};

export default ReferenceDetail;