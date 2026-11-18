
"use client";

import { Megaphone } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Announcements() {
  const announcements = useQuery(
    api.adminContent.getPublishedAnnouncements,
    {}
  );

  if (!announcements || announcements.length === 0) {
    return null;
  }

  return (
    <section className="bg-green-50 border-b border-green-100">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-start gap-3">
          <Megaphone className="mt-1 shrink-0 text-green-600" size={22} />

          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div key={announcement._id}>
                <h3 className="font-semibold text-green-900">
                  {announcement.title}
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-700">
                  {announcement.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
