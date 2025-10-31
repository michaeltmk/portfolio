#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const yaml = require('js-yaml');

// Optional PDF parsing - install with: npm install pdf-parse
// Use dynamic import for modules with proper error handling
let PDFParse = null;
try {
    const pdfParseModule = require('pdf-parse');
    PDFParse = pdfParseModule.PDFParse;
} catch (error) {
    console.warn('PDF parsing not available:', error.message);
}

/**
 * Script to update portfolio.yaml from CV
 * Supports both local files and URLs
 */

class PortfolioUpdater {
  constructor() {
    this.portfolioPath = path.join(__dirname, '../config/portfolio.yaml');
    this.supportedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
  }

  /**
   * Main function to update portfolio from CV
   */
  async updateFromCV(cvSource) {
    try {
      console.log('🚀 Starting portfolio update from CV...');
      
      // Load current portfolio config
      const currentConfig = await this.loadPortfolioConfig();
      
      // Determine if CV source is URL or local file
      const cvData = await this.fetchCVData(cvSource);
      
      // Extract information from CV
      const extractedInfo = await this.extractCVInformation(cvData, cvSource);
      
      // Update portfolio config
      const updatedConfig = this.updatePortfolioConfig(currentConfig, extractedInfo);
      
      // Save updated config
      await this.savePortfolioConfig(updatedConfig);
      
      console.log('✅ Portfolio updated successfully!');
      if (updatedConfig._updatedFields && updatedConfig._updatedFields.length > 0) {
        console.log('📝 Updated fields:', JSON.stringify(updatedConfig._updatedFields, null, 2));
      } else {
        console.log('📝 No fields were updated (data may be the same)');
      }
      
      // Clean up the temporary field
      delete updatedConfig._updatedFields;
      
    } catch (error) {
      console.error('❌ Error updating portfolio:', error.message);
      process.exit(1);
    }
  }

  /**
   * Load current portfolio configuration
   */
  async loadPortfolioConfig() {
    try {
      const configContent = fs.readFileSync(this.portfolioPath, 'utf8');
      return yaml.load(configContent);
    } catch (error) {
      throw new Error(`Failed to load portfolio config: ${error.message}`);
    }
  }

  /**
   * Fetch CV data from URL or local file
   */
  async fetchCVData(source) {
    if (this.isURL(source)) {
      console.log(`📥 Fetching CV from URL: ${source}`);
      return await this.downloadFromURL(source);
    } else {
      console.log(`📁 Reading CV from local file: ${source}`);
      return await this.readLocalFile(source);
    }
  }

  /**
   * Check if source is a URL
   */
  isURL(source) {
    return source.startsWith('http://') || source.startsWith('https://');
  }

