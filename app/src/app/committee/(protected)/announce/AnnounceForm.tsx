"use client";

import { useState } from "react";

type Template = { id: string; name: string; body: string | null };

export default function AnnounceForm({ templates }: { templates: Template[] }) {
  const [message, setMessage] = useState("");

  function applyTemplate(templateId: string) {
    const tpl = templates.find((t) => t.id === templateId);
    if (tpl?.body) setMessage(tpl.body);
  }

  async function copyForFacebook() {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      // clipboard access can fail outside a secure context - non-fatal
    }
  }

  const whatsappHref = message ? `https://wa.me/?text=${encodeURIComponent(message)}` : "#";

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      {templates.length > 0 && (
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600 dark:text-slate-400">Start from template</span>
          <select
            defaultValue=""
            onChange={(e) => applyTemplate(e.target.value)}
            className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="">— None —</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {templates.length === 0 && (
        <p className="text-sm text-amber-700 dark:text-amber-400">
          No announcement templates yet - write one on the{" "}
          <a href="/committee/templates" className="underline">
            Templates
          </a>{" "}
          page, or just type your message below.
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">Message</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="e.g. This week's competition is cancelled due to weather."
          className="rounded border border-slate-300 bg-white px-3 py-2 text-base dark:border-slate-700 dark:bg-slate-800"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!message}
          onClick={(e) => {
            if (!message) e.preventDefault();
          }}
          className="rounded bg-green-600 px-4 py-3 text-center font-medium text-white hover:bg-green-500 aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          Share to WhatsApp
        </a>
        <button
          type="button"
          onClick={copyForFacebook}
          disabled={!message}
          className="rounded bg-blue-700 px-4 py-3 font-medium text-white hover:bg-blue-600 disabled:opacity-50"
        >
          Copy caption for Facebook
        </button>
      </div>
    </div>
  );
}
