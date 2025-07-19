# TradeMinutes Frontend

A modern, full-featured marketplace platform built with Next.js 15, TypeScript, and Tailwind CSS. TradeMinutes connects service providers with customers through an intuitive, responsive web application.

![TradeMinutes Platform](https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react)

## 🚀 Features

### 🔐 Authentication & Authorization
- **Multi-provider Authentication**: Google, GitHub OAuth integration
- **Protected Routes**: Role-based access control
- **Session Management**: Secure user sessions with NextAuth.js
- **Password Reset**: Email-based password recovery

### 👥 User Management
- **User Profiles**: Comprehensive profile management
- **Dashboard**: Personalized user dashboard with statistics
- **Settings**: User preferences and account settings
- **Reviews & Ratings**: User feedback system

### 🛍️ Marketplace Features
- **Service Listings**: Browse and search services by category
- **Service Details**: Detailed service information with images
- **Booking System**: Appointment scheduling with calendar integration
- **Messaging**: Real-time communication between users
- **Notifications**: Push notifications for updates

### 📱 Modern UI/UX
- **Responsive Design**: Mobile-first approach
- **Dark/Light Theme**: Theme toggle functionality
- **Animations**: Smooth transitions with Framer Motion
- **Interactive Maps**: Location-based services with Leaflet
- **Real-time Updates**: Live data synchronization

### 🛠️ Technical Features
- **TypeScript**: Full type safety
- **Server-Side Rendering**: SEO optimized
- **API Routes**: RESTful API endpoints
- **Database Integration**: MongoDB connectivity
- **Docker Support**: Containerized deployment

## 📁 Project Structure

```
trademinutes-frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (public)/                 # Public routes
│   │   │   ├── about/                # About page
│   │   │   ├── contact/              # Contact page
│   │   │   ├── product/              # Product showcase
│   │   │   ├── seller/               # Seller information
│   │   │   ├── services/             # Service listings
│   │   │   │   ├── all/              # All services
│   │   │   │   ├── category/         # Category-based services
│   │   │   │   └── search/           # Service search
│   │   │   └── users/                # User listings
│   │   │       ├── nearby/           # Nearby users
│   │   │       └── top/              # Top users
│   │   ├── (protected)/              # Protected routes
│   │   │   ├── (auth)/               # Authentication pages
│   │   │   │   ├── login/            # Login page
│   │   │   │   ├── register/         # Registration page
│   │   │   │   ├── forgot-password/  # Password recovery
│   │   │   │   ├── reset-password/   # Password reset
│   │   │   │   ├── google-auth/      # Google OAuth
│   │   │   │   └── github-auth/      # GitHub OAuth
│   │   │   ├── dashboard/            # User dashboard
│   │   │   ├── profile/              # User profile
│   │   │   ├── appointments/         # Appointment management
│   │   │   │   ├── booked-by-me/     # Appointments booked by user
│   │   │   │   └── booked-from-me/   # Appointments received
│   │   │   ├── book-appointment/     # Appointment booking
│   │   │   ├── messages/             # Messaging system
│   │   │   ├── my-listings/          # User's service listings
│   │   │   ├── notifications/        # Notification center
│   │   │   ├── reviews/              # Review management
│   │   │   ├── services/             # Service management
│   │   │   ├── settings/             # User settings
│   │   │   └── tasks/                # Task management
│   │   │       ├── explore/          # Task exploration
│   │   │       ├── list/             # Task listing
│   │   │       └── view/             # Task details
│   │   ├── api/                      # API routes
│   │   │   └── auth/                 # Authentication API
│   │   │       └── [...nextauth]/    # NextAuth.js configuration
│   │   ├── globals.css               # Global styles
│   │   └── layout.tsx                # Root layout
│   ├── components/                   # Reusable components
│   │   ├── common/                   # Common components
│   │   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   │   └── ThemeToggle.tsx       # Theme switcher
│   │   ├── tasks/                    # Task-related components
│   │   │   └── TasksMap.tsx          # Task map component
│   │   ├── Layout/                   # Layout components
│   │   │   └── ProtectedLayout.tsx   # Protected route layout
│   │   └── [Various UI Components]   # All other UI components
│   ├── lib/                          # Utility libraries
│   │   └── auth.ts                   # Authentication utilities
│   ├── providers/                    # Context providers
│   │   └── theme-provider.tsx        # Theme context provider
│   └── types/                        # TypeScript type definitions
│       └── next-auth.d.ts            # NextAuth.js types
├── public/                           # Static assets
├── .github/                          # GitHub workflows
├── Dockerfile                        # Docker configuration
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── next.config.ts                    # Next.js configuration
├── tailwind.config.js                # Tailwind CSS configuration
└── README.md                         # This file
```

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 15.3.3** - React framework with App Router
- **React 19.0.0** - UI library
- **TypeScript 5.0** - Type safety

### Styling & UI
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Headless UI** - Unstyled, accessible UI components
- **Radix UI** - Low-level UI primitives
- **Lucide React** - Icon library

### Authentication & Backend
- **NextAuth.js 4.24.11** - Authentication for Next.js
- **MongoDB 5.9.2** - Database
- **Next.js API Routes** - Backend API

### Maps & Location
- **React Google Maps API** - Google Maps integration
- **Leaflet** - Open-source mapping library
- **React Leaflet** - React components for Leaflet

### Calendar & Scheduling
- **FullCalendar** - Calendar component
- **React Calendly** - Scheduling integration
- **Date-fns** - Date utility library

### UI Enhancements
- **React Toastify** - Toast notifications
- **React CountUp** - Animated counters
- **React Spring** - Spring physics animations
- **TSParticles** - Particle effects

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Docker** - Containerization

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **MongoDB** database (local or cloud)
- **Google OAuth** credentials (optional)
- **GitHub OAuth** credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ElioCloud/trademinutes-frontend.git
   cd trademinutes-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # NextAuth.js
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   
   # OAuth Providers (optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   
   # API Keys (optional)
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Docker
docker build -t trademinutes-frontend .  # Build Docker image
docker run -p 3000:3000 trademinutes-frontend  # Run container
```

## 🏗️ Architecture

### App Router Structure
The application uses Next.js 15 App Router with the following structure:

- **Public Routes** (`(public)`): Accessible to all users
- **Protected Routes** (`(protected)`): Require authentication
- **API Routes** (`api`): Backend endpoints
- **Layout Components**: Shared layouts and navigation

### Component Architecture
- **Atomic Design**: Components follow atomic design principles
- **Reusable Components**: Modular, reusable UI components
- **Type Safety**: Full TypeScript integration
- **Responsive Design**: Mobile-first approach

### State Management
- **React Context**: Theme and authentication state
- **NextAuth.js**: Session and user state
- **Local State**: Component-level state management

## 🔧 Configuration

### Next.js Configuration
```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    // Enable experimental features
  },
  images: {
    // Image optimization settings
  },
  // Other Next.js configurations
}
```

### Tailwind CSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
  plugins: [],
}
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Docker Deployment
```bash
# Build the image
docker build -t trademinutes-frontend .

# Run the container
docker run -p 3000:3000 -e NODE_ENV=production trademinutes-frontend
```

### Manual Deployment
```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXTAUTH_URL` | NextAuth.js URL | Yes |
| `NEXTAUTH_SECRET` | NextAuth.js secret | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | No |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | No |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint for code quality
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing framework
- **Vercel** - For hosting and deployment
- **Tailwind CSS** - For the utility-first CSS framework
- **All Contributors** - For their valuable contributions

---

**TradeMinutes Frontend** - Connecting people through services 🚀
