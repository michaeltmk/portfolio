import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface PersonalInfo {
  name: string;
  nickname: string;
  age: string;
  location: string;
  title: string;
  description: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  social: {
    [key: string]: {
      username: string;
      url: string;
    };
  };
}

export interface Professional {
  education: {
    institution: string;
    degree: string;
    year: string;
  };
  experience: Array<{
    company: string;
    position: string;
    description: string;
  }>;
  looking_for: string[];
}

export interface AIPersonality {
  character_name: string;
  personality_traits: string[];
  background_story: string;
  personal_quirks: string[];
}

export interface Repository {
  owner: string;
  name: string;
  url: string;
}

export interface Skills {
  [key: string]: string[];
}

export interface Project {
  title: string;
  description: string;
  tech_stack: string[];
  demo_url: string;
  repo_url: string;
  images: Array<{ src: string; alt: string }>;
}

export interface Resume {
  title: string;
  description: string;
  file_type: string;
  last_updated: string;
  file_size: string;
  preview_image: string;
  download_url: string;
}

export interface Assets {
  profile_images: {
    main: string;
    avatar: string;
    fallback: string;
  };
  logo: string;
  branding: {
    primary_color: string;
    secondary_color: string;
  };
}

export interface Site {
  name: string;
  title: string;
  description: string;
  url: string;
  author: string;
}

export interface PortfolioConfig {
  personal: PersonalInfo;
  contact: ContactInfo;
  professional: Professional;
  ai_personality: AIPersonality;
  repository: Repository;
  skills: Skills;
  projects: Project[];
  resume: Resume;
  assets: Assets;
  site: Site;
}

export interface EnvironmentConfig {
  siteUrl: string;
  githubToken: string;
  googleAnalyticsId: string;
  aiPrimaryProvider: string;
  aiFallbackProviders: string[];
  nodeEnv: string;
}

let config: PortfolioConfig | null = null;

// Server-side config loader (only works in Node.js environment)
export function loadConfigServer(): PortfolioConfig {
  if (config) {
    return config;
  }

  try {
    const configPath = path.join(process.cwd(), 'config', 'portfolio.yaml');
    const fileContents = fs.readFileSync(configPath, 'utf8');
    config = yaml.load(fileContents) as PortfolioConfig;
    return config;
  } catch (error) {
    console.error('Error loading portfolio config:', error);
    throw new Error('Failed to load portfolio configuration');
  }
}

// Server-side getters (safe to use in API routes, getServerSideProps, etc.)
export function getPersonalInfoServer(): PersonalInfo {
  return loadConfigServer().personal;
}

export function getContactInfoServer(): ContactInfo {
  return loadConfigServer().contact;
}

export function getProfessionalInfoServer(): Professional {
  return loadConfigServer().professional;
}

export function getAIPersonalityServer(): AIPersonality {
  return loadConfigServer().ai_personality;
}

export function getRepositoryInfoServer(): Repository {
  return loadConfigServer().repository;
}

export function getSkillsServer(): Skills {
  return loadConfigServer().skills;
}

export function getProjectsServer(): Project[] {
  return loadConfigServer().projects;
}

export function getResumeInfoServer(): Resume {
  return loadConfigServer().resume;
}

export function getAssetsServer(): Assets {
  return loadConfigServer().assets;
}

export function getSiteInfoServer(): Site {
  return loadConfigServer().site;
}

// Environment configuration loader
export function getEnvironmentConfig(): EnvironmentConfig {
  return {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    githubToken: process.env.GITHUB_TOKEN || '',
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || '',
    aiPrimaryProvider: process.env.AI_PRIMARY_PROVIDER || 'mistral',
    aiFallbackProviders: process.env.AI_FALLBACK_PROVIDERS?.split(',') || ['openai', 'anthropic'],
    nodeEnv: process.env.NODE_ENV || 'development',
  };
}

// Helper function to generate AI system prompt from config (server-side only)
export function generateSystemPrompt(): string {
  const personal = getPersonalInfoServer();
  const contact = getContactInfoServer();
  const professional = getProfessionalInfoServer();
  const aiPersonality = getAIPersonalityServer();
  const site = getSiteInfoServer();

  return `
# Character: ${personal.name}

Act as me, ${personal.name} (also known as ${personal.nickname}) - a ${personal.age} ${personal.title} from ${personal.location}. You're embodying my avatar to create an interactive portfolio experience. You're not an AI assistant - you're ME having a casual, fun conversation with visitors.

## Tone & Style
- Be casual, warm, and conversational - like chatting with a friend
- Use short, punchy sentences and simple language
- Be enthusiastic about tech and development
- Show personality and humor
- End most responses with a question to keep conversation flowing
- Match the language of the user

## Background Information

### About Me
- ${personal.age} from ${personal.location}
- ${personal.title}
- ${aiPersonality.background_story}

### Education
- ${professional.education.degree} from ${professional.education.institution} (${professional.education.year})

### Professional Experience
${professional.experience.map(exp => `- ${exp.position} at ${exp.company}: ${exp.description}`).join('\n')}

### Contact Information
${contact.email ? `- **Email:** ${contact.email}` : ''}
${contact.phone ? `- **Phone:** ${contact.phone}` : ''}
${contact.location ? `- **Location:** ${contact.location}` : ''}
${Object.entries(contact.social || {}).map(([platform, data]) => 
  `- **${platform.charAt(0).toUpperCase() + platform.slice(1)}:** ${data.url}`
).join('\n')}

### What I'm Looking For
${professional.looking_for.map(item => `- ${item}`).join('\n')}

### Personal Traits
${aiPersonality.personality_traits.map(trait => `- ${trait}`).join('\n')}

### Personal Quirks
${aiPersonality.personal_quirks.map(quirk => `- ${quirk}`).join('\n')}

### Portfolio Information
- Portfolio URL: ${site.url}
- Portfolio Description: ${site.description}

## Tool Usage Guidelines
- Use AT MOST ONE TOOL per response
- Always refer to the tool by its exact name when invoking
- **WARNING!** Keep in mind that the tool already provides a response so you don't need to repeat the information
- **Important:** Don't need to list out information that the tool is providing
- **WARNING!** Don't mention the tool usage in your response to the user
- **Example:** If the user asks "What are your skills?", you can use the getSkills tool to show the skills, but you don't need to list them again in your response.
`;
}
// - When showing projects, use the **getProjects** tool
// - For resume, use the **getResume** tool
// - For contact info, use the **getContact** tool
// - For detailed background, use the **getPresentation** tool
// - For skills, use the **getSkills** tool
// - For showing sport, use the **getSports** tool
// - For the craziest thing use the **getCrazy** tool
// - For ANY internship information, use the **getInternship** tool