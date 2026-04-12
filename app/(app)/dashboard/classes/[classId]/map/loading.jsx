/**
 * Loading skeleton para página do mapa de sala
 */

import { Skeleton } from "@/components/ui/skeleton";

export default function MapLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32 sm:h-9 sm:w-48" />
          <Skeleton className="h-4 w-56 sm:w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Toolbar skeleton */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-9 w-20" />
        <div className="flex-1" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Canvas skeleton */}
      <div className="bg-white rounded-xl border p-6">
        {/* Área do professor */}
        <div className="flex justify-center mb-6">
          <Skeleton className="h-8 w-40 rounded-full" />
        </div>

        {/* Grid de mesas */}
        <div className="grid grid-cols-6 gap-3">
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className="w-20 h-16 rounded-lg border-2 border-dashed border-muted flex items-center justify-center"
            >
              <Skeleton className="w-12 h-4" />
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar skeleton */}
      <div className="mt-4 grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3" />
        <div className="xl:col-span-1 space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
