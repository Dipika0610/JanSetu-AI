import React, { createContext, useContext, useState, useEffect } from 'react';
import { OFFICERS } from '../data/mockData';

const AuthContext = createContext();

const STORAGE_KEY_AUTH = 'jansetu_auth_react_v1';

export const DEFAULT_CITIZEN = {
  id: 'usr-cit-101',
  type: 'citizen',
  name: 'Karan Malhotra',
  phone: '+91 98201 44520',
  ward: 'Andheri West',
  language: 'English',
  email: 'karan.m@gmail.com'
};

export const DEFAULT_OFFICER = {
  id: 'usr-off-201',
  type: 'staff',
  name: 'S. Kulkarni',
  designation: 'Ward Executive Officer',
  employeeId: 'MCGM-ENG-8402',
  email: 's.kulkarni@municipalcorp.gov.in',
  department: 'all',
  departmentName: 'General Administration',
  ward: 'Andheri West',
  role: 'Ward supervisor'
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      return saved ? JSON.parse(saved) : DEFAULT_CITIZEN;
    } catch (e) {
      return DEFAULT_CITIZEN;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(currentUser));
  }, [currentUser]);

  const loginCitizen = (userData) => {
    const user = {
      ...DEFAULT_CITIZEN,
      ...userData,
      type: 'citizen'
    };
    setCurrentUser(user);
    return user;
  };

  const loginStaff = (officerData) => {
    const officer = {
      ...DEFAULT_OFFICER,
      ...officerData,
      type: 'staff'
    };
    setCurrentUser(officer);
    return officer;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loginCitizen,
        loginStaff,
        logout,
        isOfficer: currentUser?.type === 'staff',
        isCitizen: currentUser?.type === 'citizen'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
