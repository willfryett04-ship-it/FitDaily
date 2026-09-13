"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const categories = ["top", "bottom", "dress", "outerwear", "shoes", "accessory", "other"] as const;
type Category = (typeof categories)[number];
type Analysis = { name: string; category: Category; color: string; seasons: string[]; occasions: string[]; description: string };

export function AddItemForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("top");
  const [color, setColor] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
    setImagePath(null);
    setAnalysis(null);
    setMessage(null);
  }

  async function takePhoto() {
    setMessage(null);
    try {
      const photo = await Camera.getPhoto({
        quality: 85,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
      });
      if (!photo.webPath) throw new Error("We could not use that photo.");

      const response = await fetch(photo.webPath);
      const blob = await response.blob();
      setFile(new File([blob], `wardrobe-${Date.now()}.jpg`, { type: blob.type || "image/jpeg" }));
      setImagePath(null);
      setAnalysis(null);
    } catch (error) {
      // Closing the native camera sheet is not an error worth showing to the user.
      if (error instanceof Error && !/cancel/i.test(error.message)) setMessage(error.message);
    }
  }

  async function uploadImage() {
    if (!file) throw new Error("Choose a photo first.");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Use a JPG, PNG, or WebP image.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Choose an image smaller than 5 MB.");
    if (imagePath) return imagePath;

    const supabase = createClient();
    const { data: auth, error: authError } = await supabase.auth.getClaims();
    const userId = auth?.claims?.sub;
    if (authError || typeof userId !== "string") throw new Error("Your session has expired. Please sign in again.");
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("wardrobe").upload(path, file, { contentType: file.type });
    if (error) throw new Error(error.message);
    setImagePath(path);
    return path;
  }

  async function analyse() {
    setIsAnalysing(true);
    setMessage(null);
    try {
      const path = await uploadImage();
      const response = await fetch("/api/wardrobe/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imagePath: path }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not analyse that photo.");
      const suggestion = result as Analysis;
      setAnalysis(suggestion);
      setName(suggestion.name);
      setCategory(suggestion.category);
      setColor(suggestion.color);
      setMessage("Suggestions are ready. Review them, then save your item.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not analyse that photo.");
    } finally {
      setIsAnalysing(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const path = await uploadImage();
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getClaims();
      const userId = auth?.claims?.sub;
      if (typeof userId !== "string") throw new Error("Your session has expired. Please sign in again.");
      const { error } = await supabase.from("clothing_items").insert({ user_id: userId, name, category, color: color || null, image_path: path, seasons: analysis?.seasons ?? [], occasions: analysis?.occasions ?? [], ai_metadata: analysis ?? {} });
      if (error) throw new Error(error.message);
      event.currentTarget.reset();
      setFile(null); setImagePath(null); setName(""); setCategory("top"); setColor(""); setAnalysis(null);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not add that item.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="grid gap-4 rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-6 sm:grid-cols-2">
      <label className="sm:col-span-2"><span className="mb-2 block text-sm font-medium">Clothing photo</span><input onChange={chooseFile} accept="image/jpeg,image/png,image/webp" type="file" className="block w-full text-sm" />{Capacitor.isNativePlatform() && <Button type="button" onClick={takePhoto} variant="outline" className="mt-3 rounded-xl">Take or choose a photo</Button>}{file && <span className="mt-2 block text-sm text-[#6f655d]">{file.name}</span>}</label>
      <div className="sm:col-span-2"><Button type="button" onClick={analyse} disabled={!file || isAnalysing || isSaving} variant="outline" className="rounded-xl">{isAnalysing ? "Analysing…" : "✨ Suggest details with AI"}</Button></div>
      {analysis && <p className="sm:col-span-2 rounded-xl bg-[#efe9e1] p-3 text-sm text-[#544b43]">{analysis.description}</p>}
      <label><span className="mb-2 block text-sm font-medium">Name</span><input value={name} onChange={(event) => setName(event.target.value)} required maxLength={120} placeholder="Black linen shirt" className="h-11 w-full rounded-xl border border-[#d7cec5] bg-white px-3" /></label>
      <label><span className="mb-2 block text-sm font-medium">Category</span><select value={category} onChange={(event) => setCategory(event.target.value as Category)} className="h-11 w-full rounded-xl border border-[#d7cec5] bg-white px-3">{categories.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}</select></label>
      <label><span className="mb-2 block text-sm font-medium">Main colour <em className="font-normal text-[#766b61]">optional</em></span><input value={color} onChange={(event) => setColor(event.target.value)} maxLength={40} placeholder="Black" className="h-11 w-full rounded-xl border border-[#d7cec5] bg-white px-3" /></label>
      <div className="flex items-end"><Button type="submit" disabled={!file || !name || isSaving || isAnalysing} className="h-11 w-full rounded-xl bg-[#302a25] text-white hover:bg-[#4a4037]">{isSaving ? "Adding…" : "Add to wardrobe"}</Button></div>
      {message && <p role="status" className="sm:col-span-2 rounded-xl bg-[#efe9e1] p-3 text-sm text-[#544b43]">{message}</p>}
    </form>
  );
}
