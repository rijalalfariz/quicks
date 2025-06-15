import React, { Dispatch, RefObject, useEffect, useState } from 'react';
import Image from 'next/image';
import DateText from './DateText';
import { getChatList, getMessageList } from '@/services/api';
import { Chat, Message, User, MessageAction } from "@/interfaces/interfaces";
import ChatDetail from './ChatDetail';

interface InboxPanelProps {
  inboxPage: "list" | "detail";
  loading: boolean;
  setLoading: Dispatch<React.SetStateAction<boolean>>;
  suppressNextOutsideClick: RefObject<boolean>;
  setInboxPage: Dispatch<React.SetStateAction<"list" | "detail">>;
  currentUser?: User;
}

function splitAndPreserve(text: string, highlight: string) {
  const regex = new RegExp(`(${highlight})`, "gi");
  const matches = [];
  let lastIndex = 0;

  text.replace(regex, (match, _, offset) => {
    matches.push(text.slice(lastIndex, offset)); // before match
    matches.push(match); // the match itself
    lastIndex = offset + match.length;
    return match;
  });

  matches.push(text.slice(lastIndex)); // after last match
  return matches;
}

function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight) return <>{text}</>;

  const parts = splitAndPreserve(text, highlight);

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-yellow-300">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

const InboxPanel: React.FC<InboxPanelProps> = ({
  inboxPage,
  loading,
  suppressNextOutsideClick,
  setInboxPage,
  setLoading,
  currentUser
}) => {
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[] | null>(null);
  const [sharedMessage, setSharedMessage] = useState<MessageAction | null>(null);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    fetchChats();
  }, [inboxPage])

  const fetchChats = async () => {
    setLoading(true);
    try {
      const chatData = await getChatList();
      console.log("Fetched chats:", chatData);
      setChats(chatData);
    }
    catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: number) => {
    setLoading(true);
    try {
      const messagesData = await getMessageList(chatId);
      console.log("Fetched messages:", messagesData);
      setChatMessages(messagesData);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white w-[734px] h-[737px] rounded-md QuicksContainer">
      {inboxPage === "list" && (
        <div className="grid grid-rows-[min-content_1fr] h-full py-[24px] px-[32px]">
          <div className="flex items-center border border-[var(--primary-2)] rounded-md px-[60px] h-[32px] mb-4 bg-white">
            <input
              type="text"
              placeholder="Search"
              className="flex-1 outline-none bg-transparent text-gray-800 placeholder-[#333333]"
              style={{ border: "none", boxShadow: "none" }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Image
              src="/images/search.svg"
              alt="search"
              width={12}
              height={12}
              className=""
            />
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <span className="relative inline-block w-[60px] h-[60px]">
                <span
                  className="absolute inset-0 rounded-full border-[6px] animate-spin"
                  style={{
                    borderTopColor: "#c4c4c4",
                    borderRightColor: "#c4c4c4",
                    borderBottomColor: "#f8f8f8",
                    borderLeftColor: "#f8f8f8",
                  }}
                ></span>
              </span>
              <p className="text-[var(--primary-3)] mt-4 font-bold text-[16px]">Loading chats...</p>
            </div>
          ) : (
            <div className="overflow-y-auto h-fit grid grid-cols-[min-content_1fr] divide-y divide-[var(--primary-2)] max-h-full">
              {[...(chats?.filter(v=> v.label.toLowerCase().includes(keyword.toLowerCase())) || [])].map((chat) => (
                <div
                  key={chat.id}
                  className="grid grid-cols-subgrid col-span-2 items-start gap-4 py-[22px] cursor-pointer hover:bg-gray-50 h-fit"
                  onClick={() => {
                    suppressNextOutsideClick.current = true;
                    setChatMessages([]);
                    setInboxPage("detail");
                    setActiveChat(chat);
                    fetchMessages(chat.id);
                  }}
                >
                  <div className="mt-1">
                    {chat.isGroup ? (
                      <div className="flex">
                        {chat.participants[1]?.avatar ? (
                          <Image
                            src={chat.participants[1].avatar}
                            alt="participant 1"
                            width={34}
                            height={34}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-[17px]">
                            <div className="w-[34px] h-[34px] rounded-full bg-[var(--primary-1)] flex items-center justify-center">
                              <Image
                                src="/images/person-gray.svg"
                                alt="participant 1"
                                width={18}
                                height={18}
                                className="text-white"
                              />
                            </div>
                          </div>
                        )}
                        {chat.participants[0]?.avatar ? (
                          <Image
                            src={chat.participants[0].avatar}
                            alt="participant 2"
                            width={34}
                            height={34}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-[34px] h-[34px] rounded-full bg-[var(--primary)] flex items-center justify-center">
                            <Image
                              src="/images/person-white.svg"
                              alt="participant 2"
                              width={18}
                              height={18}
                              className="text-white"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {chat.participants[0]?.avatar ? (
                          <Image
                            src={chat.participants[0].avatar}
                            alt="participant 1"
                            width={34}
                            height={34}
                            className="rounded-full justify-self-center"
                          />
                        ) : (
                          <div className="w-[34px] h-[34px] rounded-full bg-[var(--primary)] flex items-center justify-center justify-self-center">
                            <span className="text-white font-bold">
                              {chat.participants[0].name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div>
                    <div className="flex gap-4">
                      <h3 className="text-lg font-semibold text-[var(--primary)]">{HighlightedText({text:chat.label, highlight:keyword})}</h3>
                      <DateText value={chat.lastMessageAt} className="whitespace-nowrap" />
                    </div>
                    <div>
                      {chat.isGroup && (<p className="font-bold">{(chat.lastMessageBy == currentUser?.id ? "You" : chat.participants.filter((v) => v.id == chat.lastMessageBy)[0].name)} : <br /></p>)}
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm text-gray-600 line-clamp-1">{chat.lastMessage}</p>
                        {!chat.isReaded && (
                          <div className="h-[10px] w-[10px] min-w-[10px] rounded-full bg-[var(--indicator-red)]" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {sharedMessage && (
            <div className={"flex gap-[13px] items-center rounded-[5px] text-[var(--primary)] bg-[var(--stickers-blue)] p-3 transition-all duration-300 ease-in-out"}>
              Select the chat you want to share this message with.
            </div>
          )}
        </div>
      )}
      {inboxPage === "detail" && (
        <ChatDetail
          activeChat={activeChat}
          chatMessages={chatMessages}
          loading={loading}
          suppressNextOutsideClick={suppressNextOutsideClick}
          setInboxPage={setInboxPage}
          currentUser={currentUser}
          setChatMessages={setChatMessages}
          sharedMessage={sharedMessage}
          setSharedMessage={setSharedMessage}
        />
      )}
    </div>
  );
};

export default InboxPanel;