import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Briefcase, Check } from "lucide-react";

const PROFESSION_OPTIONS = [
  "IAS Officer", "IPS Officer", "IFS Officer", "IRS Officer", "Government Officer",
  "Civil Servant", "Army Officer", "Army Personnel", "Navy Officer", "Air Force Officer",
  "Police Officer", "Police Constable", "Sub Inspector", "Government Teacher",
  "Government Professor", "Government Doctor", "Government Nurse", "Railway Employee",
  "Railway Officer", "Bank Officer", "Bank Clerk", "Bank Manager", "SSC Employee", "Clerk",
  "Patwari", "Tehsildar", "Judge", "Lawyer", "Public Prosecutor", "Forest Officer",
  "Post Office Employee", "Municipal Employee", "Government Engineer", "Government Contractor",
  "PSU Employee", "Scientist", "Defence Personnel", "Firefighter", "Gram Sachiv",
  "Panchayat Secretary", "Government Accountant", "Government Pharmacist", "Anganwadi Worker",
  "Government Employee", "Software Engineer", "Web Developer", "Frontend Developer",
  "Backend Developer", "Full Stack Developer", "Mobile App Developer", "UI/UX Designer",
  "Graphic Designer", "Digital Marketer", "SEO Specialist", "Social Media Manager",
  "Content Writer", "Video Editor", "Data Analyst", "Data Scientist", "Cybersecurity Specialist",
  "IT Professional", "Project Manager", "Product Manager", "HR Manager", "HR Executive",
  "Recruiter", "Sales Executive", "Sales Manager", "Marketing Manager", "Accountant",
  "Chartered Accountant", "Banker", "Financial Analyst", "Business Analyst",
  "Customer Support Executive", "Call Centre Executive", "Operations Manager", "Office Assistant",
  "Private Teacher", "Professor", "Doctor", "Nurse", "Pharmacist", "Medical Representative",
  "Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Architect", "Journalist",
  "Photographer", "Fashion Designer", "Interior Designer", "Hotel Manager", "Chef",
  "Delivery Executive", "Driver", "Security Guard", "Real Estate Agent", "Fitness Trainer",
  "Receptionist", "Relationship Manager", "Store Manager", "Private Employee",
  "Corporate Professional", "Business Owner", "Entrepreneur", "Self Employed", "Freelancer",
  "Shop Owner", "Farmer", "Student", "Preparing for Government Exams", "Job Seeker",
  "Homemaker", "Retired", "Artist", "Influencer", "YouTuber", "Content Creator", "Trader",
  "Manufacturer", "E-commerce Seller", "Not Working Currently", "Prefer Not to Say",
];

export function StepProfession({ profile, onNext }: { profile: any; onNext: (val: string) => void }) {
  const initialProfession = profile?.profession || "";
  const [value, setValue] = useState(initialProfession);
  const [selectedProfession, setSelectedProfession] = useState(initialProfession);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    const query = value.trim().toLocaleLowerCase();
    if (!query) return [];
    return PROFESSION_OPTIONS.filter((option) => option.toLocaleLowerCase().includes(query)).slice(0, 16);
  }, [value]);

  const selectProfession = (profession: string) => {
    setValue(profession);
    setSelectedProfession(profession);
    setShowSuggestions(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const exactMatch = PROFESSION_OPTIONS.find(
      (option) => option.toLocaleLowerCase() === value.trim().toLocaleLowerCase(),
    );
    const profession = selectedProfession || exactMatch;
    if (profession) onNext(profession);
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col justify-between">
      <div>
        <p className="mb-6 text-center text-slate-400">
          What do you do for a living? Type and select the closest profession.
        </p>
        <div className="relative mx-auto">
          <div className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-slate-500">
            <Briefcase className="h-5 w-5" />
          </div>
          <Input
            autoFocus
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setSelectedProfession("");
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && suggestions.length > 0 && !selectedProfession) {
                event.preventDefault();
                selectProfession(suggestions[0]);
              }
              if (event.key === "Escape") setShowSuggestions(false);
            }}
            placeholder="e.g. Software Engineer"
            autoComplete="off"
            role="combobox"
            aria-expanded={showSuggestions && suggestions.length > 0}
            className="h-14 rounded-xl border-white/10 bg-black/50 pl-10 pr-10 text-lg text-white placeholder:text-slate-500 focus-visible:ring-rose-500"
          />
          {selectedProfession && (
            <Check className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-400" />
          )}

          {showSuggestions && value.trim() && suggestions.length > 0 && !selectedProfession && (
            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 max-h-60 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-xl">
              {suggestions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectProfession(option)}
                  className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-slate-300 transition hover:bg-rose-500/15 hover:text-white"
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {showSuggestions && value.trim() && suggestions.length === 0 && (
            <p className="mt-3 text-sm text-slate-500">No matching profession found. Try another related word.</p>
          )}
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <Button
          type="submit"
          disabled={!selectedProfession}
          className="h-12 w-full rounded-xl bg-rose-500 px-8 text-white hover:bg-rose-600 sm:w-auto"
        >
          Continue
        </Button>
      </div>
    </form>
  );
}
