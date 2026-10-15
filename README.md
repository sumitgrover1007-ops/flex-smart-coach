# Flex Smart Coach

Flex Smart Coach is an AI-powered fitness and wellness web application designed to help users achieve their fitness goals through personalized workouts, real-time posture analysis, and intelligent nutrition tracking.

## Features

- **Personalized Workout Plans**: Tailored exercises based on fitness level, muscle group focus, and goals.
- **Real-Time Posture Detection**: Built-in computer vision utilizing MediaPipe Pose landmarks for exercise form correction and rep counting.
- **Smart Nutrition Tracking**: Meal logging, calorie estimations, and macro distribution insights.
- **AI Fitness Assistant**: Interactive AI assistant for real-time fitness, form, and diet guidance.
- **Progress Tracking & Analytics**: Visual dashboards and charts tracking your consistency and personal milestones.
- **Modern UI & Themes**: Seamless toggle between dark, light, and custom fitness themes.

## Tech Stack

- **Frontend**: [React 18](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Computer Vision**: [@mediapipe/tasks-vision](https://developers.google.com/mediapipe/solutions/vision/pose_landmarker)
- **Backend & Database**: [Supabase](https://supabase.com/)
- **Charts & UI**: [Recharts](https://recharts.org/), [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18+ recommended)
- `npm` or `bun`

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/sumitgrover1007-ops/flex-smart-coach.git
   cd flex-smart-coach
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_PROJECT_ID="your_supabase_project_id"
   VITE_SUPABASE_PUBLISHABLE_KEY="your_supabase_anon_key"
   VITE_SUPABASE_URL="https://your_project.supabase.co"
   ```

4. Start the development server:
   ```sh
   npm run dev
   ```

5. Build for production:
   ```sh
   npm run build
   ```
