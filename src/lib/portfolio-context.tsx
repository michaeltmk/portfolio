'use client';

import React, { createContext, useContext } from 'react';
import type { 
  PersonalInfo, 
  ContactInfo, 
  Professional, 
  Repository, 
  Skills, 
  Opportunities,
  Resume, 
  Assets, 
  Site,
  Project,
  AIPersonality
} from './config';

interface PortfolioContextType {
  personal: PersonalInfo;
  contact: ContactInfo;
  professional: Professional;
  repository: Repository;
  skills: Skills;
  opportunities: Opportunities;
  projects: Project[];
  resume: Resume;
  assets: Assets;
  site: Site;
  aiPersonality: AIPersonality;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export function PortfolioProvider({ 
  children, 
  config 
}: { 
  children: React.ReactNode;
  config: PortfolioContextType;
}) {
  return (
    <PortfolioContext.Provider value={config}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolioConfig() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolioConfig must be used within a PortfolioProvider');
  }
  return context;
}

// Individual hooks for specific config sections
export function usePersonalInfo() {
  return usePortfolioConfig().personal;
}

export function useContactInfo() {
  return usePortfolioConfig().contact;
}

export function useProfessionalInfo() {
  return usePortfolioConfig().professional;
}

export function useRepositoryInfo() {
  return usePortfolioConfig().repository;
}

export function useSkills() {
  return usePortfolioConfig().skills;
}

export function useOpportunities() {
  return usePortfolioConfig().opportunities;
}

export function useProjects() {
  return usePortfolioConfig().projects;
}

export function useResumeInfo() {
  return usePortfolioConfig().resume;
}

export function useAssets() {
  return usePortfolioConfig().assets;
}

export function useSiteInfo() {
  return usePortfolioConfig().site;
}

export function useAIPersonality() {
  return usePortfolioConfig().aiPersonality;
}
