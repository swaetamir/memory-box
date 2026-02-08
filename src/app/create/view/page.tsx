"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BoxCanvas from "@/components/box/BoxCanvas";
import GiftBox from "@/components/GiftBox";

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

function hashStringToInt(str: string) {
    // simple deterministic hash (stable)
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

export default function ViewBoxPage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef<number | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const isSent = searchParams.get("sent") === "1";
  const isCommunity = searchParams.get("community") === "1";

  const contentText = useMemo(() => {
    const noteText = notes.map((n) => n.text ?? "").join(" ");
    // include song URLs as weak signals 
    const songText = songs.map((s) => s.embedUrl ?? "").join(" ");
    return `${noteText} ${songText}`.trim();
  }, [notes, songs]);
  
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
    <main className="relative min-h-screen bg-[#101B36] text-white overflow-hidden">
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
            <Link href="/create/add">send another →</Link>
          </div>
          <div className="absolute left-[1400px] top-[880px] font-gambarino text-[25px] hover:opacity-80">
            <Link href="/create/view?community=1">see community boxes →</Link>
          </div>
        </>
      )}

      {/* hide the normal view content when showing sent page*/}
      {(isSent || isCommunity) && null}

      {!isSent && !isCommunity && (
        <>
          {/* top left text */}
          <div className="absolute left-[66px] top-[30px] font-gambarino text-[25px]">
            theme detected: {theme}
          </div>
          <div className="absolute left-[67px] top-[65px] font-gambarino text-[25px]">
            {others} others have created boxes like this...
          </div>

          {/* final rendered box */}
          <div className="absolute left-[420px] top-[180px]">
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

          {/* final CTA */}
          <button
            type="button"
            onClick={async () => {
                try {
                  const id = crypto.randomUUID();
              
                  // store a shareable snapshot (receiver will read this)
                  localStorage.setItem(
                    `${SHARE_PREFIX}${id}`,
                    JSON.stringify({ notes, photos, songs })
                  );
              
                  const receiverUrl = `${window.location.origin}/receive/${id}`;
                  await navigator.clipboard.writeText(receiverUrl);
              
                  setCopied(true);
                  if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
                  copiedTimerRef.current = window.setTimeout(() => setCopied(false), 1200);
              
                  window.setTimeout(() => {
                    router.push("/create/view?sent=1");
                  }, 250);
                } catch {
                  // ignore
                }
              }}
            className="absolute left-[1410px] top-[857px] text-left hover:opacity-80"
          >
            <div className="font-gambarino text-[30px] leading-none">
              {copied ? "copied!" : "send via link →"}
            </div>
            <div
              className={`mt-1 border-t-[2px] border-white transition-all duration-100 ${
                copied ? "w-0 opacity-0" : "w-[205px] opacity-100"
              }`}
            />
          </button>
        </>
      )}
    </main>
  );
}