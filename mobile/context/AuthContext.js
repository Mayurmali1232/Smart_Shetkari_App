import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import i18n from '../i18n';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('accessToken');
      const storedUser = await AsyncStorage.getItem('user');
      const storedLang = await AsyncStorage.getItem('preferredLanguage');

      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser.preferredLanguage) {
          i18n.changeLanguage(parsedUser.preferredLanguage);
        }
      } else if (storedLang) {
        i18n.changeLanguage(storedLang);
      }
    } catch (e) {
      console.warn('Failed to restore auth session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (mobileNumber, password) => {
    setIsLoading(true);
    try {
      const res = await authService.login({ mobileNumber, password });
      if (res.success && res.data) {
        const authData = res.data;
        setToken(authData.accessToken);
        setUser(authData);

        await AsyncStorage.setItem('accessToken', authData.accessToken);
        await AsyncStorage.setItem('refreshToken', authData.refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(authData));

        if (authData.preferredLanguage) {
          await AsyncStorage.setItem('preferredLanguage', authData.preferredLanguage);
          i18n.changeLanguage(authData.preferredLanguage);
        }
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (farmerData) => {
    setIsLoading(true);
    try {
      const res = await authService.register(farmerData);
      if (res.success && res.data) {
        const authData = res.data;
        setToken(authData.accessToken);
        setUser(authData);

        await AsyncStorage.setItem('accessToken', authData.accessToken);
        await AsyncStorage.setItem('refreshToken', authData.refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(authData));

        if (authData.preferredLanguage) {
          await AsyncStorage.setItem('preferredLanguage', authData.preferredLanguage);
          i18n.changeLanguage(authData.preferredLanguage);
        }
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout().catch(() => {});
    } catch (e) {
      // Continue cleanup even if server call fails
    }
    setToken(null);
    setUser(null);
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  };

  const updateUser = async (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
    await AsyncStorage.setItem('user', JSON.stringify({ ...user, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
