"use server";

import { createServerSupabase, verifyAuth } from "./supabase-server";
import { revalidatePath } from "next/cache";
import type { SiteSettings, Project, Learning, WorkExperience } from "@/types";

/**
 * Revalidate all public-facing pages so changes appear instantly.
 * Using "layout" revalidates every page that shares the root layout.
 */
function revalidateAll() {
  revalidatePath("/", "layout");
}

/* ═══════════════════════════════════════════════════
   PUBLIC ACTIONS
   ═══════════════════════════════════════════════════ */

/**
 * Save a contact form submission to Supabase.
 */
export async function submitContactForm(data: {
  name: string;
  email: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const db = createServerSupabase();
    const { error } = await db.from("contact_submissions").insert({
      name: data.name,
      email: data.email,
      message: data.message,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch {
    return { success: false, error: "Failed to send message." };
  }
}

/* ═══════════════════════════════════════════════════
   ADMIN ACTIONS (token-verified)
   ═══════════════════════════════════════════════════ */

/**
 * Update site settings.
 */
export async function updateSettings(
  token: string,
  data: Partial<SiteSettings>
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAuth(token);
    const db = createServerSupabase();
    const { error } = await db
      .from("settings")
      .update({
        ...data,
        skills:
          typeof data.skills === "object"
            ? JSON.stringify(data.skills)
            : data.skills,
      })
      .eq("id", 1);
    if (error) return { success: false, error: error.message };
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Unauthorized or server error." };
  }
}

/* ── Projects CRUD ── */

export async function createProject(
  token: string,
  data: Omit<Project, "id">
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    await verifyAuth(token);
    const db = createServerSupabase();
    const { data: row, error } = await db
      .from("projects")
      .insert({
        ...data,
        tech: JSON.stringify(data.tech),
        screenshots: JSON.stringify(data.screenshots),
      })
      .select("id")
      .single();
    if (error) return { success: false, error: error.message };
    revalidateAll();
    return { success: true, id: row?.id };
  } catch {
    return { success: false, error: "Unauthorized or server error." };
  }
}

export async function updateProject(
  token: string,
  id: string,
  data: Partial<Project>
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAuth(token);
    const db = createServerSupabase();
    const payload: Record<string, unknown> = { ...data };
    if (data.tech) payload.tech = JSON.stringify(data.tech);
    if (data.screenshots)
      payload.screenshots = JSON.stringify(data.screenshots);
    const { error } = await db.from("projects").update(payload).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Unauthorized or server error." };
  }
}

export async function deleteProject(
  token: string,
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAuth(token);
    const db = createServerSupabase();
    const { error } = await db.from("projects").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Unauthorized or server error." };
  }
}

export async function reorderProjects(
  token: string,
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAuth(token);
    const db = createServerSupabase();
    const updates = orderedIds.map((id, index) =>
      db.from("projects").update({ order: index }).eq("id", id)
    );
    await Promise.all(updates);
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Unauthorized or server error." };
  }
}

/* ── Learnings CRUD ── */

export async function createLearning(
  token: string,
  data: Omit<Learning, "id">
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    await verifyAuth(token);
    const db = createServerSupabase();
    const { data: row, error } = await db
      .from("learnings")
      .insert(data)
      .select("id")
      .single();
    if (error) return { success: false, error: error.message };
    revalidateAll();
    return { success: true, id: row?.id };
  } catch {
    return { success: false, error: "Unauthorized or server error." };
  }
}

export async function updateLearning(
  token: string,
  id: string,
  data: Partial<Learning>
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAuth(token);
    const db = createServerSupabase();
    const { error } = await db.from("learnings").update(data).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Unauthorized or server error." };
  }
}

export async function deleteLearning(
  token: string,
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAuth(token);
    const db = createServerSupabase();
    const { error } = await db.from("learnings").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Unauthorized or server error." };
  }
}

export async function reorderLearnings(
  token: string,
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAuth(token);
    const db = createServerSupabase();
    const updates = orderedIds.map((id, index) =>
      db.from("learnings").update({ order: index }).eq("id", id)
    );
    await Promise.all(updates);
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Unauthorized or server error." };
  }
}

/* ── Contact messages ── */

export async function markMessageRead(
  token: string,
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAuth(token);
    const db = createServerSupabase();
    const { error } = await db
      .from("contact_submissions")
      .update({ is_read: true })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch {
    return { success: false, error: "Unauthorized or server error." };
  }
}

/* ── Experience CRUD ── */

export async function createExperience(
  token: string,
  data: Omit<WorkExperience, "id">
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    await verifyAuth(token);
    const db = createServerSupabase();
    const { data: row, error } = await db
      .from("experience")
      .insert({
        ...data,
        tech: JSON.stringify(data.tech),
      })
      .select("id")
      .single();
    if (error) return { success: false, error: error.message };
    revalidateAll();
    return { success: true, id: row?.id };
  } catch {
    return { success: false, error: "Unauthorized or server error." };
  }
}

export async function updateExperience(
  token: string,
  id: string,
  data: Partial<WorkExperience>
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAuth(token);
    const db = createServerSupabase();
    const payload: Record<string, unknown> = { ...data };
    if (data.tech) payload.tech = JSON.stringify(data.tech);
    const { error } = await db.from("experience").update(payload).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Unauthorized or server error." };
  }
}

export async function deleteExperience(
  token: string,
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAuth(token);
    const db = createServerSupabase();
    const { error } = await db.from("experience").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Unauthorized or server error." };
  }
}

export async function reorderExperience(
  token: string,
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAuth(token);
    const db = createServerSupabase();
    const updates = orderedIds.map((id, index) =>
      db.from("experience").update({ order: index }).eq("id", id)
    );
    await Promise.all(updates);
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Unauthorized or server error." };
  }
}
