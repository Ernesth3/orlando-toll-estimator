import React, { useState } from 'react';

interface WizardAnswers {
  homeBase: boolean; // true = I-Drive, false = fallback
  disney: boolean;
  universal: boolean;
  ksc: boolean;
  disneyDays: number;
  universalVisits: number;
  kscTrips: number;
  airportTrips: number;
}

interface TripLeg {
  origin: string;
  destination: string;
  waypoints?: string[];
  departureTime: string;
}

interface TollEstimate {
  standardEToll: string;
  unlimitedEToll: string;
  savings: string;
  tagTollsTotal: string;
  cashTollsTotal: string;
  flatRateTotal: string;
  rentalDays: number;
  daysWithTolls: number;
}

const OrlandoTollWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<WizardAnswers>({
    homeBase: false,
    disney: false,
    universal: false,
    ksc: false,
    disneyDays: 0,
    universalVisits: 0,
    kscTrips: 0,
    airportTrips: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [estimate, setEstimate] = useState<TollEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Canonical POIs
  const POIS = {
    MCO: "1 Jeff Fuqua Blvd, Orlando, FL 32827",
    DISNEY: "1180 Seven Seas Dr, Lake Buena Vista, FL 32830",
    UNIVERSAL: "6000 Universal Blvd, Orlando, FL 32819",
    IDRIVE: "9800 International Dr, Orlando, FL 32819",
    KSC: "Space Commerce Way, Merritt Island, FL 32953",
    COCOA: "1500 N Atlantic Ave, Cocoa Beach, FL 32931"
  };

  const totalSteps = 6;
  const maxStep = Math.min(totalSteps, 
    1 + // Home base question
    (answers.disney ? 1 : 0) + // Disney days
    (answers.universal ? 1 : 0) + // Universal visits  
    (answers.ksc ? 1 : 0) + // KSC trips
    1 // Airport trips
  );

  const canContinue = () => {
    switch (currentStep) {
      case 1: return true; // Home base always answered
      case 2: return answers.disney || answers.universal || answers.ksc; // At least one destination
      case 3: return answers.disney ? answers.disneyDays > 0 : true;
      case 4: return answers.universal ? answers.universalVisits > 0 : true;
      case 5: return answers.ksc ? answers.kscTrips > 0 : true;
      case 6: return answers.airportTrips >= 0;
      default: return false;
    }
  };

  const handleAnswer = (field: keyof WizardAnswers, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < maxStep) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const generateTripLegs = (): TripLeg[] => {
    const legs: TripLeg[] = [];
    
    // Determine home base
    let homeBase: string;
    if (answers.homeBase) {
      homeBase = POIS.IDRIVE;
    } else {
      // Priority: Disney > Universal > I-Drive
      if (answers.disney) {
        homeBase = POIS.DISNEY;
      } else if (answers.universal) {
        homeBase = POIS.UNIVERSAL;
      } else {
        homeBase = POIS.IDRIVE;
      }
    }

    // Generate timestamps across Aug 25-27
    const baseDate = new Date('2025-08-25T10:00:00');
    let timeIndex = 0;

    // Disney trips
    for (let i = 0; i < answers.disneyDays; i++) {
      const departureTime = new Date(baseDate);
      departureTime.setDate(baseDate.getDate() + (i % 3));
      departureTime.setHours(10 + (timeIndex % 6), 0, 0, 0);
      
      legs.push({
        origin: homeBase,
        destination: POIS.DISNEY,
        departureTime: departureTime.toISOString()
      });
      
      legs.push({
        origin: POIS.DISNEY,
        destination: homeBase,
        departureTime: new Date(departureTime.getTime() + 6 * 60 * 60 * 1000).toISOString()
      });
      
      timeIndex++;
    }

    // Universal trips
    for (let i = 0; i < answers.universalVisits; i++) {
      const departureTime = new Date(baseDate);
      departureTime.setDate(baseDate.getDate() + (i % 3));
      departureTime.setHours(11 + (timeIndex % 6), 0, 0, 0);
      
      legs.push({
        origin: homeBase,
        destination: POIS.UNIVERSAL,
        departureTime: departureTime.toISOString()
      });
      
      legs.push({
        origin: POIS.UNIVERSAL,
        destination: homeBase,
        departureTime: new Date(departureTime.getTime() + 6 * 60 * 60 * 1000).toISOString()
      });
      
      timeIndex++;
    }

    // KSC/Cocoa trips
    for (let i = 0; i < answers.kscTrips; i++) {
      const departureTime = new Date(baseDate);
      departureTime.setDate(baseDate.getDate() + (i % 3));
      departureTime.setHours(9 + (timeIndex % 6), 0, 0, 0);
      
      legs.push({
        origin: homeBase,
        destination: POIS.KSC,
        waypoints: [POIS.COCOA],
        departureTime: departureTime.toISOString()
      });
      
      legs.push({
        origin: POIS.KSC,
        destination: homeBase,
        waypoints: [POIS.COCOA],
        departureTime: new Date(departureTime.getTime() + 8 * 60 * 60 * 1000).toISOString()
      });
      
      timeIndex++;
    }

    // Airport trips
    for (let i = 0; i < answers.airportTrips; i++) {
      const departureTime = new Date(baseDate);
      departureTime.setDate(baseDate.getDate() + (i % 3));
      departureTime.setHours(8 + (timeIndex % 6), 0, 0, 0);
      
      if (i % 2 === 0) {
        // Arrival
        legs.push({
          origin: POIS.MCO,
          destination: homeBase,
          departureTime: departureTime.toISOString()
        });
      } else {
        // Departure
        legs.push({
          origin: homeBase,
          destination: POIS.MCO,
          departureTime: departureTime.toISOString()
        });
      }
      
      timeIndex++;
    }

    return legs;
  };

  const handleSubmit = async () => {
    const legs = generateTripLegs();
    
    if (legs.length === 0) {
      setError("No toll-likely trips detected for Aug 25–27 in Orlando.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setEstimate(null);

    try {
      const payload = {
        rentalStart: "2025-08-25T00:00:00.000Z",
        rentalEnd: "2025-08-27T23:59:59.999Z", // Fix: Use end of day to include full Aug 27
        days: legs.map(leg => ({
          origin: leg.origin,
          destination: leg.destination,
          waypoints: leg.waypoints
        })),
        state: "FL",
        vehicleType: "2AxlesAuto",
        currency: "USD"
      };

      const response = await fetch('http://localhost:4000/api/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setEstimate(result.details);

    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Will you mostly stay near International Drive / Convention Center?
            </h3>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleAnswer('homeBase', true)}
                className={`px-6 py-3 rounded-md border-2 transition-colors ${
                  answers.homeBase 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleAnswer('homeBase', false)}
                className={`px-6 py-3 rounded-md border-2 transition-colors ${
                  !answers.homeBase 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                No
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Are you visiting any of these during Aug 25–27?
            </h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={answers.disney}
                  onChange={(e) => handleAnswer('disney', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Walt Disney World</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={answers.universal}
                  onChange={(e) => handleAnswer('universal', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Universal Orlando</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={answers.ksc}
                  onChange={(e) => handleAnswer('ksc', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Kennedy Space Center / Cocoa Beach</span>
              </label>
            </div>
          </div>
        );

      case 3:
        return answers.disney ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              How many park days at Disney?
            </h3>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => handleAnswer('disneyDays', Math.max(0, answers.disneyDays - 1))}
                className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center"
              >
                -
              </button>
              <span className="text-2xl font-semibold text-gray-800 w-12 text-center">
                {answers.disneyDays}
              </span>
              <button
                type="button"
                onClick={() => handleAnswer('disneyDays', Math.min(4, answers.disneyDays + 1))}
                className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center"
              >
                +
              </button>
            </div>
            <p className="text-sm text-gray-600">Range: 0-4 days</p>
          </div>
        ) : null;

      case 4:
        return answers.universal ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              How many visits to Universal?
            </h3>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => handleAnswer('universalVisits', Math.max(0, answers.universalVisits - 1))}
                className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center"
              >
                -
              </button>
              <span className="text-2xl font-semibold text-gray-800 w-12 text-center">
                {answers.universalVisits}
              </span>
              <button
                type="button"
                onClick={() => handleAnswer('universalVisits', Math.min(4, answers.universalVisits + 1))}
                className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center"
              >
                +
              </button>
            </div>
            <p className="text-sm text-gray-600">Range: 0-4 visits</p>
          </div>
        ) : null;

      case 5:
        return answers.ksc ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              How many day trips to KSC/Cocoa?
            </h3>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => handleAnswer('kscTrips', Math.max(0, answers.kscTrips - 1))}
                className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center"
              >
                -
              </button>
              <span className="text-2xl font-semibold text-gray-800 w-12 text-center">
                {answers.kscTrips}
              </span>
              <button
                type="button"
                onClick={() => handleAnswer('kscTrips', Math.min(3, answers.kscTrips + 1))}
                className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center"
              >
                +
              </button>
            </div>
            <p className="text-sm text-gray-600">Range: 0-3 trips</p>
          </div>
        ) : null;

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              How many airport trips between MCO and your base will you make?
            </h3>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => handleAnswer('airportTrips', Math.max(0, answers.airportTrips - 1))}
                className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center"
              >
                -
              </button>
              <span className="text-2xl font-semibold text-gray-800 w-12 text-center">
                {answers.airportTrips}
              </span>
              <button
                type="button"
                onClick={() => handleAnswer('airportTrips', Math.min(6, answers.airportTrips + 1))}
                className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center"
              >
                +
              </button>
            </div>
            <p className="text-sm text-gray-600">Range: 0-6 trips</p>
          </div>
        );

      default:
        return null;
    }
  };

  const renderResults = () => {
    if (!estimate) return null;

    const savings = parseFloat(estimate.savings);
    const isUnlimitedBetter = savings >= 0;

    return (
      <div className="mt-10 space-y-8">
        <h3 className="text-2xl font-bold text-[#E31837] text-center">Your Toll Estimate</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Standard e-Toll Card */}
           <div className="bg-white border-2 border-[#E31837] rounded-xl p-8 shadow-lg">
             <h4 className="text-xl font-bold text-[#E31837] mb-4">Standard e-Toll</h4>
             <div className="text-4xl font-bold text-[#E31837] mb-4">${estimate.standardEToll}</div>
             <div className="text-base text-gray-700 space-y-2">
               <div>Convenience fee: $6.95 × {estimate.daysWithTolls} (cap $34.95)</div>
               <div>Cash tolls: ${estimate.cashTollsTotal}</div>
               <div>Rental days: {estimate.rentalDays}</div>
             </div>
           </div>

           {/* Unlimited e-Toll Card */}
           <div className="bg-white border-2 border-[#E31837] rounded-xl p-8 shadow-lg">
             <h4 className="text-xl font-bold text-[#E31837] mb-4">e-Toll Unlimited</h4>
             <div className="text-4xl font-bold text-[#E31837] mb-4">${estimate.unlimitedEToll}</div>
             <div className="text-base text-gray-700">
               <div>Flat rate: $13.49 × {estimate.rentalDays} days</div>
               <div>No additional toll charges</div>
             </div>
           </div>
        </div>

                 {/* Recommendation */}
         <div className={`p-6 rounded-xl border-2 ${
           isUnlimitedBetter 
             ? 'bg-red-50 border-red-200' 
             : 'bg-red-50 border-red-200'
         }`}>
           <p className={`text-lg font-semibold text-center ${
             isUnlimitedBetter ? 'text-[#E31837]' : 'text-[#E31837]'
           }`}>
            {isUnlimitedBetter 
              ? `You're saving $${Math.abs(savings).toFixed(2)} with e-Toll Unlimited!`
              : `Standard e-Toll is cheaper by $${Math.abs(savings).toFixed(2)}.`
            }
          </p>
        </div>
      </div>
    );
  };

    return (
    <div className="max-w-6xl mx-auto p-8 bg-white shadow-xl rounded-xl">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center mb-6">
          <svg className="w-12 h-12 mr-4" viewBox="0 0 24 24" fill="#E31837">
            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
          </svg>
          <h1 className="text-4xl font-bold text-[#E31837] mb-3">Orlando e-Toll Estimator</h1>
        </div>
        <p className="text-xl text-gray-600 mb-6">Plan your toll costs for Aug 25-27, 2025</p>
        
        {/* Fixed Context Badges */}
        <div className="flex justify-center space-x-6 mt-6">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-base font-medium bg-red-50 text-[#E31837] border-2 border-red-200">
            📍 Orlando, FL
          </span>
          <span className="inline-flex items-center px-4 py-2 rounded-full text-base font-medium bg-red-50 text-[#E31837] border-2 border-red-200">
            📅 Aug 25-27, 2025
          </span>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-semibold text-gray-700">
            Step {currentStep} of {maxStep}
          </span>
          <span className="text-lg font-medium text-gray-500">
            {Math.round((currentStep / maxStep) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-[#E31837] h-3 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / maxStep) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Wizard Steps */}
      {currentStep <= maxStep && (
        <div className="mb-8">
          {renderStep()}
        </div>
      )}

      {/* Navigation */}
      {currentStep <= maxStep && (
        <div className="flex justify-between mb-8">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-8 py-4 border-2 border-gray-300 rounded-lg text-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          {currentStep < maxStep ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!canContinue()}
              className="px-8 py-4 bg-[#E31837] text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canContinue() || isLoading}
              className="px-8 py-4 bg-[#E31837] text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Generate Estimate'
              )}
            </button>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Results */}
      {renderResults()}
    </div>
  );
};

export default OrlandoTollWizard;
