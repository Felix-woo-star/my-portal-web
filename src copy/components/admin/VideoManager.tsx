"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";

type VideoType = "SHORT" | "VIDEO";

interface VideoItem {
  id: string;
  type: VideoType;
  title: string;
  views: string;
  duration: string;
  thumbnail: string;
  url: string;
}

const DEFAULT_FORM: Partial<VideoItem> = {
  type: "VIDEO",
  title: "",
  views: "",
  duration: "",
  thumbnail: "bg-gradient-to-br from-blue-600 to-cyan-400",
  url: "",
};

export function VideoManager() {
  const { user } = useAuth();
  const [items, setItems] = useState<VideoItem[]>([]);
  const [form, setForm] = useState<Partial<VideoItem>>(DEFAULT_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (user?.username) {
      headers["x-username"] = user.username;
    }
    return headers;
  };

  const readError = async (res: Response, fallback: string) => {
    const data = await res.json().catch(() => null);
    if (data && typeof data.error === "string") {
      return data.error;
    }
    return fallback;
  };

  const fetchItems = async () => {
    const res = await fetch("/api/videos");
    if (!res.ok) return;
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const res = await fetch("/api/videos");
      if (!res.ok || !isMounted) return;
      const data = await res.json();
      if (isMounted) {
        setItems(Array.isArray(data) ? data : []);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.type || !form.title || !form.views || !form.duration || !form.thumbnail || !form.url) {
      alert("All fields are required.");
      return;
    }

    const method = editingId ? "PATCH" : "POST";
    const payload = editingId ? { ...form, id: editingId } : form;

    const res = await fetch("/api/videos", {
      method,
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert(await readError(res, "Save failed"));
      return;
    }

    resetForm();
    await fetchItems();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/videos?id=${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      alert(await readError(res, "Delete failed"));
      return;
    }

    await fetchItems();
  };

  const applySectionOrderLocally = (type: VideoType, nextSection: VideoItem[]) => {
    setItems((prev) => {
      const others = prev.filter((item) => item.type !== type);
      return [...others, ...nextSection];
    });
  };

  const persistSectionOrder = async (nextSection: VideoItem[]) => {
    const res = await fetch("/api/videos", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(nextSection.map((item, order) => ({ id: item.id, order }))),
    });

    if (!res.ok) {
      await fetchItems();
      alert(await readError(res, "Order update failed"));
    }
  };

  const reorderWithinType = async (type: VideoType, from: number, to: number) => {
    const section = items.filter((item) => item.type === type);
    if (to < 0 || to >= section.length) return;

    const nextSection = [...section];
    [nextSection[from], nextSection[to]] = [nextSection[to], nextSection[from]];

    applySectionOrderLocally(type, nextSection);
    await persistSectionOrder(nextSection);
  };

  const handleEdit = (item: VideoItem) => {
    setForm(item);
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const shorts = useMemo(() => items.filter((item) => item.type === "SHORT"), [items]);
  const videos = useMemo(() => items.filter((item) => item.type === "VIDEO"), [items]);

  const renderSection = (type: VideoType, title: string, sectionItems: VideoItem[]) => (
    <section className="space-y-4">
      <h3 className="text-xl font-bold">{title}</h3>
      {sectionItems.map((item, index) => (
        <Card key={item.id} className="bg-card/50 border-white/10">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex flex-col gap-1">
              <Button variant="ghost" size="icon" onClick={() => reorderWithinType(type, index, index - 1)} disabled={index === 0}>
                <GripVertical className="h-4 w-4 rotate-90" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => reorderWithinType(type, index, index + 1)}
                disabled={index === sectionItems.length - 1}
              >
                <GripVertical className="h-4 w-4 -rotate-90" />
              </Button>
            </div>

            <div className={"h-16 w-28 rounded border border-white/10 " + item.thumbnail} />

            <div className="flex-1 min-w-0">
              <h4 className="font-bold truncate">{item.title}</h4>
              <p className="text-xs text-muted-foreground truncate mt-1">{item.views} views • {item.duration}</p>
              <p className="text-xs text-muted-foreground truncate mt-1">{item.url}</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => handleEdit(item)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );

  return (
    <div className="space-y-8">
      <Card className="bg-card/50 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{editingId ? "Edit Video Item" : "Add Video Item"}</CardTitle>
          {editingId && (
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="mr-2 h-4 w-4" /> Cancel Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="h-10 rounded-md border border-input bg-secondary/50 px-3 text-sm"
              value={form.type ?? "VIDEO"}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as VideoType }))}
            >
              <option value="VIDEO">Recommended Video</option>
              <option value="SHORT">Short</option>
            </select>
            <Input
              placeholder="Title"
              value={form.title ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="bg-secondary/50"
            />
            <Input
              placeholder="Views (e.g. 1.2M)"
              value={form.views ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, views: e.target.value }))}
              className="bg-secondary/50"
            />
            <Input
              placeholder="Duration (e.g. 12:34 or LIVE)"
              value={form.duration ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
              className="bg-secondary/50"
            />
            <Input
              placeholder="Thumbnail class"
              value={form.thumbnail ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, thumbnail: e.target.value }))}
              className="bg-secondary/50"
            />
            <Input
              placeholder="Embed URL"
              value={form.url ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
              className="bg-secondary/50"
            />
          </div>

          <Button onClick={handleSave} className="w-full md:w-auto">
            {editingId ? (
              <>
                <Pencil className="mr-2 h-4 w-4" /> Update Item
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {renderSection("SHORT", "Trending Shorts", shorts)}
      {renderSection("VIDEO", "Recommended Videos", videos)}
    </div>
  );
}
