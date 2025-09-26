# Emerald Lobster Snap - Real-time Chat Application

A modern, full-stack chat application built with React, TypeScript, and Vite, featuring real-time messaging, user authentication, and responsive design with shadcn/ui components.

## 🚀 Tech Stack

### Frontend
- **React 18** - JavaScript library for building user interfaces
- **TypeScript** - Type-safe JavaScript superset
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Reusable UI components built with Radix UI and Tailwind CSS
- **React Router DOM** - Client-side routing solution

### Backend & Database
- **Supabase** - Backend-as-a-Service (BaaS) providing authentication, database, and real-time features
- **PostgreSQL** - Relational database used by Supabase

### UI/UX Libraries
- **Lucide React** - Beautiful icon library
- **Radix UI** - Low-level component primitives for accessible UI
- **React Hook Form** - Form library with easy validation
- **Zod** - Schema validation library
- **Recharts** - Charting library
- **Sonner** - Toast notifications

### Development Tools
- **ESLint** - Code linting
- **pnpm** - Fast, disk space efficient package manager
- **Vaul** - Modal and drawer components
- **React Query** - Server state management

## 📋 Features

- **Real-time Chat**: Send and receive messages instantly
- **User Authentication**: Secure login/signup with Supabase Auth
- **Profile Management**: User profiles with username and avatar
- **Multiple Chat Rooms**: Create and participate in different chat rooms
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Dark/Light Theme**: Toggle between color schemes
- **Modern UI Components**: Built with shadcn/ui for consistent design
- **Form Validation**: Robust form handling with React Hook Form and Zod

## 🏗️ Project Structure

```
emerald-lobster-snap/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── lib/            # Utility functions and configuration
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Route components
│   ├── types/          # TypeScript type definitions
│   ├── services/       # API and Supabase integration
│   ├── utils/          # Helper functions
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
├── supabase_schema.sql # Database schema and RLS policies
├── vite.config.ts      # Vite configuration
├── tailwind.config.ts  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Project dependencies and scripts
```

## 🛠️ Database Schema

The application uses a PostgreSQL database with the following tables:

- **profiles**: User profile information (username, avatar, etc.)
- **chat_rooms**: Chat room information (name, creator, etc.)
- **messages**: Message content (content, sender, timestamp, room)

All tables have Row Level Security (RLS) policies for data protection and privacy.

## 📦 Installation & Setup

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/emerald-lobster-snap.git
cd emerald-lobster-snap
```

2. **Install dependencies:**
```bash
pnpm install
```

3. **Set up environment variables:**
Create a `.env` file in the root directory with the following:
```env
VITE_SUPABASE_URL="your_supabase_project_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

4. **Run the development server:**
```bash
pnpm dev
```

5. **Visit the application:**
Open [http://localhost:8080](http://localhost:8080) in your browser.

## 🧪 Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm build:dev` - Build the application for development
- `pnpm lint` - Run ESLint to check for code issues
- `pnpm preview` - Preview the production build locally

## 🌐 Deployment

This application is configured for deployment on Vercel (as indicated by the `vercel.json` file). To deploy:

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Add the required environment variables in the Vercel dashboard
4. Deploy!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please open an issue in the repository.