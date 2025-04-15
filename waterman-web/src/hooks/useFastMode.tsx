import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface FastModeContextType {
  fastMode: boolean;
  toggleFastMode: () => void;
  setFastMode: (enabled: boolean) => void;
}

const FastModeContext = createContext<FastModeContextType | undefined>(undefined);

interface FastModeProviderProps {
  children: ReactNode;
}

export function FastModeProvider({ children }: FastModeProviderProps) {
  const [fastMode, setFastMode] = useState(() => {
    // Initialize from localStorage if available
    const savedMode = localStorage.getItem('waterman-fast-mode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  
  // Persist fast mode setting to localStorage
  useEffect(() => {
    localStorage.setItem('waterman-fast-mode', JSON.stringify(fastMode));
  }, [fastMode]);
  
  const toggleFastMode = () => setFastMode(!fastMode);
  
  return (
    <FastModeContext.Provider value={{ fastMode, toggleFastMode, setFastMode }}>
      {children}
    </FastModeContext.Provider>
  );
}

export function useFastMode() {
  const context = useContext(FastModeContext);
  if (context === undefined) {
    throw new Error('useFastMode must be used within a FastModeProvider');
  }
  return context;
} 