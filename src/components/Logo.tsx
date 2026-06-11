interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export default function Logo({ size = 'md', variant = 'dark' }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg', sub: 'text-[9px]' },
    md: { icon: 38, text: 'text-2xl', sub: 'text-[10px]' },
    lg: { icon: 52, text: 'text-3xl', sub: 'text-xs' },
  };

  const s = sizes[size];
  const textColor = variant === 'light' ? 'text-white' : 'text-slate-900';
  const subColor = variant === 'light' ? 'text-blue-200' : 'text-blue-600';

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 shadow-lg overflow-hidden"
        style={{ width: s.icon, height: s.icon }}
      >
        <img src="/logo.png" alt="Nexero Capital" className="w-[60%] h-[60%] object-contain" />
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-black tracking-tight ${s.text} ${textColor}`}>
          Nexero
          <span className="text-blue-600 ml-0.5">Capital</span>
        </span>
        <span className={`font-semibold tracking-widest uppercase ${s.sub} ${subColor} mt-0.5`}>
          Invest · Earn · Grow
        </span>
      </div>
    </div>
  );
}
