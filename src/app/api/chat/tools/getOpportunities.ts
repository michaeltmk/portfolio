import { tool } from 'ai';
import { z } from 'zod';
import { getOpportunitiesServer, getContactInfoServer } from '@/lib/config';

export const getOpportunities = tool({
  description:
    "Gives a summary of what kind of opportunities I'm looking for, plus my contact info and how to reach me. Use this tool when the user asks about my opportunity search or how to contact me for opportunities.",
  parameters: z.object({}),
  execute: async () => {
    const opportunities = getOpportunitiesServer();
    const contact = getContactInfoServer();
    
    return `Here's what I'm looking for 👇

- 📅 **Availability**: ${opportunities.availability}
- 🌍 **Location**: Preferably **${opportunities.preferred_location}**${opportunities.remote_work ? ' or anywhere remote' : ''}
- 🧑‍💻 **Focus**: ${opportunities.focus_areas.join(', ')}
- 🛠️ **Stack**: ${opportunities.tech_stack.join(', ')}
- ✅ **What I bring**: ${opportunities.what_i_bring}
- 🔥 ${opportunities.motivation}

📬 **Contact me** via:
- Email: ${contact.email}
- LinkedIn: [${contact.social.linkedin.url}](${contact.social.linkedin.url})
- GitHub: [${contact.social.github.url}](${contact.social.github.url})

${opportunities.call_to_action}
    `;
  },
});
