"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
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


function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function DraggableNote({
  note,
  bringToFront,
  moveNote,
  updateText,
  deleteNote,
  rotateNote,
}: {
  note: NoteItem;
  bringToFront: (id: string) => void;
  moveNote: (id: string, x: number, y: number) => void;
  updateText: (id: string, text: string) => void;
  deleteNote: (id: string) => void;
  rotateNote: (id: string, rotationDeg: number) => void;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <Draggable
      nodeRef={nodeRef}
      bounds="parent"
      position={{ x: note.x, y: note.y }}
      onStart={() => bringToFront(note.id)}
      onDrag={(e: DraggableEvent, data: DraggableData) => {
        // hold alt option to rotate for now
        const alt = (e as any)?.altKey === true;
        if (alt) {
          const next = note.rotationDeg + data.deltaX * 0.5;
          rotateNote(note.id, next);
        }
      }}
      onStop={(e: DraggableEvent, data: DraggableData) => {
        const alt = (e as any)?.altKey === true;
        if (alt) return;

        // safety clamp
        const nx = clamp(data.x, 0, 871);
        const ny = clamp(data.y, 0, 538);
        moveNote(note.id, nx, ny);
      }}
    >
      <div
        ref={nodeRef}
        style={{ zIndex: note.z }}
        className="absolute cursor-grab active:cursor-grabbing"
        onMouseDown={() => bringToFront(note.id)}
      >
        <div
          style={{
            transform: `rotate(${note.rotationDeg}deg)`,
            transformOrigin: "top left",
            background: "#F3E1AE",
            boxShadow: "10px 12px 4px rgba(0, 0, 0, 0.25)",
          }}
          className="group relative w-[208px] min-h-[180px] p-4 font-gambarino text-black"
        >
          <div className="flex items-center justify-end mb-2">
            <button
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-black/60 hover:text-black"
              onClick={() => deleteNote(note.id)}
              aria-label="Delete note"
              type="button"
            >
              ×
            </button>
          </div>

          <textarea
            value={note.text}
            onChange={(e) => updateText(note.id, e.target.value)}
            className="w-full h-[96px] bg-transparent outline-none resize-none text-[16px] leading-snug font-gambarino text-black placeholder:text-black/40"
          />
        </div>
      </div>
    </Draggable>
  );
}

function DraggablePhoto({
  photo,
  bringToFront,
  movePhoto,
  deletePhoto,
  rotatePhoto,
}: {
  photo: PhotoItem;
  bringToFront: (id: string) => void;
  movePhoto: (id: string, x: number, y: number) => void;
  deletePhoto: (id: string) => void;
  rotatePhoto: (id: string, rotationDeg: number) => void;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <Draggable
      nodeRef={nodeRef}
      bounds="parent"
      position={{ x: photo.x, y: photo.y }}
      onStart={() => bringToFront(photo.id)}
      onDrag={(e: DraggableEvent, data: DraggableData) => {
        const alt = (e as any)?.altKey === true;
        if (alt) {
          const next = photo.rotationDeg + data.deltaX * 0.5;
          rotatePhoto(photo.id, next);
        }
      }}
      onStop={(e: DraggableEvent, data: DraggableData) => {
        const alt = (e as any)?.altKey === true;
        if (alt) return;

        const nx = clamp(data.x, 0, 871);
        const ny = clamp(data.y, 0, 538);
        movePhoto(photo.id, nx, ny);
      }}
    >
      <div
        ref={nodeRef}
        style={{ zIndex: photo.z }}
        className="absolute cursor-grab active:cursor-grabbing"
        onMouseDown={() => bringToFront(photo.id)}
      >
        <div
          style={{
            transform: `rotate(${photo.rotationDeg}deg)`,
            transformOrigin: "top left",
            boxShadow: "10px 12px 4px rgba(0, 0, 0, 0.25)",
          }}
          className="group relative w-[240px]"
        >
          <button
            className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-black/60 text-white hover:bg-black/75 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            onClick={() => deletePhoto(photo.id)}
            aria-label="Delete photo"
            type="button"
          >
            ×
          </button>

          <img
            src={photo.src}
            alt="Uploaded"
            className="block w-full h-auto select-none pointer-events-none"
            draggable={false}
          />
        </div>
      </div>
    </Draggable>
  );
}

