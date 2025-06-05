import { useContext } from 'react';
import { ZenithContext } from './ZenithProvider';
import type { ZenithContextType } from '../types';

export const useZenith = (): ZenithContextType => {
  const context = useContext(ZenithContext);
  if (context === undefined) {
    throw new Error('useZenith must be used within a ZenithProvider');
  }
  return context;
};
