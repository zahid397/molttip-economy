import { InputHTMLAttributes, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = '', id, ...props }: InputProps) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-300"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`w-full px-4 py-2 bg-glass-dark border rounded-xl text-white placeholder:text-gray-500
        focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed
        ${
          error
            ? 'border-red-500 focus:ring-red-500/30'
            : 'border-glass-light focus:border-neon-blue focus:ring-neon-blue/30'
        } ${className}`}
        {...props}
      />

      {error && (
        <p id={errorId} className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};