  /**
   * Download CV from URL
   */
  async downloadFromURL(url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https://') ? https : http;
      
      client.get(url, (response) => {
        // Handle redirects
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          console.log(`🔄 Following redirect to: ${response.headers.location}`);
          return this.downloadFromURL(response.headers.location).then(resolve).catch(reject);
        }
        
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }

        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            buffer,
            contentType: response.headers['content-type'] || '',
            url
          });
        });
      }).on('error', reject);
    });
  }

  /**
   * Read local CV file
   */
  async readLocalFile(filePath) {
    try {
      const buffer = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      
      return {
        buffer,
        contentType: this.getContentTypeFromExtension(ext),
        filePath
      };
    } catch (error) {
      throw new Error(`Failed to read local file: ${error.message}`);
    }
  }

  /**
   * Get content type from file extension
   */
  getContentTypeFromExtension(ext) {
    const types = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain'
    };
    return types[ext] || 'application/octet-stream';
  }

  /**
   * Extract information from CV
   */
  async extractCVInformation(cvData, source) {
    console.log('🔍 Extracting information from CV...');
    
    let text = '';
    
    // Enhanced text extraction based on content type
    if (cvData.contentType.includes('text/plain')) {
      text = cvData.buffer.toString('utf8');
    } else if (cvData.contentType.includes('pdf')) {
      if (PDFParse && typeof PDFParse === 'function') {
        try {
          console.log('📖 Parsing PDF content...');
          const parser = new PDFParse({ data: cvData.buffer });
          const result = await parser.getText();
          text = result.text || '';
          console.log(`✅ Extracted ${text.length} characters from PDF`);
        } catch (error) {
          console.log('⚠️  PDF parsing failed, using URL as fallback:', error.message);
          text = `CV available at: ${source}`;
        }
      } else {
        console.log('⚠️  PDF parsing requires pdf-parse library. Install with: pnpm add pdf-parse');
        text = `CV available at: ${source}`;
      }
    } else {
      console.log('⚠️  Unsupported format. Using source as reference.');
      text = `CV available at: ${source}`;
    }

    return this.parseCVContent(text, source);
  }

  /**
   * Parse CV text using structured section-based approach
   * Based on fixed CV format with known sections
   */
  async parseCVContent(text, source) {
    console.log('🔍 Parsing structured CV content...');
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    console.log(`� Processing ${lines.length} lines of content...`);
    
    const info = {};
    
    // Parse sections based on CV structure
    const sections = this.identifySections(lines);
    
    // 1. Name is always at the top
    info.name = this.extractName(lines);
    
    // 2. Contact info and social media (following name)
    const contactInfo = this.extractContactInfo(lines, sections);
    Object.assign(info, contactInfo);
    
    // 3. Summary/Description section
    info.description = this.extractSummary(lines, sections);
    
    // 4. Education section (includes certifications)
    info.education = this.extractEducation(lines, sections);
    
    // 5. Work Experience section
    info.experience = this.extractExperience(lines, sections);
    
    // 6. Skills section
    info.skills = this.extractSkills(lines, sections);
    
    // 7. Projects section
    info.projects = this.extractProjects(lines, sections);
    
    // Add CV URL
    info.cv_url = source;
    
    return info;
  }

  /**
   * Identify sections in the CV
   */
  identifySections(lines) {
    const sections = {};
    const sectionHeaders = {
      'summary': ['summary', 'about', 'profile', 'objective'],
      'education': ['education', 'academic', 'qualification'],
      'certification': ['certification', 'certificates', 'credentials'],
      'experience': ['experience', 'work experience', 'employment', 'professional experience'],
      'skills': ['skills', 'technical skills', 'competencies', 'technologies'],
      'projects': ['projects', 'portfolio', 'work samples']
    };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      
      for (const [sectionKey, keywords] of Object.entries(sectionHeaders)) {
        for (const keyword of keywords) {
          if (line.includes(keyword) && line.length < 50) {
            sections[sectionKey] = i;
            break;
          }
        }
      }
    }
    
    console.log(`� Identified sections:`, Object.keys(sections));
    return sections;
  }

  /**
   * Extract name from the top of CV
   */
  extractName(lines) {
    // Name is usually in the first few lines, look for proper name pattern
    const namePattern = /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+$/;
    
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and lines that are too long or contain special chars
      if (!line || line.length > 50 || /[^\w\s]/.test(line)) continue;
      
      if (namePattern.test(line)) {
        console.log(`👤 Found name: ${line}`);
        return line;
      }
    }
    
    return null;
  }

  /**
   * Extract contact information and social media links
   */
  extractContactInfo(lines, sections) {
    const info = {};
    const contactSection = lines.slice(0, sections.education || sections.summary || 20);
    
    // Extract email
    const emailMatch = contactSection.join(' ').match(/[\w.-]+@[\w.-]+\.\w+/g);
    if (emailMatch) {
      info.email = emailMatch[0];
      console.log(`📧 Found email: ${info.email}`);
    }
    
    // Extract phone
    const phoneMatch = contactSection.join(' ').match(/[\+]?[\d\s\-\(\)]{10,}/g);
    if (phoneMatch) {
      info.phone = phoneMatch[0].trim();
      console.log(`📞 Found phone: ${info.phone}`);
    }
    
    // Extract social media and other URLs
    const socialMedia = {};
    const urlPattern = /https?:\/\/[^\s]+/g;
    
    for (const line of contactSection) {
      const urls = line.match(urlPattern);
      if (urls) {
        for (const url of urls) {
          if (url.includes('linkedin.com')) {
            const username = url.match(/linkedin\.com\/in\/([^\/\?]+)/)?.[1];
            if (username) {
              socialMedia.linkedin = { username, url };
              console.log(`🔗 Found LinkedIn: ${username}`);
            }
          } else if (url.includes('github.com')) {
            const username = url.match(/github\.com\/([^\/\?]+)/)?.[1];
            if (username) {
              socialMedia.github = { username, url };
              info.github_username = username;
              console.log(`🐙 Found GitHub: ${username}`);
            }
          } else if (url.includes('instagram.com')) {
            const username = url.match(/instagram\.com\/([^\/\?]+)/)?.[1];
            if (username) {
              socialMedia.instagram = { username, url };
              console.log(`� Found Instagram: ${username}`);
            }
          }
        }
      }
    }
    
    if (Object.keys(socialMedia).length > 0) {
      info.social = socialMedia;
    }
    
    // Extract location
    const locationKeywords = ['hong kong', 'hk', 'singapore', 'london', 'new york', 'san francisco'];
    for (const line of contactSection) {
      const lowerLine = line.toLowerCase();
      for (const location of locationKeywords) {
        if (lowerLine.includes(location)) {
          info.location = location.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
          console.log(`� Found location: ${info.location}`);
          break;
        }
      }
      if (info.location) break;
    }
    
    return info;
  }

  /**
   * Extract summary/description section
   */
  extractSummary(lines, sections) {
    if (!sections.summary) return null;
    
    const startIdx = sections.summary + 1;
    const endIdx = this.getNextSectionIndex(sections, 'summary', lines.length);
    
    const summaryLines = lines.slice(startIdx, endIdx)
      .filter(line => line.length > 20); // Filter out short lines
    
    if (summaryLines.length > 0) {
      const summary = summaryLines.join(' ');
      console.log(`📝 Found summary: ${summary.substring(0, 100)}...`);
      return summary;
    }
    
    return null;
  }

  /**
   * Extract education and certifications
   */
  extractEducation(lines, sections) {
    const educationItems = [];
    
    // Process education section
    if (sections.education) {
      const startIdx = sections.education + 1;
      const endIdx = this.getNextSectionIndex(sections, 'education', lines.length);
      educationItems.push(...this.parseEducationItems(lines.slice(startIdx, endIdx)));
    }
    
    // Process certification section
    if (sections.certification) {
      const startIdx = sections.certification + 1;
      const endIdx = this.getNextSectionIndex(sections, 'certification', lines.length);
      educationItems.push(...this.parseEducationItems(lines.slice(startIdx, endIdx)));
    }
    
    if (educationItems.length > 0) {
      console.log(`🎓 Found ${educationItems.length} education items`);
      return educationItems;
    }
    
    return null;
  }

  /**
   * Parse individual education items
   */
  parseEducationItems(lines) {
    const items = [];
    let currentItem = null;
    
    for (const line of lines) {
      // Check if line contains a date (indicates new education item)
      const dateMatch = line.match(/\b(19|20)\d{2}\b/);
      const degreeKeywords = ['bachelor', 'master', 'phd', 'diploma', 'certificate', 'degree'];
      
      if (dateMatch || degreeKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        if (currentItem) {
          items.push(currentItem);
        }
        currentItem = {
          institution: '',
          degree: line,
          year: dateMatch ? dateMatch[0] : '',
          description: ''
        };
      } else if (currentItem && line.length > 10) {
        if (!currentItem.institution && !line.toLowerCase().includes('gpa')) {
          currentItem.institution = line;
        } else {
          currentItem.description += (currentItem.description ? ' ' : '') + line;
        }
      }
    }
    
    if (currentItem) {
      items.push(currentItem);
    }
    
    return items;
  }

  /**
   * Extract work experience
   */
  extractExperience(lines, sections) {
    if (!sections.experience) return null;
    
    const startIdx = sections.experience + 1;
    const endIdx = this.getNextSectionIndex(sections, 'experience', lines.length);
    
    const experienceItems = this.parseExperienceItems(lines.slice(startIdx, endIdx));
    
    if (experienceItems.length > 0) {
      console.log(`� Found ${experienceItems.length} experience items`);
      return experienceItems;
    }
    
    return null;
  }

  /**
   * Parse individual experience items
   */
  parseExperienceItems(lines) {
    const items = [];
    let currentItem = null;
    
    for (const line of lines) {
      // Check if line contains a date range (indicates new job)
      const dateRangeMatch = line.match(/\b(19|20)\d{2}\s*[-–]\s*(present|(19|20)\d{2})/i);
      const monthDateMatch = line.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(19|20)\d{2}/i);
      
      if (dateRangeMatch || monthDateMatch) {
        if (currentItem) {
          items.push(currentItem);
        }
        
        // Split line to extract company and position
        const parts = line.split(/[-–]|\s{2,}/);
        currentItem = {
          company: parts[0]?.trim() || 'Unknown Company',
          position: parts[1]?.trim() || 'Unknown Position',
          period: dateRangeMatch?.[0] || monthDateMatch?.[0] || '',
          description: '',
          responsibilities: []
        };
      } else if (currentItem && line.length > 10) {
        if (line.startsWith('•') || line.startsWith('-') || line.startsWith('–')) {
          currentItem.responsibilities.push(line.replace(/^[•\-–]\s*/, ''));
        } else {
          currentItem.description += (currentItem.description ? ' ' : '') + line;
        }
      }
    }
    
    if (currentItem) {
      items.push(currentItem);
    }
    
    return items;
  }

  /**
   * Extract skills section
   */
  extractSkills(lines, sections) {
    if (!sections.skills) return null;
    
    const startIdx = sections.skills + 1;
    const endIdx = this.getNextSectionIndex(sections, 'skills', lines.length);
    
    const skillsLines = lines.slice(startIdx, endIdx);
    const skills = {
      programming_languages: [],
      frameworks: [],
      tools: [],
      soft_skills: [],
      extracted_from_cv: []
    };
    
    // Common categorization patterns
    const categories = {
      programming_languages: ['javascript', 'typescript', 'python', 'java', 'go', 'c++', 'c#', 'php', 'ruby'],
      frameworks: ['react', 'vue', 'angular', 'next.js', 'express', 'django', 'flask', 'spring'],
      tools: ['git', 'docker', 'kubernetes', 'aws', 'azure', 'jenkins', 'npm', 'webpack'],
      soft_skills: ['leadership', 'communication', 'teamwork', 'problem-solving', 'management']
    };
    
    for (const line of skillsLines) {
      const lowerLine = line.toLowerCase();
      let categorized = false;
      
      // Try to categorize skills
      for (const [category, keywords] of Object.entries(categories)) {
        for (const keyword of keywords) {
          if (lowerLine.includes(keyword)) {
            skills[category].push(line);
            categorized = true;
            break;
          }
        }
        if (categorized) break;
      }
      
      // If not categorized, add to extracted_from_cv
      if (!categorized && line.length > 3) {
        skills.extracted_from_cv.push(line);
      }
    }
    
    console.log(`🛠️  Found skills across ${Object.keys(skills).length} categories`);
    return skills;
  }

  /**
   * Extract projects section
   */
  extractProjects(lines, sections) {
    if (!sections.projects) return null;
    
    const startIdx = sections.projects + 1;
    const endIdx = this.getNextSectionIndex(sections, 'projects', lines.length);
    
    const projectItems = this.parseProjectItems(lines.slice(startIdx, endIdx));
    
    if (projectItems.length > 0) {
      console.log(`🚀 Found ${projectItems.length} projects`);
      return projectItems;
    }
    
    return null;
  }

  /**
   * Parse individual project items
   */
  parseProjectItems(lines) {
    const items = [];
    let currentItem = null;
    
    for (const line of lines) {
      // Check if line looks like a project title (may include date)
      const dateMatch = line.match(/\b(19|20)\d{2}\b/);
      const isNewProject = dateMatch || (line.length < 100 && !line.startsWith('•') && !line.startsWith('-'));
      
      if (isNewProject && !currentItem) {
        currentItem = {
          title: line.replace(/\s*\(.*?\)\s*$/, ''), // Remove date in parentheses
          description: '',
          tech_stack: [],
          repo_url: '',
          demo_url: '',
          period: dateMatch?.[0] || ''
        };
      } else if (currentItem && line.length > 10) {
        // Look for URLs
        const urlMatch = line.match(/https?:\/\/[^\s]+/g);
        if (urlMatch) {
          for (const url of urlMatch) {
            if (url.includes('github.com')) {
              currentItem.repo_url = url;
            } else {
              currentItem.demo_url = url;
            }
          }
        }
        
        // Look for tech stack in description
        const techKeywords = ['react', 'vue', 'angular', 'node', 'python', 'javascript', 'typescript', 'aws', 'docker'];
        for (const tech of techKeywords) {
          if (line.toLowerCase().includes(tech) && !currentItem.tech_stack.includes(tech)) {
            currentItem.tech_stack.push(tech);
          }
        }
        
        // Add to description
        if (!line.includes('http')) { // Skip lines with URLs
          currentItem.description += (currentItem.description ? ' ' : '') + line;
        }
        
        // If we find another project title, save current and start new
        if (line.length < 50 && !line.startsWith('•') && !line.startsWith('-') && currentItem.description.length > 50) {
          items.push(currentItem);
          currentItem = {
            title: line.replace(/\s*\(.*?\)\s*$/, ''),
            description: '',
            tech_stack: [],
            repo_url: '',
            demo_url: '',
            period: dateMatch?.[0] || ''
          };
        }
      }
    }
    
    if (currentItem && currentItem.title) {
      items.push(currentItem);
    }
    
    return items;
  }

  /**
   * Get the index of the next section
   */
  getNextSectionIndex(sections, currentSection, maxLength) {
    const sectionKeys = Object.keys(sections);
    const currentIndex = sections[currentSection];
    
    let nextIndex = maxLength;
    for (const key of sectionKeys) {
      if (sections[key] > currentIndex && sections[key] < nextIndex) {
        nextIndex = sections[key];
      }
    }
    
    return nextIndex;
  }

  /**
   * Update portfolio configuration with extracted information
   */
  updatePortfolioConfig(currentConfig, extractedInfo) {
    const updated = { ...currentConfig };
    const updatedFields = [];

    console.log('🔄 Updating portfolio configuration...');

    // Update personal information
    if (extractedInfo.name) {
      updated.personal = updated.personal || {};
      updated.personal.name = extractedInfo.name;
      updatedFields.push('name');
    }

    if (extractedInfo.location) {
      updated.personal = updated.personal || {};
      updated.personal.location = extractedInfo.location;
      updated.contact = updated.contact || {};
      updated.contact.location = extractedInfo.location;
      updatedFields.push('location');
    }

    if (extractedInfo.description) {
      updated.personal = updated.personal || {};
      updated.personal.description = extractedInfo.description;
      updatedFields.push('description');
    }

    // Update contact information
    if (extractedInfo.email) {
      updated.contact = updated.contact || {};
      updated.contact.email = extractedInfo.email;
      updatedFields.push('email');
    }
    
    if (extractedInfo.phone) {
      updated.contact = updated.contact || {};
      updated.contact.phone = extractedInfo.phone;
      updatedFields.push('phone');
    }

    // Update social links
    if (extractedInfo.social) {
      updated.contact = updated.contact || {};
      updated.contact.social = updated.contact.social || {};
      
      if (extractedInfo.social.github) {
        updated.contact.social.github = extractedInfo.social.github;
        updatedFields.push('github');
      }
      
      if (extractedInfo.social.linkedin) {
        updated.contact.social.linkedin = extractedInfo.social.linkedin;
        updatedFields.push('linkedin');
      }
      
      if (extractedInfo.social.instagram) {
        updated.contact.social.instagram = extractedInfo.social.instagram;
        updatedFields.push('instagram');
      }
    }

    if (extractedInfo.github_username) {
      updated.contact = updated.contact || {};
      updated.contact.social = updated.contact.social || {};
      updated.contact.social.github = {
        username: extractedInfo.github_username,
        url: `https://github.com/${extractedInfo.github_username}`
      };
      updatedFields.push('github_username');
    }

    // Update education
    if (extractedInfo.education && extractedInfo.education.length > 0) {
      updated.professional = updated.professional || {};
      
      // Update education as an array
      updated.professional.education = extractedInfo.education.map(edu => ({
        institution: edu.institution || 'Unknown Institution',
        degree: edu.degree || 'Unknown Degree',
        year: edu.year || 'Unknown Year'
      }));
      
      updatedFields.push('education');
    }

    // Update experience
    if (extractedInfo.experience && extractedInfo.experience.length > 0) {
      updated.professional = updated.professional || {};
      updated.professional.experience = extractedInfo.experience.map(exp => ({
        company: exp.company,
        position: exp.position,
        period: exp.period,
        description: exp.description,
        Skills: exp.Skills || [], // Handle Skills field
        responsibilities: exp.responsibilities
      }));
      updatedFields.push('experience');
    }

    // Update skills with proper categorization
    if (extractedInfo.skills) {
      updated.skills = updated.skills || {};
      
      // Merge with existing skills
      if (extractedInfo.skills.programming_languages && extractedInfo.skills.programming_languages.length > 0) {
        updated.skills.programming_languages = [
          ...(updated.skills.programming_languages || []),
          ...extractedInfo.skills.programming_languages
        ];
        // Remove duplicates
        updated.skills.programming_languages = [...new Set(updated.skills.programming_languages)];
      }
      
      if (extractedInfo.skills.frameworks && extractedInfo.skills.frameworks.length > 0) {
        updated.skills.frameworks = [
          ...(updated.skills.frameworks || []),
          ...extractedInfo.skills.frameworks
        ];
        updated.skills.frameworks = [...new Set(updated.skills.frameworks)];
      }
      
      if (extractedInfo.skills.tools && extractedInfo.skills.tools.length > 0) {
        updated.skills.tools = [
          ...(updated.skills.tools || []),
          ...extractedInfo.skills.tools
        ];
        updated.skills.tools = [...new Set(updated.skills.tools)];
      }
      
      if (extractedInfo.skills.soft_skills && extractedInfo.skills.soft_skills.length > 0) {
        updated.skills.soft_skills = [
          ...(updated.skills.soft_skills || []),
          ...extractedInfo.skills.soft_skills
        ];
        updated.skills.soft_skills = [...new Set(updated.skills.soft_skills)];
      }
      
      // Keep extracted skills for reference
      if (extractedInfo.skills.extracted_from_cv && extractedInfo.skills.extracted_from_cv.length > 0) {
        updated.skills.extracted_from_cv = extractedInfo.skills.extracted_from_cv;
      }
      
      updatedFields.push('skills');
    }

    // Update projects
    if (extractedInfo.projects && extractedInfo.projects.length > 0) {
      updated.projects = updated.projects || [];
      
      // Add new projects from CV
      const newProjects = extractedInfo.projects.map(project => ({
        title: project.title,
        description: project.description,
        tech_stack: project.tech_stack,
        repo_url: project.repo_url,
        demo_url: project.demo_url,
        period: project.period,
        images: [] // Will need to be added manually
      }));
      
      // Merge with existing projects (avoid duplicates by title)
      const existingTitles = (updated.projects || []).map(p => p.title.toLowerCase());
      const uniqueNewProjects = newProjects.filter(p => 
        !existingTitles.includes(p.title.toLowerCase())
      );
      
      if (uniqueNewProjects.length > 0) {
        updated.projects = [...(updated.projects || []), ...uniqueNewProjects];
        updatedFields.push('projects');
      }
    }

    // Update resume URL and metadata
    if (extractedInfo.cv_url) {
      updated.resume = updated.resume || {};
      updated.resume.download_url = extractedInfo.cv_url;
      updated.resume.last_updated = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      updatedFields.push('cv_url');
    }

    // Store updated fields for reporting
    updated._updatedFields = updatedFields;

    return updated;
  }

  /**
   * Save updated portfolio configuration
   */
  async savePortfolioConfig(config) {
    try {
      // Create backup
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = this.portfolioPath + `.backup.${timestamp}`;
      fs.copyFileSync(this.portfolioPath, backupPath);
      console.log(`📋 Backup created: ${backupPath}`);

      // Save updated config
      const yamlContent = yaml.dump(config, {
        indent: 2,
        lineWidth: 100,
        noRefs: true
      });
      
      fs.writeFileSync(this.portfolioPath, yamlContent, 'utf8');
      console.log(`💾 Portfolio config updated: ${this.portfolioPath}`);
      
    } catch (error) {
      throw new Error(`Failed to save portfolio config: ${error.message}`);
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
📄 Portfolio CV Updater

Usage:
  node update-portfolio-from-cv.js <cv_source>

Examples:
  # From URL
  node update-portfolio-from-cv.js https://example.com/cv.pdf
  
  # From local file
  node update-portfolio-from-cv.js ./documents/resume.pdf
  
  # Use existing URL from portfolio.yaml
  node update-portfolio-from-cv.js --use-existing

Options:
  --use-existing    Use the CV URL from current portfolio.yaml
  --help           Show this help message
    `);
    process.exit(1);
  }

  if (args[0] === '--help') {
    console.log(`
📄 Portfolio CV Updater

This script extracts information from your CV and updates the portfolio.yaml configuration file.

Supported formats:
  - PDF files (requires pdf-parse: pnpm add pdf-parse)
  - Text files
  - URLs to downloadable CVs

What it extracts:
  - Personal information (name, email, phone, location)
  - Education details
  - Work experience
  - Skills and technologies
  - Social media links (GitHub, LinkedIn)

The script creates a backup before making changes.
    `);
    process.exit(0);
  }

  const updater = new PortfolioUpdater();
  
  let cvSource = args[0];
  
  if (cvSource === '--use-existing') {
    try {
      const currentConfig = await updater.loadPortfolioConfig();
      cvSource = currentConfig.resume?.download_url;
      
      if (!cvSource) {
        console.error('❌ No CV URL found in portfolio.yaml');
        process.exit(1);
      }
      
      console.log(`📎 Using existing CV URL: ${cvSource}`);
    } catch (error) {
      console.error('❌ Failed to load existing config:', error.message);
      process.exit(1);
    }
  }

  await updater.updateFromCV(cvSource);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = PortfolioUpdater;
