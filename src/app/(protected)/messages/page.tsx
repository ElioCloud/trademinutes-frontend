"use client";

import React, { useState } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import { FiSearch, FiPlus, FiPhone, FiVideo, FiMoreHorizontal, FiPaperclip, FiSmile, FiSend } from "react-icons/fi";

const mockConversations = [
  {
    id: 1,
    name: "Jerome Bell",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    lastMessage: "Hello, how are you!",
    time: "Just Now",
    unread: true,
  },
  {
    id: 2,
    name: "Guy Hawkins",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    lastMessage: "Thanks! Looks great!",
    time: "1 min",
    unread: false,
  },
  {
    id: 3,
    name: "Marvin McKinney",
    avatar: "https://randomuser.me/api/portraits/men/36.jpg",
    lastMessage: "Can you find a house for...",
    time: "1 min",
    unread: true,
  },
  {
    id: 4,
    name: "Darlene Robertson",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    lastMessage: "Sent me over the latest...",
    time: "3 mins",
    unread: false,
  },
  {
    id: 5,
    name: "Darrell Steward",
    avatar: "https://randomuser.me/api/portraits/men/68.jpg",
    lastMessage: "I will give you a nice com...",
    time: "15 mins",
    unread: false,
  },
];

const mockGroups = [
  { id: 1, name: "Design Team", avatar: "https://randomuser.me/api/portraits/men/75.jpg", lastMessage: "I will have a look today.", time: "1 min" },
  { id: 2, name: "Human Resource Department", avatar: "https://randomuser.me/api/portraits/women/32.jpg", lastMessage: "I've published the...", time: "2 mins" },
  { id: 3, name: "Campaigns", avatar: "https://randomuser.me/api/portraits/men/36.jpg", lastMessage: "Let's review the...", time: "5 mins" },
];

const mockMessages = [
  { id: 1, user: "Jacob Jones", avatar: "https://randomuser.me/api/portraits/men/75.jpg", text: "A creative brief is a short document that sums up marketing, advertising, or design project mission, goals, challenges, demographics, messaging, and other key details. It's often created by a consultant or a creative project manager. The goal of a brief is to achieve stakeholder alignment on a project before it begins.", time: "Friday 8:05am", isMe: false },
  { id: 2, user: "Wade Warren", avatar: "https://randomuser.me/api/portraits/men/32.jpg", text: "Sound Interesting!\nWhat should we do to start", time: "Friday 8:00am", isMe: false },
  { id: 3, user: "You", avatar: "https://randomuser.me/api/portraits/men/36.jpg", text: "Step 1. The teams who need assistance from the creative team will retrieve the creative brief template from a repository like OneDrive, Google Drive, or an online form.", time: "Friday 4:10pm", isMe: true, reactions: ["👍", "❤️", "😂", "😮"], unread: 2 },
  { id: 4, user: "Cameron Williamson", avatar: "https://randomuser.me/api/portraits/women/22.jpg", text: "Hello, how are you doing.\nWhy don't we go out somewhere?", time: "Friday 4:30pm", isMe: false },
  { id: 5, user: "Robert Fox", avatar: "https://randomuser.me/api/portraits/men/68.jpg", text: "is typing...", time: "", isMe: false, typing: true },
];

const mockImages = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=200&q=80",
];

const mockFiles = [
  { name: "642 TB-DSHN_0001.pdf", type: "pdf", size: "5.38MB", date: "12 Nov, 2023" },
  { name: "Report_week42.mp4", type: "mp4", size: "66.75MB", date: "12 Nov, 2023" },
  { name: "Marketing Campaign Brief.word", type: "word", size: "2.21MB", date: "12 Nov, 2023" },
];

const mockLinks = [
  { name: "Neuro Marketing: How brands are...", url: "#" },
  { name: "Accomplish More Together", url: "#" },
  { name: "How Apple and Nike have branded...", url: "#" },
];

