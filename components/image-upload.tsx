"use client";

import { useRef, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Upload, X, Link, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";

/* ────────────────────────────────────────────────────
   Single-image upload (settings profile image, etc.)
   ──────────────────────────────────────────────────── */

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Image",
  hint,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<"link" | "upload">(value ? "link" : "upload");

  const getToken = async (): Promise<string | null> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);

      const token = await getToken();
      if (!token) {
        toast.error("Session expired.");
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Upload failed");
        onChange(json.url);
        toast.success("Image uploaded.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onChange]
  );

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {/* Mode toggle */}
      <div className="flex gap-1 mb-2">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-sm transition-colors ${
            mode === "upload"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
          data-interactive
        >
          <Upload size={12} /> Upload
        </button>
        <button
          type="button"
          onClick={() => setMode("link")}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-sm transition-colors ${
            mode === "link"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
          data-interactive
        >
          <Link size={12} /> Paste URL
        </button>
      </div>

      {mode === "link" ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      ) : (
        <div
          className="relative flex flex-col items-center justify-center gap-2 border-2 border-dashed border-muted-foreground/25 rounded-sm p-6 hover:border-muted-foreground/50 transition-colors cursor-pointer"
          onClick={() => !uploading && inputRef.current?.click()}
          data-interactive
        >
          {uploading ? (
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          ) : (
            <Upload size={24} className="text-muted-foreground" />
          )}
          <p className="text-xs text-muted-foreground">
            {uploading
              ? "Uploading…"
              : "Click to choose or drag & drop an image"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            JPEG, PNG, GIF, WebP, SVG · Max 5 MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="relative inline-block mt-2">
          <Image
            src={value}
            alt="Preview"
            width={160}
            height={100}
            className="rounded-sm object-cover border border-border"
            unoptimized
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
            data-interactive
          >
            <X size={12} />
          </button>
        </div>
      )}

      {hint && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────
   Multi-image upload (project screenshots, etc.)
   ──────────────────────────────────────────────────── */

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  hint?: string;
}

export function MultiImageUpload({
  value,
  onChange,
  label = "Images",
  hint,
}: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [mode, setMode] = useState<"link" | "upload">("upload");

  const getToken = async (): Promise<string | null> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  const handleFilesChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      setUploading(true);

      const token = await getToken();
      if (!token) {
        toast.error("Session expired.");
        setUploading(false);
        return;
      }

      const newUrls: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error ?? "Upload failed");
          newUrls.push(json.url);
        } catch (err) {
          toast.error(
            `Failed: ${file.name} — ${
              err instanceof Error ? err.message : "Upload error"
            }`
          );
        }
      }

      if (newUrls.length > 0) {
        onChange([...value, ...newUrls]);
        toast.success(
          `${newUrls.length} image${newUrls.length > 1 ? "s" : ""} uploaded.`
        );
      }

      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    },
    [value, onChange]
  );

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onChange([...value, trimmed]);
    setUrlInput("");
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {/* Mode toggle */}
      <div className="flex gap-1 mb-2">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-sm transition-colors ${
            mode === "upload"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
          data-interactive
        >
          <Upload size={12} /> Upload
        </button>
        <button
          type="button"
          onClick={() => setMode("link")}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-sm transition-colors ${
            mode === "link"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
          data-interactive
        >
          <Link size={12} /> Paste URL
        </button>
      </div>

      {mode === "link" ? (
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/screenshot.png"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
          />
          <Button type="button" size="sm" variant="secondary" onClick={addUrl}>
            Add
          </Button>
        </div>
      ) : (
        <div
          className="relative flex flex-col items-center justify-center gap-2 border-2 border-dashed border-muted-foreground/25 rounded-sm p-6 hover:border-muted-foreground/50 transition-colors cursor-pointer"
          onClick={() => !uploading && inputRef.current?.click()}
          data-interactive
        >
          {uploading ? (
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          ) : (
            <ImageIcon size={24} className="text-muted-foreground" />
          )}
          <p className="text-xs text-muted-foreground">
            {uploading
              ? "Uploading…"
              : "Click to choose images or drag & drop"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            JPEG, PNG, GIF, WebP, SVG · Max 5 MB each · Multiple allowed
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFilesChange}
            disabled={uploading}
          />
        </div>
      )}

      {/* Thumbnails */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((url, i) => (
            <div key={`${url}-${i}`} className="relative group">
              <Image
                src={url}
                alt={`Screenshot ${i + 1}`}
                width={120}
                height={75}
                className="rounded-sm object-cover border border-border"
                unoptimized
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                data-interactive
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {hint && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
