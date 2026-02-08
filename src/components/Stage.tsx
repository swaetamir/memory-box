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

      // fit whole stage inside view
      const s = Math.min(vw / baseWidth, vh / baseHeight);

      // don’t upscale on big screens 
      setScale(Math.min(1, s));
    }

    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [baseWidth, baseHeight]);

  return (
    <div className="min-h-screen w-screen bg-[#101B36] overflow-hidden flex items-center justify-center">
      <div
        style={{
          width: baseWidth,
          height: baseHeight,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
        className="relative"
      >
        {children}
      </div>
    </div>
  );
}