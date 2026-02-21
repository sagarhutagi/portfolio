"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { updateSettings } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/image-upload";
import { RichTextEditor } from "@/components/rich-text-editor";
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

        <RichTextEditor
          value={settings.intro}
          onChange={(html) =>
            setSettings({ ...settings, intro: html })
          }
          label="Intro"
          placeholder="A short intro line…"
          minHeight={80}
        />

        <RichTextEditor
          value={settings.about}
          onChange={(html) =>
            setSettings({ ...settings, about: html })
          }
          label="About"
          placeholder="Tell visitors about yourself…"
          minHeight={150}
        />

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

        <ImageUpload
          value={settings.profile_image_url}
          onChange={(url) =>
            setSettings({ ...settings, profile_image_url: url })
          }
          label="Profile Image"
          hint="Leave blank to show a default icon."
        />

        {/* ── Contact & Location ── */}
        <div className="pt-4 border-t border-border">
          <h2 className="text-sm font-semibold mb-4">Contact & Location</h2>
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            value={settings.email}
            onChange={(e) =>
              setSettings({ ...settings, email: e.target.value })
            }
            placeholder="hello@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <Input
            value={settings.location}
            onChange={(e) =>
              setSettings({ ...settings, location: e.target.value })
            }
            placeholder="San Francisco, CA"
          />
        </div>

        {/* ── Social Links ── */}
        <div className="pt-4 border-t border-border">
          <h2 className="text-sm font-semibold mb-4">Social Links</h2>
        </div>

        <div className="space-y-2">
          <Label>GitHub URL</Label>
          <Input
            value={settings.github_url}
            onChange={(e) =>
              setSettings({ ...settings, github_url: e.target.value })
            }
            placeholder="https://github.com/username"
          />
        </div>

        <div className="space-y-2">
          <Label>Twitter / X URL</Label>
          <Input
            value={settings.twitter_url}
            onChange={(e) =>
              setSettings({ ...settings, twitter_url: e.target.value })
            }
            placeholder="https://twitter.com/username"
          />
        </div>

        <div className="space-y-2">
          <Label>LinkedIn URL</Label>
          <Input
            value={settings.linkedin_url}
            onChange={(e) =>
              setSettings({ ...settings, linkedin_url: e.target.value })
            }
            placeholder="https://linkedin.com/in/username"
          />
        </div>

        {/* ── Info Cards ── */}
        <div className="pt-4 border-t border-border">
          <h2 className="text-sm font-semibold mb-4">Info Cards</h2>
          <p className="text-xs text-muted-foreground mb-4">
            These show as small cards on your homepage.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Focus</Label>
          <Input
            value={settings.focus}
            onChange={(e) =>
              setSettings({ ...settings, focus: e.target.value })
            }
            placeholder="Full Stack"
          />
        </div>

        <div className="space-y-2">
          <Label>Currently Reading</Label>
          <Input
            value={settings.reading}
            onChange={(e) =>
              setSettings({ ...settings, reading: e.target.value })
            }
            placeholder="Clean Code"
          />
        </div>

        <div className="space-y-2">
          <Label>Interests</Label>
          <Input
            value={settings.interests}
            onChange={(e) =>
              setSettings({ ...settings, interests: e.target.value })
            }
            placeholder="OSS, Design"
          />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
