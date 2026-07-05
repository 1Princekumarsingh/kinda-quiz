export default function ImportFormatGuide() {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
      <h3 className="mb-4 text-lg font-semibold text-blue-900">Question Import Formats</h3>
      
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Basic Format */}
        <div className="rounded-xl border border-blue-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-900">Basic Format (Existing)</span>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">Format A</span>
          </div>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-800">
{`Question 1
What is the time complexity of binary search?
A. O(n)
B. O(log n)
C. O(n²)
D. O(1)
Answer: B`}
          </pre>
        </div>

        {/* Enhanced Format */}
        <div className="rounded-xl border border-violet-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-violet-900">Enhanced Format with Explanations</span>
            <span className="rounded-full bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700">Format B</span>
          </div>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-800">
{`Question 2
What is the capital of France?
A. Berlin
B. Madrid
C. Paris
D. Rome
Answer: C
Explanation: Paris is the capital city of 
France and a major European center.`}
          </pre>
          <div className="mt-2 rounded-md bg-violet-50 p-2 text-xs text-violet-700">
            <span className="font-semibold">Note:</span> Explanation appears on a new line after Answer
          </div>
        </div>
      </div>

      {/* Key Points */}
      <div className="mt-5 rounded-lg border border-blue-100 bg-white p-4">
        <h4 className="mb-2 text-sm font-semibold text-gray-900">Key Points:</h4>
        <ul className="space-y-1.5 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="mr-2 text-green-600">✓</span>
            <span>You can use either format — explanations are <strong>completely optional</strong></span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-green-600">✓</span>
            <span>Existing question files without explanations continue to work without changes</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-blue-600">•</span>
            <span>Each question must have a number, four options (A-D), and one correct answer</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-violet-600">✨</span>
            <span>Explanations help users learn by providing context after answering questions</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
