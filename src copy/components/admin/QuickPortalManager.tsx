"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";

interface QuickPortal {
  id: string;
  name: string;
  href: string;
  description: string;
  color: string;
  iconKey: string;
}

const ICON_KEYS = [
  "search",
  "youtube",
  "instagram",
  "facebook",
  "twitter",
  "twitch",
  "film",
  "globe",
  "message-circle",
];

const DEFAULT_FORM: Partial<QuickPortal> = {
  name: "",
  href: "",
  description: "",
  color: "bg-[#03C75A]",
  iconKey: "globe",
};

export function QuickPortalManager() {
  const { user } = useAuth();
  const [portals, setPortals] = useState<QuickPortal[]>([]);
  const [form, setForm] = useState<Partial<QuickPortal>>(DEFAULT_FORM);
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

  const fetchPortals = async () => {
    const res = await fetch("/api/portals");
    if (!res.ok) return;
    const data = await res.json();
    setPortals(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const res = await fetch("/api/portals");
      if (!res.ok || !isMounted) return;
      const data = await res.json();
      if (isMounted) {
        setPortals(Array.isArray(data) ? data : []);
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
    if (!form.name || !form.href || !form.description || !form.color || !form.iconKey) {
      alert("All fields are required.");
      return;
    }

    const method = editingId ? "PATCH" : "POST";
    const payload = editingId ? { ...form, id: editingId } : form;

    const res = await fetch("/api/portals", {
      method,
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert(await readError(res, "Save failed"));
      return;
    }

    resetForm();
    await fetchPortals();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/portals?id=${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      alert(await readError(res, "Delete failed"));
      return;
    }
    await fetchPortals();
  };

  const updateOrder = async (next: QuickPortal[]) => {
    setPortals(next);
    const updates = next.map((portal, order) => ({ id: portal.id, order }));

    const res = await fetch("/api/portals", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      await fetchPortals();
      alert(await readError(res, "Order update failed"));
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const next = [...portals];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    await updateOrder(next);
  };

  const handleMoveDown = async (index: number) => {
    if (index >= portals.length - 1) return;
    const next = [...portals];
    [next[index + 1], next[index]] = [next[index], next[index + 1]];
    await updateOrder(next);
  };

  const handleEdit = (portal: QuickPortal) => {
    setForm(portal);
    setEditingId(portal.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      <Card className="bg-card/50 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{editingId ? "Edit Quick Portal" : "Add Quick Portal"}</CardTitle>
          {editingId && (
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="mr-2 h-4 w-4" /> Cancel Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Name"
              value={form.name ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="bg-secondary/50"
            />
            <Input
              placeholder="URL"
              value={form.href ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, href: e.target.value }))}
              className="bg-secondary/50"
            />
            <Input
              placeholder="Description"
              value={form.description ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="bg-secondary/50"
            />
            <Input
              placeholder="Background class (e.g. bg-[#03C75A])"
              value={form.color ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
              className="bg-secondary/50"
            />
            <Input
              placeholder="Icon key"
              list="icon-keys"
              value={form.iconKey ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, iconKey: e.target.value }))}
              className="bg-secondary/50"
            />
            <datalist id="icon-keys">
              {ICON_KEYS.map((key) => (
                <option key={key} value={key} />
              ))}
            </datalist>
          </div>

          <Button onClick={handleSave} className="w-full md:w-auto">
            {editingId ? (
              <>
                <Pencil className="mr-2 h-4 w-4" /> Update Portal
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Add Portal
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-bold">Current Quick Portals</h3>
        {portals.map((portal, index) => (
          <Card key={portal.id} className="bg-card/50 border-white/10">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex flex-col gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleMoveUp(index)} disabled={index === 0}>
                  <GripVertical className="h-4 w-4 rotate-90" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === portals.length - 1}
                >
                  <GripVertical className="h-4 w-4 -rotate-90" />
                </Button>
              </div>

              <div className={`h-16 w-16 rounded ${portal.color} border border-white/10`} />

              <div className="flex-1 min-w-0">
                <h4 className="font-bold truncate">{portal.name}</h4>
                <p className="text-sm text-muted-foreground truncate">{portal.description}</p>
                <p className="text-xs text-muted-foreground truncate mt-1">{portal.href}</p>
                <p className="text-xs text-muted-foreground/80 mt-1">icon: {portal.iconKey}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => handleEdit(portal)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(portal.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
