# Portfolio Setup Guide

This portfolio is now **configuration-driven**, meaning you can customize everything by simply editing the `config/portfolio.yaml` file. No need to hunt through multiple files and components!

## 🚀 Quick Start

### 1. **Update Your Personal Information**
Edit `config/portfolio.yaml` with your details:

```yaml
personal:
  name: "Your Name"
  nickname: "Nick"
  age: "25 years old"  # Optional
  location: "Your City"
  title: "Your Job Title"
  description: >-
    Your introduction message. This supports multi-line descriptions
    and will be used throughout your portfolio.

contact:
  email: "your.email@example.com"
  phone: "+1 234 567 8900"  # Optional
  location: "Your City"
  social:  # All social platforms are optional
    linkedin:
      username: "your-linkedin"
      url: "https://linkedin.com/in/your-linkedin"
    github:
      username: "yourusername"
      url: "https://github.com/yourusername"
    twitter:
      username: "yourtwitter"
      url: "https://twitter.com/yourtwitter"
    website:
      username: "yoursite.com"
      url: "https://yoursite.com"
```

### 2. **Add Professional Background**
```yaml
professional:
  education:
    - institution: "University Name"
      degree: "Bachelor of Computer Science"
      year: "2020-2024"
    - institution: "Online Platform"
      degree: "Certification Name"
      year: "2023"
  
  experience:
    - company: "Company Name"
      position: "Your Position"
      period: "Jan 2024 - Present"
      description: "Your role description and achievements"
      Skills:
        - "Skill 1"
        - "Skill 2"
  
  additional_education:  # Optional certifications
    - institution: "AWS"
      degree: "Certified Solutions Architect"
      year: "2024"
      description: "Certification description"
      link:  # Optional
        url: "https://certification-url.com"
        text: "View Certification"
```

### 3. **Add Your Projects**
```yaml
projects:
  - title: "Your Project Name"
    start_date: "Jan 2024"  # Optional
    end_date: "Jun 2024"    # Optional (leave blank for ongoing)
    description: 
      - "Project description line 1"
      - "Project description line 2"
    tech_stack: ["React", "Node.js", "TypeScript"]
    demo_url: "https://your-demo.com"  # Optional
    repo_url: "https://github.com/you/project"  # Optional
    images:
      - src: "/projects/project-screenshot.png"
        alt: "Project screenshot"
```

### 4. **Customize Skills**
```yaml
skills:
  programming_languages:
    - "JavaScript/TypeScript"
    - "Python"
    - "Java"
  
  frontend_frameworks:  # Customize categories as needed
    - "React"
    - "Next.js"
    - "Vue.js"
  
  backend_frameworks:
    - "Node.js"
    - "Express"
    - "FastAPI"
  
  databases:
    - "PostgreSQL"
    - "MongoDB"
    - "Redis"
  
  cloud_platforms:
    - "AWS"
    - "Google Cloud"
    - "Azure"
  
  tools_technologies:
    - "Docker"
    - "Git/GitHub"
    - "Webpack"
  
  soft_skills:
    - "Problem-solving"
    - "Team leadership"
    - "Communication"
```

### 5. **Configure AI Personality**
```yaml
ai_personality:
  character_name: "Your Name"
  personality_traits:
    - "Tech enthusiast passionate about innovation"
    - "Problem solver with attention to detail"
    - "Collaborative team player"
  
  background_story: >-
    Brief professional background that will be used by the AI chat
    to represent you in conversations.
  
  personal_quirks:
    - "Coffee addict - can't code without it"
    - "Mechanical keyboard enthusiast"
    - "Weekend hiker"
```

### 6. **Set Up Career Opportunities**
```yaml
opportunities:
  availability: "Available for new opportunities"
  preferred_location: "Your City"
  remote_work: true
  looking_for:
    - "Senior Developer roles"
    - "Tech Lead positions"
    - "AI/ML projects"
  
  focus_areas:
    - "Web Development"
    - "AI/ML"
    - "Cloud Architecture"
  
  what_i_bring: >-
    Your value proposition and what you bring to potential employers
  
  motivation: "What drives you professionally"
  call_to_action: "Let's build something amazing together! 🚀"
```

### 7. **Configure Resume**
```yaml
resume:
  title: "Your Name's Resume"
  description: "Your Professional Title"
  file_type: "PDF"
  last_updated: "October 2024"
  file_size: "0.3 MB"
  preview_image: "/resume-preview.png"
  download_url: "https://your-site.com/resume.pdf"
```

### 8. **Set Up Environment Variables**
Copy `.env.example` to `.env.local` and add your values:

```bash
# Required AI API Key
MISTRAL_API_KEY=your_mistral_key_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-portfolio.com

# Optional: Analytics and GitHub integration
NEXT_PUBLIC_GA_ID=your_google_analytics_id
GITHUB_TOKEN=your_github_token

# AI Provider Configuration
AI_PRIMARY_PROVIDER=mistral
AI_FALLBACK_PROVIDERS=openai,anthropic
```

