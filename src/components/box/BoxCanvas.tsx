type BoxCanvasProps = {
    className?: string;
  };
  
  export default function BoxCanvas({ className }: BoxCanvasProps) {
    return (
      <div
        className={[
          "relative w-[947px] h-[603px] bg-[#792323] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] overflow-hidden",
          className ?? "",
        ].join(" ")}
      >
        <div className="absolute left-[38px] top-[33px] w-[871px] h-[538px] bg-[#792323] shadow-[inset_1px_1px_95.2px_25px_rgba(0,0,0,0.25)]" />
      </div>
    );
  }