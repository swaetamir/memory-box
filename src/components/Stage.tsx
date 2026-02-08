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
      
        // makw bigger on phone
        const isPhone = vw <= 480;
        const boost = isPhone ? 1.35 : 1; // keep between 1.25–1.5
      
        const s = fit * boost;
      
        // never upscale above 1 on desktop
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