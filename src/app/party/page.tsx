"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, User, Calendar, X, CheckCircle2, Sword } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { useSearchParams } from "next/navigation";

interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  img: string | null;
}

const initialCharacters: Character[] = [
  {
    id: "1",
    name: "芙蕾雅",
    race: "人类",
    class: "法师",
    img: null,
  },
  {
    id: "2",
    name: "铁锤·石拳",
    race: "矮人",
    class: "战士",
    img: null,
  },
  {
    id: "3",
    name: "月影·行者",
    race: "精灵",
    class: "游侠",
    img: null,
  },
];

interface PartyData {
  selectedCharacter: Character | null;
  title: string;
  content: string;
  nextSessionTime: string;
}

export default function PartyPage() {
  const { user } = useAuth();
  const { settings } = useApp();
  const searchParams = useSearchParams();
  const [characters] = useState<Character[]>(initialCharacters);
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [partyData, setPartyData] = useState<PartyData>(() => {
    const title = searchParams.get("title") || "寻找队伍";
    const content = searchParams.get("content") || "";
    return {
      selectedCharacter: null,
      title,
      content,
      nextSessionTime: "",
    };
  });

  const selectCharacter = (char: Character) => {
    setPartyData({ ...partyData, selectedCharacter: char });
    setShowCharacterSelector(false);
  };

  const handleSubmit = () => {
    if (!partyData.selectedCharacter) {
      alert("请选择要加入队伍的角色");
      return;
    }
    if (!partyData.title) {
      alert("请输入标题");
      return;
    }
    if (!partyData.content) {
      alert("请输入内容");
      return;
    }
    alert("组队信息已提交！（演示）");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">需要登录</h2>
          <p className="text-zinc-400 mb-6">请先登录才能发起组队</p>
          <Link href="/">
            <Button className="bg-amber-600 hover:bg-amber-700">
              返回首页登录
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {showCharacterSelector && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <User className="h-5 w-5" />
                选择加入队伍的角色
              </h3>
              <button onClick={() => setShowCharacterSelector(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {characters.map((char) => (
                  <div
                    key={char.id}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 cursor-pointer hover:border-amber-500/50 transition-colors"
                    onClick={() => selectCharacter(char)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-zinc-900 rounded-lg flex items-center justify-center overflow-hidden">
                        {char.img ? (
                          <img src={char.img} alt={char.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-8 w-8 text-zinc-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{char.name}</p>
                        <p className="text-sm text-zinc-400">{char.race} · {char.class}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-amber-500" />
              <h1 className="text-xl font-bold">组队界面</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>选择角色</CardTitle>
              <CardDescription>选择要加入队伍的角色</CardDescription>
            </CardHeader>
            <CardContent>
              {partyData.selectedCharacter ? (
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-zinc-900 rounded-lg flex items-center justify-center overflow-hidden">
                        {partyData.selectedCharacter.img ? (
                          <img src={partyData.selectedCharacter.img} alt={partyData.selectedCharacter.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-8 w-8 text-zinc-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                          {partyData.selectedCharacter.name}
                        </p>
                        <p className="text-sm text-zinc-400">{partyData.selectedCharacter.race} · {partyData.selectedCharacter.class}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setShowCharacterSelector(true)}
                    >
                      更换角色
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  className="w-full bg-zinc-800 hover:bg-zinc-700"
                  onClick={() => setShowCharacterSelector(true)}
                >
                  <User className="h-4 w-4 mr-2" />
                  选择角色
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>填写组队的标题和内容</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">标题</label>
                <input
                  type="text"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
                  placeholder="输入标题"
                  value={partyData.title}
                  onChange={(e) => setPartyData({ ...partyData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">内容</label>
                <textarea
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white h-32"
                  placeholder="输入组队内容"
                  value={partyData.content}
                  onChange={(e) => setPartyData({ ...partyData, content: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                下一次跑团时间
              </CardTitle>
              <CardDescription>设置下一次跑团的时间</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="datetime-local"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white"
                value={partyData.nextSessionTime}
                onChange={(e) => setPartyData({ ...partyData, nextSessionTime: e.target.value })}
              />
            </CardContent>
          </Card>

          <Button
            className="w-full bg-amber-600 hover:bg-amber-700"
            onClick={handleSubmit}
          >
            <Sword className="h-4 w-4 mr-2" />
            提交组队信息
          </Button>
        </div>
      </main>
    </div>
  );
}
