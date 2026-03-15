# Contributing to LumiQ

Thank you for your interest in contributing! 🎉

## Getting Started

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/lumiq.git`
3. **Install**: `npm install`
4. **Branch**: `git checkout -b feature/your-feature-name`
5. **Run**: `npm start`

## Development Guidelines

### Code Style
- Use functional React components with hooks
- Keep components focused — one responsibility per file
- Co-locate styles in `App.css` using BEM-ish class names
- Use `const` for all declarations; avoid `var`
- Prefer descriptive names over comments

### Component Structure
```
ComponentName/
├── ComponentName.jsx    # Component logic
└── index.js            # Re-export (optional, for larger components)
```

### Adding a New Page
1. Create `src/components/your-page/YourPage.jsx`
2. Add a nav entry in `src/components/layout/Sidebar.jsx`
3. Add the page title in `src/components/layout/TopBar.jsx`
4. Mount it in `src/App.jsx`

### Adding AI Analysis
- Add your system prompt and demo fallback in `src/utils/api.js`
- Call `callClaude(system, user, onChunk)` — it handles streaming and fallback automatically

## Pull Request Process

1. Ensure your branch is up to date with `main`
2. Run `npm run build` to verify no build errors
3. Write a clear PR description explaining what changed and why
4. Reference any related issues with `Fixes #123`

## Reporting Issues

Use [GitHub Issues](https://github.com/YOUR_USERNAME/lumiq/issues) with:
- A clear title
- Steps to reproduce
- Expected vs actual behaviour
- Browser and OS if relevant

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
