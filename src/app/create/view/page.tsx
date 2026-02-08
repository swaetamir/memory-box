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
            theme detected: sisterhood &amp; gratitude
          </div>
          <div className="absolute left-[67px] top-[65px] font-gambarino text-[25px]">
            34 others have created boxes like this...
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
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
                copiedTimerRef.current = window.setTimeout(() => setCopied(false), 1200);

                // sent page nav
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