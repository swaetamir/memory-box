export default function CreatePage({
    searchParams,
  }: {
    searchParams: { mode?: string };
  }) {
    const mode = searchParams.mode ?? "self";
  
    return (
      <main className="relative min-h-screen bg-[#101B36] overflow-hidden">
        {/* outer box */}
        <div className="absolute left-[500px] top-[223px] w-[947px] h-[603px] bg-[#792323] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] overflow-hidden">
          {/* inner box */}
          <div className="absolute left-[38px] top-[33px] w-[871px] h-[538px] bg-[#792323] shadow-[inset_1px_1px_95.2px_25px_rgba(0,0,0,0.25)]" />
        </div>
      </main>
    );
  }