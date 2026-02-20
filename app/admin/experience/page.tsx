"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  createExperience,
  updateExperience,
  deleteExperience,
  reorderExperience,
} from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { WorkExperience } from "@/types";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { GripVertical, Pencil, Trash2, Plus, X } from "lucide-react";

const EMPTY_EXPERIENCE: Omit<WorkExperience, "id"> = {
  company: "",
  role: "",
  start_date: "",
  end_date: "",
  description: "",
  tech: [],
  order: 0,
};

export default function AdminExperiencePage() {
  const [items, setItems] = useState<WorkExperience[]>([]);
  const [editing, setEditing] = useState<
    WorkExperience | (Omit<WorkExperience, "id"> & { id?: string }) | null
  >(null);
  const [techInput, setTechInput] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("experience")
      .select("*")
      .order("order", { ascending: true });
    if (data) {
      setItems(
        data.map((e) => ({
          ...e,
          tech: typeof e.tech === "string" ? JSON.parse(e.tech) : e.tech,
        })) as WorkExperience[]
      );
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getToken = async (): Promise<string | null> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  /* ── Drag & Drop ── */
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const list = Array.from(items);
    const [moved] = list.splice(result.source.index, 1);
    list.splice(result.destination.index, 0, moved);
    setItems(list);

    const token = await getToken();
    if (token) {
      await reorderExperience(
        token,
        list.map((e) => e.id)
      );
    }
  };

  const openNew = () => {
    setEditing({ ...EMPTY_EXPERIENCE, order: items.length });
    setTechInput("");
  };

  const openEdit = (exp: WorkExperience) => {
    setEditing({ ...exp });
    setTechInput(exp.tech.join(", "));
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const token = await getToken();
    if (!token) {
      toast.error("Session expired.");
      setSaving(false);
      return;
    }

    // Parse tech from comma-separated string
    const tech = techInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = { ...editing, tech };

    let result;
    if ("id" in payload && payload.id) {
      result = await updateExperience(token, payload.id, payload);
    } else {
      result = await createExperience(
        token,
        payload as Omit<WorkExperience, "id">
      );
    }

    if (result.success) {
      toast.success("Experience saved.");
      setEditing(null);
      load();
    } else {
      toast.error(result.error ?? "Failed to save.");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this experience?")) return;
    const token = await getToken();
    if (!token) return;
    const result = await deleteExperience(token, id);
    if (result.success) {
      toast.success("Experience deleted.");
      load();
    } else {
      toast.error(result.error ?? "Failed to delete.");
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Experience</h1>
          <p className="text-sm text-muted-foreground">
            Manage your work history. Drag to reorder.
          </p>
        </div>
        <Button onClick={openNew} size="sm">
          <Plus size={16} className="mr-1" /> Add
        </Button>
      </div>

      {/* ── List with DnD ── */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="experience">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2"
            >
              {items.map((exp, index) => (
                <Draggable key={exp.id} draggableId={exp.id} index={index}>
                  {(prov) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      className="flex items-center gap-3 p-4 bg-card rounded-sm"
                    >
                      <span
                        {...prov.dragHandleProps}
                        className="text-muted-foreground"
                        data-interactive
                      >
                        <GripVertical size={16} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {exp.role}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {exp.company} · {exp.start_date} — {exp.end_date || "Present"}
                        </p>
                      </div>
                      <button
                        onClick={() => openEdit(exp)}
                        className="text-muted-foreground hover:text-foreground p-1"
                        data-interactive
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="text-muted-foreground hover:text-destructive p-1"
                        data-interactive
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {items.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No experience added yet. Click Add to create one.
        </p>
      )}

      {/* ── Editor Panel ── */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">
                {editing && "id" in editing && editing.id
                  ? "Edit Experience"
                  : "New Experience"}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="text-muted-foreground hover:text-foreground p-1"
                data-interactive
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={editing.company}
                    onChange={(e) =>
                      setEditing({ ...editing, company: e.target.value })
                    }
                    placeholder="Acme Corp"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role / Title</Label>
                  <Input
                    value={editing.role}
                    onChange={(e) =>
                      setEditing({ ...editing, role: e.target.value })
                    }
                    placeholder="Senior Developer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    value={editing.start_date}
                    onChange={(e) =>
                      setEditing({ ...editing, start_date: e.target.value })
                    }
                    placeholder="2023-01"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Format: YYYY-MM
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    value={editing.end_date}
                    onChange={(e) =>
                      setEditing({ ...editing, end_date: e.target.value })
                    }
                    placeholder="Leave empty for Present"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Leave empty for current role
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  rows={4}
                  placeholder="What did you do in this role?"
                />
              </div>

              <div className="space-y-2">
                <Label>Tech Stack</Label>
                <Input
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="React, TypeScript, Node.js"
                />
                <p className="text-[10px] text-muted-foreground">
                  Comma-separated list
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save Experience"}
                </Button>
                <Button variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
