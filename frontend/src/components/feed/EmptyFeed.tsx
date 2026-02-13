import { DocumentTextIcon } from '@heroicons/react/24/outline';

export const EmptyFeed = () => {
  return (
    <div className="glass-panel p-12 text-center">
      <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-600" />
      <h3 className="mt-4 text-xl font-medium text-gray-300">No posts yet</h3>
      <p className="mt-2 text-gray-500">Check back later or follow more creators.</p>
    </div>
  );
};
