# 📅 Calendar Planner PWA

A beautiful and functional calendar planner Progressive Web App (PWA) built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- 📱 **Progressive Web App** - Install on any device
- 🎨 **Beautiful UI** - Modern, responsive design with Tailwind CSS
- 📅 **Calendar View** - Full calendar functionality
- 🎯 **Task Management** - Create and manage tasks
- 📊 **Goals Tracking** - Set and track personal goals
- 💤 **Sleep Tracking** - Monitor sleep patterns
- 🌟 **Wellbeing Dashboard** - Health and wellness insights
- 🔄 **Offline Support** - Works without internet connection
- 📱 **Mobile Optimized** - Perfect for mobile devices

## 🚀 Live Demo

[Coming Soon - Deploy to Vercel/Netlify]

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: Drizzle ORM
- **Build Tool**: Vite
- **PWA**: Service Worker, Web App Manifest
- **UI Components**: Radix UI, Lucide React Icons

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/calendar-planner-pwa.git
   cd calendar-planner-pwa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5000
   ```

## 📱 PWA Features

### Installation
- **Android**: Tap "Add to Home Screen" in Chrome
- **iOS**: Tap the share button and "Add to Home Screen"
- **Desktop**: Click the install button in the address bar

### Offline Support
- Basic functionality works without internet
- Tasks and calendar data cached locally
- Automatic sync when connection restored

## 🎨 Design Features

- **Theme Colors**: Warm, aesthetic color palette (#EFE5DB, #8B7355)
- **Responsive Design**: Works perfectly on all screen sizes
- **Dark/Light Mode**: Automatic theme switching
- **Smooth Animations**: Framer Motion powered interactions
- **Accessibility**: WCAG compliant design

## 📊 App Sections

### Calendar
- Monthly, weekly, and daily views
- Event creation and management
- Drag and drop functionality
- Color-coded events

### Tasks
- Create, edit, and delete tasks
- Priority levels and due dates
- Task categories and filtering
- Progress tracking

### Goals
- Set personal and professional goals
- Progress visualization
- Milestone tracking
- Goal completion analytics

### Wellbeing
- Sleep pattern tracking
- Water intake monitoring
- Mood tracking
- Health insights dashboard

## 🔧 Development

### Project Structure
```
RusPlanner/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets & PWA files
├── server/                # Express backend
├── shared/                # Shared types and utilities
└── package.json
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking

## 🌐 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify

### Manual Deployment
1. Build: `npm run build`
2. Upload `dist` folder to your web server
3. Ensure HTTPS is enabled (required for PWA)

## 📱 PWA Testing

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Application tab
3. Check Manifest and Service Workers
4. Test "Install" prompt

### Mobile Testing
1. Deploy to HTTPS server
2. Open on mobile device
3. Look for "Add to Home Screen" prompt
4. Test offline functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide React](https://lucide.dev/) for icons
- [Framer Motion](https://www.framer.com/motion/) for animations

---

Made with ❤️ for better productivity and wellbeing 