export default function MessagesPage() {
  const [selectedTab, setSelectedTab] = useState("Inbox");
  const [selectedConv, setSelectedConv] = useState(1);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(mockMessages);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [
      ...msgs,
      {
        id: msgs.length + 1,
        user: "You",
        avatar: "https://randomuser.me/api/portraits/men/36.jpg",
        text: input,
        isMe: true,
        time: "Now",
        typing: false,
      },
    ]);
    setInput("");
  };

  return (
    <ProtectedLayout>
      <div className="flex h-[88vh] bg-white rounded-2xl overflow-hidden">
        {/* Sidebar */}
        <aside className="w-1/4 min-w-[260px] bg-white border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  className="w-full pl-10 pr-3 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Search"
                />
              </div>
              <button className="ml-2 p-2 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition">
                <FiPlus />
              </button>
            </div>
            <div className="flex gap-2 mb-2">
              <button
                className={`flex-1 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedTab === "Inbox" ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-emerald-50"}`}
                onClick={() => setSelectedTab("Inbox")}
              >
                Inbox <span className="ml-1 text-xs bg-white/80 text-emerald-600 px-2 py-0.5 rounded-full">24</span>
              </button>
              <button
                className={`flex-1 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedTab === "Explore" ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-emerald-50"}`}
                onClick={() => setSelectedTab("Explore")}
              >
                Explore <span className="ml-1 text-xs bg-white/80 text-emerald-600 px-2 py-0.5 rounded-full">10</span>
              </button>
            </div>
            <button className="w-full mt-2 mb-4 py-2 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition text-sm">
              Create New Group
            </button>
            <div className="text-xs text-gray-400 font-semibold mb-2 mt-4">Messages</div>
            <ul className="space-y-1">
              {mockConversations.map((conv) => (
                <li
                  key={conv.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors group ${selectedConv === conv.id ? "bg-emerald-100" : "hover:bg-gray-100"}`}
                  onClick={() => setSelectedConv(conv.id)}
                >
                  <img src={conv.avatar} className="w-9 h-9 rounded-full object-cover border" alt={conv.name} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate text-gray-900 group-hover:text-emerald-700">{conv.name}</div>
                    <div className="text-xs text-gray-500 truncate">{conv.lastMessage}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-gray-400">{conv.time}</span>
                    {conv.unread && <span className="w-2 h-2 bg-emerald-500 rounded-full" />}
                  </div>
                </li>
              ))}
            </ul>
            <div className="text-xs text-gray-400 font-semibold mb-2 mt-6">Groups</div>
            <ul className="space-y-1">
              {mockGroups.map((group) => (
                <li key={group.id} className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100">
                  <img src={group.avatar} className="w-8 h-8 rounded-full object-cover border" alt={group.name} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate text-gray-900">{group.name}</div>
                    <div className="text-xs text-gray-500 truncate">{group.lastMessage}</div>
                  </div>
                  <span className="text-[10px] text-gray-400">{group.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        {/* Main chat area */}
        <main className="flex-1 flex flex-col bg-gray-50 min-h-0 h-full">
          {/* Chat header */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-8 py-5 bg-white">
            <div className="flex items-center gap-3">
              <img src={mockConversations[0].avatar} className="w-10 h-10 rounded-full object-cover border" alt={mockConversations[0].name} />
              <div>
                <div className="font-semibold text-lg text-gray-900">Marketing Team</div>
                <div className="text-xs text-gray-400">24 members</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full hover:bg-emerald-50 text-emerald-600"><FiPhone /></button>
              <button className="p-2 rounded-full hover:bg-emerald-50 text-emerald-600"><FiVideo /></button>
              <button className="p-2 rounded-full hover:bg-emerald-50 text-emerald-600"><FiMoreHorizontal /></button>
            </div>
          </div>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-8 py-4 space-y-4 min-h-0">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                <div className="flex items-end gap-2 max-w-2xl">
                  {!msg.isMe && <img src={msg.avatar} className="w-8 h-8 rounded-full object-cover border" alt={msg.user} />}
                  <div className={`px-4 py-2 rounded-2xl shadow-sm text-sm ${msg.isMe ? "bg-emerald-100 text-right" : "bg-white border border-gray-100"}`}
                    style={msg.typing ? { fontStyle: 'italic', color: '#aaa' } : {}}>
                    {msg.text}
                  </div>
                  {msg.isMe && <img src={msg.avatar} className="w-8 h-8 rounded-full object-cover border" alt={msg.user} />}
                </div>
                {/* Reactions */}
                {msg.reactions && (
                  <div className="flex gap-1 mt-1 ml-10">
                    {msg.reactions.map((r, i) => (
                      <span key={i} className="text-lg">{r}</span>
                    ))}
                    {msg.unread && <span className="text-xs text-gray-400 ml-2">{msg.unread} Unread</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Input box */}
          <form className="flex items-center gap-2 px-8 py-4 border-t border-gray-100 bg-white sticky bottom-0 z-10" onSubmit={handleSend}>
            <button type="button" className="p-2 rounded-full hover:bg-emerald-50 text-emerald-600"><FiPaperclip /></button>
            <input
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button type="button" className="p-2 rounded-full hover:bg-emerald-50 text-emerald-600"><FiSmile /></button>
            <button className="bg-emerald-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-emerald-600 transition flex items-center gap-2" type="submit">
              <FiSend />
              <span className="hidden md:inline">Send</span>
            </button>
          </form>
        </main>
        {/* Right sidebar: Group Info */}
        <aside className="w-1/4 min-w-[260px] bg-white border-l border-gray-100 flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <img src={mockConversations[0].avatar} className="w-12 h-12 rounded-full object-cover border" alt={mockConversations[0].name} />
              <div>
                <div className="font-semibold text-lg text-gray-900">Marketing Team</div>
                <div className="text-xs text-gray-400">24 members</div>
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              <button className="flex-1 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs">Notification</button>
              <button className="flex-1 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs">Pin Group</button>
              <button className="flex-1 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs">Member</button>
              <button className="flex-1 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs">Setting</button>
            </div>
            <div className="text-xs text-gray-400 font-semibold mb-2">Members</div>
            <div className="flex flex-wrap gap-2 mb-4">
              {[mockConversations[0], mockConversations[1], mockConversations[2]].map((m) => (
                <img key={m.id} src={m.avatar} className="w-8 h-8 rounded-full object-cover border" alt={m.name} />
              ))}
              <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">+21</span>
            </div>
            <div className="text-xs text-gray-400 font-semibold mb-2">Images</div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {mockImages.slice(0, 6).map((img, i) => (
                <img key={i} src={img} className="w-full h-14 object-cover rounded-lg" alt="img" />
              ))}
            </div>
            <div className="text-xs text-gray-400 font-semibold mb-2">Files</div>
            <ul className="mb-4">
              {mockFiles.map((file, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-gray-700 mb-1">
                  <span className="font-bold uppercase text-emerald-600">{file.type}</span>
                  <span>{file.name}</span>
                  <span className="text-gray-400">{file.size}</span>
                  <span className="text-gray-400">{file.date}</span>
                </li>
              ))}
            </ul>
            <div className="text-xs text-gray-400 font-semibold mb-2">Links</div>
            <ul>
              {mockLinks.map((link, i) => (
                <li key={i} className="mb-1">
                  <a href={link.url} className="text-emerald-600 hover:underline text-xs">{link.name}</a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </ProtectedLayout>
  );
} 