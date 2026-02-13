import Link from 'next/link';
import { Button } from '@/components/common/Button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
      <h2 className="text-6xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
        404
      </h2>
      <p className="text-2xl text-gray-300">Page not found</p>
      <p className="text-gray-400 max-w-md">
        The page you are looking for might have been removed or is temporarily unavailable.
      </p>
      <Link href="/">
        <Button variant="primary">Return Home</Button>
      </Link>
    </div>
  );
}
