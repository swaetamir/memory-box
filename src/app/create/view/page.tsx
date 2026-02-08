"use client";

import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BoxCanvas from "@/components/box/BoxCanvas";
import GiftBox from "@/components/GiftBox";
import Stage from "@/components/Stage";

type NoteItem = {
  id: string;
  type: "note";
  text: string;
  x: number;
  y: number;
  z: number;
  rotationDeg: number;
};

type PhotoItem = {
  id: string;
  type: "photo";
  src: string; // data URL
  x: number;
  y: number;
  z: number;
  rotationDeg: number;
};

type SongItem = {
  id: string;
  type: "song";
  embedUrl: string;
  x: number;
  y: number;
  z: number;
};

const STORAGE_KEY = "memory-box:draft:add";
const SHARE_PREFIX = "memory-box:box:";

async function copyToClipboard(text: string) {
  // picks modern Clipboard API when available + secure
  if (typeof window !== "undefined" && window.isSecureContext && navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // fallback for browsers/contexts where clipboard API is blocked
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "true");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  ta.style.top = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(ta);
  if (!ok) throw new Error("Clipboard blocked");
}

function hashStringToInt(str: string) {
    // simple deterministic hash 
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }
  
  function detectThemeFromText(text: string): { theme: string; others: number } {
    const t = text.toLowerCase();
  
    const themes: {
      key: string;
      label: string;
      keywords: string[];
      min: number;
      max: number;
    }[] = [
        {
          key: "family",
          label: "family & home",
          keywords: [
            "mom",
            "mother",
            "dad",
            "father",
            "parents",
            "family",
            "brother",
            "sister",
            "siblings",
            "aunt",
            "uncle",
            "cousin",
            "grandma",
            "grandmother",
            "grandpa",
            "grandfather",
            "home",
          ],
          min: 20,
          max: 110,
        },
        {
          key: "love",
          label: "love & romance",
          keywords: [
            "i love you",
            "love u",
            "my love",
            "babe",
            "baby",
            "bf",
            "girlfriend",
            "boyfriend",
            "husband",
            "wife",
            "partner",
            "soulmate",
            "forever",
            "kiss",
            "date",
            "crush",
            "valentine",
          ],
          min: 18,
          max: 105,
        },
        {
          key: "friendship",
          label: "friendship & chosen family",
          keywords: [
            "friend",
            "friends",
            "friendship",
            "bestie",
            "best friend",
            "roommate",
            "girls night",
            "group chat",
            "crew",
            "squad",
            "the girls",
            "hangout",
          ],
          min: 28,
          max: 140,
        },
        {
          key: "sisterhood",
          label: "sisterhood & best friends by choice",
          keywords: [
            "sisterhood",
            "girlhood",
            "girls supporting girls",
            "women supporting women",
            "we got this",
            "together",
            "our",
            "we",
            "us",
          ],
          min: 30,
          max: 150,
        },
        {
          key: "gratitude",
          label: "gratitude & appreciation",
          keywords: ["thank", "grateful", "gratitude", "appreciate", "appreciation", "<3"],
          min: 24,
          max: 92,
        },
        {
          key: "longing",
          label: "longing & missing",
          keywords: ["miss", "missing", "wish you were", "i wish", "distance", "apart", "miss us", "think about you"],
          min: 18,
          max: 80,
        },
        {
          key: "grief",
          label: "grief & remembrance",
          keywords: ["rest in peace", "rip", "passed", "loss", "gone", "grief", "funeral", "remember"],
          min: 10,
          max: 60,
        },
        {
          key: "heartbreak",
          label: "heartbreak & letting go",
          keywords: ["ex", "breakup", "broken", "hurt", "goodbye", "let go", "moving on", "i miss you", "i still think about you"],
          min: 22,
          max: 100,
        },
        {
          key: "celebration",
          label: "celebration & proud of you",
          keywords: ["congrats", "proud", "celebrate", "birthday", "graduation", "achievement", "you did it", "congratulations", "you deserve this"],
          min: 16,
          max: 70,
        },
        {
          key: "comfort",
          label: "comfort",
          keywords: ["you got this", "i’m here", "here for you", "breathe", "safe"],
          min: 14,
          max: 75,
        },
        {
          key: "nostalgia",
          label: "nostalgia & memories",
          keywords: ["remember when", "back then", "nostalgia", "throwback", "old", "again"],
          min: 12,
          max: 65,
        },
      ];
  
    let bestLabel = "connection & memories";
    let bestMin = 18;
    let bestMax = 88;
    let bestScore = 0;
  
    for (const th of themes) {
      let score = 0;
      for (const kw of th.keywords) {
        if (t.includes(kw)) score += 2;
      }
      if (th.key === "sisterhood" && (t.includes(" we ") || t.includes(" us "))) score += 1;
  
      if (score > bestScore) {
        bestScore = score;
        bestLabel = th.label;
        bestMin = th.min;
        bestMax = th.max;
      }
    }
  
    // others
    const h = hashStringToInt(t);
    const others = bestMin + (h % (bestMax - bestMin + 1));
    
  
    return { theme: bestLabel, others };
  }

  function ViewBoxInner() {
    const [notes, setNotes] = useState<NoteItem[]>([]);
    const [photos, setPhotos] = useState<PhotoItem[]>([]);
    const [songs, setSongs] = useState<SongItem[]>([]);
    const [copied, setCopied] = useState(false);
    const [shareUrl, setShareUrl] = useState<string>("");
    const [copyError, setCopyError] = useState<string>("");
    const [sending, setSending] = useState(false);
    const [createdBoxId, setCreatedBoxId] = useState<string>("");
  
    const copiedTimerRef = useRef<number | null>(null); 
  
    const router = useRouter();
    const searchParams = useSearchParams();
    const isSent = searchParams.get("sent") === "1";
    const isCommunity = searchParams.get("community") === "1";
  
    const handleManualCopy = useCallback(async () => {
      if (!shareUrl) return;
      try {
        setCopyError("");
        await copyToClipboard(shareUrl);
        setCopied(true);
        if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
        copiedTimerRef.current = window.setTimeout(() => setCopied(false), 1200);
  
        window.setTimeout(() => {
          router.push("/create/view?sent=1");
        }, 650);
      } catch {
        setCopyError("Copy blocked — click the link field, press ⌘C, then try the copy button again.");
      }
    }, [shareUrl, router]);


  const contentText = useMemo(() => {
    const noteText = notes.map((n) => n.text ?? "").join(" ");
    // include song URLs as weak signals 
    const songText = songs.map((s) => s.embedUrl ?? "").join(" ");
    return `${noteText} ${songText}`.trim();
  }, [notes, songs]);

  const hasContent = notes.length > 0 || photos.length > 0 || songs.length > 0;
  
  const { theme, others } = useMemo(() => detectThemeFromText(contentText), [contentText]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as {
        notes?: Partial<NoteItem>[];
        photos?: Partial<PhotoItem>[];
        songs?: Partial<SongItem>[];
      };

      if (parsed?.notes) {
        setNotes(
          parsed.notes.map((n) => ({
            id: n.id ?? crypto.randomUUID(),
            type: "note",
            text: n.text ?? "",
            x: typeof n.x === "number" ? n.x : 24,
            y: typeof n.y === "number" ? n.y : 24,
            z: typeof n.z === "number" ? n.z : 1,
            rotationDeg:
              typeof (n as any).rotationDeg === "number" ? (n as any).rotationDeg : 8,
          }))
        );
      }

      if (parsed?.photos) {
        setPhotos(
          parsed.photos.map((p) => ({
            id: p.id ?? crypto.randomUUID(),
            type: "photo",
            src: typeof p.src === "string" ? p.src : "",
            x: typeof p.x === "number" ? p.x : 40,
            y: typeof p.y === "number" ? p.y : 40,
            z: typeof p.z === "number" ? p.z : 1,
            rotationDeg:
              typeof (p as any).rotationDeg === "number" ? (p as any).rotationDeg : 8,
          }))
        );
      }

      if (parsed?.songs) {
        setSongs(
          parsed.songs.map((s) => ({
            id: s.id ?? crypto.randomUUID(),
            type: "song",
            embedUrl: typeof s.embedUrl === "string" ? s.embedUrl : "",
            x: typeof s.x === "number" ? s.x : 60,
            y: typeof s.y === "number" ? s.y : 320,
            z: typeof s.z === "number" ? s.z : 1,
          }))
        );
      }
    } catch {
      // ignore
    }
    return () => {
      if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
    };
  }, []);

  return (
    <Stage baseWidth={1728} baseHeight={960}>
      <main className="relative w-full h-full bg-[#101B36] text-white overflow-hidden">
      {/* community placeholder */}
      {isCommunity && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="font-gambarino text-[48px]">community boxes</div>
          <div className="font-gambarino text-[24px] opacity-80">
            coming next…
          </div>
          <Link href="/create/view" className="font-gambarino text-[24px] underline">
            ← back to your box
          </Link>
        </div>
      )}

      {/* sent confirmation screen */}
      {isSent && !isCommunity && (
        <>
          <div className="absolute left-[740px] top-[550px] font-gambarino text-[36px]">
            your box was sent.
          </div>

          {/* giftbox component */}
          <div
            className="absolute left-[720px] top-[300px] origin-top-left"
            style={{ transform: "scale(0.45)" }}
            >
            <GiftBox />
            </div>

          <div className="absolute left-[1400px] top-[840px] font-gambarino text-[25px] hover:opacity-80">
            <Link href="/create/">send another →</Link>
          </div>
          <div className="absolute left-[1400px] top-[880px] font-gambarino text-[20px] opacity-40">
             see community boxes (coming soon)
          </div>
        </>
      )}

      {/* hide normal view content when showing sent page*/}
      {(isSent || isCommunity) && null}

      {!isSent && !isCommunity && (
        <>
          {/* top left text (only when content exists) */}
          {hasContent ? (
            <>
              <div className="absolute left-[66px] top-[30px] font-gambarino text-[25px]">
                theme detected: {theme}
              </div>
              <div className="absolute left-[67px] top-[65px] font-gambarino text-[25px]">
                {others} others have created boxes like this...
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="font-gambarino text-[36px] opacity-90">your box is empty!</div>
              <div className="font-gambarino text-[18px] opacity-70">go back and add a note, photo, or song.</div>
              <Link
                href="/create"
                className="font-gambarino text-[22px] underline hover:opacity-80"
              >
                ← go back
              </Link>
            </div>
          )}

          {/* final rendered box */}
          {hasContent ? (
            <div className="absolute left-[420px] top-[180px] pointer-events-none">
              <BoxCanvas>
              {/* notes */}
              {notes.map((note) => (
                <div
                  key={note.id}
                  style={{
                    zIndex: note.z,
                    transform: `translate(${note.x}px, ${note.y}px)`,
                  }}
                  className="absolute"
                >
                  <div
                    style={{
                      transform: `rotate(${note.rotationDeg}deg)`,
                      transformOrigin: "top left",
                      background: "#F3E1AE",
                      boxShadow: "10px 12px 4px rgba(0, 0, 0, 0.25)",
                    }}
                    className="w-[208px] min-h-[180px] p-4 font-gambarino text-black"
                  >
                    <div className="whitespace-pre-wrap text-[16px] leading-snug">
                      {note.text}
                    </div>
                  </div>
                </div>
              ))}

              {/* photos */}
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  style={{
                    zIndex: photo.z,
                    transform: `translate(${photo.x}px, ${photo.y}px)`,
                  }}
                  className="absolute"
                >
                  <div
                    style={{
                      transform: `rotate(${photo.rotationDeg}deg)`,
                      transformOrigin: "top left",
                      boxShadow: "10px 12px 4px rgba(0, 0, 0, 0.25)",
                    }}
                    className="w-[240px]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.src}
                      alt="Photo"
                      className="block w-full h-auto select-none"
                      draggable={false}
                    />
                  </div>
                </div>
              ))}

              {songs.map((song) => (
                <div
                  key={song.id}
                  style={{
                    zIndex: song.z,
                    transform: `translate(${song.x}px, ${song.y}px)`,
                  }}
                  className="absolute w-[340px]"
                >
                  <div className="overflow-hidden rounded-md shadow-[10px_12px_4px_rgba(0,0,0,0.25)]">
                    <iframe
                      src={song.embedUrl}
                      width="100%"
                      height="152"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      style={{ border: 0 }}
                      title="Spotify embed"
                    />
                  </div>
                </div>
              ))}
              </BoxCanvas>
            </div>
          ) : null}

          {/* final CTA */}
          {!shareUrl ? (
            <button
              type="button"
              disabled={sending}
              onClick={async () => {
                try {
                  setCopyError("");
                  setCopied(false);
                  setShareUrl("");
                  setCreatedBoxId("");
                  setSending(true);

                  const res = await fetch("/api/boxes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ payload: { notes, photos, songs } }),
                  });

                  const json = await res.json();
                  if (!res.ok) throw new Error(json?.error ?? "Failed to create box");

                  const receiverUrl = `${window.location.origin}/receive/${json.id}`;
                  setCreatedBoxId(json.id);
                  setShareUrl(receiverUrl);
                } catch (e: any) {
                  console.error("SEND FAILED:", e);
                  alert(`Send failed: ${e?.message ?? "unknown error"}`);
                } finally {
                  setSending(false);
                }
              }}
              className="absolute left-[1410px] top-[830px] z-50 text-left hover:opacity-80 disabled:opacity-50"
            >
              <div className="inline-block">
                <div className="font-gambarino text-[30px] leading-none">
                    {sending ? "creating…" : "send via link →"}
                </div>
                <div className="mt-1 w-full border-t-[2px] border-white" />
                </div>
            </button>
          ) : null}
          {shareUrl ? (
            <div className="absolute left-[1300px] top-[840px] w-[400px] font-gambarino z-50">
              <div className="text-[13px] opacity-80 mb-0.1">link:</div>
              <div className="flex gap-2">
                <input
                  value={shareUrl}
                  readOnly
                  onClick={(e) => (e.currentTarget as HTMLInputElement).select()}
                  className="flex-1 rounded-md bg-white/10 px-2 py-2 text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleManualCopy}
                  className="rounded-md bg-white/10 px-2 py-2 hover:bg-white/15"
                >
                  copy
                </button>
              </div>
              {copyError ? <div className="mt-2 text-[12px] opacity-80">{copyError}</div> : null}
            </div>
          ) : null}
        </>
      )}
      </main>
    </Stage>
  );
}

export default function ViewBoxPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#101B36] text-white flex items-center justify-center font-gambarino text-2xl">
          loading…
        </main>
      }
    >
      <ViewBoxInner />
    </Suspense>
  );
}