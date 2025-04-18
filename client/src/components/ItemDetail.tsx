import '../styles/ItemDetail.css';
import {useState, useEffect, useCallback} from 'react';
import {useParams} from 'react-router-dom';
import {useLoadingError} from './contexts/LoadingErrorContext';
import LoadingErrorDisplay from "./LoadingErrorDisplay.tsx";

interface ReferenceItem {
    id: number;
    name: string;
    description: string;
}

interface ReferenceDetailProps {
    type: string;
    title: string;
}

const ItemDetail = ({type, title}: ReferenceDetailProps) => {
    const {id} = useParams<{ id: string }>();
    const [item, setItem] = useState<ReferenceItem | null>(null);
    const {loading, error, setLoading, setError, resetStates} = useLoadingError();

    const fetchData = useCallback(async () => {
        resetStates();

        try {
            const response = await fetch(`/api/${type}/${id}/`);
            if (response.ok) {
                const data = await response.json();
                setItem(data);
            } else {
                setError('Не удалось загрузить данные');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка');
        } finally {
            setLoading(false);
        }
    }, [type, id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <>
            <LoadingErrorDisplay/>
            {!loading && !error && item && (<div className="item-detail">

                    <h2>{title}: {item.name}</h2>
                    <div className="item-card">
                        <div className="item-field" style={{  }}>{item.description || 'Описание отсутствует'}</div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ItemDetail;