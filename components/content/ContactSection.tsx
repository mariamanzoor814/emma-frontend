"use client";

import { MapPin, Phone, Mail } from "lucide-react";

type InfoBlock = {
  title?: string;
  text?: string;
  value?: string;
};

type Props = {
  visit: InfoBlock;
  phone: InfoBlock;
  email: InfoBlock;
  mapEmbedUrl?: string;
};

export function ContactSection({
  visit,
  phone,
  email,
  mapEmbedUrl,
}: Props) {
  return (
    <>
      {/* Info Cards */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <ContactCard icon={<MapPin />} {...visit} />
          <ContactCard icon={<Phone />} {...phone} />
          <ContactCard icon={<Mail />} {...email} />
        </div>
      </section>

      {/* Map */}
      {mapEmbedUrl && (
        <section className="h-[450px] w-full">
          <iframe
            title="Map"
            src={mapEmbedUrl}
            className="h-full w-full border-0"
            loading="lazy"
          />
        </section>
      )}
    </>
  );
}

function ContactCard({
  icon,
  title,
  text,
  value,
}: {
  icon: React.ReactNode;
  title?: string;
  text?: string;
  value?: string;
}) {
  if (!title && !text && !value) return null;

  return (
    <div className="px-6">
      <div className="mx-auto flex h-12 w-12 items-center justify-center text-orange-500">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold tracking-wide">{title}</h3>
      {text && <p className="mt-2 text-sm text-gray-500">{text}</p>}
      {value && (
        <p className="mt-4 text-sm font-semibold text-orange-500">{value}</p>
      )}
    </div>
  );
}
