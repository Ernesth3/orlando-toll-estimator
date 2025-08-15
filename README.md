# Toll Estimator - Avis Branded

A fully interactive toll estimation web application with Avis branding, built with React, TypeScript, and Node.js.

## Features

- **Interactive Date Pickers**: Select rental start and end dates
- **Dynamic Trip Details**: Add origin, waypoints, and destination for each day
- **State Selection**: Choose from all US states (default: CA)
- **Toll Cost Calculation**: Compare Standard e-Toll vs Unlimited e-Toll
- **Detailed Breakdown**: View comprehensive cost analysis
- **Avis Branding**: Professional design matching Avis brand identity

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, React Hook Form, React DatePicker
- **Backend**: Node.js, Express, TypeScript
- **API Integration**: TollGuru API (with mock data for testing)
- **Build Tool**: Vite

## Local Development

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd backend && npm install
   ```

### Running Locally
1. Start backend server:
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on `http://localhost:4000`

2. Start frontend server:
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy Frontend**:
   ```bash
   vercel
   ```

3. **Deploy Backend**:
   ```bash
   cd backend
   vercel
   ```

4. **Update API URL**: After deployment, update the backend URL in `vercel.json`

### Option 2: Netlify

1. **Connect to Netlify**:
   - Push code to GitHub
   - Connect repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

2. **Deploy Backend**:
   - Use Railway, Render, or Heroku for backend
   - Update `netlify.toml` with backend URL

### Option 3: Railway (Full Stack)

1. **Deploy Both Frontend and Backend**:
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

## Environment Variables

### Backend (.env)
```
TOLLGURU_API_KEY=your_api_key_here
PORT=4000
```

### Frontend
Update API endpoint in `vite.config.ts` for production:
```typescript
proxy: {
  '/api': {
    target: 'https://your-backend-url.com',
    changeOrigin: true,
  },
}
```

## API Endpoints

- `POST /api/estimate` - Calculate toll estimates
- `POST /api/gpt` - GPT integration (if needed)

## Cost Calculation Logic

### Standard e-Toll
- Daily flat rate: $6.95/day
- CA cap: $34.95/rental
- Plus: Cash tolls from API

### Unlimited e-Toll  
- Daily rate: $11.99/day
- CA weekly cap: 7 days maximum

### Savings Calculation
- Savings = Standard e-Toll - Unlimited e-Toll
- Positive: "You're saving $X with e-Toll Unlimited!"
- Negative: "Standard e-Toll is cheaper by $Y"

## Project Structure

```
toll-estimator/
├── src/
│   ├── components/
│   │   └── TollForm.tsx      # Main form component
│   ├── App.tsx               # Root component
│   └── main.tsx              # Entry point
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── estimateRoute.ts
│   │   │   └── gptRoute.ts
│   │   ├── server.ts         # Express server
│   │   └── tollguru.ts       # API integration
│   └── package.json
├── vercel.json               # Vercel config
├── netlify.toml              # Netlify config
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License 