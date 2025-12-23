const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export function getFullImageUrl(url?: string) {
  if (!url) return "";
  return url.startsWith("/media") ? `${BACKEND_URL}${url}` : url;
}

export type TopLink = {
  id: string;
  label: string;
  href: string;
};

export type MainCategory = {
  id: string;
  label: string;
  href?: string;
};

export type CircleCategory = {
  id: string;
  label: string;
  imageUrl: string;
  href?: string;
};

export type Product = {
  id: string | number;
  title: string;
  imageUrl: string;
  price: number | string;      
  currency: string;
  oldPrice?: number | string;  
  badgeText?: string;
};


export type HeroSlideItem = {
  id: string;
  label: string;
  imageUrl: string;
};

export type HeroSlide = {
  id: string;
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  backgroundColor?: string; // e.g. "#d4e43b"
  items?: HeroSlideItem[];
};

export type ProductSection = {
  id: string;
  title: string;
  subtitle?: string;
  products: Product[];
};

export type FooterColumn = {
  id: string;
  title: string;
  links: { id: string; label: string; href: string }[];
};
