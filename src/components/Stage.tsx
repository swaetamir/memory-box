"use client";

import { ReactNode, useEffect, useState } from "react";

type Props = {
  children: ReactNode;
  baseWidth?: number;   
  baseHeight?: number;  
};

export default function Stage({
  children,
  baseWidth = 1728,
  baseHeight = 960,
}: Props) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function recalc() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // base fit (keeps whole 1728x960 visible)
      const fit = Math.min(vw / baseWidth, vh / baseHeight);

      // make bigger on phone
      const isPhone = vw <= 480;
      const boost = isPhone ? 1.35 : 1;

      const s = Math.min(1, fit * boost);
      setScale(s);
    }

    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [baseWidth, baseHeight]);

  return (
    <div
      className="w-screen bg-[#101B36] overflow-x-hidden"
      style={{
        minHeight: "100dvh",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div
        style={{
          width: baseWidth,
          height: baseHeight,
          // center scaled stage
          transform: `translate(${Math.max(0, (typeof window !== "undefined" ? (window.innerWidth - baseWidth * scale) / 2 : 0))}px, ${Math.max(0, (typeof window !== "undefined" ? (window.innerHeight - baseHeight * scale) / 2 : 0))}px) scale(${scale})`,
          transformOrigin: "top left",
          willChange: "transform",
        }}
        className="relative"
      >
        {children}
      </div>
    </div>
  );
}