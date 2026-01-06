'use client';

import { useWatch } from 'react-hook-form';

function calculatePasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];

  return { score, label: labels[score-1] || 'Weak', color: colors[score-1] || 'bg-red-500' };
};

export default function PasswordStrength({ control }) {
  const password = useWatch({ control, name: 'password' });
  const strength = calculatePasswordStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
        <span className="text-slate-500">Strength</span>
        <span className={strength.color.replace('bg-', 'text-')}>{strength.label}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${strength.color} transition-all duration-500`}
          style={{ width: `${(strength.score / 4) * 100}%` }}
        />
      </div>
    </div>
  );
}
