import type {
  CircleCategory,
  FooterColumn,
  HeroSlide,
  MainCategory,
  ProductSection,
  TopLink,
} from "@/components/content/storefront/types";

export type MallStorefront = {
  topLinks: TopLink[];
  mainCategories: MainCategory[];
  heroSlides: HeroSlide[];
  promo: { title: string; subtitle?: string; buttonLabel?: string };
  circleRow: { title: string; subtitle?: string; items: CircleCategory[] };
  productSections: ProductSection[];
  footerColumns: FooterColumn[];
};

// Temporary static data; replace with real API once available.
export async function getMallStorefront(): Promise<MallStorefront> {
  return {
    topLinks: [
      { id: 1, label: "Customer Service", href: "#" },
      { id: 2, label: "Track Order", href: "#" },
    ],
    mainCategories: [
      { id: "furniture", label: "Furniture", href: "#" },
      { id: "lighting", label: "Lighting", href: "#" },
      { id: "kitchen", label: "Kitchen", href: "#" },
    ],
    heroSlides: [
      {
        id: "hero-1",
        title: "Shop living room essentials",
        subtitle: "Curated pieces for comfort and style.",
        buttonLabel: "Shop now",
        backgroundColor: "#e8f0ff",
        items: [
          { id: "chair", label: "Chairs", imageUrl: "/assets/store/chair.png" },
          { id: "table", label: "Tables", imageUrl: "/assets/store/table.png" },
        ],
      },
    ],
    promo: {
      title: "Free shipping over $50",
      subtitle: "US & Canada • Easy returns",
      buttonLabel: "Learn more",
    },
    circleRow: {
      title: "Browse categories",
      subtitle: "Popular picks from shoppers",
      items: [
        { id: "sofas", label: "Sofas", imageUrl: "/assets/store/sofa.png" },
        { id: "beds", label: "Beds", imageUrl: "/assets/store/bed.png" },
        { id: "lamps", label: "Lamps", imageUrl: "/assets/store/lamp.png" },
      ],
    },
    productSections: [
      {
        id: "featured",
        title: "Featured products",
        products: [
          { id: "p1", name: "Modern Lounge Chair", price: "$249", imageUrl: "/assets/store/chair.png" },
          { id: "p2", name: "Walnut Coffee Table", price: "$189", imageUrl: "/assets/store/table.png" },
        ],
      },
    ],
    footerColumns: [
      {
        id: 1,
        title: "Company",
        links: [
          { id: "about", label: "About", href: "#" },
          { id: "careers", label: "Careers", href: "#" },
        ],
      },
    ],
  };
}

