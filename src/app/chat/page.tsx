"use client";

import { useState, useEffect, useRef, useCallback, type MouseEvent as ReactMouseEvent } from "react";
import { 
  MapPin, 
  MessageCircle, 
  ShoppingCart, 
  Users, 
  Send, 
  User, 
  Plus, 
  Coins, 
  X, 
  Hash,
  ArrowLeft,
  CheckCircle2 
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { useRouter } from "next/navigation";

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
  isClosed: boolean;
  createdAt: string;
}

type ChannelType = "日常RP";

interface CombinedCard {
  id: string;
  type: "item" | "party";
  data: ItemCard | PartyCard;
  createdAt: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const { isClient } = useApp();
  const router = useRouter();

  const [strongholds, setStrongholds] = useState<MapNode[]>([]);
  const [selectedStronghold, setSelectedStronghold] = useState<MapNode | null>(null);
  const [activeChannel, setActiveChannel] = useState<ChannelType>("日常RP");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [itemCards, setItemCards] = useState<ItemCard[]>([]);
  const [partyCards, setPartyCards] = useState<PartyCard[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [itemForm, setItemForm] = useState({ name: "", description: "", price: "" });
  const [partyForm, setPartyForm] = useState({ title: "", description: "", maxCount: "4", characterId: "" });
  const [joiningParty, setJoiningParty] = useState<string | null>(null);
  const [selectedJoinCharacter, setSelectedJoinCharacter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedCharacters, setHasCheckedCharacters] = useState(false);
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<{
    type: "stronghold";
    target: MapNode;
  } | null>(null);
  const [messageContextMenu, setMessageContextMenu] = useState<{
    messageId: string;
    x: number;
    y: number;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    initializePage();
  }, [user]);

  const initializePage = async () => {
    try {
      setIsLoading(true);
      const [charRes, strongholdRes] = await Promise.all([
        fetch(`/api/characters?userId=${user?.id}`),
        fetch("/api/chat/strongholds")
      ]);

      if (charRes.ok) {
        const chars = await charRes.json();
        setCharacters(chars);
        if (chars.length === 0) {
          router.push("/");
          return;
        }
        if (chars.length > 0) {
          setSelectedCharacter(chars[0]);
        }
      }

      if (strongholdRes.ok) {
        const nodes = await strongholdRes.json();
        setStrongholds(nodes);
        if (nodes.length > 0) {
          setSelectedStronghold(nodes[0]);
        }
      }

      setHasCheckedCharacters(true);
    } catch (error) {
      console.error("Failed to initialize page:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStronghold && hasCheckedCharacters) {
      loadChannelData();
    }
  }, [selectedStronghold, activeChannel, hasCheckedCharacters]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!messageContextMenu) return;

    const closeContextMenu = () => setMessageContextMenu(null);

    window.addEventListener("click", closeContextMenu);
    window.addEventListener("resize", closeContextMenu);
    window.addEventListener("scroll", closeContextMenu, true);

