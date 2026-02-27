import { useCountUp } from '@/hooks/useCountUp';

interface AnimatedNumberProps {
  value:      number;
  decimals?:  number;
  duration?:  number;
  className?: string;
  suffix?:    string;
  prefix?:    string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  decimals  = 0,
  duration  = 800,
  className = '',
  suffix,
  prefix,
}) => {
  const display = useCountUp(value, { decimals, duration });

  return (
    <span className={className}>
      {prefix}{display}{suffix && (
        <span className="text-text-secondary font-normal text-xs ml-1">{suffix}</span>
      )}
    </span>
  );
};
