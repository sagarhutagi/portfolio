"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  createProject,
  updateProject,
  deleteProject,
  reorderProjects,
} from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Project } from "@/types";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { GripVertical, Pencil, Trash2, Plus, X } from "lucide-react";

const EMPTY_PROJECT: Omit<Project, "id"> = {
  title: "",
  short_desc: "",
  long_desc: "",
  tech: [],
  screenshots: [],
  live_url: "",
  github_url: "",
  order: 0,
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | (Omit<Project, "id"> & { id?: string }) | null>(null);
  const [techText, setTechText] = useState("");
  const [screenshotsText, setScreenshotsText] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("order", { ascending: true });
    if (data) {
      setProjects(
        data.map((p) => ({
          ...p,
          tech: typeof p.tech === "string" ? JSON.parse(p.tech) : p.tech ?? [],
          screenshots:
            typeof p.screenshots === "string"
              ? JSON.parse(p.screenshots)
              : p.screenshots ?? [],
        }))
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
    const items = Array.from(projects);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setProjects(items);

    const token = await getToken();
    if (token) {
      await reorderProjects(
        token,
        items.map((p) => p.id)
      );
    }
  };

  /* ── Open editor ── */
  const openNew = () => {
    setEditing({ ...EMPTY_PROJECT, order: projects.length });
    setTechText("");
    setScreenshotsText("");
  };

  const openEdit = (project: Project) => {
    setEditing({ ...project });
    setTechText(project.tech.join(", "));
    setScreenshotsText(project.screenshots.join("\n"));
  };

  /* ── Save ── */
  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const token = await getToken();
    if (!token) {
      toast.error("Session expired.");
      setSaving(false);
      return;
    }

    const payload = {
      ...editing,
      tech: techText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      screenshots: screenshotsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    let result;
    if ("id" in editing && editing.id) {
      result = await updateProject(token, editing.id, payload);
    } else {
      result = await createProject(token, payload as Omit<Project, "id">);
    }

    if (result.success) {
      toast.success("Project saved.");
      setEditing(null);
      load();
    } else {
      toast.error(result.error ?? "Failed to save.");
    }
    setSaving(false);
  };

  /* ── Delete ── */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    const token = await getToken();
    if (!token) return;
    const result = await deleteProject(token, id);
    if (result.success) {
      toast.success("Project deleted.");
      load();
    } else {
      toast.error(result.error ?? "Failed to delete.");
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold mb-1">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage and reorder your projects. Drag to reorder.
          </p>
        </div>
        <Button onClick={openNew} size="sm">
          <Plus size={16} className="mr-1" /> Add
        </Button>
      </div>

      {/* ── List with DnD ── */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="projects">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2"
            >
              {projects.map((project, index) => (
                <Draggable
                  key={project.id}
                  draggableId={project.id}
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
                          {project.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {project.short_desc}
                        </p>
                      </div>
                      <button
                        onClick={() => openEdit(project)}
                        className="text-muted-foreground hover:text-foreground p-1"
                        data-interactive
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
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

      {projects.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No projects yet. Click Add to create one.
        </p>
      )}

      {/* ── Editor Panel ── */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">
                {editing && "id" in editing && editing.id
                  ? "Edit Project"
                  : "New Project"}
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
              <div className="space-y-2">
                <Label>Short Description</Label>
                <Textarea
                  value={editing.short_desc}
                  onChange={(e) =>
                    setEditing({ ...editing, short_desc: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Full Description</Label>
                <Textarea
                  value={editing.long_desc}
                  onChange={(e) =>
                    setEditing({ ...editing, long_desc: e.target.value })
                  }
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label>Tech (comma separated)</Label>
                <Input
                  value={techText}
                  onChange={(e) => setTechText(e.target.value)}
                  placeholder="Next.js, React, ..."
                />
              </div>
              <div className="space-y-2">
                <Label>Screenshot URLs (one per line)</Label>
                <Textarea
                  value={screenshotsText}
                  onChange={(e) => setScreenshotsText(e.target.value)}
                  rows={3}
                  placeholder="https://picsum.photos/seed/img1/800/500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Live URL</Label>
                  <Input
                    value={editing.live_url}
                    onChange={(e) =>
                      setEditing({ ...editing, live_url: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>GitHub URL</Label>
                  <Input
                    value={editing.github_url}
                    onChange={(e) =>
                      setEditing({ ...editing, github_url: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save Project"}
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
