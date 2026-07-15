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
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span><strong className="text-rose-600">{minAge}</strong> yrs</span>
        <span><strong className="text-rose-600">{maxAge}</strong> yrs</span>
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
