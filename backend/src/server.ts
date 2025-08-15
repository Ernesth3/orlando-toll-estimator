import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import estimateRoute from './routes/estimateRoute';
// import gptRoute from './routes/gptRoute';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', estimateRoute);
// app.use('/api', gptRoute);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Toll Estimator API is running!' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
}); 