"use client";

import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Button } from "@/components/ui/button";

const notificationId = 1042;

export function ReminderPreferences({ initialEnabled, initialTime }: { initialEnabled: boolean; initialTime: string }) {
  const [enabled, setEnabled] = useState(initialEnabled); const [time, setTime] = useState(initialTime.slice(0, 5));
  const [saving, setSaving] = useState(false); const [message, setMessage] = useState<string | null>(null);
  async function save() {
    setSaving(true); setMessage(null);
    try {
      if (Capacitor.isNativePlatform()) {
        if (enabled) {
          const permissions = await LocalNotifications.requestPermissions();
          if (permissions.display !== "granted") throw new Error("Allow notifications in your iPhone settings to turn on reminders.");
          const [hour, minute] = time.split(":").map(Number);
          await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
          await LocalNotifications.schedule({ notifications: [{ id: notificationId, title: "Style Set", body: "Your outfit suggestion is ready.", schedule: { on: { hour, minute }, repeats: true } }] });
        } else await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
      }
      const response = await fetch("/api/reminders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled, time }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "We could not save your reminder.");
      setMessage(Capacitor.isNativePlatform() && enabled ? "Your daily iPhone reminder is on." : enabled ? "Reminder saved. Turn it on from the Style Set iPhone app to receive phone alerts." : "Daily reminder turned off.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "We could not save your reminder."); } finally { setSaving(false); }
  }
  return <section className="mt-5 rounded-3xl border border-[#e5ddd5] bg-[#fcfbf9] p-6"><p className="text-xs font-medium tracking-[0.14em] text-[#766b61]">DAILY REMINDER</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Get ready with less guesswork.</h2><p className="mt-2 text-sm leading-6 text-[#6f655d]">Choose when Style Set should remind you to check your outfit.</p><div className="mt-5 flex flex-wrap items-end gap-4"><label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} className="size-4 accent-[#302a25]" />Send my daily reminder</label><label className="grid gap-2 text-sm font-medium">Time<input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="h-11 rounded-xl border border-[#d7cec5] bg-white px-3" /></label><Button onClick={save} disabled={saving} className="h-11 rounded-xl bg-[#302a25] text-white hover:bg-[#4a4037]">{saving ? "Saving…" : "Save reminder"}</Button></div>{message && <p role="status" className="mt-4 rounded-xl bg-[#efe9e1] p-3 text-sm text-[#544b43]">{message}</p>}</section>;
}
