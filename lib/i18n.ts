import navigationEn from "../content/en/navigation.json";

type Dictionary = Record<string, string>;

const dictionaries: Record<string, Dictionary> = {
  en: {
    ...navigationEn
  },
  // future languages can load their own JSON
  // es: { ...navigationEs },
  // fr: { ...navigationFr },
};

export function t(key: string, lang: string = "en"): string {
  const dict = dictionaries[lang] ?? dictionaries["en"];
  return dict[key] ?? key;
}
