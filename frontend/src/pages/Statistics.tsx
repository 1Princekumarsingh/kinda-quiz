export default function Statistics() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-600">Total Study Time</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">0h 0m</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-600">Questions Solved</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">0</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-600">Overall Accuracy</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">-%</div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
        <p className="text-gray-500">No statistics available yet. Start practicing to see detailed analytics.</p>
      </div>
    </div>
  )
}
