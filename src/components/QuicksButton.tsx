import React from "react";
import Image from "next/image";

type QuicksButtonProps = {
  icon: string;
  text: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  activeClassName?: string;
  quicksButtonActive?: boolean;
  hasActiveQuicks?: boolean;
};

const QuicksButton: React.FC<QuicksButtonProps> = ({
  icon,
  text,
  active = false,
  onClick,
  className,
  activeClassName,
  quicksButtonActive = false,
  hasActiveQuicks = false,
}) => {
  return (
    <div className={className
      + (quicksButtonActive ? (active ? " w-[75px]" : " w-[60px]") + " opacity-100" : " w-[0px] opacity-0 pointer-events-none")
      + " grid justify-items-center gap-[8px] relative ease-in-out duration-300 transition-all"}>
      {!hasActiveQuicks &&
        <span className="text-white text-[14px] font-bold">
          {text}
        </span>
      }
      <button
        className={(active ? activeClassName + " ml-[16px]" : "bg-white") + " w-[60px] h-[60px] rounded-full border-none text-gray-500 flex items-center justify-center shadow-sm transition-all duration-200 ease-in-out relative z-1 cursor-pointer"}
        onClick={onClick}
        aria-pressed={active}
        style={{ boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.1)" }}
      >
        <Image src={"/images/" + (icon) + (active ? "-active" : "") + ".svg"} alt="inbox" width={27} height={27} />
      </button>
      <div className={(active ? "left-0" : "left-0") + " w-[60px] h-[60px] rounded-full bg-[var(--primary-3)] absolute transition-all duration-300 ease-in-out bottom-0"} />
    </div>
  );
};

export default QuicksButton;