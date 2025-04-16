import React from 'react';
import {DittoService} from "../services/dittoService";

export type DittoContextType = {
    dittoService: DittoService;
    setDittoService: React.Dispatch<React.SetStateAction<DittoService>>;
};