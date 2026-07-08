import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

export function StepAge({ profile, onNext }: { profile: any; onNext: (val: string) => void }) {
  // Convert existing birthDate (if any) to YYYY-MM-DD
  const initialValue = profile?.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : "";
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onNext(value);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between">
      <div>
        <p className="text-slate-400 mb-6 text-center">
          Please enter your date of birth to calculate your age.
        </p>
        <div className="relative mx-auto max-w-sm">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
            <Calendar className="h-[20px] w-[20px]" />
          </div>
          <Input
            autoFocus
            type="date"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="pl-10 h-[56px] bg-black/50 border-white/10 text-white placeholder:text-slate-500 text-lg rounded-xl focus-visible:ring-rose-500"
          />
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <Button
          type="submit"
          disabled={!value.trim()}
          className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-[48px] px-8 w-full sm:w-auto"
        >
          Continue
        </Button>
      </div>
    </form>
  );
}
