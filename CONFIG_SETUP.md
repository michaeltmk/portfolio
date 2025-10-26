# Portfolio Setup Guide

This portfolio is now **configuration-driven**, meaning you can customize everything by simply editing the `config/portfolio.yaml` file. No need to hunt through multiple files and components!

## 🚀 Quick Start

### 1. **Update Your Information**
Edit `config/portfolio.yaml` with your details:

```yaml
personal:
  name: "Your Name"
  nickname: "Nick"
  age: "25 years old"
  location: "Your City"
  title: "Your Job Title"
  description: "Your introduction message"

contact:
  email: "your.email@example.com"
  phone: "+1 234 567 8900"
  social:
    linkedin:
      username: "your-linkedin"
      url: "https://linkedin.com/in/your-linkedin"
    github:
      username: "yourusername"
      url: "https://github.com/yourusername"
```

### 2. **Add Your Projects**
```yaml
projects:
  - title: "Your Project Name"
    description: "Project description"
    tech_stack: ["React", "Node.js", "TypeScript"]
    demo_url: "https://your-demo.com"
    repo_url: "https://github.com/you/project"
    images:
      - src: "/projects/project-screenshot.png"
        alt: "Project screenshot"
```

### 3. **Customize Skills**
```yaml
skills:
  programming_languages: ["JavaScript", "Python", "TypeScript"]
  frameworks: ["React", "Next.js", "Express"]
  tools: ["Git", "Docker", "VS Code"]
  soft_skills: ["Problem-solving", "Communication"]
```

### 4. **Set Up Environment Variables**
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
- ✅ **Skills & Experience** - Programming languages, frameworks, work history
- ✅ **Projects** - Titles, descriptions, tech stacks, demo links
- ✅ **AI Personality** - Background story, traits, conversation style
- ✅ **Site Metadata** - Portfolio title, description, author

### From Environment Variables (`.env.local`):
- ✅ **API Keys** - AI providers, analytics, integrations
- ✅ **Deployment Settings** - Site URL, provider configuration
- ✅ **Sensitive Data** - GitHub tokens, private configuration

## 🖼️ Adding Your Assets

Replace these files in the `public/` directory:

### Profile Images
- `/public/profile-main.jpg` - Main profile photo
- `/public/avatar-memoji.png` - Chat avatar/memoji  

### Resume
- `/public/Your_Name_Resume.pdf` - Resume file
- `/public/resume-preview.png` - Resume preview image

### Project Screenshots
- `/public/projects/project1-screenshot.png`
- `/public/projects/project2-screenshot.png`

## 🤖 AI Personality

The AI chat is automatically generated from your config:
- Uses your personal background
- Includes your contact information  
- Reflects your personality traits
- References your projects and skills

## 🎨 Customization

### Colors & Branding
```yaml
assets:
  branding:
    primary_color: "#0070f3"
    secondary_color: "#666666"
```

### Site Information
```yaml
site:
  name: "Your Portfolio"
  title: "Your Professional Title" 
  description: "Portfolio description for SEO"
  url: "https://your-domain.com"  # Also set in NEXT_PUBLIC_SITE_URL
```

**Note:** The `site.url` should match your `NEXT_PUBLIC_SITE_URL` environment variable.

## 🚀 Deployment

1. Update `site.url` in config with your domain
2. Deploy to Vercel/Netlify
3. Add environment variables to your hosting platform
4. Your portfolio is live! 🎉

## 🆘 Need Help?

- Check the example config in `config/portfolio.yaml`
- All component files now auto-load from config
- The AI personality is generated from your information
- Contact info, skills, and projects are all centralized

## 🔄 Migration from Hardcoded Version

If you're updating from the old hardcoded version:
1. All your data should now be in `config/portfolio.yaml`
2. Components automatically read from config
3. No need to edit individual component files
4. Just update the config and everything else follows!

---

**That's it!** Your portfolio is now fully configuration-driven. Update the YAML file and watch your entire portfolio adapt automatically! 🚀
