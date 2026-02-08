"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import BoxCanvas from "@/components/box/BoxCanvas";
import Link from "next/link";

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
  embedUrl: string; // https://open.spotify.com/embed/...
  x: number;
  y: number;
  z: number;
};

type SongDraft = {
  id: string;
  type: "song_draft";
  input: string;
  x: number;
  y: number;
  z: number;
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

function DraggableSong({
  song,
  bringToFront,
  moveSong,
  deleteSong,
}: {
  song: SongItem;
  bringToFront: (id: string) => void;
  moveSong: (id: string, x: number, y: number) => void;
  deleteSong: (id: string) => void;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <Draggable
      nodeRef={nodeRef}
      bounds="parent"
      handle=".drag-handle"
      position={{ x: song.x, y: song.y }}
      onStart={() => bringToFront(song.id)}
      onStop={(_e: DraggableEvent, data: DraggableData) => {
        const nx = clamp(data.x, 0, 871);
        const ny = clamp(data.y, 0, 538);
        moveSong(song.id, nx, ny);
      }}
    >
      <div
        ref={nodeRef}
        style={{ zIndex: song.z }}
        className="absolute"
        onMouseDown={() => bringToFront(song.id)}
      >
        <div className="group w-[340px] relative">
          <button
            className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-black/60 text-white hover:bg-black/75 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            onClick={() => deleteSong(song.id)}
            aria-label="Delete song"
            type="button"
          >
            ×
          </button>

          {/* move box */}
          <div className="drag-handle flex items-center justify-between px-3 py-1.5 bg-black/30 rounded-t-md cursor-grab active:cursor-grabbing">
            <div className="font-gambarino text-white/90 text-[14px] leading-none">song</div>
            <div className="text-white/50 text-[11px] leading-none">move</div>
          </div>

          <div className="overflow-hidden rounded-b-md shadow-[10px_12px_4px_rgba(0,0,0,0.25)]">
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
      </div>
    </Draggable>
  );
}

export default function AddStuffClient() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [songDraft, setSongDraft] = useState<SongDraft | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // load draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        notes?: NoteItem[];
        photos?: PhotoItem[];
        songs?: SongItem[];
      };

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

      if (parsed?.songs) {
        setSongs(parsed.songs);
      }
    } catch {
      // ignore
    }
  }, []);

  // save draft
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ notes, photos, songs }));
    } catch {
      // ignore
    }
  }, [notes, photos, songs]);

  const nextZ = useMemo(() => {
    const maxNotes = notes.reduce((m, n) => Math.max(m, n.z), 0);
    const maxPhotos = photos.reduce((m, p) => Math.max(m, p.z), 0);
    const maxSongs = songs.reduce((m, s) => Math.max(m, s.z), 0);
    const draftZ = songDraft?.z ?? 0;
    return Math.max(maxNotes, maxPhotos, maxSongs, draftZ) + 1;
  }, [notes, photos, songs, songDraft]);

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
    const maxSongs = songs.reduce((m, s) => Math.max(m, s.z), 0);
    const draftZ = songDraft?.z ?? 0;
    const topZ = Math.max(maxNotes, maxPhotos, maxSongs, draftZ) + 1;

    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, z: topZ } : n)));
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, z: topZ } : p)));
    setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, z: topZ } : s)));
    setSongDraft((prev) => (prev?.id === id ? { ...prev, z: topZ } : prev));
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

  function toSpotifyEmbedUrl(input: string): string {
    const trimmed = input.trim();
    if (!trimmed) return "";

    // spotify:track:<id> style
    if (trimmed.startsWith("spotify:")) {
      const parts = trimmed.split(":");
      if (parts.length >= 3) {
        const kind = parts[1];
        const id = parts[2];
        return `https://open.spotify.com/embed/${kind}/${id}`;
      }
    }

    try {
      const u = new URL(trimmed);
      if (!u.hostname.includes("spotify.com")) return "";

      // already an embed link
      if (u.pathname.startsWith("/embed/")) {
        return `https://open.spotify.com${u.pathname}`;
      }

      const segs = u.pathname.split("/").filter(Boolean); // ["track","id"]
      if (segs.length >= 2) {
        const kind = segs[0];
        const id = segs[1];
        return `https://open.spotify.com/embed/${kind}/${id}`;
      }
    } catch {
      return "";
    }

    return "";
  }

  function moveSong(id: string, x: number, y: number) {
    setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, x, y } : s)));
  }

  function deleteSong(id: string) {
    setSongs((prev) => prev.filter((s) => s.id !== id));
  }

  function startSongDraft() {
    // if one is already open brings it to front
    if (songDraft) {
      bringToFront(songDraft.id);
      return;
    }

    const id = crypto.randomUUID();
    setSongDraft({
      id,
      type: "song_draft",
      input: "",
      x: 60,
      y: 320,
      z: nextZ,
    });
  }

  function moveSongDraft(x: number, y: number) {
    setSongDraft((prev) => (prev ? { ...prev, x, y } : prev));
  }

  function updateSongDraftInput(input: string) {
    setSongDraft((prev) => (prev ? { ...prev, input } : prev));
  }

  function cancelSongDraft() {
    setSongDraft(null);
  }

  function commitSongDraft() {
    if (!songDraft) return;
    const embedUrl = toSpotifyEmbedUrl(songDraft.input);
    if (!embedUrl) {
      window.alert("that doesn’t look like a spotify link 😭 try again.");
      return;
    }

    const id = crypto.randomUUID();
    setSongs((prev) => [
      ...prev,
      {
        id,
        type: "song",
        embedUrl,
        x: songDraft.x,
        y: songDraft.y,
        z: songDraft.z,
      },
    ]);

    setSongDraft(null);
  }
  function DraggableSongDraft({
    draft,
    bringToFront,
    moveDraft,
    updateInput,
    onCancel,
    onCommit,
  }: {
    draft: SongDraft;
    bringToFront: (id: string) => void;
    moveDraft: (x: number, y: number) => void;
    updateInput: (val: string) => void;
    onCancel: () => void;
    onCommit: () => void;
  }) {
    const nodeRef = useRef<HTMLDivElement>(null);

    return (
      <Draggable
        nodeRef={nodeRef}
        bounds="parent"
        handle=".drag-handle"
        position={{ x: draft.x, y: draft.y }}
        onStart={() => bringToFront(draft.id)}
        onStop={(_e: DraggableEvent, data: DraggableData) => {
          const nx = clamp(data.x, 0, 871);
          const ny = clamp(data.y, 0, 538);
          moveDraft(nx, ny);
        }}
      >
        <div
          ref={nodeRef}
          style={{ zIndex: draft.z }}
          className="absolute"
          onMouseDown={() => bringToFront(draft.id)}
        >
          <div className="w-[340px] overflow-hidden rounded-md shadow-[10px_12px_4px_rgba(0,0,0,0.25)] bg-black/40">
            <div className="drag-handle flex items-center justify-between px-3 py-1.5 bg-black/30 cursor-grab active:cursor-grabbing">
              <div className="font-gambarino text-white/90 text-[14px] leading-none">
                paste spotify link
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="text-white/70 hover:text-white text-[14px] leading-none"
                aria-label="Cancel"
              >
                ×
              </button>
            </div>

            <div className="p-3 bg-black/20">
              <input
                value={draft.input}
                onChange={(e) => updateInput(e.target.value)}
                placeholder="https://open.spotify.com/track/..."
                className="w-full bg-white/10 text-white placeholder:text-white/50 px-3 py-2 rounded-md outline-none"
              />
              <div className="mt-3 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={onCancel}
                  className="font-gambarino text-[16px] text-white/80 hover:text-white"
                >
                  cancel
                </button>
                <button
                  type="button"
                  onClick={onCommit}
                  className="font-gambarino text-[16px] text-white hover:opacity-90"
                >
                  add →
                </button>
              </div>
            </div>
          </div>
        </div>
      </Draggable>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#101B36] overflow-hidden">
      {/* canvas */}
      <div className="absolute left-[380px] top-[74px]">
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
          {songs.map((song) => (
            <DraggableSong
              key={song.id}
              song={song}
              bringToFront={bringToFront}
              moveSong={moveSong}
              deleteSong={deleteSong}
            />
          ))}
          {songDraft && (
            <DraggableSongDraft
              draft={songDraft}
              bringToFront={bringToFront}
              moveDraft={moveSongDraft}
              updateInput={updateSongDraftInput}
              onCancel={cancelSongDraft}
              onCommit={commitSongDraft}
            />
          )}
        </BoxCanvas>
      </div>

      {/* bottom controls */}
      <div className="absolute left-[500px] top-[700px] flex gap-[90px] text-white font-gambarino text-[36px]">
        <button
          className="hover:opacity-80"
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          add a photo
        </button>
        <button className="hover:opacity-80" type="button" onClick={startSongDraft}>
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
      <Link
        href="/create/view"
        className="absolute left-[1500px] top-[860px] text-white hover:opacity-80"
      >
        <div className="font-gambarino text-[30px] leading-none">view box →</div>
        <div className="mt-1 w-[157px] border-t-[2px] border-white" />
      </Link>
    </main>
  );
}