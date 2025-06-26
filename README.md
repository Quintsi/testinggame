# Testing Game

A fun interactive game with two modes: Desktop Destroyer and Pest Control.

## Features

### Game Modes
- **Desktop Destroyer**: Destroy your desktop with various tools (hammer, gun, flamethrower, laser, paintball, chainsaw)
- **Pest Control**: Eliminate bugs and compete on the global leaderboard

### Authentication
- **Google Sign-In**: Secure authentication using Google OAuth
- **Leaderboard**: Save high scores and compete with other players
- **Progress Tracking**: Your game progress is saved when signed in

### Tools Available
- 🔨 Hammer - Basic destruction tool
- 🔫 Gun - Precise shooting
- 🔥 Flamethrower - Area damage with fire effects
- ⚡ Laser - High-precision energy weapon
- 🎨 Paintball - Colorful projectiles
- 🔪 Chainsaw - Continuous cutting tool

### Sound Effects
- Each tool has unique sound effects
- Volume control and mute options
- Individual weapon sound toggles

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Firebase configuration in environment variables
4. Run the development server: `npm run dev`

## Environment Variables

Create a `.env` file with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Technologies Used

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Firebase for authentication and database
- Lucide React for icons
- Custom game engine with particle effects

## Login Page

The game features a modern login page with:
- Google OAuth integration
- Beautiful modal design with backdrop blur
- Loading states and error handling
- Feature preview for new users
- Responsive design

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
