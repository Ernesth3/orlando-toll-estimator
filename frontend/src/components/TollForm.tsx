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

interface DaySectionProps {
  dayNumber: number;
  control: any;
  register: any;
  errors: any;
}

const DaySection: React.FC<DaySectionProps> = ({ dayNumber, control, register, errors }) => {
  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Day {dayNumber}</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Origin <span className="text-red-500">*</span>
          </label>
          <input
            {...register(`daysData.${dayNumber - 1}.origin`, { required: 'Origin is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter origin address"
          />
          {errors.daysData?.[dayNumber - 1]?.origin && (
            <p className="text-red-500 text-sm mt-1">{errors.daysData[dayNumber - 1].origin.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Waypoints (optional)
          </label>
          <input
            {...register(`daysData.${dayNumber - 1}.waypoints`)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter waypoints separated by commas"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination <span className="text-red-500">*</span>
          </label>
          <input
            {...register(`daysData.${dayNumber - 1}.destination`, { required: 'Destination is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter destination address"
          />
          {errors.daysData?.[dayNumber - 1]?.destination && (
            <p className="text-red-500 text-sm mt-1">{errors.daysData[dayNumber - 1].destination.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const TollForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
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
      alert('Please select both start and end dates');
      return;
    }

    // Validate rental dates
    if (data.rentalStart >= data.rentalEnd) {
      alert('Rental start date must be before rental end date');
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

    try {
      const apiUrl = 'http://localhost:4000/api/estimate';
      console.log('Sending request to:', apiUrl);
      console.log('Payload:', payload);
      console.log('Current window location:', window.location.href);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setResponse(result.answer);

    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Toll Estimator Form</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Date Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholderText="Select start date"
                />
              )}
            />
            {errors.rentalStart && (
              <p className="text-red-500 text-sm mt-1">{errors.rentalStart.message}</p>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholderText="Select end date"
                />
              )}
            />
            {errors.rentalEnd && (
              <p className="text-red-500 text-sm mt-1">{errors.rentalEnd.message}</p>
            )}
          </div>
        </div>

        {/* Day Sections */}
        {daysCount > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Trip Details ({daysCount} day{daysCount > 1 ? 's' : ''})
            </h3>
            {Array.from({ length: daysCount }, (_, index) => (
              <DaySection
                key={index}
                dayNumber={index + 1}
                control={control}
                register={register}
                errors={errors}
              />
            ))}
          </div>
        )}

        {/* State and Vehicle Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <select
              {...register('state')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="CA">CA</option>
              <option value="NY">NY</option>
              <option value="TX">TX</option>
              <option value="FL">FL</option>
              <option value="IL">IL</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Type
            </label>
            <input
              type="text"
              {...register('vehicleType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              readOnly
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              'Generate Toll Estimate'
            )}
          </button>
        </div>
      </form>

      {/* Response Display */}
      {response && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Response:</h3>
          <pre className="whitespace-pre-wrap mt-6 p-4 bg-gray-100 rounded-lg">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TollForm; 