    return () => {
      window.removeEventListener("click", closeContextMenu);
      window.removeEventListener("resize", closeContextMenu);
      window.removeEventListener("scroll", closeContextMenu, true);
    };
  }, [messageContextMenu]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChannelData = useCallback(async () => {
    if (!selectedStronghold) return;
    try {
      const requests = [
        fetch(`/api/chat/${selectedStronghold.id}/messages?channelType=${activeChannel}`)
      ];

      const responses = await Promise.all(requests);

      if (responses[0].ok) {
        const msgs = await responses[0].json();
        setMessages(msgs.reverse());
      }

      const [itemRes, partyRes] = await Promise.all([
        fetch(`/api/chat/${selectedStronghold.id}/items`),
        fetch(`/api/chat/${selectedStronghold.id}/parties`)
      ]);

      if (itemRes.ok) setItemCards(await itemRes.json());
      if (partyRes.ok) setPartyCards(await partyRes.json());
    } catch (error) {
      console.error("Failed to load channel data:", error);
    }
  }, [selectedStronghold, activeChannel]);

  const sendMessage = async () => {
    if (!inputValue.trim() || !user || !selectedStronghold || !selectedCharacter) return;

    try {
      const response = await fetch(`/api/chat/${selectedStronghold.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelType: activeChannel,
          content: inputValue,
          authorId: user.id,
          characterId: selectedCharacter.id
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages([...messages, newMessage]);
        setInputValue("");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const createItem = async () => {
    if (!itemForm.name || !itemForm.description || !itemForm.price || !user || !selectedStronghold || !selectedCharacter) return;

    try {
      const response = await fetch(`/api/chat/${selectedStronghold.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: itemForm.name,
          description: itemForm.description,
          price: itemForm.price,
          authorId: user.id,
          characterId: selectedCharacter.id
        }),
      });

      if (response.ok) {
        const newItem = await response.json();
        setItemCards([newItem, ...itemCards]);
        setShowItemModal(false);
        setItemForm({ name: "", description: "", price: "" });
      }
    } catch (error) {
      console.error("Failed to create item:", error);
    }
  };

  const markItemSold = async (itemId: string) => {
    if (!user || !selectedStronghold) return;

    try {
      const response = await fetch(`/api/chat/${selectedStronghold.id}/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: user.id }),
      });

      if (response.ok) {
        setItemCards(itemCards.filter(i => i.id !== itemId));
      }
    } catch (error) {
      console.error("Failed to mark item sold:", error);
    }
  };

  const createParty = async () => {
    if (!partyForm.title || !partyForm.description || !partyForm.maxCount || !partyForm.characterId || !user || !selectedStronghold) return;

    try {
      const response = await fetch(`/api/chat/${selectedStronghold.id}/parties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: partyForm.title,
          description: partyForm.description,
          maxCount: partyForm.maxCount,
          authorId: user.id,
          characterId: partyForm.characterId
        }),
      });

      if (response.ok) {
        const newParty = await response.json();
        setPartyCards([newParty, ...partyCards]);
        setShowPartyModal(false);
        setPartyForm({ title: "", description: "", maxCount: "4", characterId: "" });
      }
    } catch (error) {
      console.error("Failed to create party:", error);
    }
  };

  const joinParty = async (partyId: string) => {
    if (!selectedJoinCharacter) return;

    try {
      const response = await fetch(`/api/chat/${selectedStronghold?.id}/parties/${partyId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: selectedJoinCharacter }),
      });

      if (response.ok) {
        const updatedParty = await response.json();
        setPartyCards(partyCards.map(p => p.id === partyId ? updatedParty : p));
        setJoiningParty(null);
        setSelectedJoinCharacter("");
      }
    } catch (error) {
      console.error("Failed to join party:", error);
    }
  };

  const closeParty = async (partyId: string) => {
    if (!user || !selectedStronghold) return;

    try {
      const response = await fetch(`/api/chat/${selectedStronghold.id}/parties/${partyId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: user.id }),
      });

      if (response.ok) {
        setPartyCards(partyCards.filter(p => p.id !== partyId));
      }
    } catch (error) {
      console.error("Failed to close party:", error);
    }
  };

  const withdrawMessage = async (messageId: string) => {
    if (!user || !selectedStronghold) return;

    const shouldWithdraw = window.confirm("确定要撤回这条消息吗？");
    if (!shouldWithdraw) {
      setMessageContextMenu(null);
      return;
    }

    try {
      const response = await fetch(`/api/chat/${selectedStronghold.id}/messages/${messageId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: user.id }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        alert(data?.error || "撤回消息失败");
        return;
      }

      setMessages(prev => prev.filter(message => message.id !== messageId));
    } catch (error) {
      console.error("Failed to withdraw message:", error);
      alert("撤回消息失败");
    } finally {
      setMessageContextMenu(null);
    }
  };

  const handleMessageContextMenu = (event: ReactMouseEvent<HTMLDivElement>, message: ChatMessage) => {
    if (!isOwner(message.authorId)) return;

    event.preventDefault();
    setMessageContextMenu({
      messageId: message.id,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleStrongholdClick = (node: MapNode) => {
    if (node.id === selectedStronghold?.id) return;
    setPendingSwitch({ type: "stronghold", target: node });
    setShowSwitchConfirm(true);
  };

  const confirmSwitch = () => {
    if (!pendingSwitch) return;
    setSelectedStronghold(pendingSwitch.target as MapNode);
    setShowSwitchConfirm(false);
    setPendingSwitch(null);
  };

  const cancelSwitch = () => {
    setShowSwitchConfirm(false);
    setPendingSwitch(null);
  };

  const isOwner = (authorId: string) => {
    return user && authorId === user.id;
  };

  const isCharacterInParty = (party: PartyCard, charId: string) => {
    if (party.character?.id === charId) return true;
    return party.members.some(m => m.character.id === charId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const combinedCards: CombinedCard[] = [
    ...itemCards.map(item => ({ id: item.id, type: "item" as const, data: item, createdAt: item.createdAt })),
    ...partyCards.map(party => ({ id: party.id, type: "party" as const, data: party, createdAt: party.createdAt }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const ChannelIcon = {
    "日常RP": MessageCircle
  };

  if (!user || isLoading) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">加载中...</div>
      </div>
    );
  }

  if (!selectedCharacter && characters.length > 0 && hasCheckedCharacters) {
    setShowCharacterSelector(true);
  }

  return (
    <div className="h-screen bg-amber-50 text-amber-900 flex overflow-hidden min-h-0">
      <aside className="w-60 bg-amber-100 border-r border-amber-200 flex flex-col min-h-0">
        <div className="p-4 border-b border-amber-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:text-amber-600 transition-colors p-1.5 hover:bg-amber-200 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-amber-600" />
              <h2 className="font-bold text-sm text-amber-800">据点</h2>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0">
          {strongholds.map((node) => (
            <button
              key={node.id}
              onClick={() => handleStrongholdClick(node)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedStronghold?.id === node.id
                  ? "bg-amber-200 text-amber-900"
                  : "text-amber-700 hover:bg-amber-150 hover:text-amber-800"
              }`}
            >
              <Hash className="h-4 w-4" />
              <span>{node.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-amber-200 flex-shrink-0">
          {selectedCharacter ? (
            <button
              onClick={() => setShowCharacterSelector(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-amber-200 hover:bg-amber-300 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {selectedCharacter.img ? (
                  <img src={selectedCharacter.img} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-sm font-medium text-amber-900 truncate">{selectedCharacter.name}</p>
                <p className="text-xs text-amber-600 truncate">{selectedCharacter.race} · {selectedCharacter.class}</p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setShowCharacterSelector(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-200 hover:bg-amber-300 transition-colors text-sm text-amber-700"
            >
              <User className="h-4 w-4" />
              <span>选择角色</span>
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-auto border-b border-amber-200 bg-amber-100 flex flex-col px-4 py-3 gap-3">
          <div className="flex items-center gap-3">
            <Hash className="h-5 w-5 text-amber-600" />
            <div>
              <h1 className="font-semibold text-sm text-amber-900">{activeChannel}</h1>
              {selectedStronghold && (
                <p className="text-xs text-amber-600">{selectedStronghold.label}</p>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col min-w-0 bg-amber-50">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-amber-600">
                  <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
                  <p>暂无消息，开始聊天吧！</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    onContextMenu={(event) => handleMessageContextMenu(event, message)}
                    className="flex gap-4 hover:bg-amber-100/50 -mx-4 px-4 py-2 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {message.character?.img ? (
                        <img src={message.character.img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-amber-700">
                          {message.character?.name || message.author.username}
                        </span>
                        <span className="text-xs text-amber-500">{formatDate(message.createdAt)}</span>
                      </div>
                      <div className="text-amber-900 prose prose-amber prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-amber-200 bg-amber-50 flex-shrink-0">
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
                    className="w-full bg-amber-100 border border-amber-300 rounded-xl px-4 py-3 text-amber-900 placeholder-amber-600 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none"
                    rows={1}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || !selectedCharacter}
                  className="px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <aside className="w-80 bg-amber-100 border-l border-amber-200 flex flex-col min-h-0">
            <div className="p-4 border-b border-amber-200 flex justify-between items-center flex-shrink-0">
              <h3 className="font-semibold text-sm text-amber-900">活动</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowItemModal(true)}
                  className="p-2 rounded-lg hover:bg-amber-200 text-amber-600 hover:text-amber-800 transition-colors"
                  title="发布物品"
                >
                  <ShoppingCart className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowPartyModal(true)}
                  className="p-2 rounded-lg hover:bg-amber-200 text-amber-600 hover:text-amber-800 transition-colors"
                  title="发布组队"
                >
                  <Users className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
              {combinedCards.length === 0 ? (
                <div className="text-center py-8 text-amber-600">
                  <div className="w-12 h-12 bg-amber-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="h-6 w-6 text-amber-600" />
                  </div>
                  <p className="text-sm">暂无活动</p>
                </div>
              ) : (
                combinedCards.map((card) => (
                  <div key={card.id} className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    {card.type === "item" ? (
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm text-amber-900">{(card.data as ItemCard).name}</h4>
                          <div className="flex items-center gap-1 text-amber-600 font-bold text-xs">
                            <Coins className="h-3 w-3" />
                            <span>{Number((card.data as ItemCard).price).toFixed(2)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-amber-700 mb-3 line-clamp-2">{(card.data as ItemCard).description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-amber-600">
                            {(card.data as ItemCard).character?.name}
                          </span>
                          {isOwner((card.data as ItemCard).authorId) && (
                            <button
                              onClick={() => markItemSold(card.id)}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-green-200 text-green-800 text-xs hover:bg-green-300 transition-colors"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              售出
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-amber-900">{(card.data as PartyCard).title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-1.5 py-0.5 bg-amber-200 text-amber-800 text-xs rounded">
                                {(card.data as PartyCard).members.length + 1}/{(card.data as PartyCard).maxCount}
                              </span>
                              {(card.data as PartyCard).isFull && (
                                <span className="px-1.5 py-0.5 bg-red-200 text-red-800 text-xs rounded">
                                  已满
                                </span>
                              )}
                            </div>
                          </div>
                          {isOwner((card.data as PartyCard).authorId) && (
                            <button
                              onClick={() => closeParty(card.id)}
                              className="text-xs text-amber-600 hover:text-red-600"
                            >
                              关闭
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-amber-700 mb-3 line-clamp-2">{(card.data as PartyCard).description}</p>
                        <div className="mb-3">
                          <p className="text-xs text-amber-600 mb-1">成员:</p>
                          <div className="flex flex-wrap gap-1">
                            {(card.data as PartyCard).character && (
                              <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-xs rounded">
                                {(card.data as PartyCard).character!.name}
                              </span>
                            )}
                            {(card.data as PartyCard).members.map((member) => (
                              <span key={member.id} className="px-2 py-0.5 bg-amber-200 text-amber-900 text-xs rounded">
                                {member.character.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        {!(card.data as PartyCard).isFull && !(card.data as PartyCard).isClosed && (
                          <div>
                            {joiningParty === card.id ? (
                              <div className="space-y-2">
                                <select
                                  className="w-full bg-amber-100 border border-amber-300 rounded-lg px-2 py-1.5 text-xs text-amber-900"
                                  onChange={(e) => setSelectedJoinCharacter(e.target.value)}
                                  value={selectedJoinCharacter}
                                >
                                  <option value="">选择角色...</option>
                                  {characters.map(char => (
                                    <option 
                                      key={char.id} 
                                      value={char.id}
                                      disabled={isCharacterInParty(card.data as PartyCard, char.id)}
                                      className={isCharacterInParty(card.data as PartyCard, char.id) ? "text-amber-400" : ""}
                                    >
                                      {char.name} {isCharacterInParty(card.data as PartyCard, char.id) ? "(已加入)" : ""}
                                    </option>
                                  ))}
                                </select>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => joinParty(card.id)}
                                    disabled={!selectedJoinCharacter || isCharacterInParty(card.data as PartyCard, selectedJoinCharacter)}
                                    className="flex-1 px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs transition-colors"
                                  >
                                    确认加入
                                  </button>
                                  <button
                                    onClick={() => {
                                      setJoiningParty(null);
                                      setSelectedJoinCharacter("");
                                    }}
                                    className="px-2 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-800 text-xs transition-colors"
                                  >
                                    取消
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setJoiningParty(card.id)}
                                className="w-full px-2 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs transition-colors"
                              >
                                加入队伍
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </main>

      {showCharacterSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCharacterSelector(false)}>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-amber-900">选择角色</h3>
              <button onClick={() => setShowCharacterSelector(false)} className="text-amber-600 hover:text-amber-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {characters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => {
                    setSelectedCharacter(char);
                    setShowCharacterSelector(false);
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-colors ${
                    selectedCharacter?.id === char.id
                      ? "border-amber-500 bg-amber-100"
                      : "border-amber-200 bg-amber-50 hover:border-amber-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center overflow-hidden">
                      {char.img ? (
                        <img src={char.img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-7 w-7 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-amber-900">{char.name}</p>
                      <p className="text-sm text-amber-600">{char.race} · {char.class}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showItemModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowItemModal(false)}>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-amber-900">发布物品</h3>
              <button onClick={() => setShowItemModal(false)} className="text-amber-600 hover:text-amber-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-amber-700 mb-2">物品名称</label>
                <input 
                  type="text" 
                  className="w-full bg-amber-100 border border-amber-300 rounded-xl px-4 py-3 text-amber-900 placeholder-amber-600 focus:outline-none focus:border-amber-500"
                  placeholder="物品名称"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-amber-700 mb-2">物品价格</label>
                <div className="relative">
                  <Coins className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600" />
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    className="w-full bg-amber-100 border border-amber-300 rounded-xl pl-10 pr-4 py-3 text-amber-900 placeholder-amber-600 focus:outline-none focus:border-amber-500"
                    placeholder="0.00"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-amber-700 mb-2">物品描述</label>
                <textarea 
                  className="w-full bg-amber-100 border border-amber-300 rounded-xl px-4 py-3 text-amber-900 h-32 placeholder-amber-600 focus:outline-none focus:border-amber-500 resize-none"
                  placeholder="描述你的物品..."
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowItemModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={createItem}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors"
                >
                  发布
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPartyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowPartyModal(false)}>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-amber-900">发布组队</h3>
              <button onClick={() => setShowPartyModal(false)} className="text-amber-600 hover:text-amber-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-amber-700 mb-2">选择角色</label>
                <select 
                  className="w-full bg-amber-100 border border-amber-300 rounded-xl px-4 py-3 text-amber-900 focus:outline-none focus:border-amber-500"
                  value={partyForm.characterId}
                  onChange={(e) => setPartyForm({ ...partyForm, characterId: e.target.value })}
                >
                  <option value="">请选择一个角色...</option>
                  {characters.map(char => (
                    <option key={char.id} value={char.id}>
                      {char.name} ({char.race} · {char.class})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-amber-700 mb-2">组队标题</label>
                <input 
                  type="text" 
                  className="w-full bg-amber-100 border border-amber-300 rounded-xl px-4 py-3 text-amber-900 placeholder-amber-600 focus:outline-none focus:border-amber-500"
                  placeholder="组队标题"
                  value={partyForm.title}
                  onChange={(e) => setPartyForm({ ...partyForm, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-amber-700 mb-2">队伍人数</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600" />
                  <input 
                    type="number" 
                    min="1"
                    max="10"
                    className="w-full bg-amber-100 border border-amber-300 rounded-xl pl-10 pr-4 py-3 text-amber-900 placeholder-amber-600 focus:outline-none focus:border-amber-500"
                    placeholder="4"
                    value={partyForm.maxCount}
                    onChange={(e) => setPartyForm({ ...partyForm, maxCount: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-amber-700 mb-2">组队描述</label>
                <textarea 
                  className="w-full bg-amber-100 border border-amber-300 rounded-xl px-4 py-3 text-amber-900 h-32 placeholder-amber-600 focus:outline-none focus:border-amber-500 resize-none"
                  placeholder="描述你的组队需求..."
                  value={partyForm.description}
                  onChange={(e) => setPartyForm({ ...partyForm, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowPartyModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={createParty}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors"
                >
                  发布
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSwitchConfirm && pendingSwitch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={cancelSwitch}>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-amber-900">确认切换</h3>
              <button onClick={cancelSwitch} className="text-amber-600 hover:text-amber-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-amber-800">
                确定要切换到据点 "{pendingSwitch.target.label}" 吗？
              </p>
              <p className="text-xs text-amber-600 mt-2">切换后将加载新的消息和活动卡片。</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={cancelSwitch}
                className="flex-1 px-4 py-3 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={confirmSwitch}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {messageContextMenu && (
        <div
          className="fixed z-[60] min-w-[120px] rounded-lg border border-amber-200 bg-amber-50 shadow-lg py-1"
          style={{ top: messageContextMenu.y, left: messageContextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => withdrawMessage(messageContextMenu.messageId)}
            className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
          >
            撤回消息
          </button>
        </div>
      )}
    </div>
  );
}
