import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

const MAX_INTERESTS = 5;
const MIN_PERSONALITY_TAGS = 1;

const PERSONALITY_OPTIONS = [
  "Introverted", "Extroverted", "Ambivert", "Adventurous", "Confident", "Funny",
  "Witty", "Romantic", "Caring", "Loyal", "Honest", "Kind", "Friendly", "Creative",
  "Calm", "Emotional", "Independent", "Optimistic", "Open-minded", "Easygoing",
  "Respectful", "Supportive", "Understanding", "Talkative", "Shy", "Curious",
  "Passionate", "Thoughtful", "Empathetic", "Spontaneous", "Playful", "Energetic",
  "Mature", "Patient", "Goal-oriented", "Family-oriented", "Hardworking", "Fitness Lover",
  "Nature Lover", "Animal Lover", "Foodie", "Traveler", "Book Lover", "Music Lover",
  "Movie Buff", "Tech Enthusiast", "Social Butterfly", "Good Listener", "Deep Thinker",
  "Sense of Humor", "Positive Thinker", "Straightforward", "Down to Earth", "Fun Loving",
  "Career Focused", "Spiritual", "Health Conscious", "Night Owl", "Early Bird", "Risk Taker",
  "Organized", "Minimalist", "Protective", "Affectionate", "Sensitive", "Polite", "Generous",
  "Responsible", "Trustworthy", "Charming", "Intelligent", "Competitive", "Disciplined",
  "Peaceful", "Bold", "Reserved", "Outspoken", "Laid-back", "Dreamer", "Realistic",
  "Punctual", "Motivated", "Adaptable", "Self-aware", "Non-judgmental",
  "Relationship-oriented", "Commitment-minded",
];

const INTEREST_OPTIONS = [
  "90s Kid", "Harry Potter", "SoundCloud", "Spa", "Self Care", "Heavy Metal",
  "House Parties", "Gymnastics", "Ludo", "Maggi", "Documentaries", "Biryani",
  "Drama shows", "Meditation", "Foodie", "Sushi", "Spotify", "Hockey", "Basketball",
  "Fantasy movies", "Home Workout", "Theater", "Cafe hopping", "Sneakers", "Aquarium",
  "Instagram", "Hot Springs", "Walking", "Running", "Travel", "Language Exchange",
  "Movies", "Action movies", "Animated movies", "Crime shows", "Social Development",
  "Gym", "Social Media", "Soul music", "Hip Hop", "Skincare", "Musical theater", "J-Pop",
  "Cricket", "Shisha", "Freelancing", "K-Pop", "Skateboarding", "Gospel music",
  "Pop music", "Punk rock", "Trying New Things", "Photography", "Bollywood", "Bhangra",
  "Reading", "Singing", "Rap music", "Sports", "Poetry", "Stand up Comedy", "Coffee",
  "Karaoke", "Fortnite", "Free Diving", "Self Development", "Mental Health Awareness",
  "Food tours", "Voter Rights", "Climate Change", "Exhibition", "Walking My Dog",
  "LGBTQIA+ Rights", "Feminism", "Escape Rooms", "Shopping", "Brunch", "Jetskiing",
  "Reggaeton", "Thrifting", "Black Lives Matter", "Jogging", "Road Trips", "Vintage fashion",
  "Couchsurfing", "Happy hour", "Inclusivity", "Country Music", "Football", "Investing",
  "Thriller films", "K-drama shows", "X", "Comic-con", "Tennis", "Indie films", "Ice Cream",
  "Reality TV", "Rom-coms", "Human Rights", "Sports shows", "Skiing", "Canoeing",
  "Snowboarding", "Pilates", "PlayStation", "Cheerleading", "Choir", "Pole Dancing",
  "Car Racing", "Pinterest", "Festivals", "Opera", "Pub Quiz", "Cosplay", "Motor Sports",
  "Content Creation", "E-Sports", "Binge-Watching TV shows", "Tattoos", "Painting",
  "Paddle Boarding", "Padel", "Surfing", "Bowling", "Grime", "90s Britpop", "Beach Bars",
];

