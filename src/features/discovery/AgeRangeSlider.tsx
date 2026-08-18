type AgeRangeSliderProps = {
  minAge: number;
  maxAge: number;
  onChange: (minAge: number, maxAge: number) => void;
};

const MIN_AGE = 18;
const MAX_AGE = 90;

export function AgeRangeSlider({ minAge, maxAge, onChange }: AgeRangeSliderProps) {
  const left = ((minAge - MIN_AGE) / (MAX_AGE - MIN_AGE)) * 100;
  const right = 100 - ((maxAge - MIN_AGE) / (MAX_AGE - MIN_AGE)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <button type="button" aria-label="Decrease minimum age" title="Decrease minimum age" disabled={minAge <= MIN_AGE} onClick={() => onChange(Math.max(MIN_AGE, minAge - 1), maxAge)} className="grid h-7 w-7 place-items-center rounded-full border border-rose-200 bg-white text-lg font-bold leading-none text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40">−</button>
          <span><strong className="text-rose-600">{minAge}</strong> yrs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span><strong className="text-rose-600">{maxAge}</strong> yrs</span>
          <button type="button" aria-label="Increase maximum age" title="Increase maximum age" disabled={maxAge >= MAX_AGE} onClick={() => onChange(minAge, Math.min(MAX_AGE, maxAge + 1))} className="grid h-7 w-7 place-items-center rounded-full border border-rose-200 bg-white text-lg font-bold leading-none text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40">+</button>
        </div>
      </div>
      <div className="relative h-5">
        <div className="absolute inset-x-0 top-2 h-1 rounded-full bg-border" />
        <div className="absolute top-2 h-1 rounded-full bg-rose-600" style={{ left: `${left}%`, right: `${right}%` }} />
        <input type="range" aria-label="Minimum age" value={minAge}
          onChange={(event) => onChange(Math.min(Number(event.target.value), maxAge), maxAge)}
          min={MIN_AGE} max={MAX_AGE} step={1}
          className="age-range-thumb age-range-thumb-min absolute inset-x-0 top-0 h-5 w-full appearance-none bg-transparent" />
        <input type="range" aria-label="Maximum age" value={maxAge}
          onChange={(event) => onChange(minAge, Math.max(Number(event.target.value), minAge))}
          min={MIN_AGE} max={MAX_AGE} step={1}
          className="age-range-thumb age-range-thumb-max absolute inset-x-0 top-0 h-5 w-full appearance-none bg-transparent" />
      </div>
      <p className="text-[10px] text-muted-foreground">Showing ages {minAge}–{maxAge}</p>
    </div>
  );
}
