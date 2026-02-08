"use client";

import { useEffect, useState } from "react";
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
  src: string; // data URL
  x: number;
  y: number;
  z: number;
  rotationDeg: number;
};

const STORAGE_KEY = "memory-box:draft:add";

export default function ViewBoxPage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as {
        notes?: Partial<NoteItem>[];
        photos?: Partial<PhotoItem>[];
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
    } catch {
      // ignore
    }
  }, []);

  return (
    <main className="relative min-h-screen bg-[#101B36] text-white overflow-hidden">
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
        </BoxCanvas>
      </div>

      {/* final CTA */}
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(window.location.href);
          } catch {}
        }}
        className="absolute left-[1410px] top-[857px] text-left hover:opacity-80"
      >
        <div className="font-gambarino text-[30px] leading-none">
          send via link →
        </div>
        <div className="mt-1 w-[205px] border-t-[2px] border-white" />
      </button>
    </main>
  );
}