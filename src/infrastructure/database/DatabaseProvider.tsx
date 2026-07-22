/**
 * DatabaseProvider — React context that initializes SQLite on app launch.
 *
 * Wraps the entire app. Children do not render until the database is ready.
 * Repositories read from this context via getDatabase().
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { initDatabase } from './database';

type DatabaseState = 'INITIALIZING' | 'READY' | 'ERROR';

const DatabaseContext = createContext<{ state: DatabaseState }>({
  state: 'INITIALIZING',
});

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DatabaseState>('INITIALIZING');

  useEffect(() => {
    initDatabase()
      .then(() => setState('READY'))
      .catch((error) => {
        console.error('[DatabaseProvider] Failed to initialize database:', error);
        setState('ERROR');
      });
  }, []);

  if (state === 'INITIALIZING') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  if (state === 'ERROR') {
    // Will be replaced with a proper ErrorState component in Phase 0 UI work
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

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
    backgroundColor: '#0C0C14',
  },
});
