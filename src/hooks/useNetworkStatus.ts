/**
 * Placeholder for useNetworkStatus hook — replaces NetworkConnectivityObserver.kt.
 *
 * Will use @react-native-community/netinfo to observe connectivity.
 *
 * Responsibilities from Android:
 *   - isConnected: Boolean (via ConnectivityManager + NetworkCallback)
 *   - connectionType
 */
import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  return { isConnected };
}
