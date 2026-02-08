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
          className="w-[208px] min-h-[180px] p-4 font-gambarino text-black"
        >
          <div className="flex items-center justify-end mb-2">
            <button
              className="text-black/60 hover:text-black"
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

export default function AddStuffClient() {
  const [notes, setNotes] = useState<NoteItem[]>([]);

  // load draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { notes?: NoteItem[] };
      if (parsed?.notes) setNotes(parsed.notes.map((n) => ({
        ...n,
        rotationDeg: typeof (n as any).rotationDeg === "number" ? (n as any).rotationDeg : 8,
      })));
    } catch {
      // ignore
    }
  }, []);

  // save draft
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ notes }));
    } catch {
      // ignore
    }
  }, [notes]);

  const nextZ = useMemo(() => {
    return notes.reduce((m, n) => Math.max(m, n.z), 0) + 1;
  }, [notes]);

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
        z: Date.now(),
        rotationDeg: 8,
      },
    ]);
  }

  function bringToFront(id: string) {
    setNotes((prev) => {
      const maxZ = prev.reduce((m, n) => Math.max(m, n.z), 0);
      return prev.map((n) => (n.id === id ? { ...n, z: maxZ + 1 } : n));
    });
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
        </BoxCanvas>
      </div>

      {/* bottom controls */}
      <div className="absolute left-[60px] top-[700px] flex gap-[80px] text-white font-gambarino text-[36px]">
        <button className="hover:opacity-80" type="button">
          add a photo
        </button>
        <button className="hover:opacity-80" type="button">
          add a song
        </button>
        <button onClick={addNote} className="hover:opacity-80" type="button">
          add a note
        </button>
        <button className="hover:opacity-80" type="button">
          add an item
        </button>
      </div>

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