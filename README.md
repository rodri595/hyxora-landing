# Hyxora Landing Page

A modern, responsive landing page built with Next.js 16, React 19, and Tailwind CSS 4. Features a clean component architecture with dark mode support and smooth user interactions.

## ✨ Features

- **⚡ Next.js 16** - Latest App Router architecture for optimal performance
- **⚛️ React 19** - Cutting-edge React features and improvements
- **🎨 Tailwind CSS 4** - Modern utility-first CSS framework with PostCSS integration
- **🌓 Dark Mode** - Seamless theme switching with `next-themes`
- **📱 Responsive Design** - Mobile-first approach that works on all devices
- **🎯 Component-Based** - Modular and reusable component architecture
- **🔧 TypeScript Support** - Type-safe development experience
- **♿ Accessible** - Built with accessibility in mind using Headless UI
- **🚀 SEO Optimized** - Comprehensive SEO implementation with metadata, Open Graph, structured data, and sitemaps

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm (recommended) or npm/yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/rodri595/hyxora-landing.git
cd hyxora-landing
```

2. Install dependencies:

```bash
pnpm install
```

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Available Scripts

| Command      | Description                        |
| ------------ | ---------------------------------- |
| `pnpm dev`   | Start the development server       |
| `pnpm build` | Build the production application   |
| `pnpm start` | Start the production server        |
| `pnpm lint`  | Run ESLint for code quality checks |

## 🏗️ Project Structure

```
hyxora-landing/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.jsx         # Root layout component
│   ├── page.jsx          # Home page
│   └── providers.jsx     # Theme and context providers
├── assets/                # Static assets (images, etc.)
│   └── imgs/
│       └── brand/        # Brand assets
├── components/            # Reusable UI components
│   ├── Button/           # Button component
│   ├── Field/            # Form field component
│   ├── Footer/           # Footer component
│   ├── Header/           # Header/navigation
│   ├── Icon/             # Icon component
│   ├── Image/            # Optimized image component
│   ├── Layout/           # Layout wrapper
│   ├── Modal/            # Modal dialog
│   ├── Select/           # Select dropdown
│   ├── ThemeButton/      # Theme toggle button
│   └── UpButton/         # Scroll to top button
├── hooks/                 # Custom React hooks
│   ├── index.js
│   └── useScrollPosition.jsx
└── templates/             # Page templates
    └── HomePage/         # Home page template
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Headless Components**: [@headlessui/react](https://headlessui.com/)
- **Theme Management**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Hooks Library**: [usehooks-ts](https://usehooks-ts.com/)
- **Language**: JavaScript/TypeScript
- **Package Manager**: pnpm

## 🎨 Components

### Core Components

- **Button** - Versatile button component with multiple variants
- **Field** - Form input field with validation support
- **Header** - Navigation header with responsive menu
- **Footer** - Site footer with links and information
- **Modal** - Accessible modal dialog
- **Select** - Custom select dropdown
- **ThemeButton** - Dark/light mode toggle
- **UpButton** - Scroll to top functionality
- **Layout** - Main layout wrapper for pages

### Custom Hooks

- **useScrollPosition** - Track scroll position for UI interactions

## 🎯 Development

### Adding New Components

1. Create a new folder in `components/` with your component name
2. Add an `index.jsx` or `index.tsx` file
3. Export your component as default
4. Import and use in your pages or templates

### Styling Guidelines

This project uses Tailwind CSS 4. Follow these best practices:

- Use utility classes for styling
- Keep custom CSS minimal in `globals.css`
- Use the theme configuration for consistent colors and spacing
- Leverage dark mode classes (`dark:`) for theme support

## 📝 License

This project is private and proprietary.

## 🔍 SEO Implementation

This project includes comprehensive SEO optimization for Google and other search engines. For complete SEO documentation:

- **[SEO_SUMMARY.md](SEO_SUMMARY.md)** - Quick overview and implementation status
- **[SEO_CHECKLIST.md](SEO_CHECKLIST.md)** - Step-by-step checklist for deployment
- **[SEO_OPTIMIZATION.md](SEO_OPTIMIZATION.md)** - Technical documentation
- **[OG_IMAGE_GUIDE.md](OG_IMAGE_GUIDE.md)** - Social media image creation guide

### SEO Features Included:

✅ Comprehensive metadata (title, description, keywords)  
✅ Open Graph tags for social media sharing  
✅ Twitter Cards optimization  
✅ JSON-LD structured data (Schema.org)  
✅ Dynamic sitemap generation  
✅ Robots.txt configuration  
✅ PWA manifest  
✅ Performance optimization  
✅ Security headers

### Before Deployment:

1. Update domain URLs in `app/layout.jsx` and `app/sitemap.js`
2. Create social media images (see `OG_IMAGE_GUIDE.md`)
3. Set up Google Search Console
4. Run `seo-check.bat` (Windows) or `seo-check.sh` (Mac/Linux) to validate

## 🤝 Contributing

This is a private project. For contribution guidelines, please contact the repository owner.

## 📧 Contact

For questions or support, please reach out to the project maintainers.

---

Built with ❤️ by BlockImpulse
