import React, { useEffect, useState, Dispatch, useRef, RefObject } from 'react';
import { Chat, Message, MessageAction } from "@/interfaces/interfaces";
import DateText from './DateText';
import Image from "next/image";
import { deleteMessage } from '@/services/api';

interface MessageBubbleProps {
  activeChat: Chat;
  message: Message;
  isOwnMessage?: boolean;
  activeOptionBubble?: number;
  setActiveOptionBubble?: Dispatch<React.SetStateAction<number>>;
  setMessageFIeldAction?: Dispatch<React.SetStateAction<MessageAction | null>>;
  onDelete?: () => void;
  scrollParentRef?: RefObject<HTMLDivElement | null>;
  suppressNextOutsideClick: RefObject<boolean>;
  suppressBubbleOptionClick: RefObject<boolean>;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  activeChat,
  message,
  isOwnMessage = false,
  activeOptionBubble = 0,
  setActiveOptionBubble = () => { },
  setMessageFIeldAction = () => { },
  onDelete = () => { },
  scrollParentRef,
  suppressNextOutsideClick,
  suppressBubbleOptionClick
}) => {
  const lightBubbleColorList = [
    "hsla(40,87%,91%,1)",
    "hsla(165,55%,89%,1)",
  ];
  const darkBubbleColorList = [
    "hsla(36,76%,58%,1)",
    "hsla(158,46%,49%,1)",
  ];

  const kebabRef = useRef<HTMLImageElement>(null);
  const [alignOption, setAlignOption] = useState("");
  const [isShowOption, setIsShowOption] = useState(activeOptionBubble == message.id);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    setIsShowOption(activeOptionBubble == message.id);
    if (activeOptionBubble != message.id) {
      setShowDeleteConfirm(false)
    }
  }, [activeOptionBubble])

  useEffect(() => {
    console.log('suppressBubbleOptionClick3', suppressBubbleOptionClick)
  }, [suppressBubbleOptionClick.current])

  const getColorTheme = (mode: ("dark" | "light") = "light") => {
    const participant = activeChat.participants.find(v => v.id == message.senderId);
    const participantIndex = participant ? activeChat.participants.indexOf(participant) : -1;
    const randomColors = `${participantIndex},${Math.max(...[30, 100 - participantIndex])}`;

    if (mode == "light") {
      if (isOwnMessage) {
        return "hsla(271,100%,93%,1)";
      }

      if (participantIndex <= 1) {
        return lightBubbleColorList[participantIndex];
      }

      return `hsla(${randomColors}%,90%,1)`;
    } else {
      if (isOwnMessage) {
        return "hsla(271,70%,60%,1)";
      }

      if (participantIndex <= 1) {
        return darkBubbleColorList[participantIndex];
      }

      return `hsla(${randomColors}%,59%,1)`;
    }
  }

  return (
    <div className={(isOwnMessage ? "justify-items-end" : "") + " w-full grid gap-[6px]"}>
      <div className="font-bold" style={{ color: activeChat.isGroup||isOwnMessage? getColorTheme("dark"):"var(--primary)" }}>
        {isOwnMessage
          ? "You"
          : (activeChat.participants.find(v => v.id === message.senderId)?.name)
        }
      </div>
      {(message.replyTo || message.sharedContent) && (
        <div className="p-[10px] rounded-[5px] border-1 border-[var(--primary-1)] bg-[#f2f2f2] w-fit">
          {(message.replyTo as Message)?.body || message.sharedContent}
        </div>
      )}
      <div className={(isOwnMessage ? "flex-row-reverse" : "") + " flex items-start gap-[7px] w-fit min-w-[calc(8px+50%)] justify-between"}>
        <div className="p-[10px] grid gap-[12px] rounded-[5px] break-words" style={{ backgroundColor: activeChat.isGroup||isOwnMessage?getColorTheme("light"):"#f8f8f8" }}>
          <div className="overflow-hidden">
            {message.body}
          </div>
          <DateText value={message.createdAt} mode={2} className="text-[12px] text-[var(--primary-3)]" />
        </div>
        <div className="relative cursor-pointer">
          <Image
            ref={kebabRef}
            src="/images/kebab-x-gray.svg"
            alt="click for more"
            width={16}
            height={16}
            className="BubbleOptions min-w-4"
            onClick={() => {
              setActiveOptionBubble(activeOptionBubble == message.id ? 0 : message.id)
              if (kebabRef.current) {
                const rect = kebabRef.current.getBoundingClientRect();
                const scrollRect = scrollParentRef?.current?.getBoundingClientRect();
                let alignment = ""
                const containerWidth = window.innerWidth;
                const containerHeight = window.innerHeight;

                // Decide alignment: if there's not enough space on the right, align left
                const shouldAlignRight = containerWidth - rect.right < 190; // assume menu width ~150px
                alignment = shouldAlignRight ? alignment + " right-0" : alignment;

                const shouldAlignTop = containerHeight - rect.bottom < containerHeight - (scrollRect?.bottom || 0) + 100; // assume menu width ~150px
                alignment = shouldAlignTop ? alignment + " bottom-[18px]" : alignment;
                setAlignOption(alignment);
              }
            }}
          />
          {isShowOption && (<>
            <div className={"grid divide-y divide-[#bdbdbd] border-[#bdbdbd] border-1 rounded-[5px] w-[126px] absolute bg-white z-10 " + alignOption} >
              {isOwnMessage
                ? (showDeleteConfirm
                  ? (
                    <>
                      <p className="text-[12px] p-[12px] cursor-default" onClick={() => {
                        suppressBubbleOptionClick.current = true;
                      }}>Are you sure?</p>
                      <div className="flex divide-x divide-[#bdbdbd]">
                        <p className="text-[var(--indicator-red)] text-[12px] p-[12px] w-full text-center" onClick={() => {
                          deleteMessage(message.id, activeChat.id)
                          onDelete()
                        }}>yes</p>
                        <p className="text-[12px] p-[12px] w-full text-center" onClick={() => {
                          suppressNextOutsideClick.current = true;
                          suppressBubbleOptionClick.current = true;

                          setShowDeleteConfirm(false);
                        }}>No</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-[var(--primary)] text-[12px] p-[12px]" onClick={() => {
                        setMessageFIeldAction({
                          action: "edit",
                          title: "Editing your message",
                          body: message.body,
                          relatedMessageId: message.id
                        })
                      }}>Edit</p>
                      <p className="text-[var(--indicator-red)] text-[12px] p-[12px]" onClick={() => {
                        suppressNextOutsideClick.current = true;
                        suppressBubbleOptionClick.current = true;
                        console.log('suppressBubbleOptionClick2', suppressBubbleOptionClick);
                        setIsShowOption(true);
                        setActiveOptionBubble(message.id);

                        setShowDeleteConfirm(true);
                      }}>Delete</p>
                    </>
                  )
                ) : (
                  <>
                    <p className="text-[var(--primary)] text-[12px] p-[12px]" onClick={() => {
                      setMessageFIeldAction({
                        action: "share",
                        title: "Shared message",
                        body: message.body,
                        relatedMessageId: message.id
                      })
                    }}>Share</p>
                    <p className="text-[var(--primary)] text-[12px] p-[12px]" onClick={() => {
                      setMessageFIeldAction({
                        action: "reply",
                        title: "Replying to " + (activeChat.participants.find(v => v.id === message.senderId)?.name),
                        body: message.body,
                        relatedMessageId: message.id
                      })
                    }}>Reply</p>
                  </>
                )}
            </div>
          </>)}
        </div>
      </div>
    </div >
  );
};

export default MessageBubble;