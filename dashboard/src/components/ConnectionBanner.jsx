export default function ConnectionBanner({ connected, onRetry }) {
  if (connected) return null;

  return (
    <div className="bg-rose-950/80 border-b border-rose-500/40 px-6 py-2.5 flex items-center justify-between text-xs">
      <span className="text-rose-200 font-mono">
        Backend offline — start FastAPI backend:{' '}
        <code className="text-rose-100">cd backend && python main.py</code>
      </span>
      <button
        onClick={onRetry}
        className="px-3 py-1 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-200 hover:bg-rose-500/30 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}
