
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authenticateAdmin } from "./adminSubmissions";

// ==========================================
// WEBSITE PAGES
// ==========================================

export const getAllPages = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    return await ctx.db.query("sitePages").collect();
  },
});

export const savePage = mutation({
  args: {
    token: v.string(),
    id: v.optional(v.id("sitePages")),
    slug: v.string(),
    title: v.string(),
    content: v.string(),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const slug = args.slug.trim().toLowerCase();
    const title = args.title.trim();

    if (!slug || !title || !args.content.trim()) {
      throw new Error("Slug, title and content are required.");
    }

    const existing = await ctx.db
      .query("sitePages")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (existing && existing._id !== args.id) {
      throw new Error("A page with this slug already exists.");
    }

    const now = Date.now();

    const data = {
      slug,
      title,
      content: args.content,
      isPublished: args.isPublished,
      updatedAt: now,
    };

    if (args.id) {
      const page = await ctx.db.get(args.id);
      if (!page) throw new Error("Page not found.");

      await ctx.db.patch(args.id, data);
      return { success: true, id: args.id };
    }

    const id = await ctx.db.insert("sitePages", data);
    return { success: true, id };
  },
});

export const deletePage = mutation({
  args: {
    token: v.string(),
    id: v.id("sitePages"),
  },
  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// ==========================================
// FAQ MANAGEMENT
// ==========================================

export const getAllFaqs = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);
    return await ctx.db.query("faqs").collect();
  },
});

export const saveFaq = mutation({
  args: {
    token: v.string(),
    id: v.optional(v.id("faqs")),
    question: v.string(),
    answer: v.string(),
    order: v.number(),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const question = args.question.trim();
    const answer = args.answer.trim();

    if (!question || !answer) {
      throw new Error("Question and answer are required.");
    }

    if (!Number.isInteger(args.order) || args.order < 0) {
      throw new Error("FAQ order must be a non-negative whole number.");
    }

    const data = {
      question,
      answer,
      order: args.order,
      isPublished: args.isPublished,
      updatedAt: Date.now(),
    };

    if (args.id) {
      const faq = await ctx.db.get(args.id);
      if (!faq) throw new Error("FAQ not found.");

      await ctx.db.patch(args.id, data);
      return { success: true, id: args.id };
    }

    const id = await ctx.db.insert("faqs", {
      ...data,
      createdAt: Date.now(),
    });

    return { success: true, id };
  },
});

export const deleteFaq = mutation({
  args: {
    token: v.string(),
    id: v.id("faqs"),
  },
  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// ==========================================
// ANNOUNCEMENTS
// ==========================================

export const getAllAnnouncements = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);
    return await ctx.db.query("announcements").collect();
  },
});

export const saveAnnouncement = mutation({
  args: {
    token: v.string(),
    id: v.optional(v.id("announcements")),
    title: v.string(),
    message: v.string(),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const title = args.title.trim();
    const message = args.message.trim();

    if (!title || !message) {
      throw new Error("Title and message are required.");
    }

    const now = Date.now();

    const data = {
      title,
      message,
      isPublished: args.isPublished,
      updatedAt: now,
    };

    if (args.id) {
      const announcement = await ctx.db.get(args.id);
      if (!announcement) throw new Error("Announcement not found.");

      await ctx.db.patch(args.id, data);
      return { success: true, id: args.id };
    }

    const id = await ctx.db.insert("announcements", {
      ...data,
      createdAt: now,
    });

    return { success: true, id };
  },
});

export const deleteAnnouncement = mutation({
  args: {
    token: v.string(),
    id: v.id("announcements"),
  },
  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// ==========================================
// PROMOTIONAL BANNERS
// ==========================================

export const getAllBanners = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);
    return await ctx.db.query("banners").collect();
  },
});

export const saveBanner = mutation({
  args: {
    token: v.string(),
    id: v.optional(v.id("banners")),
    title: v.string(),
    message: v.string(),
    imageUrl: v.optional(v.string()),
    targetUrl: v.optional(v.string()),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);

    const title = args.title.trim();
    const message = args.message.trim();

    if (!title || !message) {
      throw new Error("Title and message are required.");
    }

    if (args.imageUrl && !/^https?:\/\/\S+$/i.test(args.imageUrl)) {
      throw new Error("Image URL must be a valid HTTP or HTTPS URL.");
    }

    if (args.targetUrl && !/^https?:\/\/\S+$/i.test(args.targetUrl)) {
      throw new Error("Target URL must be a valid HTTP or HTTPS URL.");
    }

    const now = Date.now();

    const data = {
      title,
      message,
      imageUrl: args.imageUrl?.trim() || undefined,
      targetUrl: args.targetUrl?.trim() || undefined,
      isPublished: args.isPublished,
      updatedAt: now,
    };

    if (args.id) {
      const banner = await ctx.db.get(args.id);
      if (!banner) throw new Error("Banner not found.");

      await ctx.db.patch(args.id, data);
      return { success: true, id: args.id };
    }

    const id = await ctx.db.insert("banners", {
      ...data,
      createdAt: now,
    });

    return { success: true, id };
  },
});

export const deleteBanner = mutation({
  args: {
    token: v.string(),
    id: v.id("banners"),
  },
  handler: async (ctx, args) => {
    await authenticateAdmin(ctx, args.token);
    await ctx.db.delete(args.id);
    return { success: true };
  },
});



// ==========================================
// PUBLIC CONTENT QUERIES
// ==========================================

// Published website page by slug
export const getPublishedPage = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const slug = args.slug.trim().toLowerCase();

    return await ctx.db
      .query("sitePages")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique()
      .then((page) =>
        page && page.isPublished ? page : null
      );
  },
});

// Published FAQs
export const getPublishedFaqs = query({
  args: {},
  handler: async (ctx) => {
    const faqs = await ctx.db.query("faqs").collect();

    return faqs
      .filter((faq) => faq.isPublished)
      .sort((a, b) => a.order - b.order);
  },
});

// Published announcements
export const getPublishedAnnouncements = query({
  args: {},
  handler: async (ctx) => {
    const announcements = await ctx.db
      .query("announcements")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();

    return announcements.filter((item) => item.isPublished);
  },
});

// Published banners
export const getPublishedBanners = query({
  args: {},
  handler: async (ctx) => {
    const banners = await ctx.db
      .query("banners")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();

    return banners.filter((banner) => banner.isPublished);
  },
});