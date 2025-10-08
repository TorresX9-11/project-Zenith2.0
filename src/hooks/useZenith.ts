import { useContext } from 'react';
import { useZenith as useZenithFromContext } from '../context/ZenithContext';

export const useZenith = () => useZenithFromContext();
