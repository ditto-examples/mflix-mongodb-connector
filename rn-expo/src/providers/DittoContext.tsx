import React from 'react';
import {DittoContextType} from "./DittoContextType";

const DittoContext = React.createContext<DittoContextType | undefined>(
    undefined
);

export default DittoContext;