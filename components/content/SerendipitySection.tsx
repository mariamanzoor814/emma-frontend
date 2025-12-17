// frontend/components/content/SerendipitySection.tsx
import React from "react";

type Block = { key: string; value: any };

function getBlock(blocks: Block[] = [], key: string, field: string = "text") {
  const b = blocks.find((x) => x.key === key);
  if (!b?.value) return "";
  return b.value[field] ?? "";
}

export function SerendipitySection({ blocks }: { blocks: Block[] }) {
  const serendipityTitle = getBlock(blocks, "mission.serendipity.title");
  const serendipityBody = getBlock(blocks, "mission.serendipity.body");

  if (!serendipityTitle && !serendipityBody ) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 md:px-6 py-20 space-y-12">
      <div className="glass-card p-6 md:p-8 space-y-0">
        
        {serendipityTitle && <h3 className="text-2xl md:text-3xl font-bold text-slate-900">{serendipityTitle}</h3>}
        {serendipityBody && <p className="text-slate-800 text-base md:text-lg leading-relaxed whitespace-pre-line">{serendipityBody}</p>}
      </div>
    </section>
  );
}
