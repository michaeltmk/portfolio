import { tool } from 'ai';
import { z } from 'zod';

export const getOpportunities = tool({
  description:
    "Gives a summary of what kind of opportunities I'm looking for, plus my contact info and how to reach me. Use this tool when the user asks about my opportunity search or how to contact me for opportunities.",
  parameters: z.object({}),
  execute: async () => {
    return `Here’s what I’m looking for 👇

- 📅 **Availability**: Open to immediate opportunities
- 🌍 **Location**: Preferably **Hong Kong** or anywhere remote
- 🧑‍💻 **Focus**: Data Science, AI/ML, Full-stack development
- 🛠️ **Stack**: Python, React, SQL, TensorFlow, Power BI, Tableau
- ✅ **What I bring**: Experience in building data-driven dashboards, optimizing data pipelines, and developing end-to-end analytics projects. Proven ability to translate raw data into actionable business insights.
- 🔥 I move fast, learn faster, and I’m HUNGRYYYYY for big challenges

📬 **Contact me** via:
- Email: tse.man.kit.michael@gmail.com
- LinkedIn: [linkedin.com/in/man-kit-michael-tse-4013a5176](https://linkedin.com/in/man-kit-michael-tse-4013a5176)
- GitHub: [github.com/michaeltmk](https://github.com/michaeltmk)

Let's build cool shit together ✌️
    `;
  },
});
