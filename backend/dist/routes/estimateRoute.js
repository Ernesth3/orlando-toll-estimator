"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tollguru_1 = require("../tollguru");
const router = express_1.default.Router();
// POST /api/estimate
router.post('/estimate', async (req, res) => {
    try {
        const { rentalStart, rentalEnd, days, state, vehicleType, currency } = req.body;
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
                const tollCost = await (0, tollguru_1.getTollCost)({
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
            }
            catch (error) {
                console.error(`Error calculating toll cost for day ${i + 1}:`, error);
                return res.status(500).json({
                    error: `Failed to calculate toll cost for day ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }
        }
        // Calculate actual rental days from the date range (not from trip legs count)
        // Robust: count calendar days inclusive (ignores clock time)
        function calendarDaysInclusive(start, end) {
            const s = new Date(start);
            const e = new Date(end);
            // Clamp to local midnight to drop hours/minutes
            const s0 = new Date(s.getFullYear(), s.getMonth(), s.getDate());
            const e0 = new Date(e.getFullYear(), e.getMonth(), e.getDate());
            // For Aug 25-27: Aug 25, Aug 26, Aug 27 = 3 days
            return Math.floor((e0.getTime() - s0.getTime()) / 86400000) + 1;
        }
        // Debug logging
        console.log('=== DEBUG INFO ===');
        console.log('rentalStart:', rentalStart);
        console.log('rentalEnd:', rentalEnd);
        console.log('days.length (trip legs):', days.length);
        console.log('==================');
        // === FL e-Toll pricing (Orlando fixed trip) ===
        // 1) Constants
        const STATE = "FL";
        const STANDARD_DAILY_FEE = 6.95; // only on days when a toll occurs
        const STANDARD_CAP_PER_RENTAL = 34.95; // FL cap
        const UNLIMITED_DAILY = 13.49; // Orlando tier
        // 2) Rental days = 3 固定（Orlando Aug 25-27）
        const actualRentalDays = 3;
        // 3) 工具：把每个 leg 的出发时间转成 ET 自然日键
        function toETDateKey(iso) {
            // 用 Intl 即可，无需引第三方库
            return new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/New_York" }); // yyyy-mm-dd
        }
        // 4) 计算总额
        function computeTotals() {
            const tollDaysET = new Set();
            let cashTollsTotal = 0;
            for (const day of days) {
                if (day.origin && day.destination) {
                    // For now, assume each leg has tolls (will be replaced by actual TollGuru data)
                    const departureTime = rentalStart; // Use rental start time for all days
                    tollDaysET.add(toETDateKey(departureTime));
                    // Add mock toll cost for now (will be replaced by actual TollGuru data)
                    cashTollsTotal += 7.5; // Mock value
                }
            }
            const daysWithTolls = tollDaysET.size; // 只在发生 toll 的自然日收 $6.95
            const standardConvenienceFee = Math.min(daysWithTolls * STANDARD_DAILY_FEE, STANDARD_CAP_PER_RENTAL);
            const standardEToll = standardConvenienceFee + cashTollsTotal;
            // Unlimited 固定 3 天 × $13.49
            const unlimitedEToll = UNLIMITED_DAILY * actualRentalDays;
            return { actualRentalDays, daysWithTolls, cashTollsTotal, standardConvenienceFee, standardEToll, unlimitedEToll };
        }
        const totals = computeTotals();
        // Calculate savings
        const savings = totals.standardEToll - totals.unlimitedEToll;
        // Construct recommendation with clearer messaging
        let recommendation;
        if (savings >= 0) {
            recommendation = `You're saving $${savings.toFixed(2)} with e-Toll Unlimited! Standard e-Toll: $${totals.standardEToll.toFixed(2)}, Unlimited: $${totals.unlimitedEToll.toFixed(2)}.`;
        }
        else {
            const difference = Math.abs(savings);
            recommendation = `Standard e-Toll ($${totals.standardEToll.toFixed(2)}) is cheaper than Unlimited ($${totals.unlimitedEToll.toFixed(2)}) by $${difference.toFixed(2)}.`;
        }
        res.json({
            answer: recommendation,
            details: {
                standardEToll: totals.standardEToll.toFixed(2),
                unlimitedEToll: totals.unlimitedEToll.toFixed(2),
                savings: savings.toFixed(2),
                tagTollsTotal: "0.00", // Not used in new pricing model
                cashTollsTotal: totals.cashTollsTotal.toFixed(2),
                flatRateTotal: totals.standardConvenienceFee.toFixed(2),
                rentalDays: totals.actualRentalDays,
                daysWithTolls: totals.daysWithTolls
            }
        });
    }
    catch (error) {
        console.error('Error in estimate route:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
exports.default = router;
//# sourceMappingURL=estimateRoute.js.map