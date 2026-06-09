export default function NoteSummaryCard({ summary, onChange }) {
  return (
    <div className="note-summary-card">
      <h4>Quick Summary</h4>
      <p className="note-summary-hint">Write 3–5 important points for quick review.</p>
      <textarea
        className="note-summary-input"
        value={summary || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your summary…"
        rows={3}
      />
    </div>
  );
}
