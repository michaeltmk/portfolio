# Portfolio CV Updater

An automated script to update your `portfolio.yaml` configuration file by extracting information from your CV/resume.

## Features

✅ **PDF parsing** - Extracts text from PDF files using pdf-parse library
✅ **URL download** - Downloads CV from web URLs with redirect support  
✅ **Local file support** - Reads CV from local files (PDF, TXT, DOC, DOCX)
✅ **Smart text extraction** - Intelligently extracts key information:
   - Personal information (name, email, phone, location)
   - Education details
   - Work experience
   - Skills and technologies
✅ **Automatic backup** - Creates timestamped backups before making changes
✅ **Categorized skills** - Automatically categorizes skills into programming languages, frameworks, and tools
✅ **Comprehensive field mapping** - Updates multiple sections of portfolio.yaml

## Installation

The script uses dependencies already available in your project:
- `js-yaml` - for YAML parsing (already installed)
- `pdf-parse` - for PDF text extraction (automatically installed)

## Usage

### Basic Usage

```bash
# From URL (PDF or text file)
node scripts/update-portfolio-from-cv.js https://example.com/cv.pdf

# From local file
node scripts/update-portfolio-from-cv.js ./documents/resume.pdf
node scripts/update-portfolio-from-cv.js ./documents/resume.txt

# Use existing CV URL from portfolio.yaml
node scripts/update-portfolio-from-cv.js --use-existing
```

### Using npm scripts

```bash
# Using existing CV URL from portfolio.yaml
npm run update-portfolio:existing

# Using custom CV source
npm run update-portfolio https://example.com/cv.pdf
npm run update-portfolio ./local-cv.pdf
```

### Options

- `--use-existing` - Use the CV URL already specified in portfolio.yaml resume.download_url
- `--help` - Show help information

## What Gets Updated

The script intelligently extracts and updates the following fields in your `portfolio.yaml`:

### Personal Information
- `personal.name` - Full name from CV
- `personal.nickname` - First name as nickname  
- `personal.location` - Location/city

### Contact Information
- `contact.email` - Email address
- `contact.phone` - Phone number
- `contact.location` - Location

### Education
- `professional.education.institution` - University/school name
- `professional.education.degree` - Degree type (if found)
- `professional.education.year` - Graduation year (if found)

### Work Experience
- `professional.experience[]` - Array of work experiences with:
  - `company` - Company name
  - `position` - Job title/position
  - `description` - Job description/details

### Skills
The script automatically categorizes skills into:
- `skills.programming_languages[]` - JavaScript, Python, etc.
- `skills.frameworks[]` - React, Express, etc.
- `skills.tools[]` - Git, Docker, AWS, etc.

### Resume Information
- `resume.download_url` - CV URL (if source was URL)
- `resume.last_updated` - Current date

## Example Output

```
🚀 Starting portfolio update from CV...
📥 Fetching CV from URL: https://example.com/cv.pdf
🔍 Extracting information from CV (127.3 KB)...
📄 Parsing PDF content...
✅ Extracted 2847 characters from PDF
📊 Analyzing 89 lines of text...
📧 Found email: john.doe@example.com
📞 Found phone: +1 555 123 4567
👤 Found name: John Doe
🎓 Found education: University of California - Bachelor of Computer Science
🛠️  Found 12 skills
💼 Found 3 work experiences
📍 Found location: San Francisco
📋 Backup created: /config/portfolio.yaml.backup.2025-01-15T10-30-45-123Z
💾 Portfolio config updated: /config/portfolio.yaml
✅ Portfolio updated successfully!
```

## Supported File Formats

- **PDF** (.pdf) - Uses pdf-parse library for text extraction
- **Text** (.txt) - Direct text parsing
- **Word** (.doc, .docx) - Basic support (may require additional setup)

## Safety Features

- **Automatic backups** - Creates timestamped backup before any changes
- **Non-destructive** - Only updates fields with new information, preserves existing data
- **Error handling** - Graceful fallbacks if parsing fails
- **Validation** - Checks for valid email addresses, phone numbers, etc.

## Tips for Best Results

1. **CV Structure**: Use clear section headers like "Education", "Experience", "Skills"
2. **Contact Info**: Place email and phone near the top of the CV
3. **Skills Section**: List skills with commas or in bullet points
4. **Experience Format**: Include company names, positions, and dates
5. **Clean Format**: Avoid complex formatting that might confuse text extraction

## Troubleshooting

### PDF Parsing Issues
If PDF parsing fails, the script will fall back to using the CV URL as a reference. To improve PDF parsing:
- Ensure the PDF contains selectable text (not scanned images)
- Try converting to a simpler PDF format
- Use a text file (.txt) as an alternative

### Missing Information
If certain fields aren't detected:
- Check that section headers are clear ("Skills", "Experience", etc.)
- Ensure information follows common CV formatting patterns
- Review the extracted text output for parsing issues

### Permission Errors
Make sure you have write permissions to the config directory and portfolio.yaml file.

## Advanced Usage

### Custom Processing
The script can be imported as a module:

```javascript
const PortfolioUpdater = require('./scripts/update-portfolio-from-cv.js');

const updater = new PortfolioUpdater();
await updater.updateFromCV('path/to/cv.pdf');
```

### Integration with CI/CD
You can integrate this script into your deployment pipeline to automatically update portfolio information when a new CV is available.
