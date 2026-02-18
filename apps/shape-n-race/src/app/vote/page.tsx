'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Car {
  id: number;
  name: string;
  description: string | null;
  imageUrls: string[];
}

interface VoteCriterion {
  id: number;
  name: string;
  order: number;
}

export default function VotePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [criteria, setCriteria] = useState<VoteCriterion[]>([]);
  const [selectedVotes, setSelectedVotes] = useState<Record<number, number>>({}); // criterionId -> carId
  const [sessionId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      let id = sessionStorage.getItem('voteSessionId');
      if (!id) {
        id = Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('voteSessionId', id);
      }
      return id;
    }
    return '';
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [carsRes, criteriaRes] = await Promise.all([
          fetch('/api/cars'),
          fetch('/api/vote-criteria'),
        ]);

        const carsData = await carsRes.json();
        const criteriaData = await criteriaRes.json();

        setCars(carsData);
        setCriteria(criteriaData.sort((a: VoteCriterion, b: VoteCriterion) => a.order - b.order));
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage({ type: 'error', text: 'Failed to load cars and criteria' });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleVote = (criterionId: number, carId: number) => {
    setSelectedVotes((prev) => ({
      ...prev,
      [criterionId]: carId,
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedVotes).length === 0) {
      setMessage({ type: 'error', text: 'Please vote for at least one criterion' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const votePromises = Object.entries(selectedVotes).map(([criterionId, carId]) =>
        fetch('/api/votes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            carId,
            criterionId: parseInt(criterionId, 10),
            sessionId,
          }),
        })
      );

      await Promise.all(votePromises);
      setMessage({ type: 'success', text: 'Thank you for voting!' });
      setSelectedVotes({});
    } catch (error) {
      console.error('Error submitting votes:', error);
      setMessage({ type: 'error', text: 'Failed to submit votes. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Cast Your Vote</h1>
      <p className="text-center text-gray-600 mb-8">
        Vote for your favorite cars in each category. You can vote once per criterion.
      </p>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {criteria.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No voting criteria available yet.</p>
        </div>
      )}

      {criteria.map((criterion) => (
        <div key={criterion.id} className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            {criterion.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <div
                key={car.id}
                onClick={() => handleVote(criterion.id, car.id)}
                className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                  selectedVotes[criterion.id] === car.id
                    ? 'border-blue-600 bg-brand-dark-50 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="aspect-square relative mb-4 rounded-lg overflow-hidden bg-gray-100">
                  {car.imageUrls && car.imageUrls[0] ? (
                    <Image
                      src={car.imageUrls[0]}
                      alt={car.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">{car.name}</h3>
                {car.description && (
                  <p className="text-sm text-gray-600">{car.description}</p>
                )}
                {selectedVotes[criterion.id] === car.id && (
                  <div className="mt-2 text-blue-600 font-semibold">✓ Selected</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {criteria.length > 0 && (
        <div className="text-center mt-12">
          <button
            onClick={handleSubmit}
            disabled={submitting || Object.keys(selectedVotes).length === 0}
            className="bg-brand-dark-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-brand-dark-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Votes'}
          </button>
        </div>
      )}
    </div>
  );
}
