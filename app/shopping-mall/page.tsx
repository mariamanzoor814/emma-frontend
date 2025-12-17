// app/shopping-mall/page.tsx
import { AppShell } from "@/components/layout/AppShell";
import { getMenu } from "@/lib/api/navigation";
import { StorefrontShell } from "@/components/content/storefront/StorefrontShell";
import { getMallStorefront } from "@/lib/api/shoppingMall";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
function getFullImageUrl(url?: string) {
  if (!url) return "";
  return url.startsWith("/media") ? `${BACKEND_URL}${url}` : url;
}


type PageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ShoppingMallPage(props: PageProps) {
  const resolvedParams = (await props.searchParams) ?? {};
  const rawLang = resolvedParams.lang;
  const lang =
    (Array.isArray(rawLang) ? rawLang[0] : rawLang)?.toLowerCase() || "en";

  const [topMenu, mainMenu, mallData] = await Promise.all([
    getMenu("top"),
    getMenu("main"),
    getMallStorefront(),
  ]);
  // Transform heroSlides
const heroSlides = mallData.heroSlides.map(slide => ({
  ...slide,
  items: slide.items?.map(item => ({
    ...item,
    imageUrl: getFullImageUrl(item.imageUrl),
  })),
}));

// Transform circleRow items
const circleItems = mallData.circleRow.items.map(item => ({
  ...item,
  imageUrl: getFullImageUrl(item.imageUrl),
}));

// Transform product sections
const productSections = mallData.productSections.map(section => ({
  ...section,
  products: section.products.map(product => ({
    ...product,
    imageUrl: getFullImageUrl(product.imageUrl),
  })),
}));


  return (
    <AppShell topMenu={topMenu} mainMenu={mainMenu} lang={lang}>
      <StorefrontShell
  topLinks={mallData.topLinks}
  mainCategories={mallData.mainCategories}
  heroSlides={heroSlides}               // transformed
  promoTitle={mallData.promo.title}
  promoSubtitle={mallData.promo.subtitle}
  promoButtonLabel={mallData.promo.buttonLabel}
  circleRowTitle={mallData.circleRow.title}
  circleRowSubtitle={mallData.circleRow.subtitle}
  circleItems={circleItems}             // transformed
  productSections={productSections}     // transformed
  footerColumns={mallData.footerColumns}
/>

    </AppShell>
  );
}
