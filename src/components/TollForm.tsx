import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DayData {
  origin: string;
  waypoints: string;
  destination: string;
}

interface FormData {
  rentalStart: Date | null;
  rentalEnd: Date | null;
  daysData: DayData[];
  state: string;
  vehicleType: string;
}

interface DayInput {
  origin: string;
  waypoints?: string[];
  destination: string;
}

interface Payload {
  rentalStart: string;
  rentalEnd: string;
  days: DayInput[];
  state: string;
  vehicleType: string;
  currency: string;
}

interface ApiResponse {
  answer: string;
  details: {
    standardEToll: string;
    unlimitedEToll: string;
    savings: string;
    tagTollsTotal: string;
    cashTollsTotal: string;
    flatRateTotal: string;
    rentalDays: number;
  };
}

interface DaySectionProps {
  dayNumber: number;
  register: any;
  errors: any;
}

// US State codes
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const DaySection: React.FC<DaySectionProps> = ({ dayNumber, register, errors }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-6 mb-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Day {dayNumber}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Origin <span className="text-red-600">*</span>
          </label>
          <input
            {...register(`daysData.${dayNumber - 1}.origin`, { required: 'Origin is required' })}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            placeholder="Enter origin address"
          />
          {errors.daysData?.[dayNumber - 1]?.origin && (
            <p className="text-red-600 text-sm mt-1">{errors.daysData[dayNumber - 1].origin.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Waypoints (optional)
          </label>
          <input
            {...register(`daysData.${dayNumber - 1}.waypoints`)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            placeholder="Enter waypoints separated by commas"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination <span className="text-red-600">*</span>
          </label>
          <input
            {...register(`daysData.${dayNumber - 1}.destination`, { required: 'Destination is required' })}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            placeholder="Enter destination address"
          />
          {errors.daysData?.[dayNumber - 1]?.destination && (
            <p className="text-red-600 text-sm mt-1">{errors.daysData[dayNumber - 1].destination.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const TollForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [daysCount, setDaysCount] = useState(0);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      rentalStart: null,
      rentalEnd: null,
      daysData: [],
      state: 'CA',
      vehicleType: '2AxlesAuto'
    }
  });

  const rentalStart = watch('rentalStart');
  const rentalEnd = watch('rentalEnd');

  // Calculate inclusive days between rentalStart and rentalEnd
  const calculateDays = (start: Date | null, end: Date | null): number => {
    if (!start || !end) return 0;
    
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(0, daysDiff + 1); // +1 for inclusive
  };

  // Update days data when rental dates change
  useEffect(() => {
    const count = calculateDays(rentalStart, rentalEnd);
    setDaysCount(count);
    
    if (count > 0) {
      const newDaysData: DayData[] = Array.from({ length: count }, () => ({
        origin: '',
        waypoints: '',
        destination: '',
      }));
      setValue('daysData', newDaysData);
    } else {
      setValue('daysData', []);
    }
  }, [rentalStart, rentalEnd, setValue]);

  const onSubmit = async (data: FormData) => {
    if (!data.rentalStart || !data.rentalEnd) {
      setError('Please select both start and end dates');
      return;
    }

    // Validate rental dates
    if (data.rentalStart >= data.rentalEnd) {
      setError('Rental start date must be before rental end date');
      return;
    }

    // Build payload
    const days: DayInput[] = data.daysData.map(day => {
      const dayInput: DayInput = {
        origin: day.origin,
        destination: day.destination
      };

      // Only include waypoints if not empty
      if (day.waypoints && day.waypoints.trim()) {
        dayInput.waypoints = day.waypoints.split(',').map(wp => wp.trim()).filter(wp => wp);
      }

      return dayInput;
    });

    const payload: Payload = {
      rentalStart: data.rentalStart.toISOString(),
      rentalEnd: data.rentalEnd.toISOString(),
      days,
      state: data.state,
      vehicleType: "2AxlesAuto",
      currency: "USD"
    };

    setIsLoading(true);
    setResponse(null);
    setError(null);

    try {
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as ApiResponse;
      setResponse(result);

    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with Avis Logo */}
        <div className="bg-red-600 text-white py-6 px-6 rounded-t-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="text-3xl font-bold mr-4">AVIS</div>
              <div className="text-xs align-super">®</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-red-100">Car Rental</div>
            </div>
          </div>
          <h1 className="text-2xl font-bold">Toll Estimator</h1>
          <p className="text-red-100 mt-2">Calculate your toll costs and compare e-Toll options</p>
        </div>

        {/* Main Form */}
        <div className="bg-white shadow-lg rounded-b-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Date Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rental Start Date
                </label>
                <Controller
                  name="rentalStart"
                  control={control}
                  rules={{ required: 'Start date is required' }}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      onChange={(date: Date) => field.onChange(date)}
                      selectsStart
                      startDate={rentalStart}
                      endDate={rentalEnd}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      placeholderText="Select start date"
                    />
                  )}
                />
                {errors.rentalStart && (
                  <p className="text-red-600 text-sm mt-1">{errors.rentalStart.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rental End Date
                </label>
                <Controller
                  name="rentalEnd"
                  control={control}
                  rules={{ required: 'End date is required' }}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      onChange={(date: Date) => field.onChange(date)}
                      selectsEnd
                      startDate={rentalStart}
                      endDate={rentalEnd}
                      minDate={rentalStart}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      placeholderText="Select end date"
                    />
                  )}
                />
                {errors.rentalEnd && (
                  <p className="text-red-600 text-sm mt-1">{errors.rentalEnd.message}</p>
                )}
              </div>
            </div>

            {/* Day Sections */}
            {daysCount > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">
                  Trip Details ({daysCount} day{daysCount > 1 ? 's' : ''})
                </h3>
                {Array.from({ length: daysCount }, (_, index) => (
                  <DaySection
                    key={index}
                    dayNumber={index + 1}
                    register={register}
                    errors={errors}
                  />
                ))}
              </div>
            )}

            {/* State and Vehicle Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <select
                  {...register('state')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                >
                  {US_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type
                </label>
                <input
                  type="text"
                  {...register('vehicleType')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                  readOnly
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 text-white py-4 px-6 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Calculating Toll Estimate...
                  </div>
                ) : (
                  'Generate Toll Estimate'
                )}
              </button>
            </div>
          </form>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Estimate Results */}
          {response && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Estimate Results</h3>
              
              {/* Summary Alert */}
              <div className={`p-6 rounded-lg shadow-sm mb-6 ${
                parseFloat(response.details.savings) >= 0 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`font-semibold text-lg ${
                  parseFloat(response.details.savings) >= 0 
                    ? 'text-green-800' 
                    : 'text-red-800'
                }`}>
                  {response.answer}
                </p>
              </div>
              
              {/* Detailed Breakdown Table */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-800 mb-4">Detailed Breakdown</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Item</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 font-medium text-gray-800">Standard e-Toll Total</td>
                        <td className="py-3 px-4 text-right font-semibold">${response.details.standardEToll}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 pl-8 text-gray-600">• Convenience Fees</td>
                        <td className="py-3 px-4 text-right text-gray-600">${response.details.flatRateTotal}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 pl-8 text-gray-600">• Cash Tolls</td>
                        <td className="py-3 px-4 text-right text-gray-600">${response.details.cashTollsTotal}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 font-medium text-gray-800">e-Toll Unlimited Total</td>
                        <td className="py-3 px-4 text-right font-semibold">${response.details.unlimitedEToll}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium text-gray-800">Rental Days</td>
                        <td className="py-3 px-4 text-right font-semibold">{response.details.rentalDays}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TollForm; 