import { supabase } from '@/lib/supabase';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

interface UserIdentity {
  email: string;
  phone: string;
}

interface AppContextValue {
  userIdentity: UserIdentity | null;
  setUserIdentity: (identity: UserIdentity) => void;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
}

export const [AppProvider, useApp] = createContextHook<AppContextValue>(() => {
  const [userIdentity, setUserIdentityState] = useState<UserIdentity | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserIdentity();
    loadSession();
  }, []);

  const loadUserIdentity = async () => {
    try {
      const stored = await AsyncStorage.getItem('user_identity');
      if (stored) {
        setUserIdentityState(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading user identity:', error);
    }
  };

  const loadSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  const setUserIdentity = async (identity: UserIdentity) => {
    try {
      await AsyncStorage.setItem('user_identity', JSON.stringify(identity));
      setUserIdentityState(identity);
    } catch (error) {
      console.error('Error saving user identity:', error);
    }
  };

  const isAdmin = session !== null;

  return {
    userIdentity,
    setUserIdentity,
    session,
    isAdmin,
    loading,
  };
});