export function StepTags({
  type,
  profile,
  onNext,
}: {
  type: "personality" | "personalityWords" | "interests" | "hobbies";
  profile: any;
  onNext: (val: string[]) => void;
}) {
  const isInterests = type === "interests";
  const isPersonality = type === "personality" || type === "personalityWords";
  const initialTags = Array.isArray(profile?.[type]) ? profile[type] : [];
  const [tags, setTags] = useState<string[]>(
    isInterests ? initialTags.slice(0, MAX_INTERESTS) : initialTags,
  );
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    if ((!isInterests && !isPersonality) || !inputValue.trim()) return [];
    const query = inputValue.trim().toLocaleLowerCase();
    const selected = new Set(tags.map((tag) => tag.toLocaleLowerCase()));
    const options = isPersonality ? PERSONALITY_OPTIONS : INTEREST_OPTIONS;
    return options.filter(
      (option) =>
        option.toLocaleLowerCase().includes(query) &&
        !selected.has(option.toLocaleLowerCase()),
    ).slice(0, 24);
  }, [inputValue, isInterests, isPersonality, tags]);

  const addTag = (value: string) => {
    const val = value.trim();
    if (!val || tags.some((tag) => tag.toLocaleLowerCase() === val.toLocaleLowerCase())) return;
    if (isInterests && tags.length >= MAX_INTERESTS) return;
    setTags((current) => [...current, val]);
    setInputValue("");
    setShowSuggestions(false);
  };

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isPersonality && suggestions.length === 0) return;
    addTag(isPersonality && suggestions.length > 0 ? suggestions[0] : inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isPersonality && suggestions.length === 0) return;
      addTag(isPersonality && suggestions.length > 0 ? suggestions[0] : inputValue);
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((item) => item !== tag));

  const handleSubmit = () => {
    const pendingValue = inputValue.trim();
    const canIncludePending =
      pendingValue &&
      !tags.some((tag) => tag.toLocaleLowerCase() === pendingValue.toLocaleLowerCase()) &&
      (!isInterests || tags.length < MAX_INTERESTS);
    const finalTags = canIncludePending ? [...tags, pendingValue] : tags;
    if (isPersonality && finalTags.length < MIN_PERSONALITY_TAGS) return;
    if (finalTags.length > 0) onNext(finalTags);
  };

  const placeholders: Record<string, string> = {
    personality: "e.g. Introverted, Witty, Adventurous...",
    personalityWords: "e.g. Introverted, Witty, Adventurous...",
    interests: "Search interests, e.g. Coffee, Travel, Movies...",
    hobbies: "e.g. Hiking, Photography, Baking...",
  };
  const label = type === "personalityWords" ? "personality" : type;
  const limitReached = isInterests && tags.length >= MAX_INTERESTS;

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <p className="mb-2 text-center text-slate-400">
          Add some tags that describe your {label}. {isInterests ? "Choose up to 5." : isPersonality ? "Choose one or more." : "Press enter to add."}
        </p>
        {isInterests && (
          <p className="mb-6 text-center text-sm font-medium text-rose-400">
            {tags.length}/{MAX_INTERESTS} selected
          </p>
        )}
        {isPersonality && (
          <p className={`mb-6 text-center text-sm font-medium ${tags.length >= MIN_PERSONALITY_TAGS ? "text-emerald-400" : "text-rose-400"}`}>
            {tags.length} selected {tags.length === 0 && "· select at least 1"}
          </p>
        )}

        <div className="mx-auto">
          <div className="mb-4 flex min-h-8 flex-wrap gap-2">
            {tags.map((tag) => (
              <div key={tag} className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/20 px-3 py-1.5 text-sm text-rose-300">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`} className="text-rose-400 transition-colors hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              autoFocus
              value={inputValue}
              disabled={limitReached}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder={limitReached ? "Maximum 5 interests selected" : placeholders[type]}
              className="h-12 rounded-xl border-white/10 bg-black/50 text-white placeholder:text-slate-500 focus-visible:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <Button onClick={handleAdd} type="button" disabled={!inputValue.trim() || limitReached || (isPersonality && suggestions.length === 0)} className="h-12 rounded-xl bg-white/10 px-6 text-white hover:bg-white/20">
              Add
            </Button>
          </div>

          {showSuggestions && suggestions.length > 0 && !limitReached && (
            <div className="mt-3 max-h-48 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 p-3 shadow-2xl">
              <div className="flex flex-wrap gap-2">
                {suggestions.map((option) => (
                  <button key={option} type="button" onClick={() => addTag(option)} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-rose-500 hover:bg-rose-500/15 hover:text-white">
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(isInterests || isPersonality) && inputValue.trim() && suggestions.length === 0 && !limitReached && (
            <p className="mt-3 text-sm text-slate-500">
              {isPersonality ? "No matching personality keyword found." : "No matching suggestion. Press Enter or Add to use your own interest."}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleSubmit} disabled={isPersonality ? tags.length < MIN_PERSONALITY_TAGS : tags.length === 0 && !inputValue.trim()} className="h-12 w-full rounded-xl bg-rose-500 px-8 text-white hover:bg-rose-600 sm:w-auto">
          {type === "hobbies" ? "Finish" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
