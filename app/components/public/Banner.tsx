
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Banner() {
  const banners = useQuery(api.adminContent.getPublishedBanners, {});

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      {banners.map((banner) => {
        const content = (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-green-50">
            {banner.imageUrl && (
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="h-48 w-full object-cover sm:h-64"
              />
            )}

            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900">
                {banner.title}
              </h2>

              <p className="mt-2 leading-7 text-gray-700">
                {banner.message}
              </p>

              {banner.targetUrl && (
                <span className="mt-4 inline-block font-semibold text-green-700">
                  Learn more →
                </span>
              )}
            </div>
          </div>
        );

        return (
          <div key={banner._id}>
            {banner.targetUrl ? (
              <a
                href={banner.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block transition hover:opacity-95"
              >
                {content}
              </a>
            ) : (
              content
            )}
          </div>
        );
      })}
    </section>
  );
}
