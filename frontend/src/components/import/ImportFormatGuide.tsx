export default function ImportFormatGuide() {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
      <h3 className="mb-3 text-lg font-semibold text-blue-900">Question Import Formats</h3>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-blue-200 bg-white p-4">
          <div className="text-sm font-semibold text-blue-900">Basic Format (Existing)</div>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-sm text-gray-900">
Question 1
What is the time complexity of binary search?
A. O(n)
B. O(log n)
C. O(n²)
D. O(1)
Answer: B
          </pre>
        </div>
        <div className="rounded-xl border border-violet-200 bg-white p-4">
          <div className="text-sm font-semibold text-violet-900">Enhanced Format with Explanations</div>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-sm text-gray-900">
Question 2
What is the capital of France?
A. Berlin
B. Madrid
C. Paris
D. Rome
Answer: C
Explanation: Paris is the capital city of France and a major European center.
          </pre>
        </div>
      </div>
      <ul className="mt-4 space-y-1 text-sm text-blue-800">
        <li>• You can use either format — explanations are completely optional.</li>
        <li>• Existing question files without explanations continue to work without changes.</li>
        <li>• Each question must have a number, four options labeled A–D, and one correct answer.</li>
        <li>• When present, explanations appear in the preview card and will be shown later in practice/review flows.</li>
      </ul>
    </div>
  )
}
