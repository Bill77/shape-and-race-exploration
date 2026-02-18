'use client';

import { useEffect, useState } from 'react';

interface Car {
  id: number;
  name: string;
}

interface Heat {
  id: number;
  name: string;
  label: string | null;
  order: number;
}

interface HeatResult {
  id: number;
  heatId: number;
  place: number;
  carId: number;
  lane: number | null;
  timeMs: number | null;
}

export default function ResultsPage() {
  const [heats, setHeats] = useState<Heat[]>([]);
  const [heatResults, setHeatResults] = useState<Record<number, HeatResult[]>>({});
  const [cars, setCars] = useState<Record<number, Car>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [heatsRes, carsRes] = await Promise.all([
          fetch('/api/heats'),
          fetch('/api/cars'),
        ]);

        const heatsData = await heatsRes.json();
        const carsData = await carsRes.json();

        setHeats(heatsData.sort((a: Heat, b: Heat) => a.order - b.order));
        setCars(
          carsData.reduce((acc: Record<number, Car>, car: Car) => {
            acc[car.id] = car;
            return acc;
          }, {})
        );

        // Fetch results for each heat
        const resultsPromises = heatsData.map((heat: Heat) =>
          fetch(`/api/heats/${heat.id}/results`).then((res) => res.json())
        );

        const resultsArrays = await Promise.all(resultsPromises);
        const resultsMap: Record<number, HeatResult[]> = {};
        heatsData.forEach((heat: Heat, index: number) => {
          resultsMap[heat.id] = resultsArrays[index];
        });

        setHeatResults(resultsMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const formatTime = (timeMs: number | null) => {
    if (!timeMs) return 'N/A';
    const seconds = (timeMs / 1000).toFixed(3);
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Race Results</h1>

      {heats.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No heats have been completed yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {heats.map((heat) => {
            const results = heatResults[heat.id] || [];
            const sortedResults = [...results].sort((a, b) => a.place - b.place);

            return (
              <div key={heat.id} className="bg-brand-light rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  {heat.name}
                  {heat.label && <span className="text-gray-600 ml-2">({heat.label})</span>}
                </h2>

                {sortedResults.length === 0 ? (
                  <p className="text-gray-500">No results recorded yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {sortedResults.map((result) => {
                      const car = cars[result.carId];
                      return (
                        <div
                          key={result.id}
                          className={`border-2 rounded-lg p-4 ${
                            result.place === 1
                              ? 'border-yellow-400 bg-yellow-50'
                              : result.place === 2
                              ? 'border-gray-300 bg-gray-50'
                              : result.place === 3
                              ? 'border-orange-300 bg-orange-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-lg">Place {result.place}</span>
                            {result.lane && (
                              <span className="text-sm text-gray-600">Lane {result.lane}</span>
                            )}
                          </div>
                          <div className="font-semibold text-xl mb-1">
                            {car ? car.name : `Car #${result.carId}`}
                          </div>
                          {result.timeMs && (
                            <div className="text-sm text-gray-600">
                              Time: {formatTime(result.timeMs)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
