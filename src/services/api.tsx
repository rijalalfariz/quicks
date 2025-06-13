import { Chat, Message, MessageAction, User } from "@/interfaces/interfaces";
import { get } from "http";

const BASE_URL = 'https://my-json-server.typicode.com/rijalalfariz/api-riz';

export async function getDataList(item = 'chat', url = 'chat', local=false) {
  let data = {};
  if (!local) {
    const response = await fetch(`${BASE_URL}/${url}`);
    if (!response.ok) {
      throw new Error(`Error fetching ${item} Data: ${response.statusText}`);
    }
    data = await response.json();    
  }
  const localData = localStorage.getItem(`${item}Data`);
  const localDataTimestamp = localStorage.getItem(`${item}DataTimestamp`);
  const now = Date.now();

  if (localData && localDataTimestamp) {
    const lastUpdated = parseInt(localDataTimestamp, 10);
    if (now - lastUpdated <= 3600000 || local) {
      return JSON.parse(localData);
    }
  }

  localStorage.setItem(`${item}Data`, JSON.stringify(data));
  localStorage.setItem(`${item}DataTimestamp`, now.toString());
  return data;
}

export async function getChatList(local=false) {
  const data = await getDataList('chat', 'chats', local);
  return data;
}

export async function getMessageList(chatId = 1, local=false) {
  const data = await getDataList(`message${chatId}`, `messages?chatId=${chatId}`, local);
  return data;
}

export async function getCurrentUser() {
  const data = await getDataList('profile', 'profile');
  return data;
}

export async function getCurrentTime() { // fake UTC
  const now = new Date();
  const pad = (n: any) => String(n).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${ms}Z`;
}

export async function postMessage(
  chatId = 0,
  user?: User,
  body = "",
  replyTo: Message | number | null = null,
  messageFIeldAction: MessageAction | null = null,
) {
  const messageLocalData = localStorage.getItem(`message${chatId}Data`) || "";
  const chatLocalData = localStorage.getItem(`chatData`) || "";
  let messageData = JSON.parse(messageLocalData) as Message[]
  let chatData = JSON.parse(chatLocalData) as Chat[]
  let currentTime = await getCurrentTime()
  let isLastMessage = true;

  if (!messageFIeldAction || messageFIeldAction?.action == "reply") {
    messageData = messageData.map((v) => {
      return { ...v, isReaded: true }
    })
    const newMessage = {
      id: messageData.reduce((max, msg) => Math.max(max, msg.id || 0), 0) + 1,
      chatId: chatId,
      senderId: user?.id,
      body: body,
      createdAt: currentTime,
      replyTo: replyTo,
      isReaded: true,
    }
    messageData.push(newMessage)
  } else if (messageFIeldAction?.action == "edit") {
    messageData = [...messageData.map((v, i) => {
      if (v.id == messageFIeldAction.relatedMessageId) {
        isLastMessage = (i == messageData.length - 1);
        console.log('editt', v)
        return {
          ...v,
          body: body
        };
      }
      return v;
    })]
    console.log('edited msg data', messageData);
  }


  if (isLastMessage) {
    let activeChatData = chatData.find(v => v.id == chatId) as Chat;
    if (!messageFIeldAction) {
      activeChatData = {
        ...activeChatData,
        isReaded: true,
        lastMessage: body,
        lastMessageAt: currentTime,
        lastMessageBy: user?.id
      }
    } else if (messageFIeldAction?.action == "edit") {
      activeChatData = {
        ...activeChatData,
        isReaded: true,
        lastMessage: body,
      }
    }

    chatData = chatData.map(v => {
      if (v.id == chatId) {
        return activeChatData;
      }
      return v;
    }) as Chat[]
  }

  localStorage.setItem(`message${chatId}Data`, JSON.stringify(messageData));
  localStorage.setItem(`message${chatId}DataTimestamp`, Date.now().toString());
  localStorage.setItem(`chatData`, JSON.stringify(chatData));
  localStorage.setItem(`chatDataTimestamp`, Date.now().toString());

  return messageData;
}

export async function readMessage(ids: number[] = [], chatId = 0, isLastMessage = false) {
  const messageLocalData = localStorage.getItem(`message${chatId}Data`) || "";
  const chatLocalData = localStorage.getItem(`chatData`) || "";
  let messageData = JSON.parse(messageLocalData) as Message[]
  let chatData = JSON.parse(chatLocalData) as Chat[]

  if (isLastMessage) {
    let activeChatData = chatData.find(v => v.id == chatId) as Chat;
    activeChatData = {
      ...activeChatData,
      isReaded: true,
    }
    chatData = chatData.map(v => {
      if (v.id == chatId) {
        return activeChatData;
      }
      return v;
    }) as Chat[]
    localStorage.setItem(`chatData`, JSON.stringify(chatData));
    localStorage.setItem(`chatDataTimestamp`, Date.now().toString());
  }

  messageData = messageData.map(v => {
    if (ids.includes(v.id)) {
      v.isReaded = true
    }
    return v;
  })

  localStorage.setItem(`message${chatId}Data`, JSON.stringify(messageData));
  localStorage.setItem(`message${chatId}DataTimestamp`, Date.now().toString());
}

export async function deleteMessage(id=0, chatId=0) {
  const messageLocalData = localStorage.getItem(`message${chatId}Data`) || "";
  const chatLocalData = localStorage.getItem(`chatData`) || "";

  let messageData = JSON.parse(messageLocalData) as Message[]
  let chatData = JSON.parse(chatLocalData) as Chat[]
  let isLastMessage = messageData.findIndex(v => v.id == id)==messageData.length-1;

  messageData = [...messageData.filter(v => v.id!=id)]

  if (isLastMessage) {
    let activeChatData = chatData.find(v => v.id == chatId) as Chat;
    let lastMessage = messageData[messageData.length-1]
    activeChatData = {
      ...activeChatData,
      isReaded: true,
      lastMessage: lastMessage.body,
      lastMessageAt: lastMessage.createdAt,
      lastMessageBy: lastMessage.senderId
    }
    chatData = chatData.map(v => {
      if (v.id == chatId) {
        return activeChatData;
      }
      return v;
    }) as Chat[]
    localStorage.setItem(`chatData`, JSON.stringify(chatData));
    localStorage.setItem(`chatDataTimestamp`, Date.now().toString());
  }

  localStorage.setItem(`message${chatId}Data`, JSON.stringify(messageData));
  localStorage.setItem(`message${chatId}DataTimestamp`, Date.now().toString());
}