"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import GiftBox from "@/components/GiftBox";
import BoxCanvas from "@/components/box/BoxCanvas";

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
  src: string;
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


export default function ReceivePage() {
  const [opened, setOpened] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [songs, setSongs] = useState<SongItem[]>([]);

  const params = useParams();
  const shareId = typeof params?.id === "string" ? params.id : "";

  // load the same draft for demo (later: fetch by id)
  useEffect(() => {
    try {
        const raw =
        (shareId ? localStorage.getItem(`${SHARE_PREFIX}${shareId}`) : null) ??
        localStorage.getItem(STORAGE_KEY);
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
  }, [shareId]);

  useEffect(() => {
    if (!opened) {
      setAnimateIn(false);
      return;
    }

    const raf = requestAnimationFrame(() => setAnimateIn(true));
    return () => cancelAnimationFrame(raf);
  }, [opened]);

  return (
    <main className="relative min-h-screen bg-[#101B36] text-white overflow-hidden">
      {!opened ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => {
              setAnimateIn(false);
              setOpened(true);
            }}
            className="hover:opacity-90 active:opacity-80"
            aria-label="Open the box"
          >
            <div style={{ transform: "scale(0.9)" }}>
              <GiftBox />
            </div>
          </button>

          <div className="font-gambarino text-[28px] opacity-90">
            someone made this for you.
          </div>
          <div className="font-gambarino text-[18px] opacity-60">
            click to open
          </div>
        </div>
      ) : (
        <>
          {/* receiver */}
          <div
            className={
              "absolute left-[420px] top-[180px] transform-gpu transition-transform duration-700 ease-out " +
              (animateIn ? "rotate-0 translate-y-0" : "rotate-[-3deg] translate-y-6")
            }
          >
            <BoxCanvas>
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

          {/* footer */}
          <div className="absolute left-[66px] bottom-[40px] font-gambarino text-[20px] opacity-70">
            made with memory box
          </div>
        </>
      )}
    </main>
  );
}