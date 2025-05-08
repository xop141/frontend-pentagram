"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Smile } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API } from "@/utils/api";
import ChatDrawer from "../component/chatDrawer";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

let socket: Socket;

const Page = () => {
  const [msg, setMsg] = useState("");
  const [received, setReceived] = useState<any[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [prevMessage, setPrevMessage] = useState<any[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const params = useParams();
  const roomId = params.id;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [prevMessage, received]);

  useEffect(() => {
    const userIdFromStorage = JSON.parse(localStorage.getItem("id") || "{}");
    if (userIdFromStorage && userIdFromStorage.id) {
      setCurrentId(userIdFromStorage.id);
    } else {
      console.log("User not logged in or userId not found in localStorage");
    }
  }, []);

  useEffect(() => {
    if (!currentId) return;

    socket = io(API);

    socket.emit("join-room", {
      roomId,
      currentId: currentId as string,
    });

    socket.on("previousMessages", (messages) => {
      setPrevMessage(messages);
    });

    socket.on("fromServer", (data) => {
      setReceived((prevMsgs) => [...prevMsgs, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentId, roomId]);

  const sendChat = () => {
    if (!currentId || msg.trim() === "") {
      return;
    }

    socket.emit("serverMSG", {
      roomId,
      senderId: currentId as string,
      content: msg,
    });

    setMsg("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      sendChat();
    }
  };

  return (
    <div className="bg-black w-full h-[100vh] text-white flex flex-col justify-between relative">
      <div className="flex-1 overflow-y-auto p-4">
        <div>
          {[...prevMessage, ...received].map((message, index) => {
            const isCurrentUser = message.sender._id === currentId;
            return (
              <div
                key={index}
                className={`mb-4 flex items-start gap-2 ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isCurrentUser && (
                  <Avatar>
                    <AvatarImage src={message.sender.avatarImage} />
                    <AvatarFallback>xopp</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`p-3 rounded-xl max-w-[70%] ${
                    isCurrentUser
                      ? "bg-blue-600 text-right"
                      : "bg-gray-700 text-left"
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-700 p-[20px] flex items-center gap-[20px] relative">
        <Smile
          className="cursor-pointer"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        />

        {showEmojiPicker && (
          <div className="absolute bottom-[80px] z-10">emojis (coming soon)</div>
        )}

        <input
          type="text"
          placeholder="Type a message..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full outline-none text-white bg-transparent"
        />

        <Button variant="ghost" onClick={() => setShowDrawer(true)}>
          Open Drawer
        </Button>
      </div>

      <AnimatePresence>
        {showDrawer && (
          <motion.div
            className="fixed top-0 right-0 h-full w-[300px] bg-gray-800 p-4 shadow-xl"
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Chat Drawer</h2>
              <Button variant="ghost" onClick={() => setShowDrawer(false)}>
                Close
              </Button>
            </div>
            <ChatDrawer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Page;
