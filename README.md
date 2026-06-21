# 🧠 Inside the Mind of an LLM

> An interactive PM workshop to understand Large Language Models, from fundamentals to production deployment

**Live Demo:** https://productmanagerplayground.netlify.app/

## 📚 Overview

This is a comprehensive, interactive learning platform designed to help Product Managers, Designers, and Engineers understand how Large Language Models work. Rather than abstract theory, it provides hands-on demonstrations of key concepts through interactive simulations, visualizations, and real-world examples.

Whether you're new to AI or looking to deepen your understanding of LLMs, this workshop covers everything from basic concepts to advanced techniques like RAG (Retrieval-Augmented Generation) and building AI-powered products.

## 🎯 What You'll Learn

### Core Concepts
- **Why AI Matters** - Understanding the paradigm shift from rules-based software to generative AI
- **Evolution of AI** - The journey from rule-based systems to modern LLMs
- **How LLMs Work** - The mechanics of next-token prediction and neural networks

### Interactive Simulations
- **Next Token Predictor** - See how models predict the next word in real-time
- **Tokenizer Visualizer** - Understand how text is broken into tokens
- **Embedding Explorer** - Visualize how words are represented in high-dimensional space
- **Temperature Playground** - Experiment with model creativity vs. consistency
- **Attention Simulator** - Discover how models focus on different parts of text
- **Hallucination Lab** - Learn why and how LLMs make mistakes

### Advanced Topics
- **Prompt Engineering** - Master the art of crafting effective prompts
- **RAG Masterclass & Simulator** - Learn about Retrieval-Augmented Generation
- **Product Architecture** - Understand how to build AI-powered products
- **Response Generation** - Explore different strategies for generating responses
- **Capstone Challenge** - Apply everything you've learned to solve real problems

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd airtribe

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173` with hot module replacement enabled.

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

### Linting

```bash
npm run lint
```

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **Vite** | Lightning-fast build tool & dev server |
| **TailwindCSS** | Utility-first CSS framework |
| **Framer Motion** | Smooth animations & transitions |
| **Recharts** | Interactive data visualizations |
| **Zustand** | Lightweight state management |
| **Lucide React** | Beautiful icon library |
| **Canvas Confetti** | Celebration animations |

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── KarpathyInsight.jsx    # Expert quotes
│   ├── PMInsight.jsx          # Product manager takeaways
│   ├── PresenterNotes.jsx     # Additional context
│   └── Sidebar.jsx            # Navigation
├── sections/            # Interactive learning modules
│   ├── AIArchitecture.jsx
│   ├── AttentionSimulator.jsx
│   ├── EmbeddingExplorer.jsx
│   ├── HallucinationLab.jsx
│   ├── PromptBuilder.jsx
│   ├── RAG.jsx
│   ├── RAGSimulator.jsx
│   ├── TemperaturePlayground.jsx
│   ├── TokenizerVisualizer.jsx
│   └── ...
├── store/              # Global state management
│   └── useAppStore.js
├── App.jsx             # Main application component
└── main.jsx            # Entry point
```

## ✨ Key Features

✅ **Interactive Demonstrations** - Learn by doing with hands-on simulations  
✅ **Progress Tracking** - Track your learning journey through the workshop  
✅ **Expert Insights** - Quotes and wisdom from AI researchers and product leaders  
✅ **PM Takeaways** - Practical implications for product teams  
✅ **Dark/Light Mode** - Comfortable viewing in any lighting condition  
✅ **Responsive Design** - Works seamlessly on desktop and tablet  
✅ **Student & Presenter Modes** - Tailored experiences for different roles  

## 🎓 Workshop Modes

- **Student Mode** - Follow the guided learning path with all sections and interactive exercises
- **Presenter Mode** - Optimized for instructors delivering the workshop with presenter notes and timing

## 🔄 State Management

The app uses **Zustand** for simple, scalable state management. The store tracks:
- Current section/module
- Workshop progress
- User preferences (theme, mode)
- Simulation states across different modules

See [src/store/useAppStore.js](src/store/useAppStore.js) for implementation details.

## 🚢 Deployment

This project is deployed on **Netlify** with automatic deployments from the main branch.

### Deploy Locally

The `dist/` folder is ready to deploy to any static hosting provider:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Any static hosting service

## 📝 Development Notes

### Adding New Sections

1. Create a new component in `src/sections/`
2. Import it in the Sidebar navigation
3. Add state management if needed in `useAppStore.js`
4. Update the progress tracking

### Styling

This project uses TailwindCSS for styling. Custom configurations are in:
- [tailwind.config.js](tailwind.config.js)
- [postcss.config.js](postcss.config.js)

### Code Quality

- ESLint is configured for code quality
- Run `npm run lint` before committing

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run lint and build checks
5. Submit a pull request

## 📖 Learning Resources

Interested in the concepts covered in this workshop? Check out:
- Andrej Karpathy's Neural Networks course
- OpenAI's documentation
- Papers: "Attention is All You Need", "BERT", "GPT" series

## 📄 License

This project is part of the Airtribe educational initiative.

## 🎉 Get Started

Visit the live application: [Inside the Mind of an LLM](https://hilarious-kitsune-f3dc25.netlify.app/)

---

**Built with ❤️ for curious Product Managers and AI enthusiasts**
