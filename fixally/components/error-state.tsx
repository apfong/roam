'use client';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  return (
    <div className="text-center py-12 px-6">
      <div className="text-4xl mb-3">⚠️</div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 mb-4 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message, action }: { message: string; action?: { label: string; href: string } }) {
  return (
    <div className="text-center py-12 px-6 bg-slate-50 rounded-lg border border-dashed border-slate-300">
      <div className="text-4xl mb-3">📭</div>
      <p className="text-sm text-slate-600 mb-4">{message}</p>
      {action && (
        <a
          href={action.href}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-block"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
