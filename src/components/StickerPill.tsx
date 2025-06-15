import React from "react";

interface StickerPillProps {
  sticker: number;
  active?: boolean;
  className?: string;
}

export const stickerObj: Record<number, { title: string; bg: string }> = {
  1: { title: "Important ASAP", bg: "bg-[var(--stickers-blue)]" },
  2: { title: "Offline Meeting", bg: "bg-[var(--stickers-orange)]" },
  3: { title: "Virtual Meeting", bg: "bg-[var(--stickers-yellow)]" },
  4: { title: "ASAP", bg: "bg-[var(--stickers-cyan)]" },
  5: { title: "Client Related", bg: "bg-[var(--stickers-green)]" },
  6: { title: "Self Task", bg: "bg-[var(--stickers-purple)]" },
  7: { title: "Appointments", bg: "bg-[var(--stickers-magenta)]" },
  8: { title: "Court Related", bg: "bg-[var(--stickers-blue-2)]" },
};

const StickerPill: React.FC<StickerPillProps> = ({
  sticker,
  active = false,
  className = ""
}) => {

  return (
    <div className={className + " font-bold py-1 px-3 rounded-[5px] text-[var(--primary-3)] " + stickerObj[sticker].bg + (active ? " border-1 border-[var(--primary)]" : "")}>
      {stickerObj[sticker].title}
    </div>
  );
}

export default StickerPill;