export default function AddStuffClient() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // load draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { notes?: NoteItem[]; photos?: PhotoItem[] };

      if (parsed?.notes) {
        setNotes(
          parsed.notes.map((n) => ({
            ...n,
            rotationDeg:
              typeof (n as any).rotationDeg === "number" ? (n as any).rotationDeg : 8,
          }))
        );
      }

      if (parsed?.photos) {
        setPhotos(
          parsed.photos.map((p) => ({
            ...p,
            rotationDeg:
              typeof (p as any).rotationDeg === "number" ? (p as any).rotationDeg : 8,
          }))
        );
      }
    } catch {
      // ignore
    }
  }, []);

  // save draft
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ notes, photos }));
    } catch {
      // ignore
    }
  }, [notes, photos]);

  const nextZ = useMemo(() => {
    const maxNotes = notes.reduce((m, n) => Math.max(m, n.z), 0);
    const maxPhotos = photos.reduce((m, p) => Math.max(m, p.z), 0);
    return Math.max(maxNotes, maxPhotos) + 1;
  }, [notes, photos]);

  function addNote() {
    const id = crypto.randomUUID();
    setNotes((prev) => [
      ...prev,
      {
        id,
        type: "note",
        text: "write something…",
        x: 24,
        y: 24,
        z: nextZ,
        rotationDeg: 8,
      },
    ]);
  }

  function bringToFront(id: string) {
    const maxNotes = notes.reduce((m, n) => Math.max(m, n.z), 0);
    const maxPhotos = photos.reduce((m, p) => Math.max(m, p.z), 0);
    const topZ = Math.max(maxNotes, maxPhotos) + 1;

    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, z: topZ } : n)));
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, z: topZ } : p)));
  }

  function moveNote(id: string, x: number, y: number) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  }

  function updateText(id: string, text: string) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));
  }

  function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  function rotateNote(id: string, rotationDeg: number) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, rotationDeg } : n))
    );
  }

  function movePhoto(id: string, x: number, y: number) {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, x, y } : p)));
  }

  function deletePhoto(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  function rotatePhoto(id: string, rotationDeg: number) {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, rotationDeg } : p))
    );
  }

  function handleAddPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = typeof reader.result === "string" ? reader.result : "";
      if (!src) return;

      const id = crypto.randomUUID();
      setPhotos((prev) => [
        ...prev,
        {
          id,
          type: "photo",
          src,
          x: 40,
          y: 40,
          z: nextZ,
          rotationDeg: 8,
        },
      ]);

      // allow selecting the same file again
      e.target.value = "";
    };

    reader.readAsDataURL(file);
  }

  return (
    <main className="relative min-h-screen bg-[#101B36] overflow-hidden">
      {/* canvas */}
      <div className="absolute left-[59px] top-[74px]">
        <BoxCanvas>
          {notes.map((note) => (
            <DraggableNote
              key={note.id}
              note={note}
              bringToFront={bringToFront}
              moveNote={moveNote}
              updateText={updateText}
              deleteNote={deleteNote}
              rotateNote={rotateNote}
            />
          ))}
          {photos.map((photo) => (
            <DraggablePhoto
              key={photo.id}
              photo={photo}
              bringToFront={bringToFront}
              movePhoto={movePhoto}
              deletePhoto={deletePhoto}
              rotatePhoto={rotatePhoto}
            />
          ))}
        </BoxCanvas>
      </div>

      {/* bottom controls */}
      <div className="absolute left-[170px] top-[700px] flex gap-[90px] text-white font-gambarino text-[36px]">
      <button
        className="hover:opacity-80"
        type="button"
        onClick={() => fileInputRef.current?.click()}
        >
        add a photo
        </button>
        <button className="hover:opacity-80" type="button">
          add a song
        </button>
        <button onClick={addNote} className="hover:opacity-80" type="button">
          add a note
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAddPhoto}
        />

      {/* view box */}
      <div className="absolute left-[1500px] top-[860px] text-white">
        <div className="font-gambarino text-[48px] leading-none opacity-100">
          view box →
        </div>
        <div className="mt-1 w-[237.1px] border-t-[3px] border-white opacity-100" />
      </div>
    </main>
  );
}