import './index.css'

function App() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <h1 className="text-4xl font-bold text-blue-800 mb-2 tracking-tight">
          PediaDose
        </h1>
        <p className="text-gray-500 text-base mb-12">
          Paediatric drug dose calculator
        </p>
        <p className="text-gray-400 text-sm text-center">
          Coming soon — Phase 1 under construction.
        </p>
      </main>

      <footer className="bg-amber-50 border-t border-amber-200 px-4 py-3">
        <p className="text-amber-800 text-sm text-center leading-snug">
          <strong>Disclaimer:</strong> PediaDose is a calculation aid only. Always verify doses against current formulary guidelines and apply clinical judgment.
        </p>
      </footer>
    </div>
  )
}

export default App
