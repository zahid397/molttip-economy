export const PostSkeleton = () => {
  return (
    <div className="glass-panel p-5 animate-pulse">
      <div className="flex gap-4">
        <div className="w-12 h-12 bg-gray-700 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-32 bg-gray-700 rounded" />
            <div className="h-4 w-4 bg-gray-700 rounded" />
            <div className="h-4 w-24 bg-gray-700 rounded" />
          </div>
          <div className="h-4 w-full bg-gray-700 rounded" />
          <div className="h-4 w-3/4 bg-gray-700 rounded" />
          <div className="flex gap-6 pt-2">
            <div className="h-5 w-12 bg-gray-700 rounded" />
            <div className="h-5 w-12 bg-gray-700 rounded" />
            <div className="h-5 w-12 bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};
