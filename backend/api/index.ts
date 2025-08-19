import express from 'express';
import cors from 'cors';
import estimateRoute from '../src/routes/estimateRoute';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', estimateRoute);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Toll Estimator API is running!' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Export for Vercel
export default app;
