import React, { createContext, useState, useContext, ReactNode } from 'react';

interface LoadingErrorContextType {
    loading: boolean;
    error: string | null;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    resetStates: () => void;
    handleError: (err: unknown) => void;
}

const LoadingErrorContext = createContext<LoadingErrorContextType | undefined>(undefined);

export const LoadingErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const resetStates = () => {
        setLoading(true);
        setError(null);
    };

    const handleError = (err: unknown) => {
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
    };

    return (
        <LoadingErrorContext.Provider value={{
            loading,
            error,
            setLoading,
            setError,
            resetStates,
            handleError
        }}>
            {children}
        </LoadingErrorContext.Provider>
    );
};

export const useLoadingError = () => {
    const context = useContext(LoadingErrorContext);
    if (context === undefined) {
        throw new Error('useLoadingError должен использоваться внутри LoadingErrorProvider');
    }
    return context;
};