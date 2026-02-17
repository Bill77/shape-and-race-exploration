import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Video background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-30"
        >
          {/* Placeholder - replace with actual video */}
          <source src="/derby-video.mp4" type="video/mp4" />
        </video>
        {/* Fallback gradient if video doesn't load */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-900" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            Pinewood Derby
          </h1>
          <p className="text-xl md:text-2xl mb-8 drop-shadow-md">
            Welcome to our annual Pinewood Derby race!
          </p>
          <p className="text-lg mb-12 max-w-2xl mx-auto drop-shadow">
            Watch as scouts race their handcrafted cars down the track. Vote for
            your favorites and see the race results in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/vote"
              className="bg-white text-blue-800 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Cast Your Vote
            </Link>
            <Link
              href="/results"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              View Results
            </Link>
          </div>
        </div>

        {/* About section */}
        <div className="mt-24 max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8 text-gray-800">
          <h2 className="text-3xl font-bold mb-6 text-center">About the Derby</h2>
          <div className="prose prose-lg mx-auto">
            <p className="mb-4">
              The Pinewood Derby is a racing event for scouts where they build
              and race small wooden cars. Each car is crafted from a block of
              pine wood and must meet specific design requirements.
            </p>
            <h3 className="text-2xl font-semibold mt-6 mb-3">Rules</h3>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>Cars must be made from the official Pinewood Derby kit</li>
              <li>Maximum weight: 5 ounces</li>
              <li>Maximum width: 2.75 inches</li>
              <li>Maximum length: 7 inches</li>
              <li>Minimum width between wheels: 1.75 inches</li>
            </ul>
            <h3 className="text-2xl font-semibold mt-6 mb-3">Voting</h3>
            <p className="mb-4">
              Parents and spectators can vote on multiple criteria including Best
              Design, Most Creative, and more. Each person can vote once per
              criterion.
            </p>
            <h3 className="text-2xl font-semibold mt-6 mb-3">Contact</h3>
            <p>
              For questions or more information, please contact the event
              organizers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
