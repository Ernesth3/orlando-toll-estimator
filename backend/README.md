# Backend Server

This is the Express.js backend server for the Toll Estimator application.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the backend directory with the following variables:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   TOLLGURU_API_KEY=your_tollguru_api_key_here
   PORT=3001
   NODE_ENV=development
   ```

3. Get your API keys:
   - OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - TollGuru API key from [TollGuru Platform](https://tollguru.com/developers)

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### POST /api/gpt
- **Body**: `{ "prompt": "string" }`
- **Response**: `{ "answer": "string" }`
- **Description**: Sends the prompt to OpenAI GPT-4o and returns the response

### POST /api/estimate
- **Body**: 
  ```json
  {
    "rentalStart": "2025-08-02T09:00:00",
    "rentalEnd": "2025-08-03T18:00:00",
    "days": [
      {
        "origin": "Los Angeles, CA",
        "waypoints": ["Santa Monica Pier"],
        "destination": "Santa Barbara, CA"
      }
    ],
    "state": "CA",
    "vehicleType": "2AxlesAuto",
    "currency": "USD"
  }
  ```
- **Response**: `{ "answer": "string" }`
- **Description**: Calculates toll costs and compares Standard vs Unlimited e-Toll options

### GET /health
- **Response**: `{ "status": "OK", "message": "Server is running" }`
- **Description**: Health check endpoint

## Error Handling

The server includes comprehensive error handling:
- Input validation
- OpenAI API error handling
- General error handling with appropriate HTTP status codes 