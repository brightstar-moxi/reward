
"use client";

import { useCallback, useEffect, useState } from "react";

type ContentTab =
  | "pages"
  | "faqs"
  | "announcements"
  | "banners";

type ContentData = {
  pages: any[];
  faqs: any[];
  announcements: any[];
  banners: any[];
};

const tabs: { id: ContentTab; label: string }[] = [
  { id: "pages", label: "Website Pages" },
  { id: "faqs", label: "FAQs" },
  { id: "announcements", label: "Announcements" },
  { id: "banners", label: "Banners" },
];

export default function AdminContentPage() {
  const [activeTab, setActiveTab] =
    useState<ContentTab>("pages");

  const [content, setContent] = useState<ContentData>({
    pages: [],
    faqs: [],
    announcements: [],
    banners: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    slug: "",
    title: "",
    content: "",
    question: "",
    answer: "",
    order: 0,
    message: "",
    imageUrl: "",
    targetUrl: "",
    isPublished: false,
  });

  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/content", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load content.");
      }

      setContent({
        pages: data.pages ?? [],
        faqs: data.faqs ?? [],
        announcements: data.announcements ?? [],
        banners: data.banners ?? [],
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  function resetForm() {
    setEditingId(null);
    setForm({
      slug: "",
      title: "",
      content: "",
      question: "",
      answer: "",
      order: 0,
      message: "",
      imageUrl: "",
      targetUrl: "",
      isPublished: false,
    });
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    let action = "";
    let payload: Record<string, unknown> = {};

    if (activeTab === "pages") {
      action = "savePage";
      payload = {
        slug: form.slug,
        title: form.title,
        content: form.content,
        isPublished: form.isPublished,
      };
    }

    if (activeTab === "faqs") {
      action = "saveFaq";
      payload = {
        question: form.question,
        answer: form.answer,
        order: Number(form.order),
        isPublished: form.isPublished,
      };
    }

    if (activeTab === "announcements") {
      action = "saveAnnouncement";
      payload = {
        title: form.title,
        message: form.message,
        isPublished: form.isPublished,
      };
    }

    if (activeTab === "banners") {
      action = "saveBanner";
      payload = {
        title: form.title,
        message: form.message,
        imageUrl: form.imageUrl || undefined,
        targetUrl: form.targetUrl || undefined,
        isPublished: form.isPublished,
      };
    }

    if (editingId) {
      payload.id = editingId;
    }

    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Operation failed.");
      }

      setSuccess("Content saved successfully.");
      resetForm();
      await loadContent();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  function editItem(item: any) {
    setEditingId(item._id);

    setForm({
      slug: item.slug ?? "",
      title: item.title ?? "",
      content: item.content ?? "",
      question: item.question ?? "",
      answer: item.answer ?? "",
      order: item.order ?? 0,
      message: item.message ?? "",
      imageUrl: item.imageUrl ?? "",
      targetUrl: item.targetUrl ?? "",
      isPublished: item.isPublished ?? false,
    });
  }

  async function deleteItem(id: string) {
    if (!window.confirm("Are you sure you want to delete this content?")) {
      return;
    }

    const actionMap: Record<ContentTab, string> = {
      pages: "deletePage",
      faqs: "deleteFaq",
      announcements: "deleteAnnouncement",
      banners: "deleteBanner",
    };

    try {
      setError("");
      setSuccess("");

      const response = await fetch("/api/admin/content", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionMap[activeTab],
          id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Delete failed.");
      }

      setSuccess("Content deleted successfully.");
      await loadContent();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Delete failed."
      );
    }
  }

  const currentItems = content[activeTab];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Content Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage website pages, FAQs, announcements and banners.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                resetForm();
                setError("");
                setSuccess("");
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                activeTab === tab.id
                  ? "bg-green-600 text-white"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          <form
            onSubmit={submitForm}
            className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <h2 className="font-semibold text-gray-900">
              {editingId ? "Edit Content" : "Create Content"}
            </h2>

            {activeTab === "pages" && (
              <>
                <Field
                  label="Page Slug"
                  value={form.slug}
                  onChange={(value) =>
                    setForm({ ...form, slug: value })
                  }
                  placeholder="about"
                  required
                />
                <Field
                  label="Page Title"
                  value={form.title}
                  onChange={(value) =>
                    setForm({ ...form, title: value })
                  }
                  required
                />
                <TextField
                  label="Page Content"
                  value={form.content}
                  onChange={(value) =>
                    setForm({ ...form, content: value })
                  }
                  required
                />
              </>
            )}

            {activeTab === "faqs" && (
              <>
                <Field
                  label="Question"
                  value={form.question}
                  onChange={(value) =>
                    setForm({ ...form, question: value })
                  }
                  required
                />
                <TextField
                  label="Answer"
                  value={form.answer}
                  onChange={(value) =>
                    setForm({ ...form, answer: value })
                  }
                  required
                />
                <Field
                  label="Display Order"
                  type="number"
                  value={String(form.order)}
                  onChange={(value) =>
                    setForm({ ...form, order: Number(value) })
                  }
                  required
                />
              </>
            )}

            {(activeTab === "announcements" ||
              activeTab === "banners") && (
              <>
                <Field
                  label="Title"
                  value={form.title}
                  onChange={(value) =>
                    setForm({ ...form, title: value })
                  }
                  required
                />
                <TextField
                  label="Message"
                  value={form.message}
                  onChange={(value) =>
                    setForm({ ...form, message: value })
                  }
                  required
                />
              </>
            )}

            {activeTab === "banners" && (
              <>
                <Field
                  label="Image URL (optional)"
                  value={form.imageUrl}
                  onChange={(value) =>
                    setForm({ ...form, imageUrl: value })
                  }
                />
                <Field
                  label="Destination URL (optional)"
                  value={form.targetUrl}
                  onChange={(value) =>
                    setForm({ ...form, targetUrl: value })
                  }
                />
              </>
            )}

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isPublished: e.target.checked,
                  })
                }
                className="h-4 w-4 accent-green-600"
              />
              Publish immediately
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Content"
                    : "Save Content"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border px-4 py-2.5 text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </h2>
              <span className="text-xs text-gray-500">
                {currentItems.length} items
              </span>
            </div>

            {loading ? (
              <p className="py-8 text-center text-sm text-gray-500">
                Loading content...
              </p>
            ) : currentItems.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No content found. Create your first item.
              </p>
            ) : (
              <div className="space-y-3">
                {currentItems.map((item: any) => (
                  <div
                    key={item._id}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-medium text-gray-900">
                          {item.title ||
                            item.question ||
                            item.slug}
                        </h3>

                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                          {item.message ||
                            item.answer ||
                            item.content ||
                            item.slug}
                        </p>

                        <span
                          className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                            item.isPublished
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => editItem(item)}
                          className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteItem(item._id)}
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-gray-700">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-gray-700">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        rows={6}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
      />
    </label>
  );
}
