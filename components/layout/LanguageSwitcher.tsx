type Props = {
  currentLang?: string;
  onChangeLang?: (lang: string) => void;
};

export function LanguageSwitcher({ currentLang = "en", onChangeLang }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onChangeLang?.(val);
  };

  return (
    <select
      value={currentLang}
      onChange={handleChange}
      className="rounded-md border px-2 py-1 text-xs text-slate-800 bg-white"
      aria-label="Select language"
    >
      <option value="en">EN</option>
    </select>
  );
}

