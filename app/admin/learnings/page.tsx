"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  createLearning,
  updateLearning,
  deleteLearning,
  reorderLearnings,
} from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/rich-text-editor";
import { toast } from "sonner";
import type { Learning } from "@/types";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { GripVertical, Pencil, Trash2, Plus, X } from "lucide-react";

const EMPTY_LEARNING: Omit<Learning, "id"> = {
  title: "",
  summary: "",
  full_details: "",
  order: 0,
};

export default function AdminLearningsPage() {
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [editing, setEditing] = useState<
    Learning | (Omit<Learning, "id"> & { id?: string }) | null
  >(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("learnings")
      .select("*")
      .order("order", { ascending: true });
    if (data) setLearnings(data as Learning[]);
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
    const items = Array.from(learnings);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setLearnings(items);

    const token = await getToken();
    if (token) {
      await reorderLearnings(
        token,
        items.map((l) => l.id)
      );
    }
  };

  const openNew = () => {
    setEditing({ ...EMPTY_LEARNING, order: learnings.length });
  };

  const openEdit = (learning: Learning) => {
    setEditing({ ...learning });
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

    let result;
    if ("id" in editing && editing.id) {
      result = await updateLearning(token, editing.id, editing);
    } else {
      result = await createLearning(token, editing as Omit<Learning, "id">);
    }

    if (result.success) {
      toast.success("Learning saved.");
      setEditing(null);
      load();
    } else {
      toast.error(result.error ?? "Failed to save.");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this learning?")) return;
    const token = await getToken();
    if (!token) return;
    const result = await deleteLearning(token, id);
    if (result.success) {
      toast.success("Learning deleted.");
      load();
    } else {
      toast.error(result.error ?? "Failed to delete.");
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold mb-1">Learnings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your learning notes. Drag to reorder.
          </p>
        </div>
        <Button onClick={openNew} size="sm">
          <Plus size={16} className="mr-1" /> Add
        </Button>
      </div>

      {/* ── List with DnD ── */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="learnings">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2"
            >
              {learnings.map((learning, index) => (
                <Draggable
                  key={learning.id}
                  draggableId={learning.id}
                  index={index}
                >
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
                          {learning.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {learning.summary}
                        </p>
                      </div>
                      <button
                        onClick={() => openEdit(learning)}
                        className="text-muted-foreground hover:text-foreground p-1"
                        data-interactive
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(learning.id)}
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

      {learnings.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No learnings yet. Click Add to create one.
        </p>
      )}

      {/* ── Editor Panel ── */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">
                {editing && "id" in editing && editing.id
                  ? "Edit Learning"
                  : "New Learning"}
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
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editing.title}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                />
              </div>
              <RichTextEditor
                value={editing.summary}
                onChange={(html) =>
                  setEditing({ ...editing, summary: html })
                }
                label="Summary"
                placeholder="Brief summary…"
                minHeight={80}
              />
              <RichTextEditor
                value={editing.full_details}
                onChange={(html) =>
                  setEditing({ ...editing, full_details: html })
                }
                label="Full Details"
                placeholder="Detailed notes, insights, code snippets…"
                minHeight={250}
              />
              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save Learning"}
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
