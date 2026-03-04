"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  MapPin, 
  MessageCircle, 
  ShoppingCart, 
  Users, 
  Send, 
  X, 
  User, 
  Trash2, 
  Reply, 
  Plus, 
  Coins, 
  Calendar, 
  CheckCircle2 
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/contexts/AuthContext";

interface MapNode {
  id: string;
  label: string;
  type: string;
  description: string | null;
}

interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  img: string | null;
}

interface ChatMessage {
  id: string;
  content: string;
  authorId: string;
  author: { id: string; username: string };
  characterId: string | null;
  character: Character | null;
  replyToId: string | null;
  replyTo: ChatMessage | null;
  createdAt: string;
}

interface ItemCard {
  id: string;
  name: string;
  description: string;
  price: number;
  authorId: string;
  author: { id: string; username: string };
  characterId: string | null;
  character: Character | null;
  createdAt: string;
}

interface PartyCard {
  id: string;
  title: string;
  description: string;
  maxCount: number;
  authorId: string;
  author: { id: string; username: string };
  characterId: string | null;
  character: Character | null;
  members: { id: string; character: Character }[];
  isFull: boolean;
  createdAt: string;
}

type ChannelType = "日常RP" | "玩家交易" | "寻找队友";

interface ChatRoomProps {
  node: MapNode;
  onBack: () => void;
}

