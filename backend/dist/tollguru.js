"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTollCost = getTollCost;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Mock toll costs for testing
function getMockTollCosts(from, to) {
    // Simulate different toll costs based on route
    const routes = [
        { from: 'Miami, FL', to: 'Orlando, FL', tag: 8.50, cash: 12.75 },
        { from: 'New York, NY', to: 'Boston, MA', tag: 15.25, cash: 22.50 },
        { from: 'Los Angeles, CA', to: 'San Francisco, CA', tag: 12.00, cash: 18.00 },
        { from: 'Chicago, IL', to: 'Milwaukee, WI', tag: 6.75, cash: 10.25 },
        { from: 'Dallas, TX', to: 'Houston, TX', tag: 9.50, cash: 14.25 }
    ];
    // Find matching route or return default
    const route = routes.find(r => (r.from.toLowerCase().includes(from.toLowerCase().split(',')[0]) ||
        r.to.toLowerCase().includes(to.toLowerCase().split(',')[0])));
    if (route) {
        console.log(`Mock toll costs for ${from} to ${to}:`, route);
        return { tag: route.tag, cash: route.cash };
    }
    // Default mock costs
    console.log(`Using default mock toll costs for ${from} to ${to}`);
    return { tag: 5.00, cash: 7.50 };
}
async function getTollCost(opts) {
    // Validate required parameters
    if (!opts.from || !opts.to) {
        throw new Error('Both "from" and "to" addresses are required');
    }
    console.log(`Getting toll costs for: ${opts.from} to ${opts.to}`);
    // For now, use mock data instead of real API
    const mockCosts = getMockTollCosts(opts.from, opts.to);
    console.log('Returning mock toll costs:', mockCosts);
    return mockCosts;
    // Original API code (commented out for now)
    /*
    // Validate required API key
    const apiKey = process.env.TOLLGURU_API_KEY;
    if (!apiKey) {
      throw new Error('TOLLGURU_API_KEY environment variable is not configured');
    }
  
    console.log('API Key found:', apiKey ? 'Yes' : 'No');
    console.log('API Key length:', apiKey?.length);
  
    // Prepare request body
    const requestBody: TollGuruRequest = {
      from: { address: opts.from },
      to: { address: opts.to },
      vehicle: { type: opts.vehicleType || "2AxlesAuto" },
      departure_time: opts.departureTime || "now",
      currency: opts.currency || "USD"
    };
  
    // Add waypoints if provided
    if (opts.waypoints && opts.waypoints.length > 0) {
      requestBody.waypoints = opts.waypoints.map(address => ({ address }));
    }
  
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
  
    try {
      console.log('Making API call to TollGuru...');
      const response = await fetch('https://apis.tollguru.com/toll/v2/origin-destination-waypoints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(requestBody)
      });
  
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`TollGuru API error (${response.status}): ${errorText}`);
      }
  
      const data = (await response.json()) as TollGuruResponse;
  
      // Log the response for debugging
      console.log('TollGuru API Response:', JSON.stringify(data, null, 2));
  
      // Validate response structure and extract cheapest route (routes[0])
      if (!data.routes || !data.routes[0]) {
        throw new Error(`Invalid response format from TollGuru API: no routes found. Response: ${JSON.stringify(data)}`);
      }
  
      if (!data.routes[0].costs?.tag?.amount || !data.routes[0].costs?.cash?.amount) {
        // If no toll costs found, return zero costs
        console.log('No toll costs found for route, returning zero costs');
        return {
          tag: 0,
          cash: 0
        };
      }
  
      const result = {
        tag: data.routes[0].costs.tag.amount,
        cash: data.routes[0].costs.cash.amount
      };
  
      console.log('Returning toll costs:', result);
      return result;
  
    } catch (error) {
      console.log('Error in getTollCost:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Unexpected error calling TollGuru API: ${error}`);
    }
    */
}
//# sourceMappingURL=tollguru.js.map