import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTollCost, TollCost } from '../src/tollguru';

interface DayData {
  origin: string;
  waypoints?: string[];
  destination: string;
}

interface EstimateRequest {
  rentalStart: string;
  rentalEnd: string;
  days: DayData[];
  state: string;
  vehicleType: string;
  currency: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      rentalStart,
      rentalEnd,
      days,
      state,
      vehicleType,
      currency
    }: EstimateRequest = req.body;

    // Validate required fields
    if (!rentalStart || !rentalEnd || !days || !Array.isArray(days) || days.length === 0) {
      return res.status(400).json({ 
        error: 'Missing required fields: rentalStart, rentalEnd, and days array with at least one day' 
      });
    }

    if (!state || !vehicleType || !currency) {
      return res.status(400).json({ 
        error: 'Missing required fields: state, vehicleType, and currency' 
      });
    }

    // Validate each day has required fields
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      if (!day.origin || !day.destination) {
        return res.status(400).json({ 
          error: `Day ${i + 1} is missing required fields: origin and destination` 
        });
      }
    }

    let tagTollsTotal = 0;
    let cashTollsTotal = 0;

    // Calculate toll costs for each day
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      
      try {
        const tollCost: TollCost = await getTollCost({
          from: day.origin,
          to: day.destination,
          waypoints: day.waypoints,
          vehicleType,
          departureTime: rentalStart, // Use rental start time for all days
          currency
        });

        // Extract the cheapest route's tag cost (routes[0].costs.tag)
        tagTollsTotal += tollCost.tag;
        cashTollsTotal += tollCost.cash;

      } catch (error) {
        console.error(`Error calculating toll cost for day ${i + 1}:`, error);
        return res.status(500).json({ 
          error: `Failed to calculate toll cost for day ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
      }
    }

    // Calculate Standard e-Toll: daily flat rate ($6.95/day capped at $34.95/rental in CA) + sum of tag tolls at cash rates
    const dailyFlatRate = 6.95;
    const maxFlatRate = state === "CA" ? 34.95 : Infinity;
    const flatRateTotal = Math.min(dailyFlatRate * days.length, maxFlatRate);
    const standardEToll = flatRateTotal + cashTollsTotal;

    // Calculate Unlimited: $11.99 × rental days (apply weekly cap if state = CA)
    const unlimitedDailyRate = 11.99;
    const unlimitedTotal = unlimitedDailyRate * days.length;
    
    // Apply weekly cap for CA (if rental is 7+ days, cap at 7 days worth)
    const unlimitedEToll = state === "CA" && days.length > 7 
      ? unlimitedDailyRate * 7 
      : unlimitedTotal;

    // Calculate savings
    const savings = standardEToll - unlimitedEToll;

    // Construct recommendation with clearer messaging
    let recommendation: string;
    if (savings >= 0) {
      recommendation = `You're saving $${savings.toFixed(2)} with e-Toll Unlimited! Standard e-Toll: $${standardEToll.toFixed(2)}, Unlimited: $${unlimitedEToll.toFixed(2)}.`;
    } else {
      const difference = Math.abs(savings);
      recommendation = `Standard e-Toll ($${standardEToll.toFixed(2)}) is cheaper than Unlimited ($${unlimitedEToll.toFixed(2)}) by $${difference.toFixed(2)}.`;
    }

    res.json({ 
      answer: recommendation,
      details: {
        standardEToll: standardEToll.toFixed(2),
        unlimitedEToll: unlimitedEToll.toFixed(2),
        savings: savings.toFixed(2),
        tagTollsTotal: tagTollsTotal.toFixed(2),
        cashTollsTotal: cashTollsTotal.toFixed(2),
        flatRateTotal: flatRateTotal.toFixed(2),
        rentalDays: days.length
      }
    });

  } catch (error) {
    console.error('Error in estimate API:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
} 