<div align="center">
  <a href="https://your-portfolio.com">
    <img src="assets/readme-photo.png" alt="AI Portfolio Banner" width="100%"/>
  </a>
  
  <h1>🌐 Configuration-Driven AI Portfolio</h1>
  <p><em>Transform your static portfolio into an interactive AI-powered experience</em></p>
</div>

---

## 📊 Project Stats

<p align="center">
  <img src="https://img.shields.io/github/repo-size/michaeltmk/portfolio?style=for-the-badge" alt="Repo Size">
  <img src="https://img.shields.io/github/license/michaeltmk/portfolio?style=for-the-badge" alt="License">
  <a href="https://github.com/michaeltmk/portfolio/stargazers"><img src="https://img.shields.io/github/stars/michaeltmk/portfolio?style=for-the-badge&color=ffd700" alt="Repo Stars"></a>
  <a href="https://github.com/michaeltmk/portfolio/graphs/contributors"><img src="https://img.shields.io/github/contributors/michaeltmk/portfolio?style=for-the-badge&color=ff69b4" alt="Contributors"></a>
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"></a>
  <a href="https://vercel.com/"><img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Deployment"></a>
  <a href="https://openai.com/"><img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI API"></a>
  <a href="https://mistral.ai/"><img src="https://img.shields.io/badge/Mistral-FF7E00?style=for-the-badge&logo=mistralai&logoColor=white" alt="Mistral API"></a>
</p>

## 💡 About

Static portfolios are a thing of the past. This project features a **configuration-driven, AI-powered portfolio** that transforms the traditional portfolio experience into an interactive conversation.

Simply update the `config/portfolio.yaml` file with your personal information, and the entire portfolio automatically adapts to showcase your unique background, skills, and projects.

---

## ✨ Features

- **🔧 Configuration-Driven**: Update one YAML file to customize the entire portfolio
- **🔐 Environment Separation**: Sensitive data (API keys) in `.env`, content in config
- **🗣️ Interactive AI Avatar**: Engage in real-time conversation powered by your personal data
- **🧠 Dynamic Content**: All components automatically use your config data
- **🎨 Modern UI**: Sleek, responsive interface built with TailwindCSS and Framer Motion
- **🚀 Multiple AI Providers**: Support for Mistral, OpenAI, Anthropic, and more
- **💬 Smart Personality**: AI responds as YOU based on your config

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | [Next.js](https://nextjs.org/), [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) |
| **Backend** | [Node.js](https://nodejs.org/), Next.js API Routes |
| **AI & APIs** | [OpenAI API](https://openai.com/), [Mistral API](https://mistral.ai/), [GitHub API](https://docs.github.com/en/rest) |
| **Deployment** | [Vercel](https://vercel.com/) |
| **Package Manager** | [pnpm](https://pnpm.io/) |

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- pnpm package manager
- Mistral API Token
- GitHub API Token

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/michaeltmk/portfolio.git
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables and portfolio configuration**
   
   **a) Create environment variables file**
   
   Create a `.env.local` file in the root directory:
   ```env
   cp .env.example .env.local
   ```
   
   - Get your Mistral API Key from [admin.mistral.ai](https://admin.mistral.ai/organization/api-keys)
   - Generate your GitHub Token at [github.com/settings/tokens](https://github.com/settings/personal-access-tokens)
   
   **b) Configure your portfolio content**
   
   Copy the portfolio configuration template and customize it with your information:
   ```bash
   cp config/portfolio.yaml.template config/portfolio.yaml
   ```
   
   Then edit `config/portfolio.yaml` to update:
   - Personal information (name, title, description)
   - Contact details and social links
   - Professional background and experience
   - Skills and projects

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please feel free to open an issue if you find a bug or have a feature suggestion.

## 🗺️ Roadmap

- [ ] Add more AI personality "modes"
- [ ] Integrate a project showcase with live demos
- [ ] Add multilingual support for the AI chat

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## 🔗 Connect with Me

**Michael Tse** - Let's connect!

<div align="center">

[![Portfolio](https://img.shields.io/badge/Live_Demo-example.com-2ea44f?style=for-the-badge&logo=vercel)](https://www.example.com)
&nbsp;
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/man-kit-michael-tse-4013a5176/)

</div>

---

<div align="center">
  <strong>Built with ❤️ by Michael Tse</strong>
</div>
