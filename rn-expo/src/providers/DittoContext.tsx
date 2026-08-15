import React from 'react';
import { DittoService } from '../services/dittoService';

export type DittoContextType = {
    dittoService: DittoService;
    isInitialized: boolean;
    /** Set when Ditto could not be started at all. */
    error: Error | null;
    /** Set when Ditto started but could not authenticate with the server. */
    authError: Error | null;
};

const DittoContext = React.createContext<DittoContextType | undefined>(undefined);

export default DittoContext;