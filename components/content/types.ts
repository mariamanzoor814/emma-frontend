export type HeroItem = {
  id: string | number;
  label: string;
  imageUrl: string;
};

export type HeroSlide = {
  id: string | number;
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  backgroundColor?: string;
  items?: HeroItem[];
};