**Environment Variables vs Config File:**
- **Config file** (`portfolio.yaml`): Personal info, skills, projects, content
- **Environment variables** (`.env.local`): API keys, deployment settings, sensitive data

## 📁 File Structure

```
├── config/
│   └── portfolio.yaml          # 🎯 Main configuration file
├── src/
│   ├── lib/
│   │   └── config.ts          # Configuration loader
│   ├── components/            # Auto-load from config
│   └── app/
└── public/                    # Your assets
```

## 🔧 What Gets Updated Automatically

### From `config/portfolio.yaml`:
- ✅ **Personal Information** - Name, title, description, contact details
- ✅ **Professional Background** - Education, work experience, certifications
- ✅ **Skills & Experience** - Programming languages, frameworks, tools, soft skills
- ✅ **Projects** - Titles, descriptions, tech stacks, demo links, timelines
- ✅ **AI Personality** - Background story, traits, conversation style, quirks
- ✅ **Career Opportunities** - Availability, preferences, focus areas
- ✅ **Resume Configuration** - Download links, metadata, preview settings
- ✅ **Repository Information** - GitHub integration, star targets
- ✅ **Site Metadata** - Portfolio title, description, author, branding

### From Environment Variables (`.env.local`):
- ✅ **API Keys** - AI providers, analytics, integrations
- ✅ **Deployment Settings** - Site URL, provider configuration
- ✅ **Sensitive Data** - GitHub tokens, private configuration

## 🖼️ Adding Your Assets

Replace these files in the `public/` directory:

### Profile Images
- `/public/profile-main.jpg` - Main profile photo (recommended: 400x400px)
- `/public/avatar-memoji.png` - Chat avatar/memoji (recommended: 150x150px)

### Resume
- `/public/Your_Name_Resume.pdf` - Resume file
- `/public/resume-preview.png` - Resume preview image

### Project Screenshots
- `/public/projects/project1-screenshot.png`
- `/public/projects/project2-screenshot.png`
- Add images for each project in your config

### Logo & Branding
- `/public/logo-yourname.png` - Personal logo (optional)

## 🎨 Customization

### Assets Configuration
```yaml
assets:
  profile_images:
    main: "/profile-main.jpg"
    avatar: "/avatar-memoji.png"
    fallback: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
  
  logo: "/logo-yourname.png"  # Optional
  
  branding:
    primary_color: "#3b82f6"    # Optional custom colors
    secondary_color: "#64748b"  # Optional
```

### Site Information
```yaml
site:
  name: "Your Name - Portfolio"
  title: "Your Professional Title Portfolio"
  description: "Portfolio description for SEO and social media"
  url: "https://your-domain.com"  # Should match NEXT_PUBLIC_SITE_URL
  author: "Your Name"
```

### Repository Configuration
```yaml
repository:
  owner: "yourusername"
  name: "portfolio"
  url: "https://github.com/yourusername/portfolio"
  star_target: 100  # Optional GitHub stars goal
```

**Note:** The `site.url` should match your `NEXT_PUBLIC_SITE_URL` environment variable.

## 🤖 AI Personality

The AI chat is automatically generated from your config:
- Uses your personal background and professional experience
- Includes your contact information and career opportunities
- Reflects your personality traits and quirks
- References your projects, skills, and achievements
- Adapts conversation style based on your background story

## 🚀 Deployment

1. Update `site.url` in config with your domain
2. Deploy to Vercel/Netlify
3. Add environment variables to your hosting platform
4. Your portfolio is live! 🎉

## 🆘 Need Help?

- Check the comprehensive example config in `config/portfolio.yaml`
- Review the template at `config/portfolio.yaml.template`
- All component files now auto-load from config
- The AI personality is generated from your professional information
- Contact info, skills, projects, and experience are all centralized
- Skills categories can be customized to match your background
- Project descriptions support both string and array formats
- Social media links support multiple platforms (LinkedIn, GitHub, Twitter, Instagram, etc.)

## 📝 Configuration Tips

- **Optional Fields**: Most fields are optional - only include what's relevant
- **Descriptions**: Support multi-line text with `>-` for better formatting
- **Arrays vs Strings**: Projects descriptions can be arrays for bullet points
- **Images**: Always include alt text for accessibility
- **URLs**: Use full URLs for external links, relative paths for local assets
- **Dates**: Use consistent date formats (e.g., "Jan 2024" or "2024-01")

## 🔄 Migration from Hardcoded Version

If you're updating from the old hardcoded version:
1. All your data should now be in `config/portfolio.yaml`
2. Components automatically read from config
3. No need to edit individual component files
4. Just update the config and everything else follows!

---

**That's it!** Your portfolio is now fully configuration-driven. Update the YAML file and watch your entire portfolio adapt automatically! 🚀
