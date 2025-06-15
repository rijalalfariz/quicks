"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import QuicksButton from "@/components/QuicksButton";
import { getCurrentUser } from "@/services/api";
import InboxPanel from "@/components/InboxPanel";
import { User } from "@/interfaces/interfaces";
import TaskPanel from "@/components/TaskPanel";

export default function Home() {
  const [quicksButtonActive, setQuicksButtonActive] = useState(false);
  const [activeQuicks, setActiveQuicks] = useState<"task" | "inbox" | null>(null);
  const [inboxPage, setInboxPage] = useState<"list" | "detail">("list"); // "list" or "detail" of the chats
  const [loading, setLoading] = useState(false);
  const suppressNextOutsideClick = useRef(false);
  const [currentUser, setCurrentUser] = useState<User>();

  useEffect(() => {
    fetchCurrentUser();

    const quicksClicksHandler = (e: MouseEvent) => {
      if (suppressNextOutsideClick.current) {
        suppressNextOutsideClick.current = false;
        return;
      }

      const quicksContainer = document.getElementsByClassName("QuicksContainer");
      if (quicksContainer && Array.from(quicksContainer).filter(v => v.contains(e.target as Node)).length == 0) {
        console.log('triggers closeAll', e.target)
        setQuicksButtonActive(false);
        setActiveQuicks(null);
      }
    }
    document.addEventListener("click", quicksClicksHandler);
    return () => {
      document.removeEventListener("click", quicksClicksHandler);
    };
  }, []);

  useEffect(() => {
    if (activeQuicks === null) {
      setInboxPage("list");
    }
  }, [activeQuicks]);

  const fetchCurrentUser = async () => {
    setLoading(true);
    try {
      const userData = await getCurrentUser();
      console.log("Fetched current user:", userData);
      setCurrentUser(userData);
    } catch (error) {
      console.error("Error fetching current user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen animate-gradient-bg relative py-[27px] px-[34px]">
      <h1 className="z-10 text-4xl font-bold text-[#9498aa] font-bold">Hi, I&apos;m Fariz</h1>
      <div id="quicks-container" className="absolute bottom-0 right-0 py-[27px] px-[34px] z-50">
        <div className="grid gap-[15px] justify-items-end">

          {activeQuicks === "task" && (
            <TaskPanel
              loading={loading}
              setLoading={setLoading}
              suppressNextOutsideClick={suppressNextOutsideClick}
            />
          )}

          {activeQuicks === "inbox" && (
            <InboxPanel
              inboxPage={inboxPage}
              loading={loading}
              suppressNextOutsideClick={suppressNextOutsideClick}
              setInboxPage={setInboxPage}
              setLoading={setLoading}
              currentUser={currentUser}
            />
          )}

          <div className="flex gap-[26px] items-end QuicksContainer">
            <div className={(activeQuicks === "task" ? "flex-row-reverse" : "") + " flex gap-[26px] items-end"}>
              <QuicksButton
                icon="task"
                text="Task"
                active={activeQuicks === "task"}
                onClick={() => {
                  if (activeQuicks === "task") {
                    setActiveQuicks(null);
                  } else {
                    setActiveQuicks("task");
                  }
                }}
                quicksButtonActive={quicksButtonActive}
                activeClassName="bg-[var(--indicator-orange)]"
                hasActiveQuicks={activeQuicks !== null}
              />
              <QuicksButton
                icon="inbox"
                text="Inbox"
                active={activeQuicks === "inbox"}
                onClick={() => {
                  if (activeQuicks === "inbox") {
                    setActiveQuicks(null)
                  } else {
                    setActiveQuicks("inbox");
                    // fetchChats();
                  }
                }}
                quicksButtonActive={quicksButtonActive}
                activeClassName="bg-[var(--indicator-purple)]"
                hasActiveQuicks={activeQuicks !== null}
              />
            </div>
            <button className={(activeQuicks ? "-ml-[86px] opacity-0 pointer-events-none d-none" : "") + " transition-all duration-300 ease-in-out w-[68px] h-[68px] p-[6px] rounded-full bg-[var(--primary)] shadow-[0px_4px_4px_0px_#0000001A] relative z-1"}
              onClick={() => {
                if (quicksButtonActive) {
                  setActiveQuicks(null);
                }
                setQuicksButtonActive(!quicksButtonActive)
              }}>
              <Image
                src="/images/lightning.svg"
                alt="click for more"
                width={56}
                height={56}
                className="w-full h-full"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
