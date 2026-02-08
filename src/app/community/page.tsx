"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import GiftBox from "@/components/GiftBox";

type CommunityItem = {
  id: string;
  created_at: string;
  quote: string;
};

function timeAgo(iso: string) {
  const t = new Date(iso).getTime();
  const now = Date.now();
  const s = Math.max(0, Math.floor((now - t) / 1000));

  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);

  if (d >= 1) return `sent ${d} day${d === 1 ? "" : "s"} ago`;
  if (h >= 1) return `sent ${h} hour${h === 1 ? "" : "s"} ago`;
  if (m >= 1) return `sent ${m} min${m === 1 ? "" : "s"} ago`;
  return `sent just now`;
}

export default function CommunityPage() {
  const router = useRouter();
  const [items, setItems] = useState<CommunityItem[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/community", { cache: "no-store" });
      const json = await res.json();
      setItems(Array.isArray(json?.items) ? json.items : []);
    })();
  }, []);

  const top3 = useMemo(() => items.slice(0, 3), [items]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "100dvh",
        position: "relative",
        background: "#101B36",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          left: 526,
          top: 19,
          position: "absolute",
          color: "white",
          fontSize: 24,
          fontFamily: "Gambarino",
          fontWeight: 400,
        }}
      >
        community boxes with similar themes
      </div>

      {top3.map((it, idx) => {
        const top = idx === 0 ? 80 : idx === 1 ? 426 : 772;
        const quoteTop = idx === 0 ? 162 : idx === 1 ? 485 : 819;
        const metaTop = idx === 0 ? 216 : idx === 1 ? 539 : 865;

        return (
          <div key={it.id}>
            <button
              type="button"
              onClick={() => router.push(`/receive/${it.id}`)}
              style={{
                width: 221,
                height: 172,
                left: 81,
                top,
                position: "absolute",
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
              className="hover:opacity-90 active:opacity-80"
              aria-label="Open community box"
            >
              <div style={{ transform: "scale(0.3)", transformOrigin: "top left" }}>
                <GiftBox />
              </div>
            </button>

            <div
              style={{
                left: 438,
                top: quoteTop,
                position: "absolute",
                color: "white",
                fontSize: 36,
                fontFamily: "Gambarino",
                fontWeight: 400,
                maxWidth: 1100,
              }}
            >
              {it.quote}
            </div>

            <div
              style={{
                left: 446,
                top: metaTop,
                position: "absolute",
                color: "white",
                fontSize: 20,
                fontFamily: "Gambarino",
                fontWeight: 400,
                opacity: 0.9,
              }}
            >
              {timeAgo(it.created_at)}
            </div>
          </div>
        );
      })}
    </div>
  );
}