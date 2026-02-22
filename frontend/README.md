# MediSync Frontend

React + TypeScript frontend for the MediSync healthcare platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your backend API URL (default is http://localhost:5000/api)

4. Start the development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Build Tool**: Vite

## Features

- Landing page with feature showcase
- Local user prescription upload (OCR simulation)
- Hospital portal with role-based access
- Doctor dashboard with prescription management
- Patient dashboard with order tracking
- Pharmacy dashboard with inventory management
- JWT authentication
- Protected routes

## Project Structure

```
src/
├── components/       # Reusable components
├── context/          # React context providers
├── pages/            # Page components
├── services/         # API service layer
├── types/            # TypeScript type definitions
├── App.tsx           # Main app component
└── main.tsx          # Entry point
```

## Demo Credentials

After seeding the backend database:

- **Doctor**: doctor@demo.com / demo123
- **Patient**: patient@demo.com / demo123
- **Pharmacy**: pharmacy@demo.com / demo123