export default function ChatRoom({ node, onBack }: ChatRoomProps) {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState<ChannelType>("日常RP");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [items, setItems] = useState<ItemCard[]>([]);
  const [parties, setParties] = useState<PartyCard[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showItemsList, setShowItemsList] = useState(false);
  const [showPartiesList, setShowPartiesList] = useState(false);
  const [itemForm, setItemForm] = useState({ name: "", description: "", price: "" });
  const [partyForm, setPartyForm] = useState({ title: "", description: "", maxCount: "4" });
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, activeChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [charsRes] = await Promise.all([
        fetch(`/api/characters?userId=${user?.id}`)
      ]);
      
      if (charsRes.ok) {
        setCharacters(await charsRes.json());
      }

      await loadMessages();
      
      if (activeChannel === "玩家交易") {
        await loadItems();
      } else if (activeChannel === "寻找队友") {
        await loadParties();
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/chat/${node.id}/messages?channelType=${activeChannel}`);
      if (response.ok) {
        setMessages(await response.json());
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const loadItems = async () => {
    try {
      const response = await fetch(`/api/chat/${node.id}/items`);
      if (response.ok) {
        setItems(await response.json());
      }
    } catch (error) {
      console.error("Failed to load items:", error);
    }
  };

  const loadParties = async () => {
    try {
      const response = await fetch(`/api/chat/${node.id}/parties`);
      if (response.ok) {
        setParties(await response.json());
      }
    } catch (error) {
      console.error("Failed to load parties:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !user) return;

    try {
      const response = await fetch(`/api/chat/${node.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelType: activeChannel,
          content: inputValue,
          authorId: user.id,
          characterId: selectedCharacter?.id || null,
          replyToId: replyingTo?.id || null
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages([...messages, newMessage]);
        setInputValue("");
        setReplyingTo(null);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("发送消息失败");
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!user || !confirm("确定要撤回这条消息吗？")) return;

    try {
      const response = await fetch(`/api/chat/${node.id}/messages/${messageId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: user.id }),
      });

      if (response.ok) {
        setMessages(messages.filter(m => m.id !== messageId));
      } else {
        const error = await response.json();
        alert(error.error || "撤回失败");
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
      alert("撤回失败");
    }
  };

  const createItem = async () => {
    if (!itemForm.name || !itemForm.description || !itemForm.price || !user) return;

    try {
      const response = await fetch(`/api/chat/${node.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: itemForm.name,
          description: itemForm.description,
          price: itemForm.price,
          authorId: user.id,
          characterId: selectedCharacter?.id || null
        }),
      });

      if (response.ok) {
        const newItem = await response.json();
        setItems([newItem, ...items]);
        setShowItemModal(false);
        setItemForm({ name: "", description: "", price: "" });
      }
    } catch (error) {
      console.error("Failed to create item:", error);
      alert("创建物品卡片失败");
    }
  };

  const markItemSold = async (itemId: string) => {
    if (!user || !confirm("确定要标记为已售出吗？")) return;

    try {
      const response = await fetch(`/api/chat/${node.id}/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: user.id }),
      });

      if (response.ok) {
        setItems(items.filter(i => i.id !== itemId));
      } else {
        const error = await response.json();
        alert(error.error || "标记失败");
      }
    } catch (error) {
      console.error("Failed to mark item sold:", error);
      alert("标记失败");
    }
  };

  const createParty = async () => {
    if (!partyForm.title || !partyForm.description || !partyForm.maxCount || !user) return;

    try {
      const response = await fetch(`/api/chat/${node.id}/parties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: partyForm.title,
          description: partyForm.description,
          maxCount: partyForm.maxCount,
          authorId: user.id,
          characterId: selectedCharacter?.id || null
        }),
      });

      if (response.ok) {
        const newParty = await response.json();
        setParties([newParty, ...parties]);
        setShowPartyModal(false);
        setPartyForm({ title: "", description: "", maxCount: "4" });
      }
    } catch (error) {
      console.error("Failed to create party:", error);
      alert("创建组队卡片失败");
    }
  };

  const joinParty = async (partyId: string) => {
    if (!selectedCharacter) {
      alert("请先选择一个角色");
      setShowCharacterSelector(true);
      return;
    }

    try {
      const response = await fetch(`/api/chat/${node.id}/parties/${partyId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: selectedCharacter.id }),
      });

      if (response.ok) {
        const updatedParty = await response.json();
        setParties(parties.map(p => p.id === partyId ? updatedParty : p));
      } else {
        const error = await response.json();
        alert(error.error || "加入组队失败");
      }
    } catch (error) {
      console.error("Failed to join party:", error);
      alert("加入组队失败");
    }
  };

  const closeParty = async (partyId: string) => {
    if (!user || !confirm("确定要关闭这个组队吗？")) return;

    try {
      const response = await fetch(`/api/chat/${node.id}/parties/${partyId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: user.id }),
      });

      if (response.ok) {
        setParties(parties.filter(p => p.id !== partyId));
      } else {
        const error = await response.json();
        alert(error.error || "关闭组队失败");
      }
    } catch (error) {
      console.error("Failed to close party:", error);
      alert("关闭组队失败");
    }
  };

  const isOwner = (authorId: string) => {
    return user && authorId === user.id;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const ChannelIcon = {
    "日常RP": MessageCircle,
    "玩家交易": ShoppingCart,
    "寻找队友": Users
  };

  const renderMessages = () => (
    <div className="space-y-4 max-w-4xl">
      {messages.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="h-12 w-12 text-amber-700/50 mx-auto mb-4" />
          <p className="text-amber-800/60">暂无消息，开始聊天吧！</p>
        </div>
      ) : (
        messages.map((message) => (
          <div key={message.id} className="group flex gap-4 hover:bg-amber-100/50 -mx-4 px-4 py-2 rounded-lg transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              {message.character?.img ? (
                <img src={message.character.img} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-semibold text-amber-900">
                  {message.character?.name || message.author.username}
                </span>
                <span className="text-xs text-amber-700/60">{formatDate(message.createdAt)}</span>
              </div>
              {message.replyTo && (
                <div className="mb-2 pl-3 border-l-2 border-amber-300 text-sm text-amber-800/70">
                  <p className="text-xs text-amber-700/60 mb-1">
                    回复 {message.replyTo.character?.name || message.replyTo.author.username}
                  </p>
                  <p className="line-clamp-2">{message.replyTo.content}</p>
                </div>
              )}
              <div className="text-amber-900 prose prose-amber prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              </div>
              <div className="mt-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setReplyingTo(message)}
                  className="text-xs text-amber-700/60 hover:text-amber-800 flex items-center gap-1"
                >
                  <Reply className="h-3 w-3" />
                  回复
                </button>
                {isOwner(message.authorId) && (
                  <button
                    onClick={() => deleteMessage(message.id)}
                    className="text-xs text-amber-700/60 hover:text-red-600 flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    撤回
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );

  const renderTradingChannel = () => (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-amber-900">玩家交易</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowItemsList(!showItemsList)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-200/60 hover:bg-amber-300/60 text-sm text-amber-900 transition-all"
          >
            <ShoppingCart className="h-4 w-4" />
            {showItemsList ? "隐藏列表" : "查看所有物品"}
          </button>
          <button
            onClick={() => setShowItemModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            发布物品
          </button>
        </div>
      </div>
      {showItemsList ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {items.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <ShoppingCart className="h-12 w-12 text-amber-700/50 mx-auto mb-4" />
              <p className="text-amber-800/60">暂无物品，发布第一个吧！</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-amber-100/60 border border-amber-300/60 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-amber-900">{item.name}</h3>
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <Coins className="h-4 w-4" />
                    <span>{Number(item.price).toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-sm text-amber-800/70 mb-4 line-clamp-3">{item.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-amber-700/60">
                    {item.character && (
                      <span>{item.character.name}</span>
                    )}
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  {isOwner(item.authorId) && (
                    <button
                      onClick={() => markItemSold(item.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-green-200/60 text-green-800 text-xs hover:bg-green-300/60 transition-colors"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      标记售出
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="text-center py-16 mb-6">
          <ShoppingCart className="h-12 w-12 text-amber-700/50 mx-auto mb-4" />
          <p className="text-amber-800/60">点击"查看所有物品"浏览交易物品</p>
        </div>
      )}
      {renderMessages()}
    </div>
  );

  const renderPartyChannel = () => (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-amber-900">寻找队友</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPartiesList(!showPartiesList)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-200/60 hover:bg-amber-300/60 text-sm text-amber-900 transition-all"
          >
            <Users className="h-4 w-4" />
            {showPartiesList ? "隐藏列表" : "查看所有组队"}
          </button>
          <button
            onClick={() => setShowPartyModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            发布组队
          </button>
        </div>
      </div>
      {showPartiesList ? (
        <div className="space-y-4 mb-6">
          {parties.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-amber-700/50 mx-auto mb-4" />
              <p className="text-amber-800/60">暂无组队，发布第一个吧！</p>
            </div>
          ) : (
            parties.map((party) => (
              <div key={party.id} className="bg-amber-100/60 border border-amber-300/60 rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-amber-900 mb-1">{party.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-amber-300/40 text-amber-800 text-xs rounded border border-amber-400/30">
                        {party.members.length + 1}/{party.maxCount} 人
                      </span>
                      {party.isFull && (
                        <span className="px-2 py-0.5 bg-red-200/40 text-red-800 text-xs rounded border border-red-400/30">
                          已满
                        </span>
                      )}
                    </div>
                  </div>
                  {isOwner(party.authorId) && (
                    <button
                      onClick={() => closeParty(party.id)}
                      className="text-xs text-amber-700/60 hover:text-red-600"
                    >
                      关闭组队
                    </button>
                  )}
                </div>
                <p className="text-sm text-amber-800/70 mb-4">{party.description}</p>
                {party.members.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-amber-700/60 mb-2">队伍成员:</p>
                    <div className="flex flex-wrap gap-2">
                      {party.character && (
                        <div className="flex items-center gap-2 bg-amber-200/60 px-3 py-1.5 rounded-lg border border-amber-300/60">
                          <div className="w-5 h-5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{party.character.name[0]}</span>
                          </div>
                          <span className="text-sm font-medium text-amber-900">{party.character.name}</span>
                        </div>
                      )}
                      {party.members.map((member) => (
                        <div key={member.id} className="flex items-center gap-2 bg-amber-200/60 px-3 py-1.5 rounded-lg border border-amber-300/60">
                          <div className="w-5 h-5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{member.character.name[0]}</span>
                          </div>
                          <span className="text-sm font-medium text-amber-900">{member.character.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-amber-700/60">
                    {formatDate(party.createdAt)}
                  </div>
                  {!party.isFull && !isOwner(party.authorId) && (
                    <button
                      onClick={() => joinParty(party.id)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-sm transition-all"
                    >
                      加入队伍
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="text-center py-16 mb-6">
          <Users className="h-12 w-12 text-amber-700/50 mx-auto mb-4" />
          <p className="text-amber-800/60">点击"查看所有组队"浏览组队信息</p>
        </div>
      )}
      {renderMessages()}
    </div>
  );

  return (
    <div className="min-h-screen bg-amber-50 text-amber-900 flex flex-col">
      <header className="border-b border-amber-200/60 bg-amber-100/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="hover:text-amber-600 transition-colors p-2 hover:bg-amber-200/60 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-amber-900">{node.label}</h1>
              <p className="text-xs text-amber-700/60">据点聊天室</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-48 bg-amber-100/60 border-r border-amber-200/60 flex flex-col">
          <div className="p-4 border-b border-amber-200/60">
            <p className="text-xs text-amber-700/60 font-semibold uppercase tracking-wider mb-2">频道</p>
          </div>
          <nav className="flex-1 p-2 space-y-1">
            {(["日常RP", "玩家交易", "寻找队友"] as ChannelType[]).map((channel) => {
              const Icon = ChannelIcon[channel];
              return (
                <button
                  key={channel}
                  onClick={() => setActiveChannel(channel)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    activeChannel === channel
                      ? "bg-amber-200/70 text-amber-900"
                      : "text-amber-700/70 hover:bg-amber-200/40 hover:text-amber-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{channel}</span>
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-amber-200/60">
            {selectedCharacter ? (
              <button
                onClick={() => setShowCharacterSelector(true)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-amber-200/60 hover:bg-amber-300/60 transition-all"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center overflow-hidden">
                  {selectedCharacter.img ? (
                    <img src={selectedCharacter.img} alt={selectedCharacter.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-amber-900">{selectedCharacter.name}</p>
                  <p className="text-xs text-amber-700/60">{selectedCharacter.race} · {selectedCharacter.class}</p>
                </div>
              </button>
            ) : (
              <button
                onClick={() => setShowCharacterSelector(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-200/60 hover:bg-amber-300/60 transition-all text-sm text-amber-700/70"
              >
                <User className="h-4 w-4" />
                <span>选择角色</span>
              </button>
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-amber-50">
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-amber-700/60">加载中...</p>
              </div>
            ) : activeChannel === "日常RP" ? (
              renderMessages()
            ) : activeChannel === "玩家交易" ? (
              renderTradingChannel()
            ) : (
              renderPartyChannel()
            )}
          </div>

          <div className="border-t border-amber-200/60 p-4">
            {replyingTo && (
              <div className="mb-3 flex items-center gap-2 bg-amber-200/60 rounded-lg px-3 py-2">
                <Reply className="h-4 w-4 text-amber-700/60" />
                <span className="text-sm text-amber-800/70">
                  回复 {replyingTo.character?.name || replyingTo.author.username}
                </span>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="ml-auto text-amber-700/60 hover:text-amber-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={`在 #${activeChannel} 中发言...`}
                  className="w-full bg-amber-100/60 border border-amber-300/60 rounded-xl px-4 py-3 text-amber-900 placeholder-amber-700/50 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 resize-none"
                  rows={1}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim()}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </main>
      </div>

      {showCharacterSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300" onClick={() => setShowCharacterSelector(false)}>
          <div className="bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-300/60 rounded-3xl p-8 w-full max-w-2xl mx-4 shadow-2xl shadow-amber-900/20 animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-3 text-amber-900">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                选择角色
              </h3>
              <button onClick={() => setShowCharacterSelector(false)} className="text-amber-700/60 hover:text-amber-800 transition-colors p-2 hover:bg-amber-200/60 rounded-xl">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {characters.map((char) => (
                  <div
                    key={char.id}
                    className={`bg-amber-100/80 border border-amber-300/60 rounded-xl p-4 cursor-pointer transition-all duration-300 backdrop-blur-sm ${
                      selectedCharacter?.id === char.id ? 'border-amber-500/60 bg-amber-200/70' : 'hover:border-amber-500/60'
                    }`}
                    onClick={() => {
                      setSelectedCharacter(char);
                      setShowCharacterSelector(false);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-amber-500/20">
                        {char.img ? (
                          <img src={char.img} alt={char.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-8 w-8 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-amber-900">{char.name}</p>
                        <p className="text-sm text-amber-700/70">{char.race} · {char.class}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {characters.length === 0 && (
                <div className="text-center py-12">
                  <User className="h-12 w-12 text-amber-700/50 mx-auto mb-4" />
                  <p className="text-amber-700/70">暂无角色，请先去角色卡册创建</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showItemModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-8 animate-in fade-in duration-300" onClick={() => setShowItemModal(false)}>
          <div className="bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-300/60 rounded-3xl p-8 w-full max-w-lg mx-4 shadow-2xl shadow-amber-900/20 animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <ShoppingCart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-900">发布物品</h3>
                  <p className="text-amber-700/60 text-sm">创建新的交易物品</p>
                </div>
              </div>
              <button onClick={() => setShowItemModal(false)} className="text-amber-700/60 hover:text-amber-800 transition-colors p-2 hover:bg-amber-200/60 rounded-xl">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-amber-700/70 mb-2">物品名称 *</label>
                <input 
                  type="text" 
                  className="w-full bg-amber-100/60 border border-amber-300/60 rounded-xl px-4 py-3 text-amber-900 placeholder-amber-700/50 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 backdrop-blur-sm transition-all" 
                  placeholder="物品名称"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-amber-700/70 mb-2">物品价格 *</label>
                <div className="relative">
                  <Coins className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600" />
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    className="w-full bg-amber-100/60 border border-amber-300/60 rounded-xl pl-10 pr-4 py-3 text-amber-900 placeholder-amber-700/50 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 backdrop-blur-sm transition-all" 
                    placeholder="0.00"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-amber-700/70 mb-2">物品描述 *</label>
                <textarea 
                  className="w-full bg-amber-100/60 border border-amber-300/60 rounded-xl px-4 py-3 text-amber-900 h-32 placeholder-amber-700/50 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 backdrop-blur-sm transition-all resize-none" 
                  placeholder="描述你的物品..."
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowItemModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-amber-200/60 hover:bg-amber-300/60 text-amber-800 transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={createItem}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl shadow-lg shadow-amber-500/30 transition-all"
                >
                  发布
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPartyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-8 animate-in fade-in duration-300" onClick={() => setShowPartyModal(false)}>
          <div className="bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-300/60 rounded-3xl p-8 w-full max-w-lg mx-4 shadow-2xl shadow-amber-900/20 animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-900">发布组队</h3>
                  <p className="text-amber-700/60 text-sm">寻找冒险伙伴</p>
                </div>
              </div>
              <button onClick={() => setShowPartyModal(false)} className="text-amber-700/60 hover:text-amber-800 transition-colors p-2 hover:bg-amber-200/60 rounded-xl">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-amber-700/70 mb-2">组队标题 *</label>
                <input 
                  type="text" 
                  className="w-full bg-amber-100/60 border border-amber-300/60 rounded-xl px-4 py-3 text-amber-900 placeholder-amber-700/50 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 backdrop-blur-sm transition-all" 
                  placeholder="组队标题"
                  value={partyForm.title}
                  onChange={(e) => setPartyForm({ ...partyForm, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-amber-700/70 mb-2">队伍人数 *</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600" />
                  <input 
                    type="number" 
                    min="1"
                    max="10"
                    className="w-full bg-amber-100/60 border border-amber-300/60 rounded-xl pl-10 pr-4 py-3 text-amber-900 placeholder-amber-700/50 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 backdrop-blur-sm transition-all" 
                    placeholder="4"
                    value={partyForm.maxCount}
                    onChange={(e) => setPartyForm({ ...partyForm, maxCount: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-amber-700/70 mb-2">组队描述 *</label>
                <textarea 
                  className="w-full bg-amber-100/60 border border-amber-300/60 rounded-xl px-4 py-3 text-amber-900 h-32 placeholder-amber-700/50 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 backdrop-blur-sm transition-all resize-none" 
                  placeholder="描述你的组队需求..."
                  value={partyForm.description}
                  onChange={(e) => setPartyForm({ ...partyForm, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowPartyModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-amber-200/60 hover:bg-amber-300/60 text-amber-800 transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={createParty}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl shadow-lg shadow-amber-500/30 transition-all"
                >
                  发布
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
