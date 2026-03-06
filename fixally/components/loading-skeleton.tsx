'use client';

import { cn } from '@/lib/utils';

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-slate-200 rounded', className)} />;
}

export function ScanLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-600 text-lg">Scanning your site for accessibility issues...</p>
        <p className="text-slate-400 text-sm mt-2">This usually takes 10-30 seconds</p>
      </div>
      {/* Summary skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg border border-slate-200">
            <Skeleton className="h-8 w-12 mb-2" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
      {/* Violations skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg border border-slate-200">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 rounded-lg border border-slate-200 flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-5 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

export { Skeleton };
