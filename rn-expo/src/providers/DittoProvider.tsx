import React, {useState, ReactNode, useMemo, useEffect} from 'react';
import {DittoService} from "../services/dittoService";
import DittoContext from './DittoContext';

/**
 * Props for the DittoProvider component
 */
type DittoProviderProps = {
    children: ReactNode;
}

/**
 * A React context provider that initializes and manages the Ditto service.
 * This provider handles the lifecycle of the Ditto service and provides access
 * to it throughout the application.
 * 
 * @component
 * @param {DittoProviderProps} props - The props for the DittoProvider component
 * @param {ReactNode} props.children - Child components that will have access to the Ditto context
 * 
 * @example
 * <DittoProvider>
 *   <App />
 * </DittoProvider>
 * 
 * @remarks
 * - Uses a singleton pattern for the DittoService instance
 * - Handles initialization and error states
 * - Provides cleanup on unmount
 * - Manages the initialization state of the Ditto service
 * - Uses useMemo to optimize context value updates
 * 
 * @see https://docs.ditto.live/sdk/latest/install-guides/react-native#initializing-ditto
 * @see https://react.dev/learn/passing-data-deeply-with-context
 * @see https://kentcdodds.com/blog/how-to-use-react-context-effectively
 */
const DittoProvider: React.FC<DittoProviderProps> = ({children}) => {
    const [dittoService] = useState(() => DittoService.getInstance());
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true;

        const initializeDitto = async () => {
            try {
                if (!isMounted) return;
                
                await dittoService.initDitto();
                if (isMounted) {
                    setIsInitialized(true);
                    setError(null);
                }
            } catch (e) {
                console.error('Failed to initialize Ditto:', e);
                if (isMounted) {
                    setIsInitialized(false);
                    setError(e instanceof Error ? e : new Error('Failed to initialize Ditto'));
                }
            }
        };

        initializeDitto();

        return () => {
            isMounted = false;
        };
    }, [dittoService]);

    const dittoServiceValue = useMemo(() => ({
        dittoService,
        isInitialized,
        error
    }), [dittoService, isInitialized, error]);

    return (
        <DittoContext.Provider value={dittoServiceValue}>
            {children}
        </DittoContext.Provider>
    );
};

export default DittoProvider;