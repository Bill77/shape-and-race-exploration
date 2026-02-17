import './global.css';
import Link from 'next/link';

export const metadata = {
  title: 'Pinewood Derby',
  description: 'Pinewood Derby voting and results',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <nav className="bg-blue-800 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold">
                Pinewood Derby
              </Link>
              <div className="flex gap-6">
                <Link
                  href="/"
                  className="hover:text-blue-200 transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/vote"
                  className="hover:text-blue-200 transition-colors"
                >
                  Vote
                </Link>
                <Link
                  href="/results"
                  className="hover:text-blue-200 transition-colors"
                >
                  Results
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
