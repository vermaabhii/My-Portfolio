# Abhishek Kumar Verma - Portfolio

> A modern, minimalist portfolio website showcasing projects, skills, and experience. Built with pure HTML, CSS, and JavaScript inspired by Apple design principles.
![Portfolio Preview](https://img.shields.io/badge/Portfolio-Live-0071e3)
![HTML](https://img.shields.io/badge/HTML5-E34C26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## 🌐 Live Demo

Visit the live portfolio: [abhishek-webapp.vercel.app](https://abhishek-webapp.vercel.app)

---

## ✨ Features

### Design & UX
-  **Apple-Inspired Design** — Minimalist, clean, and professional aesthetic
-  **Fully Responsive** — Perfect on desktop, tablet, and mobile devices
-  **Smooth Animations** — Elegant fade-in, slide, and hover effects
-  **Masonry Layout** — Beautiful card grid layout for projects
-  **Interactive Cursor** — Custom cursor with hover effects
-  **Smooth Scrolling** — Seamless navigation between sections

### Performance
-  **Zero Dependencies** — Pure vanilla HTML, CSS, and JavaScript
-  **Fast Loading** — Optimized for quick load times
-  **Lightweight** — Single HTML file, no build tools needed
-  **Secure** — No external vulnerabilities or dependencies

### Functionality
-  **Navigation Bar** — Fixed, blurred navigation with smooth transitions
-  **Hero Section** — Captivating introduction with CTAs
-  **About Section** — Personal story with stats dashboard
-  **Projects Showcase** — Masonry grid with 3 featured projects
-  **Skills Grid** — Display of technical competencies
-  **Contact Section** — Multiple ways to get in touch
-  **Footer** — Attribution and links

---

## 🚀 Getting Started

### Prerequisites
No installation needed! Just a modern web browser.

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/vermaabhii/portfolio.git
cd portfolio
```

2. **Open in browser**
```bash
# Simply open the HTML file
open index.html
```

Or use a local server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server
```

3. **View locally**
Navigate to `http://localhost:8000` in your browser

---

## 📂 Project Structure

```
portfolio/
│
├── index.html          # Main HTML file (all content)
├── README.md           # This file
│
└── Key Sections
    ├── Navigation      # Fixed header with smooth blur effect
    ├── Hero            # Welcome section with CTA buttons
    ├── About           # Personal story and achievements
    ├── Projects        # Masonry grid of featured work
    ├── Skills          # Technical competencies
    ├── Contact         # Get in touch section
    └── Footer          # Attribution
```

---

## 🎨 Design Details

### Color Scheme
- **Primary Blue**: `#0071e3` — Interactive elements, links
- **Background**: `#ffffff` — Clean white canvas
- **Surface**: `#f5f5f7` — Card backgrounds
- **Text Primary**: `#1d1d1f` — Main text color
- **Text Secondary**: `#666` — Muted text

### Typography
- **Font Family**: Apple System Font (-apple-system, BlinkMacSystemFont)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Responsive Sizing**: Scales smoothly across all screen sizes

### Layout Breakpoints
- **Desktop**: 1024px+ (full layout)
- **Tablet**: 768px - 1024px (optimized spacing)
- **Mobile**: Below 768px (single column)

---

## 💻 Technologies Used

### Frontend
- **HTML5** — Semantic markup
- **CSS3** — Advanced styling with custom properties
- **Vanilla JavaScript** — Interactive features (no frameworks)

### Features Implemented
- Custom cursor tracking
- Intersection observer for scroll animations
- Smooth scroll navigation
- Responsive masonry grid layout
- CSS animations and transitions
- Event listeners for interactivity

---

## 🎯 Sections Overview

### Navigation
- Fixed header with frosted glass effect
- Smooth navigation links with underline animation
- Responsive menu for mobile

### Hero Section
- Large typography headline
- Subtitle and description
- Two CTA buttons (View Work, GitHub Profile)
- Smooth fade-in animations

### About Section
- Personal introduction
- Career goals and objectives
- 4 stat cards showing progress
- Grid layout for visual appeal

### Projects Section
- **Masonry Grid Layout**:
  - Desktop: Large featured card + 2 smaller cards
  - Tablet: Same responsive layout
  - Mobile: Full-width stacked layout
- Project descriptions and tech tags
- Links to GitHub and live demos

### Skills Section
- Centered grid of skill badges
- 8 core technical competencies
- Hover animations for interactivity

### Contact Section
- Call-to-action text
- Three contact options (Email, GitHub, LinkedIn)
- Smooth hover effects

---

## 🎬 Animations & Interactions

### Entrance Animations
- **Fade-In-Up** — Elements slide up and fade in on load
- **Staggered Delays** — Sequential animation of items
- **Slide-In Effects** — Left/right slide animations for text

### Hover Effects
- **Button Lift** — Buttons translate up on hover
- **Scale Transform** — Skill boxes scale up smoothly
- **Underline Animation** — Links get animated underlines
- **Custom Cursor** — Expands on interactive elements

### Scroll Behavior
- **Smooth Scrolling** — All navigation links use smooth scroll
- **Intersection Observer** — Elements animate as they come into view

---

## 📱 Responsive Design

### Desktop (1024px+)
- Full masonry layout for projects
- Multi-column grid layouts
- Large typography
- Optimal spacing and padding

### Tablet (768px - 1024px)
- Adjusted masonry grid (2 columns)
- Optimized padding and margins
- Touch-friendly buttons
- Full feature set

### Mobile (Below 768px)
- Single column layout
- Stacked cards and sections
- Larger touch targets
- Full-width containers
- Simplified navigation

---

## 🔧 Customization

### Changing Colors
Edit the color values in the `:root` section:
```html
Primary Blue: #0071e3
Background: #ffffff
Surface: #f5f5f7
```

### Adding New Projects
Add a new `.project-card` div in the projects section:
```html
<div class="project-card">
    <div class="project-icon">🎨</div>
    <h3 class="project-title">Your Project</h3>
    <p class="project-description">Description...</p>
    <div class="project-tags">
        <span class="tag">Tech</span>
    </div>
    <div class="project-links">
        <a href="#">GitHub</a>
        <a href="#">Live Demo</a>
    </div>
</div>
```

### Adjusting Animations
Modify animation durations in CSS (e.g., `0.8s`, `0.3s`)

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Auto-deploys on push
4. Get live URL instantly

```bash
# Or use Vercel CLI
vercel
```

### Deploy to GitHub Pages
1. Create a repository named `portfolio`
2. Push HTML file to main branch
3. Go to Settings → Pages
4. Enable GitHub Pages
5. Live at `username.github.io/portfolio`

### Deploy to Netlify
1. Connect GitHub repository
2. Set build command to blank
3. Publish directory: `/`
4. Deploy!

---

## ⚡ Performance Metrics

- **Page Load Time**: < 1 second
- **First Contentful Paint**: < 0.5 seconds
- **Lighthouse Score**: 95+
- **File Size**: < 50KB total
- **No External Dependencies**: 0 npm packages

---

## 📊 Projects Included

### 1. **FitLog** 💪
A gym progress tracker built with vanilla JavaScript and LocalStorage.
- **Features**: Exercise logging, progress tracking, data visualization
- **Tech**: HTML5, CSS3, Vanilla JS, LocalStorage
- **Links**: [GitHub](https://github.com/vermaabhii/FitLog) | [Live Demo](https://fit-log-gym.vercel.app)

### 2. **This Portfolio** 🌐
Modern, minimalist portfolio website.
- **Features**: Masonry layout, smooth animations, responsive design
- **Tech**: HTML5, CSS3, Vanilla JavaScript
- **Design**: Apple-inspired minimalism

### 3. **Learning & Growth** 📚
Continuous learning journey in full-stack development.
- **Exploring**: React, Backend Development, iOS with Swift
- **Focus**: Building real projects and strengthening fundamentals

---

## 🤝 Contributing

This is a personal portfolio, but you can:
- Fork and customize for your own use
- Report issues or suggest improvements
- Share feedback via email or GitHub

---

## 👤 About the Creator

**Abhishek Kumar Verma**
-  Engineering Student
-  Frontend Developer
-  UI/UX Enthusiast
-  Apple Design Fan

### Connect With Me
-  **Email**: [abhikumars2007@gmail.com](mailto:abhikumars2007@gmail.com)
-  **GitHub**: [@vermaabhii](https://github.com/vermaabhii)
-  **LinkedIn**: [@vermaabhii](https://www.linkedin.com/in/vermaabhii/)
-  **Portfolio**: [abhishek-webapp.vercel.app](https://abhishek-webapp.vercel.app)

---

##  Acknowledgments

- **Design Inspiration**: Apple's minimalist design philosophy
- **Tools**: HTML5, CSS3, Vanilla JavaScript
- **Hosting**: Vercel for fast, reliable deployment
- **Community**: Thanks to all who visit and provide feedback

---

## 📜 Summary

This portfolio showcases:
- ✅ Clean, professional design
- ✅ Smooth animations and interactions
- ✅ Fully responsive layout
- ✅ Zero dependencies (vanilla code)
- ✅ Fast performance
- ✅ Easy to customize

**Built with ❤️ using pure web technologies**

---

**Last Updated**: 2026
**Version**: 1.0
**Status**: Active & Maintained

---

### Quick Links
- [Live Portfolio](https://abhishek-webapp.vercel.app)
- [GitHub Repository](https://github.com/vermaabhii)
- [FitLog Project](https://github.com/vermaabhii/FitLog)
- [Contact Me](mailto:abhikumars2007@gmail.com)
