import React, {useState, ReactNode, useMemo, useEffect} from 'react';
import {DittoService} from "../services/dittoService";
import DittoContext from './DittoContext';

type DittoProviderProps = {
    children: ReactNode;
}

//initialize ditto in a provider/singleton pattern 
const DittoProvider: React.FC<DittoProviderProps> = ({children}) => {
    const [dittoService] = useState(() => DittoService.getInstance());
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeDitto = async () => {
            try {
                await dittoService.initDitto();
                setIsInitialized(true);
            } catch (e) {
                console.error(e);
                setIsInitialized(false);
            }
        };
        initializeDitto();
    }, [dittoService]);

    const dittoServiceValue = useMemo(() => ({
        dittoService,
        isInitialized
    }), [dittoService, isInitialized]);

    return (
        <DittoContext.Provider value={dittoServiceValue}>
            {children}
        </DittoContext.Provider>
    );
};

export default DittoProvider;