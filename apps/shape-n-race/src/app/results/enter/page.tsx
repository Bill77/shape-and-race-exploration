'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Car {
  id: number;
  name: string;
}

interface Heat {
  id: number;
  name: string;
  order: number;
}

export default function DataEntryPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const [cars, setCars] = useState<Car[]>([]);
  const [heats, setHeats] = useState<Heat[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [heatName, setHeatName] = useState('');
  const [heatLabel, setHeatLabel] = useState('');
  const [heatOrder, setHeatOrder] = useState(1);
  const [results, setResults] = useState<Record<number, number>>({}); // place -> carId
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('dataEntryAuth');
      if (auth === 'true') {
        setAuthenticated(true);
        fetchData();
      }
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [carsRes, heatsRes] = await Promise.all([
        fetch('/api/cars'),
        fetch('/api/heats'),
      ]);

      const carsData = await carsRes.json();
      const heatsData = await heatsRes.json();

      setCars(carsData);
      setHeats(heatsData.sort((a: Heat, b: Heat) => a.order - b.order));
      setHeatOrder(heatsData.length + 1);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setVerifying(true);

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('dataEntryAuth', 'true');
        }
        setAuthenticated(true);
        fetchData();
      } else {
        setPasswordError('Invalid password');
      }
    } catch (error) {
      setPasswordError('Error verifying password');
    } finally {
      setVerifying(false);
    }
  };

  const handleResultChange = (place: number, carId: number) => {
    setResults((prev) => ({
      ...prev,
      [place]: carId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all 4 places are filled
    const places = [1, 2, 3, 4];
    const missingPlaces = places.filter((p) => !results[p]);
    if (missingPlaces.length > 0) {
      alert(`Please select cars for places: ${missingPlaces.join(', ')}`);
      return;
    }

    // Check for duplicate car selections
    const carIds = Object.values(results);
    if (new Set(carIds).size !== carIds.length) {
      alert('Each car can only be assigned to one place');
      return;
    }

    setSubmitting(true);

    try {
      // Create heat first
      const heatRes = await fetch('/api/heats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: heatName,
          label: heatLabel || null,
          order: heatOrder,
        }),
      });

      if (!heatRes.ok) {
        throw new Error('Failed to create heat');
      }

      const newHeat = await heatRes.json();

      // Create results
      const resultsArray = places.map((place) => ({
        place,
        carId: results[place],
        lane: place, // Default lane to place number
      }));

      const resultsRes = await fetch(`/api/heats/${newHeat.id}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultsArray),
      });

      if (!resultsRes.ok) {
        throw new Error('Failed to create results');
      }

      // Reset form
      setHeatName('');
      setHeatLabel('');
      setResults({});
      alert('Heat results saved successfully!');
      router.push('/results');
    } catch (error) {
      console.error('Error submitting results:', error);
      alert('Failed to save results. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Data Entry</h1>
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-600">{passwordError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={verifying}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {verifying ? 'Verifying...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Enter Heat Results</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <label htmlFor="heatName" className="block text-sm font-medium mb-2">
            Heat Name *
          </label>
          <input
            type="text"
            id="heatName"
            value={heatName}
            onChange={(e) => setHeatName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="heatLabel" className="block text-sm font-medium mb-2">
            Heat Label (optional)
          </label>
          <input
            type="text"
            id="heatLabel"
            value={heatLabel}
            onChange={(e) => setHeatLabel(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="heatOrder" className="block text-sm font-medium mb-2">
            Order
          </label>
          <input
            type="number"
            id="heatOrder"
            value={heatOrder}
            onChange={(e) => setHeatOrder(parseInt(e.target.value, 10))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="1"
            required
          />
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Race Results (4 lanes)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((place) => (
              <div key={place} className="border border-gray-300 rounded-lg p-4">
                <label className="block text-sm font-medium mb-2">
                  Place {place}
                </label>
                <select
                  value={results[place] || ''}
                  onChange={(e) =>
                    handleResultChange(place, parseInt(e.target.value, 10))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select car...</option>
                  {cars.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving...' : 'Save Results'}
        </button>
      </form>
    </div>
  );
}
