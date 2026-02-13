import { Feed } from '@/components/feed/Feed';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
        Home Feed
      </h1>
      <Feed />
    </div>
  );
}
