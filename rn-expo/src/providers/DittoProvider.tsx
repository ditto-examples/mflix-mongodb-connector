import React, {useState, ReactNode, useMemo, useEffect} from 'react';
import {DittoService} from "../services/dittoService";
import DittoContext from './DittoContext';

type DittoProviderProps = {
    children: ReactNode;
}

//initialize ditto in a provider/singleton pattern 
const DittoProvider: React.FC<DittoProviderProps> = ({children}) => {
    const ds = new DittoService();
    const [dittoService, setDittoService] = useState<DittoService>(ds);

    useEffect(() => {
        const initializeDitto = async () => {
            await ds.initDitto();
        };
        initializeDitto().then().catch(e => console.error(e));
    }, [ds]);

    const dittoServiceValue = useMemo(() => ({dittoService: dittoService, setDittoService: setDittoService}), [dittoService, setDittoService]);
    return (
        <DittoContext.Provider value={dittoServiceValue}>
            {children}
        </DittoContext.Provider>
    );
};

export default DittoProvider;