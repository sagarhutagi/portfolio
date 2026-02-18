"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { updateSettings } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { SiteSettings } from "@/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [skillsText, setSkillsText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("settings")
        .select("*")
        .eq("id", 1)
        .single();
      if (data) {
        const s = {
          ...data,
          skills:
            typeof data.skills === "string"
              ? JSON.parse(data.skills)
              : data.skills ?? [],
        } as SiteSettings;
        setSettings(s);
        setSkillsText(s.skills.join(", "));
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Session expired. Please log in again.");
      setSaving(false);
      return;
    }

    const result = await updateSettings(session.access_token, {
      ...settings,
      skills: skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });

    if (result.success) {
      toast.success("Settings saved.");
    } else {
      toast.error(result.error ?? "Failed to save settings.");
    }
    setSaving(false);
  };

  if (!settings) {
    return <p className="text-sm text-muted-foreground">Loading settings…</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Site Settings</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Update your portfolio info. Changes go live immediately.
      </p>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            value={settings.name}
            onChange={(e) =>
              setSettings({ ...settings, name: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={settings.title}
            onChange={(e) =>
              setSettings({ ...settings, title: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Intro</Label>
          <Textarea
            value={settings.intro}
            onChange={(e) =>
              setSettings({ ...settings, intro: e.target.value })
            }
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>About</Label>
          <Textarea
            value={settings.about}
            onChange={(e) =>
              setSettings({ ...settings, about: e.target.value })
            }
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Skills (comma separated)</Label>
          <Input
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="Next.js, React, TypeScript, ..."
          />
        </div>

        <div className="space-y-2">
          <Label>Current Status</Label>
          <Input
            value={settings.current_status}
            onChange={(e) =>
              setSettings({ ...settings, current_status: e.target.value })
            }
            placeholder="Currently building: ..."
          />
        </div>

        <div className="space-y-2">
          <Label>Resume URL</Label>
          <Input
            value={settings.resume_url}
            onChange={(e) =>
              setSettings({ ...settings, resume_url: e.target.value })
            }
            placeholder="https://example.com/resume.pdf"
          />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
