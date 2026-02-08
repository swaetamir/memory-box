import Bow from "@/components/icons/Bow";

export default function GiftBox() {
  return (
    <div className="relative w-[734px] h-[523px]">
      {/* bottom box */}
      <div className="absolute left-[32px] top-[226px] w-[670px] h-[297px] bg-[#792323]" />

      {/* box cover */}
      <div className="absolute left-0 top-[111px] w-[734px] h-[157px] bg-[#792323] shadow-[0px_17px_16.6px_rgba(0,0,0,0.25)]" />

      {/* vertical ribbon */}
      <div className="absolute left-[355px] top-[112px] w-[24px] h-[155px] bg-[#D9D9D9]" />

      {/* bow */}
      <Bow className="absolute left-[240px] top-[10px] w-[260px] h-auto text-[#D9D9D9]" />
    </div>
  );
}