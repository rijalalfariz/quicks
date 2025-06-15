import React, { Dispatch, RefObject, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import DateText, { DateTextRaw } from './DateText';
import { getMessageList, postMessage, readMessage } from '@/services/api';
import { Chat, Message, User, MessageAction } from "@/interfaces/interfaces";
import MessageBubble from './MessageBubble';

interface ChatDetailProps {
  loading: boolean;
  suppressNextOutsideClick: RefObject<boolean>;
  setInboxPage: Dispatch<React.SetStateAction<"list" | "detail">>;
  activeChat: Chat | null;
  chatMessages?: Message[];
  setChatMessages?: Dispatch<React.SetStateAction<Message[]>>;
  currentUser?: User;
  sharedMessage?: MessageAction | null;
  setSharedMessage?: Dispatch<React.SetStateAction<MessageAction | null>>;
}

const ChatDetail: React.FC<ChatDetailProps> = ({
  loading,
  suppressNextOutsideClick,
  setInboxPage,
  activeChat,
  chatMessages = [],
  setChatMessages = () => { },
  currentUser,
  sharedMessage,
  setSharedMessage = () => { }
}) => {
  const scrollContainer = useRef<HTMLDivElement | null>(null);
  const newMessageRef = useRef<HTMLDivElement | null>(null)
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeOptionBubble, setActiveOptionBubble] = useState(0);
  const [hasScroll, setHasScroll] = useState(false);
  const [isNewMessageVissible, setIsNewMessageVissible] = useState(true);
  const [typedMessage, setTypedMessage] = useState("")
  const [repliedMessage, setRepliedMessage] = useState<Message | number | null>(null);
  const [messageFIeldAction, setMessageFIeldAction] = useState<MessageAction | null>(null);
  const suppressBubbleOptionClick = useRef(false);

  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      console.log("clicked trigger bubble", suppressBubbleOptionClick)
      if (suppressBubbleOptionClick.current) {
        suppressBubbleOptionClick.current = false;
        return;
      }

      const preferedElem = document.getElementsByClassName("BubbleOptions");
      if (preferedElem && Array.from(preferedElem).filter(v => v.contains(e.target as Node)).length == 0) {
        setActiveOptionBubble(0)
      }
    }

    document.addEventListener("click", clickHandler);
    return () => {
      document.removeEventListener("click", clickHandler);
    };
  }, [])

  useEffect(() => {
    const container = scrollContainer.current;
    const target = newMessageRef.current;

    if (container) {
      const offsetTop = target?.offsetTop || container.scrollHeight - container.offsetTop;
      container.scrollTo({ top: offsetTop, behavior: "smooth" });

      setHasScroll(container.scrollHeight > container.clientHeight);
    }

    if (sharedMessage) {
      setMessageFIeldAction(sharedMessage);
    }
  }, [chatMessages])

  useEffect(() => {
    if (messageFIeldAction?.action == "edit") {
      setTypedMessage(messageFIeldAction.body)
    }
    if (messageFIeldAction?.action == "reply") {
      setRepliedMessage(messageFIeldAction.relatedMessageId)
    }
    if (messageFIeldAction?.action == "share" && sharedMessage === null) {
      setSharedMessage(messageFIeldAction as MessageAction)
      setInboxPage("list")
    }
  }, [messageFIeldAction])

  let readTimeout = setTimeout(() => { }, 0)

  const readMessages = (scrollPoition: number = 0) => {
    const readedId: number[] = [];
    let isLastMessage = false;
    chatMessages.filter(v => v.isReaded == false).map(v => {
      if ((messageRefs.current[v.id]?.offsetTop || 0) > (scrollPoition - 120)) {
        readedId.push(v.id)
      }
      isLastMessage = chatMessages[chatMessages.length - 1].id == v.id;
    })

    if (readedId.length > 0) {
      readMessage(readedId, activeChat?.id, isLastMessage)
    }
  }

  return (
    <div className="grid grid-rows-[min-content_1fr] h-full">
      <div className="flex items-center justify-between gap-[14px] pl-[25px] pt-[20px] pr-[21px] pb-[18px] border-b border-[#bdbdbd]">
        <button
          onClick={() => {
            suppressNextOutsideClick.current = true;
            setInboxPage("list");
          }}
        >
          <Image
            src="/images/arrow-left-gray.svg"
            alt="back"
            width={24}
            height={24}
            className="inline-block mr-2 cursor-pointer"
          />
        </button>
        <div className="w-full">
          <div className="text-[16px] leading-normal font-bold text-[var(--primary)]">
            {activeChat?.label}
          </div>
          <p className="text-[12px] text-[var(--primary-3)]">{activeChat?.participants.length} Participants</p>
        </div>
        <button
          onClick={() => {
            suppressNextOutsideClick.current = true;
            setInboxPage("list");
          }}
        >
          <Image
            src="/images/close-gray.svg"
            alt="participant"
            width={14}
            height={14}
            className="text-white cursor-pointer"
          />
        </button>
      </div>


      <div className="overflow-hidden h-full grid grid-rows-[1fr_min-content] content-between">
        <div ref={scrollContainer} className={"overflow-y-auto grid grid-rows-[min-content] gap-[10px] py-[14px]" + (hasScroll ? " pl-[20px] pr-[2px]" : " px-[20px]")} onScroll={(e) => {
          clearTimeout(readTimeout)
          const scrollElem = e.target as HTMLDivElement;
          const scrollPoition = scrollElem.clientHeight + scrollElem.scrollTop + scrollElem.offsetTop
          if (newMessageRef?.current?.offsetTop) {
            setIsNewMessageVissible(scrollPoition > newMessageRef?.current?.offsetTop)
          } else {
            setIsNewMessageVissible(true)
          }
          if (
            (messageRefs.current[activeOptionBubble]?.offsetTop || 0) > (scrollPoition - 70)
            || (messageRefs.current[activeOptionBubble]?.offsetTop || Infinity) < scrollElem.scrollTop
          ) {
            setActiveOptionBubble(0)
          }
          readTimeout = setTimeout(() => {
            readMessages(scrollPoition);
          }, 200)
        }}>
          {chatMessages.length > 0 ? (
            chatMessages.map((message, i) => (
              <div key={message.id} ref={(e) => { messageRefs.current[message.id] = e }}>
                {(i == 0 || DateTextRaw({ value: chatMessages[i - 1]?.createdAt, mode: 1 }) != DateTextRaw({ value: message.createdAt, mode: 1 }))
                  && (
                    <div className="flex items-center my-4 gap-[30px]">
                      <div className="flex-grow h-px bg-[var(--primary-3)]" />
                      <span className="text-[16px] font-bold text-[var(--primary-3)]">
                        {DateTextRaw({ value: message.createdAt, mode: 1 }) == DateTextRaw({ value: new Date().toString(), mode: 1 }) && (
                          "Today, "
                        )}
                        <DateText value={message.createdAt} mode={1} />
                      </span>
                      <div className="flex-grow h-px bg-[var(--primary-3)]" />
                    </div>
                  )}

                {(i === chatMessages.findIndex((v: Message) => v.isReaded === false)) && (
                  <div ref={newMessageRef} className="flex items-center my-4 gap-[30px]">
                    <div className="flex-grow h-px bg-[var(--indicator-red)]" />
                    <span className="text-[16px] font-bold text-[var(--indicator-red)]">New Message</span>
                    <div className="flex-grow h-px bg-[var(--indicator-red)]" />
                  </div>
                )}
                <MessageBubble
                  activeChat={activeChat!}
                  message={{
                    ...message,
                    replyTo: message.replyTo ? chatMessages.find(v => v.id == message.replyTo) : null
                  }}
                  isOwnMessage={message.senderId === currentUser?.id}
                  activeOptionBubble={activeOptionBubble}
                  setActiveOptionBubble={setActiveOptionBubble}
                  setMessageFIeldAction={setMessageFIeldAction}
                  onDelete={async () => {
                    suppressNextOutsideClick.current = true;

                    const updatedMessageList = await getMessageList(activeChat?.id)

                    setChatMessages(updatedMessageList)
                  }}
                  scrollParentRef={scrollContainer}
                  suppressNextOutsideClick={suppressNextOutsideClick}
                  suppressBubbleOptionClick={suppressBubbleOptionClick}
                />
              </div>
            ))
          ) : (
            <p className="text-center text-[var(--primary-3)]">No messages yet.</p>
          )}
          {!isNewMessageVissible && (
            <div className="sticky bottom-0 flex justify-center">
              <div className="bg-[var(--stickers-blue)] w-[142px] py-2 px-3 rounded-[5px] text-[var(--primary)] font-bold text-[14px]">
                New Message
              </div>
            </div>
          )}
          {loading && (
            <div className={" -mt-[56px] sticky bottom-0 flex items-center justify-start flex-grow rounded-[5px] bg-[var(--stickers-blue)] p-[14px] gap-[10px] self-end"}>
              <span className="relative inline-block w-[24px] h-[24px]">
                <span
                  className="absolute inset-0 rounded-full border-[3px] animate-spin"
                  style={{
                    borderTopColor: "var(--primary)",
                    borderRightColor: "var(--primary)",
                    borderBottomColor: "#f8f8f8",
                    borderLeftColor: "#f8f8f8",
                  }}
                ></span>
              </span>
              <p className="text-[var(--primary-3)] font-bold text-[14px]">Please wait while we connect you with one of our team ...</p>
            </div>
          )}
        </div>
        <div className={"flex gap-[13px] items-end sticky bottom-0 bg-white pt-2 pb-[20px] transition-all duration-300 ease-in-out px-[20px]"}>
          <div className="grid h-fit flex-grow border border-[var(--primary-2)] rounded-[5px] overflow-hidden">
            {messageFIeldAction && (
              <div className="flex justify-between gap-[36px] bg-[#f2f2f2] pt-4 pr-5 pb-3 pl-4 border-b-1 border-b-[var(--primary-2)] items-start">
                <div className="grid gap-[8px]">
                  <div className="text-[14px] font-bold text-[var(--primary-3)]">{messageFIeldAction.title}</div>
                  <div>{messageFIeldAction.body}</div>
                </div>
                <Image
                  src="/images/close-gray-2.svg"
                  alt="close"
                  width={12}
                  height={12}
                  className="cursor-pointer"
                  onClick={() => {
                    suppressNextOutsideClick.current = true;

                    if (messageFIeldAction.action == "edit") {
                      setTypedMessage("")
                    }
                    setMessageFIeldAction(null)
                    setSharedMessage(null)
                    setRepliedMessage(null)
                  }}
                />
              </div>
            )}
            <input
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              type="text"
              placeholder="Type a message..."
              className="px-2 h-[38px] w-full focus:outline-none placeholder:text-[#333333]"
            />
          </div>
          <button
            className="px-[21px] bg-[var(--primary)] text-white rounded-[5px] cursor-pointer h-[40px]"
            onClick={async () => {
              if (!typedMessage) return;
              setTypedMessage("")
              const newMessageData = await postMessage(activeChat?.id, currentUser, typedMessage, repliedMessage, messageFIeldAction)
              setChatMessages(newMessageData)
              setMessageFIeldAction(null)
              setSharedMessage(null)
              setRepliedMessage(null)
            }}
          >
            Send
          </button>
        </div>
      </div>

    </div>
  );
};

export default ChatDetail;