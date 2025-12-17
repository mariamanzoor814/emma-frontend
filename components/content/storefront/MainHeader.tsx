"use client";

import React, { FormEvent } from "react";
import { Search, ShoppingCart, Bell, User } from "lucide-react";

type MainHeaderProps = {
  logoText?: string;
  onSearch?: (query: string, category: string) => void;
  categoryOptions?: { value: string; label: string }[];
};

export const MainHeader: React.FC<MainHeaderProps> = ({
  logoText = "Emma",
  onSearch,
  categoryOptions = [{ value: "all", label: "All categories" }],
}) => {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = (fd.get("q") as string) ?? "";
    const cat = (fd.get("category") as string) ?? "all";
    onSearch?.(q, cat);
  };

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        {/* Logo + "Shop by category" */}
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-1">
            <span className="rounded-md bg-blue-600 px-2 py-1 text-sm font-bold text-white">
              {logoText}
            </span>
          </a>
          <button className="hidden items-center gap-1 rounded-full px-3 py-1 text-xs text-gray-700 hover:bg-gray-100 sm:inline-flex">
            <span>Shop by category</span>
            <span className="text-[10px]">▾</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="flex flex-1 items-center">
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-3xl items-stretch overflow-hidden rounded-full border border-gray-300 bg-gray-50"
          >
            <input
              name="q"
              type="search"
              placeholder="Search for anything"
              className="flex-1 border-none bg-transparent px-4 text-sm outline-none"
            />
            <select
              name="category"
              className="hidden border-l bg-white px-3 text-xs text-gray-700 sm:block"
              defaultValue="all"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="flex items-center gap-1 rounded-r-full bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </form>
          <button className="ml-3 text-[11px] text-gray-700 hover:text-blue-700">
            Advanced
          </button>
        </div>

        {/* Icons right side */}
        <div className="hidden items-center gap-4 text-xs text-gray-700 sm:flex">
          <button className="hover:text-blue-700">Sell</button>
          <button className="hover:text-blue-700">Watchlist ▾</button>
          <button className="hover:text-blue-700">My Emma ▾</button>
          <button className="rounded-full p-1 hover:bg-gray-100">
            <Bell className="h-4 w-4" />
          </button>
          <button className="rounded-full p-1 hover:bg-gray-100">
            <ShoppingCart className="h-4 w-4" />
          </button>
          <button className="rounded-full p-1 hover:bg-gray-100">
            <User className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
