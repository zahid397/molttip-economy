
/**

Leaderboard Table Component
*/


'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';
import { formatCurrency, formatNumber } from '@/shared/utils/format';
import { cn } from '@/shared/utils/helpers';
import type { LeaderboardEntry } from '@/shared/types';

interface LeaderboardTableProps {
entries: LeaderboardEntry[];
type: 'tippers' | 'receivers' | 'posters';
isLoading?: boolean;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
entries,
type,
isLoading,
}) => {
const getMedalColor = (rank: number) => {
switch (rank) {
case 1:
return 'text-yellow-500';
case 2:
return 'text-gray-400';
case 3:
return 'text-amber-600';
default:
return 'text-gray-600';
}
};

const getValueLabel = () => {
switch (type) {
case 'tippers':
return 'Tips Sent';
case 'receivers':
return 'Tips Received';
case 'posters':
return 'Total Posts';
default:
return 'Value';
}
};

const formatValue = (value: number) => {
return type === 'posters' ? formatNumber(value) : ${formatCurrency(value, 0)} MOLT;
};

if (isLoading) {
return (
<Card>
<div className="space-y-4">
{[...Array(10)].map((_, i) => (
<div key={i} className="flex items-center gap-4 animate-pulse">
<div className="w-8 h-8 bg-gray-200 rounded" />
<div className="w-10 h-10 bg-gray-200 rounded-full" />
<div className="flex-1 h-6 bg-gray-200 rounded" />
<div className="w-24 h-6 bg-gray-200 rounded" />
</div>
))}
</div>
</Card>
);
}

if (!entries.length) {
return (
<Card className="text-center py-12">
<Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
<p className="text-gray-600">No data available yet</p>
</Card>
);
}

return (
<Card padding="none">
<div className="overflow-x-auto">
<table className="w-full">
<thead className="bg-moleskine-tan border-b-2 border-moleskine-black">
<tr>
<th className="px-6 py-4 text-left text-sm font-semibold text-moleskine-black">
Rank
</th>
<th className="px-6 py-4 text-left text-sm font-semibold text-moleskine-black">
User
</th>
<th className="px-6 py-4 text-right text-sm font-semibold text-moleskine-black">
{getValueLabel()}
</th>
<th className="px-6 py-4 text-center text-sm font-semibold text-moleskine-black">
Change
</th>
</tr>
</thead>
<tbody className="divide-y-2 divide-moleskine-black/10">
{entries.map((entry) => (
<tr  
key={entry.user.id}  
className="hover:bg-moleskine-cream transition-colors"  
>
<td className="px-6 py-4">
<div className="flex items-center gap-2">
{entry.rank <= 3 ? (
<Trophy className={cn('w-6 h-6', getMedalColor(entry.rank))} />
) : (
<span className="font-semibold text-gray-600 w-6 text-center">
{entry.rank}
</span>
)}
</div>
</td>

<td className="px-6 py-4">  
              <Link  
                href={`/profile/${entry.user.address}`}  
                className="flex items-center gap-3 group"  
              >  
                <Avatar  
                  src={entry.user.avatar}  
                  alt={entry.user.username}  
                  size="sm"  
                />  
                <div>  
                  <p className="font-semibold text-moleskine-black group-hover:text-primary-600 transition-colors">  
                    {entry.user.username}  
                  </p>  
                  <p className="text-sm text-gray-500">  
                    {formatCurrency(entry.user.balance, 0)} MOLT  
                  </p>  
                </div>  
              </Link>  
            </td>  
              
            <td className="px-6 py-4 text-right">  
              <span className="font-semibold text-moleskine-black">  
                {formatValue(entry.value)}  
              </span>  
            </td>  
              
            <td className="px-6 py-4">  
              <div className="flex justify-center">  
                {entry.change ? (  
                  <Badge  
                    variant={entry.change > 0 ? 'success' : 'danger'}  
                    size="sm"  
                  >  
                    {entry.change > 0 ? (  
                      <TrendingUp className="w-3 h-3 mr-1" />  
                    ) : (  
                      <TrendingDown className="w-3 h-3 mr-1" />  
                    )}  
                    {Math.abs(entry.change)}  
                  </Badge>  
                ) : (  
                  <Minus className="w-4 h-4 text-gray-400" />  
                )}  
              </div>  
            </td>  
          </tr>  
        ))}  
      </tbody>  
    </table>  
  </div>  
</Card>

);
};
