import { useEffect } from 'react';
import { initIAP, endIAP } from '../services/iap';

export function useIAPInit(): void {
  useEffect(() => {
    initIAP();
    return () => {
      endIAP();
    };
  }, []);
}
