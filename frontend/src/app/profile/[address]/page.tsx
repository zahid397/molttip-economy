'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Feed } from '@/components/feed/Feed';
import { Avatar } from '@/components/common/Avatar';
import { Spinner } from '@/components/common/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { formatAddress } from '@/utils/formatters';

export default function ProfilePage() {
  const params = useParams();
  const address = params?.address as string;

  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileUser, setProfileUser] = useState<any>(null);

  useEffect(() => {
    if (!address) return;

    setTimeout(() => {
      setProfileUser({
        address,
        displayName: `User ${address.slice(0, 4)}...${address.slice(-4)}`,
        bio: 'Web3 enthusiast and creator.',
        joinedAt: new Date().toISOString(),
      });
      setLoading(false);
    }, 500);
  }, [address]);

  if (!address) {
    return (
      <div className="glass-panel p-10 text-center">
        <p className="text-red-400 font-semibold">Invalid profile address</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const isOwnProfile = user?.address?.toLowerCase() === address.toLowerCase();

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <div className="flex items-start gap-4">
          <Avatar size="lg" address={address} />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">
              {profileUser?.displayName || formatAddress(address)}
            </h1>
            <p className="text-sm text-gray-400 mt-1">{address}</p>

            {profileUser?.bio && (
              <p className="mt-3 text-gray-300">{profileUser.bio}</p>
            )}

            {isOwnProfile && (
              <span className="inline-block mt-3 px-3 py-1 text-xs bg-neon-blue/20 border border-neon-blue/40 rounded-full text-neon-blue">
                Your profile
              </span>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Posts</h2>
        <Feed profileAddress={address} />
      </div>
    </div>
  );
}
