/* eslint-disable */
"use client";
import { API_ORIGIN } from "@/config/runtime";

import { FormEvent, useState } from "react";
import { ImagePlus, Loader2, Mail, MessageSquare, Phone, Send, X } from "lucide-react";

const API_BASE = API_ORIGIN;

type ContactForm = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  photoDataUrl: string;
};

const initialForm: ContactForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  photoDataUrl: "",
};

export function ContactUsForm() {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [photoName, setPhotoName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const updateField = (field: keyof ContactForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handlePhoto = (file?: File) => {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError("Please upload a photo smaller than 3 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateField("photoDataUrl", String(reader.result || ""));
      setPhotoName(file.name);
    };
    reader.onerror = () => setError("Photo could not be read. Please try another image.");
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (form.name.trim().length < 2 || form.subject.trim().length < 3 || form.message.trim().length < 10) {
      setError("Please fill your name, problem type, and full problem details.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.phone.replace(/\D/g, "").length < 8) {
      setError("Please enter a valid phone number for a support call.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/support/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
          photoDataUrl: form.photoDataUrl,
        }),
      });

      if (!response.ok) throw new Error("Unable to submit contact request.");

      setSent(true);
      setForm(initialForm);
      setPhotoName("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Support request could not be sent. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-white px-6 py-12 text-center shadow-xl shadow-slate-900/5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Send className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-950">Request sent to support</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          Your phone number, message, and uploaded photo are now visible in the support management queue.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 rounded-full bg-rose-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-500"
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
      <div className="border-b border-slate-100 px-6 py-6">
        <p className="text-xs font-bold uppercase tracking-widest text-rose-500">Contact Us</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Tell support what happened</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Add your phone number for a callback, your email for updates, a photo if needed, and the full problem details for the support team.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">
            Full Name
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Your name"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Email
            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="you@email.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-normal text-slate-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
              />
            </div>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">
            Call Number
            <div className="relative mt-2">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-normal text-slate-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
              />
            </div>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Problem Type
            <input
              value={form.subject}
              onChange={(event) => updateField("subject", event.target.value)}
              placeholder="Payment, account, safety..."
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
            />
          </label>
        </div>

        <label className="block text-sm font-semibold text-slate-700">
          Problem Photo
          <div className="mt-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <input
              id="support-photo"
              type="file"
              accept="image/*"
              onChange={(event) => handlePhoto(event.target.files?.[0])}
              className="hidden"
            />
            {form.photoDataUrl ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <img src={form.photoDataUrl} alt="Uploaded support evidence" className="h-28 w-28 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{photoName || "Photo attached"}</p>
                  <p className="mt-1 text-xs text-slate-500">This photo will be shown with your support ticket.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateField("photoDataUrl", "");
                    setPhotoName("");
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:text-rose-600"
                  aria-label="Remove uploaded photo"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <label htmlFor="support-photo" className="flex cursor-pointer items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-rose-500 shadow-sm">
                  <ImagePlus className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-800">Upload a photo</span>
                  <span className="block text-xs font-normal text-slate-500">PNG/JPG up to 3 MB</span>
                </span>
              </label>
            )}
          </div>
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          Message Box
          <div className="relative mt-2">
            <MessageSquare className="pointer-events-none absolute left-3 top-4 h-4 w-4 text-slate-400" />
            <textarea
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
              rows={5}
              placeholder="Write the full problem so support can understand and reply quickly..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-normal text-slate-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
            />
          </div>
        </label>

        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition hover:from-rose-400 hover:to-pink-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          {submitting ? "Sending to support..." : "Send to Support"}
        </button>
      </form>
    </div>
  );
}
