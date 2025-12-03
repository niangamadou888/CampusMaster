export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to CampusMaster
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Campus Management System - Frontend
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="p-6 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Next.js 14</h2>
            <p className="text-gray-600">
              React framework with App Router and TypeScript
            </p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Spring Boot</h2>
            <p className="text-gray-600">
              Backend API at http://localhost:8080
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
