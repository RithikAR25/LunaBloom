/**
 * DatabaseProvider — React context that initializes SQLite on app launch.
 *
 * Wraps the entire app. Children do not render until the database is ready.
 * Repositories read from this context via getDatabase().
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { initDatabase } from './database';

type DatabaseState = 'INITIALIZING' | 'READY' | 'ERROR';

const DatabaseContext = createContext<{ state: DatabaseState }>({
  state: 'INITIALIZING',
});

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const [state, setState] = useState<DatabaseState>('INITIALIZING');

  useEffect(() => {
    initDatabase()
      .then(() => setState('READY'))
      .catch((error) => {
        console.error('[DatabaseProvider] Failed to initialize database:', error);
        setState('ERROR');
      });
  }, []);



  return (
    <DatabaseContext.Provider value={{ state }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  return useContext(DatabaseContext);
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor applied dynamically via theme in each render branch
  },
});
