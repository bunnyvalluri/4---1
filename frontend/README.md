# CareerAI Frontend Layer

This directory contains the user interface components, views, styles, and client-side architecture for the **CareerAI** platform.

## Architecture
- **Framework**: React 19 / Next.js App Router
- **Styling**: Pure CSS / Tailwind CSS (Strict Light / White Theme)
- **Icons**: Lucide React
- **Visuals**: Recharts (Data Visualizations & Radar Charts)

## Directory Structure
```
frontend/
├── components/          # Reusable UI component design system
│   └── layout/          # Core navigation layouts
│       ├── Navbar.tsx   # Light header navigation with responsive mobile drawer
│       ├── Footer.tsx   # Comprehensive light 4-column footer
│       └── Sidebar.tsx  # Authenticated candidate dashboard navigation
├── globals.css          # Color system, glassmorphism tokens, and animations
└── README.md            # Frontend architecture documentation
```

## Theme Guarantee
- **Strict Light / White Theme**: `#FFFFFF` cards, `#F8FAFC` page background, `#0F172A` text, `#2563EB` accent.
- Zero dark mode classes, zero dark mode toggles.
