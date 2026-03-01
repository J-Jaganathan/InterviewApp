# Interview Prep App – Next.js Dashboard

A production-ready Interview Prep dashboard built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**.

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd interview-prep-app
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
interview-prep-app/
├── src/
│   └── app/
│       ├── globals.css     # Global styles + animations
│       ├── layout.tsx      # Root layout with font import
│       └── page.tsx        # Main dashboard page
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
└── tsconfig.json
```

## ✨ Features

- **Progress Ring** – Animated SVG circular progress indicator
- **Upcoming Interview Card** – Company, role, and countdown display
- **Quick Start** – Jump into Aptitude, DSA, or System Design sessions
- **Mock Interview Stats** – Sessions completed, average score, topic tags
- **Sidebar Navigation** – Icon-based collapsible nav
- **Animated Entry** – Cards fade in with stagger on load
- **Fully Responsive** – Works across screen sizes

## 🛠 Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Plus Jakarta Sans** (Google Fonts)
