'use client';

import Image from 'next/image';
import { useState } from 'react';

interface AvatarProps {
  address?: string;
  size?: 'sm' | 'md' | 'lg';
  src?: string;
}

export const Avatar = ({ address, size = 'md', src }: AvatarProps) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const avatarUrl =
    src || (address ? `https://effigy.im/a/${address}.svg` : '/avatar.png');

  return (
    <div
      className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gray-800 ring-2 ring-glass-light shadow-md`}
    >
      <Image
        src={imgError ? '/avatar.png' : avatarUrl}
        alt="Avatar"
        fill
        sizes="64px"
        className="object-cover"
        onError={() => setImgError(true)}
        priority={size === 'lg'}
      />
    </div>
  );
};
