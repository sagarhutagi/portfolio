"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { markMessageRead } from "@/lib/actions";
import { toast } from "sonner";
import type { ContactSubmission } from "@/types";
import { Mail, MailOpen } from "lucide-react";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [selected, setSelected] = useState<ContactSubmission | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setMessages(data as ContactSubmission[]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = async (msg: ContactSubmission) => {
    if (msg.is_read) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    const result = await markMessageRead(session.access_token, msg.id);
    if (result.success) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
      );
      if (selected?.id === msg.id) {
        setSelected({ ...msg, is_read: true });
      }
    } else {
      toast.error("Failed to mark as read.");
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Messages</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Contact form submissions from your visitors.
      </p>

      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No messages yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ── Message List ── */}
          <div className="md:col-span-1 space-y-1 max-h-[70vh] overflow-y-auto">
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => {
                  setSelected(msg);
                  handleMarkRead(msg);
                }}
                className={`w-full text-left p-3 rounded-sm transition-colors duration-75 ${
                  selected?.id === msg.id
                    ? "bg-muted"
                    : "hover:bg-muted/50"
                }`}
                data-interactive
              >
                <div className="flex items-center gap-2 mb-1">
                  {msg.is_read ? (
                    <MailOpen size={12} className="text-muted-foreground" />
                  ) : (
                    <Mail size={12} className="text-[var(--accent-color)]" />
                  )}
                  <p className="text-sm font-medium truncate">{msg.name}</p>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {msg.email}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(msg.created_at).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>

          {/* ── Message Detail ── */}
          <div className="md:col-span-2">
            {selected ? (
              <div className="p-6 bg-card rounded-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold">{selected.name}</p>
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-sm text-[var(--accent-color)] hover:underline"
                      data-interactive
                    >
                      {selected.email}
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-line">
                  {selected.message}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                Select a message to view.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
