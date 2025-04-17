import React from 'react';
import { useLoadingError } from './contexts/LoadingErrorContext';

const LoadingErrorDisplay: React.FC = () => {
    const { loading, error } = useLoadingError();

    return (
        <>
            {loading && <div className="loading-message">Загрузка данных...</div>}
            {error && <div className="error-message">{error}</div>}
        </>
    );
};

export default LoadingErrorDisplay;