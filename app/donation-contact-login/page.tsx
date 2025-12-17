// frontend/app/donation-contact-login/page.tsx

import { AppShell } from "@/components/layout/AppShell";
import { HeroSection } from "@/components/content/HeroSection";
import { DonationContactLoginContent } from "@/components/content/DonationContactLoginContent";
import { getMenu } from "@/lib/api/navigation";
import { getPage } from "@/lib/api/content";

const PAGE_SLUG = "donation-contact-login";

type RawSearchParams = {
  lang?: string;
  [key: string]: string | string[] | undefined;
};

type PageProps = {
  searchParams: Promise<RawSearchParams>;
};

type Block = {
  key: string;
  value: any;
};

function getBlock(
  blocks: Block[] = [],
  key: string,
  field: string = "text"
): string {
  const block = blocks.find((b) => b.key === key);
  if (!block?.value) return "";
  return block.value[field] ?? "";
}

export default async function DonationContactLoginPage({
  searchParams,
}: PageProps) {
  const sp = await searchParams;
  const lang = (sp?.lang ?? "en").toLowerCase();

  const [topMenu, mainMenu, page] = await Promise.all([
    getMenu("top"),
    getMenu("main"),
    getPage(PAGE_SLUG, lang),
  ]);

  const blocks: Block[] = page?.blocks ?? [];

  // Hero content (from JSON)
  const heroTitle =
    getBlock(blocks, "hero.title") || "Welcome to The 1% and Better!";
  const heroSubtitle =
    getBlock(blocks, "hero.subtitle") ||
    "Support EMMA Foundation through donations, volunteering, and staying connected.";
  const heroImage = getBlock(blocks, "hero.image", "url");
  const heroImageAlt =
    getBlock(blocks, "hero.image", "alt") || "EMMA Foundation";

  // Donation
  const donation = {
    title: getBlock(blocks, "donation.title") || "Donation",
    intro:
      getBlock(blocks, "donation.intro") ||
      "Click the following link to donate using your credit card.",
    alertTitle: getBlock(blocks, "donation.alert.title") || "ALERT:",
    alertBody:
      getBlock(blocks, "donation.alert.body") ||
      `You are not obligated to pay anything to Zeffy payment platform. That money doesn’t go to EMMA Foundation. You do not need to accept the default percentage. Just under the total dollar amount of donation you will see a drop-down menu, please click on that and select “other”, then put 0%.`,
    linkUrl:
      getBlock(blocks, "donation.link.url") ||
      "https://www.zeffy.com/en-US/donation-form/f2a2c9dc-3095-45d6-a689-5d8f25a87e35",
    linkLabel:
      getBlock(blocks, "donation.link.label") ||
      "Donate via Zeffy (Credit Card)",
    otherMethods:
      getBlock(blocks, "donation.other_methods") ||
      "You may also donate through Paypal, Payoneer, Venmo and more.",
  };

  // Volunteering
  const volunteering = {
    title: getBlock(blocks, "volunteering.title") || "Volunteering",
    body:
      getBlock(blocks, "volunteering.body") ||
      "If you want to volunteer for EMMA Foundation in any capacity then please contact Maria Haque. You can do certain volunteering work remotely from anywhere in the world. You can participate in our YouTube channel, etc.",
    contactName:
      getBlock(blocks, "volunteering.contact.name") || "Maria Haque",
    contactRole:
      getBlock(blocks, "volunteering.contact.role") ||
      "Director of Operation",
    contactEmail:
      getBlock(blocks, "volunteering.contact.email") ||
      "Maria.EmmaFoundation@gmail.com",
  };

  // Corporate office
  const corporate = {
    title: getBlock(blocks, "corporate.title") || "Corporate Office",
    emailLabel:
      getBlock(blocks, "corporate.email.label") || "Contact us at",
    email: getBlock(blocks, "corporate.email") || "EMMA@EmmaFoundation.net",
  };

  // Sign up / login
  const signup = {
    title: getBlock(blocks, "signup.title") || "Sign Up Now",
    body:
      getBlock(blocks, "signup.body") ||
      "Create your account to stay connected with EMMA Foundation initiatives, events, and updates.",
    linkUrl: getBlock(blocks, "signup.link.url") || "/auth/signup",
    linkLabel:
      getBlock(blocks, "signup.link.label") || "Create your EMMA account",
  };

  return (
    <AppShell topMenu={topMenu} mainMenu={mainMenu} lang={lang}>
      <HeroSection
        title={heroTitle}
        subtitle={heroSubtitle}
        cta=""
        image={heroImage}
        imageAlt={heroImageAlt}
        applyOverlayBlur={false}
      />

      <DonationContactLoginContent
        donation={donation}
        volunteering={volunteering}
        corporate={corporate}
        signup={signup}
      />
    </AppShell>
  );
}
