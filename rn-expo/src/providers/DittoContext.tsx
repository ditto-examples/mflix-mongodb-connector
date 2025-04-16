import React from 'react';
import { DittoService } from '../services/dittoService';

export type DittoContextType = {
    dittoService: DittoService;
    isInitialized: boolean;
};

const DittoContext = React.createContext<DittoContextType | undefined>(undefined);

export default DittoContext;