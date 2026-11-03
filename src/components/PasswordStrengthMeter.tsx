import React from 'react';
import { ShieldAlert, ShieldCheck, Check, AlertCircle } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

export const getPasswordStrength = (
  password: string
): {
  score: number; // 0 to 4
  label: 'Weak' | 'Medium' | 'Strong' | 'Very Strong' | '';
  color: string;
  barColor: string;
  feedback: string;
  criteria: {
    length: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
} => {
  if (!password) {
    return {
      score: 0,
      label: '',
      color: 'text-slate-500',
      barColor: 'bg-slate-700',
      feedback: 'Enter a passphrase',
      criteria: {
        length: false,
        hasUpper: false,
        hasLower: false,
        hasNumber: false,
        hasSpecial: false,
      },
    };
  }

  const criteria = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  let points = 0;
  if (password.length >= 6) points += 1;
  if (password.length >= 10) points += 1;
  if (criteria.hasUpper && criteria.hasLower) points += 1;
  if (criteria.hasNumber) points += 0.5;
  if (criteria.hasSpecial) points += 0.5;

  let score = 1;
  let label: 'Weak' | 'Medium' | 'Strong' | 'Very Strong' = 'Weak';
  let color = 'text-rose-400';
  let barColor = 'bg-rose-500';
  let feedback = 'Easily guessable. Add letters, numbers, and symbols.';

  if (points >= 3.5 && password.length >= 10) {
    score = 4;
    label = 'Very Strong';
    color = 'text-emerald-400';
    barColor = 'bg-emerald-400';
    feedback = 'Exceptional cryptographic entropy for AES-256 key derivation.';
  } else if (points >= 2.5 && password.length >= 8) {
    score = 3;
    label = 'Strong';
    color = 'text-cyan-400';
    barColor = 'bg-cyan-400';
    feedback = 'Strong password. Resistant to dictionary attacks.';
  } else if (points >= 2 && password.length >= 6) {
    score = 2;
    label = 'Medium';
    color = 'text-amber-400';
    barColor = 'bg-amber-400';
    feedback = 'Acceptable, but consider adding special characters.';
  }

  return { score, label, color, barColor, feedback, criteria };
};

export const PasswordStrengthMeter: React.FC<PasswordStrengthProps> = ({ password }) => {
  const { score, label, color, barColor, feedback, criteria } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2 pt-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">Password Strength:</span>
        <span className={`font-semibold font-mono flex items-center gap-1 ${color}`}>
          {score >= 3 ? (
            <ShieldCheck className="w-3.5 h-3.5" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5" />
          )}
          {label}
        </span>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-full rounded-full transition-all duration-300 ${
              score >= step ? barColor : 'bg-slate-800'
            }`}
          />
        ))}
      </div>

      <p className="text-[11px] text-slate-400 leading-tight">{feedback}</p>

      {/* Criteria Checklist */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-400 pt-1">
        <span className={`flex items-center gap-1 ${criteria.length ? 'text-emerald-400' : 'text-slate-500'}`}>
          <Check className="w-3 h-3" /> 8+ characters
        </span>
        <span className={`flex items-center gap-1 ${criteria.hasUpper && criteria.hasLower ? 'text-emerald-400' : 'text-slate-500'}`}>
          <Check className="w-3 h-3" /> Uppercase & lowercase
        </span>
        <span className={`flex items-center gap-1 ${criteria.hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
          <Check className="w-3 h-3" /> Numbers (0-9)
        </span>
        <span className={`flex items-center gap-1 ${criteria.hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
          <Check className="w-3 h-3" /> Special symbols (!@#$)
        </span>
      </div>
    </div>
  );
};
