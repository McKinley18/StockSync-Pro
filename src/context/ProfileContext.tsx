// StockSync Audit Date: 2026-04-20
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserProfile, updateUserProfile, UserProfile } from '../utils/database';

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  updateProfile: (profile: UserProfile) => void;
  isSafe: (ingredient: string) => boolean;
  checkLiability: () => boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const data = getUserProfile();
    setProfile(data);
    setLoading(false);
  };

  const updateProfile = (newProfile: UserProfile) => {
    updateUserProfile(newProfile);
    setProfile(newProfile);
  };

  const isSafe = (ingredient: string): boolean => {
    if (!profile?.allergies) return true;
    const allergies = profile.allergies.split(',').map(s => s.trim().toLowerCase());
    return !allergies.some(allergy => ingredient.toLowerCase().includes(allergy));
  };

  const checkLiability = (): boolean => {
    return profile?.liability_accepted === 1;
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, updateProfile, isSafe, checkLiability }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
};
