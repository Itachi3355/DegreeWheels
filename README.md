# RideShare - University Rideshare Platform

A modern rideshare platform designed specifically for university students to share rides safely and efficiently.

## 🚀 Features

- **Student-Only Platform**: University email verification required
- **Real-time Ride Matching**: Find rides instantly
- **Interactive Maps**: Powered by Mapbox GL JS
- **Secure Authentication**: Supabase Auth integration
- **Mobile Responsive**: Works perfectly on all devices
- **Real-time Notifications**: Stay updated on ride requests

## 🛠️ Tech Stack

- **Frontend**: React 18, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Maps**: Mapbox GL JS
- **Icons**: Heroicons
- **State Management**: React Context API
- **Routing**: React Router DOM

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/rideshare-app.git
   cd rideshare-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   REACT_APP_SUPABASE_URL=your-supabase-url
   REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
   REACT_APP_MAPBOX_ACCESS_TOKEN=your-mapbox-token
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

## 🗄️ Database Setup

The app uses Supabase with the following main tables:
- `profiles` - User profiles
- `rides` - Ride offers
- `ride_requests` - Passenger requests
- `ride_bookings` - Confirmed bookings
- `notifications` - Real-time notifications

## 🚀 Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**
   - Vercel
   - Netlify
   - AWS S3 + CloudFront

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@rideshare.com or create an issue in this repository.