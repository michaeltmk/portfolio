# Dynamic Contact System Documentation

## Overview

The portfolio now features a fully dynamic contact system that allows users to customize their contact information based on their preferences and privacy needs. All contact fields are optional, and the system automatically adapts to display only the information provided.

## Features

### ✨ Fully Optional Fields
- **Email**: Optional - only displayed if provided
- **Phone**: Optional - only displayed if provided  
- **Location**: Optional - only displayed if provided
- **Social Media**: Dynamic - supports any number of platforms

### 🔄 Dynamic Social Media Support
The system supports any social media platform by using a flexible key-value structure:

```yaml
social:
  platform_name:
    username: your_username
    url: https://platform.com/your_profile
```

### 🎨 Automatic Icon & Color Mapping
The system automatically provides appropriate icons and colors for popular platforms:
- **LinkedIn**: Blue professional icon
- **GitHub**: Gray code icon
- **Instagram**: Pink camera icon
- **Twitter**: Blue bird icon
- **Facebook**: Blue social icon
- **YouTube**: Red play icon
- **Unknown platforms**: Gray globe icon (fallback)

## Configuration Examples

### Minimal Contact (Social Only)
```yaml
contact:
  social:
    github:
      username: myusername
      url: https://github.com/myusername
```

### Traditional Contact (Email & Phone)
```yaml
contact:
  email: contact@example.com
  phone: +1234567890
  location: New York, USA
  social: {}
```

### Comprehensive Contact
```yaml
contact:
  email: contact@example.com
  phone: +1234567890
  location: San Francisco, CA
  social:
    linkedin:
      username: professional-name
      url: https://linkedin.com/in/professional-name
    github:
      username: developer-name
      url: https://github.com/developer-name
    twitter:
      username: twitter_handle
      url: https://twitter.com/twitter_handle
    instagram:
      username: insta_handle
      url: https://instagram.com/insta_handle
    youtube:
      username: channel-name
      url: https://youtube.com/@channel-name
```

### Privacy-Focused (No Traditional Contact)
```yaml
contact:
  # No email, phone, or location shared
  social:
    twitter:
      username: anonymous_dev
      url: https://twitter.com/anonymous_dev
    github:
      username: anonymous-dev
      url: https://github.com/anonymous-dev
```

## Supported Social Platforms

The system has built-in support for these platforms with custom icons and colors:
- LinkedIn
- GitHub
- Instagram
- Twitter
- Facebook
- YouTube

### Adding New Platforms
To add a new social platform, simply add it to your configuration:

```yaml
social:
  mastodon:
    username: "@user@instance.social"
    url: "https://instance.social/@user"
  discord:
    username: "User#1234"
    url: "https://discord.com/users/userid"
```

New platforms will automatically use the default globe icon and gray color.

## Component Behavior

### Empty Contact Information
If no contact information is provided, the component displays a helpful message:
"Contact information is not currently available. Please check back later!"

### Responsive Design
The contact cards automatically arrange in a responsive grid:
- Mobile: Single column
- Desktop: Two columns
- Adapts to any number of contact methods

### Interactive Elements
- **Email**: Opens default email client with mailto link
- **Phone**: Opens phone dialer with tel link
- **Location**: Displays "View on Map" (can be customized)
- **Social Media**: Opens profile in new tab

## Migration Guide

### From Fixed to Dynamic System

**Old Structure (Fixed):**
```yaml
contact:
  email: required@example.com
  phone: required
  location: required
  social:
    linkedin: { username: "req", url: "req" }
    github: { username: "req", url: "req" }
    instagram: { username: "req", url: "req" }
```

**New Structure (Dynamic):**
```yaml
contact:
  email: optional@example.com  # Optional
  phone: "+1234567890"         # Optional
  location: "City, Country"    # Optional
  social:                      # Any platforms you want
    platform_name:
      username: "username"
      url: "https://..."
```

### Benefits of Migration
1. **Privacy Control**: Share only what you're comfortable with
2. **Flexibility**: Add any social media platform
3. **Professional Profiles**: Business vs personal contact preferences
4. **Maintenance**: No need to provide dummy data for unused fields

## Best Practices

### For Professional Portfolios
```yaml
contact:
  email: professional@example.com
  location: "City, Country"
  social:
    linkedin:
      username: professional-name
      url: https://linkedin.com/in/professional-name
    github:
      username: github-username
      url: https://github.com/github-username
```

### For Content Creators
```yaml
contact:
  social:
    youtube:
      username: channel-name
      url: https://youtube.com/@channel-name
    instagram:
      username: creator_handle
      url: https://instagram.com/creator_handle
    twitter:
      username: twitter_handle
      url: https://twitter.com/twitter_handle
```

### For Privacy-Conscious Users
```yaml
contact:
  social:
    github:
      username: anonymous-dev
      url: https://github.com/anonymous-dev
    # Only professional platforms, no personal info
```

## Technical Implementation

### TypeScript Interface
```typescript
interface ContactInfo {
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
```

### Component Features
- Conditional rendering based on available data
- Dynamic icon and color assignment
- Responsive grid layout
- Accessible button interactions
- Error handling for missing data

## Testing

The system includes comprehensive tests for various scenarios:
- Minimal contact (only social)
- Email and social only
- Full contact information
- No contact info at all
- Traditional contact without email

Run tests with:
```bash
node test-dynamic-contact.js
```

This documentation ensures users can fully leverage the flexible contact system while maintaining their desired level of privacy and professional presentation.
