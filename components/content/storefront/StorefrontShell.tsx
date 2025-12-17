"use client";

import React from "react";
import { TopUtilityBar } from "./TopUtilityBar";
import { MainHeader } from "./MainHeader";
import { CategoryStrip } from "./CategoryStrip";
import { HeroCarousel } from "./HeroCarousel";
import { PromoBand } from "./PromoBand";
import { CircleCategoryRow } from "./CircleCategoryRow";
import { ProductSectionRow } from "./ProductSectionRow";

import type {
  TopLink,
  MainCategory,
  HeroSlide,
  CircleCategory,
  ProductSection,
  FooterColumn,
} from "./types";

type StorefrontShellProps = {
  topLinks: TopLink[];
  mainCategories: MainCategory[];
  heroSlides: HeroSlide[];
  promoTitle: string;
  promoSubtitle?: string;
  promoButtonLabel?: string;
  circleRowTitle: string;
  circleRowSubtitle?: string;
  circleItems: CircleCategory[];
  productSections: ProductSection[];
  footerColumns: FooterColumn[];
};

export const StorefrontShell: React.FC<StorefrontShellProps> = ({
  topLinks,
  mainCategories,
  heroSlides,
  promoTitle,
  promoSubtitle,
  promoButtonLabel,
  circleRowTitle,
  circleRowSubtitle,
  circleItems,
  productSections,
  footerColumns,
}) => {
  return (
    <div className="min-h-screen bg-white">
      <TopUtilityBar
        leftText="Hi!"
        authLinks={{ signInHref: "/login", registerHref: "/register" }}
        links={topLinks}
      />

      <MainHeader
        logoText="Emma"
        categoryOptions={[
          { value: "all", label: "All categories" },
          ...mainCategories.map((c) => ({ value: c.id, label: c.label })),
        ]}
      />

      <CategoryStrip categories={mainCategories} />

      <HeroCarousel slides={heroSlides} />

      <PromoBand
        title={promoTitle}
        subtitle={promoSubtitle}
        buttonLabel={promoButtonLabel}
      />

      <CircleCategoryRow
        title={circleRowTitle}
        subtitle={circleRowSubtitle}
        items={circleItems}
      />

      {productSections.map((section) => (
        <ProductSectionRow
          key={section.id}
          section={section}
          seeAllHref="#"
        />
      ))}

    </div>
  );
};
