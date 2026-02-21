"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { initDB, getAllResources, addResource as addResourceDB, deleteResource as deleteResourceDB } from "@/lib/indexedDB";

export type ImageCategory = "homeBg" | "mapBg" | "docsBg" | "boardBg" | "partyBg" | "characterAvatar" | "general";

export interface ResourceImage {
  id: string;
  name: string;
  url: string;
  category: ImageCategory;
  createdAt: number;
}

export interface AppSettings {
  homeBg: string | null;
  mapBg: string | null;
  docsBg: string | null;
  boardBg: string | null;
  partyBg: string | null;
  userNickname: string | null;
  userAvatar: string | null;
  sessionHistory: string[];
}

export interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
}

interface AppContextType {
  resources: ResourceImage[];
  settings: AppSettings;
  isLoading: boolean;
  addResource: (image: Omit<ResourceImage, "id" | "createdAt">) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  verifyPassword: (password: string) => boolean;
  loadResources: () => Promise<void>;
  documents: Document[];
  addDocument: (doc: Omit<Document, "id" | "createdAt" | "updatedAt">) => void;
  updateDocument: (id: string, doc: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
}

const PASSWORD = "WM2006";

const defaultSettings: AppSettings = {
  homeBg: null,
  mapBg: null,
  docsBg: null,
  boardBg: null,
  partyBg: null,
  userNickname: null,
  userAvatar: null,
  sessionHistory: [],
};

const adventureGuideContent = `# 《西征冒险指南》

各位冒险者，无论你是刚刚抵达这片土地的新面孔，还是为了财富而来的雇佣兵，欢迎来到**凡达林**！

凡达林的危机已经解除，昔日的英雄们已经在这里安家落户，将这座边境小镇重建成了文明的避风港。但不要高兴得太早——镇子外面的剑湾荒野、无冬林和废墟深处，依然盘踞着未知的恐怖与诱人的宝藏。

为了让大家在这个庞大的沙盒世界中自由探索，我们将正式开启**西征模式**！为了照顾新玩家，初次加入的玩家只需阅读以下几条核心生存法则，更细致和增加沉浸感的系统将会慢慢开放。

## 1. 城镇是唯一的安全区

在这里，没有"DM，我们这周睡在地城里，下周接着打"的说法。

- **规则：** 所有的冒险**必须**从凡达林出发，并且在每次跑团结束时**必须**返回凡达林（或其他据点）。
- **注意：** 荒野是致命的。如果时间到了但地城没有探索完毕，你们必须果断撤退回镇上。量力而行，活着把战利品带回来才是真本事。

## 2. 玩家是冒险的发起者

不再是传统的由DM发起组织，而是由玩家决定！

- **怎么开团：** DM 会在群里定期更新【酒馆传闻板】（比如：东边山丘有地精异动、法师重金悬赏遗迹里的某本书）。
- **玩家组局：** 你们需要在群里自行凑齐有空的队友，选定一个目标，然后**提前向 DM 预约时间**（"DM，我们周五晚8点要去那个地精营地看看"）。
- **免责声明：** 你们预约去哪，DM就只准备哪。如果走到半路突然想改道去打龙……抱歉，前方的迷雾你们无法穿透。

## 3. 永久死亡与战利品

死亡是真实的，战利品也是真实的！

- **永久死亡：** 如果你的角色在冒险中不幸身亡，那么这个角色就永远离开了。你可以创建新角色继续冒险，但失去的经验和装备无法找回。
- **战利品分配：** 冒险获得的战利品由队伍自行协商分配。DM 只负责监督公平性，不参与分配决策。
- **城镇商店：** 你可以在城镇的商店里出售战利品换取金币，也可以购买装备和补给品。

## 4. 角色成长与经验

每次冒险都会让你变得更强！

- **经验获取：** 完成冒险后，根据挑战难度和完成度，DM 会给予相应的经验值。
- **等级提升：** 积累足够的经验值后，你的角色可以升级，获得新的能力和属性点。
- **角色档案：** 请妥善保管你的角色 sheet，这是你在这个世界的唯一身份证明。

## 5. 公会与声望

在凡达林，声望就是一切！

- **公会任务：** 完成公会发布的任务可以获得声望值和特殊奖励。
- **声望等级：** 随着声望提升，你可以解锁更多特权和折扣。
- **个人传奇：** 你的冒险事迹可能会被记录在公会档案馆中，成为传说的一部分！

## 6. 房规与礼仪

无规矩不成方圆！

- **尊重他人：** 请尊重每一位玩家和 DM，保持友善的游戏氛围。
- **准时参加：** 请准时参加预约好的冒险，迟到超过15分钟可能会被替换。
- **有事请假：** 如果临时有事无法参加，请至少提前2小时通知 DM 和队友。

🎪 7. 不止于荒野

冒险之余，凡达林的娱乐生活也随着镇子的重建日益丰富！为了满足大家不同的战斗欲望与休闲需求，我们不仅有荒野探索，还特别开放了多种"独立活动模式"。

- **特色赛事：** 目前镇上已经设立了供大家挑战极限的【**竞技场**】、组队对抗的【**斗兽**】，以及正在开发中的【自走棋】等。未来还会有更多新活动，你也可以自己参与设计。
- **如何参与：** 就像预约荒野探索一样，你们可以在群里自由组局，向 DM 申请开启这些特色活动。无论你是想测试新构筑（Build）的强度、想和群友"皇城PK"，还是只想在酒馆里赚点快钱，随时欢迎报名！
- **独立结算：** 这些特色活动通常节奏更快，且死亡惩罚和收益机制会与正规的荒野西征有所不同（例如斗兽场通常是非致命的切磋）。具体规则会在各活动开启前为大家单独说明。放心大胆地来玩吧！

---

**⚔️ 迷雾已经散去，荒野正在呼唤。去酒馆看看最新的传闻板，寻找你的队友，我们随时准备出发！**
`;

const defaultDocuments: Document[] = [
  {
    id: "guide",
    title: "📜 《西征冒险指南》",
    content: adventureGuideContent,
    category: "指南",
    author: "DM",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPinned: true,
  },
  {
    id: "1",
    title: "冒险规则",
    content: "# 冒险规则\n\n欢迎来到西征冒险公会！\n\n## 基本规则\n\n1. 每次冒险需要3-5名玩家\n2. 冒险前请在布告栏发布招募信息\n3. 冒险结束后请及时发布战报\n\n## 注意事项\n\n- 请遵守房规\n- 保持团队协作\n- 享受冒险！",
    category: "规则",
    author: "DM",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPinned: true,
  },
  {
    id: "2",
    title: "房规",
    content: "# 公会房规\n\n## 总则\n\n1. 尊重每一位冒险者\n2. 保持游戏氛围友好\n3. 准时参加冒险\n\n## 惩罚措施\n\n违反房规者将受到警告，严重者将被禁止参加冒险。",
    category: "房规",
    author: "DM",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPinned: true,
  },
  {
    id: "3",
    title: "示例战报：迷雾森林探险",
    content: "# 战报：迷雾森林探险\n\n## 参与冒险者\n\n- 铁锤·石拳（战士）\n- 月影·行者（游侠）\n- 圣光·守护者（牧师）\n\n## 冒险过程\n\n我们成功探索了迷雾森林，发现了一个神秘的精灵遗迹！\n\n### 战斗经历\n\n遭遇了3只哥布林，轻松击败。\n\n## 战利品\n\n- 金币 x50\n- 魔法药剂 x2\n\n## 总结\n\n这是一次成功的冒险！",
    category: "战报",
    author: "冒险者张三",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [resources, setResources] = useState<ResourceImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [documents, setDocuments] = useState<Document[]>(() => {
    try {
      const saved = localStorage.getItem("wm-documents");
      if (saved) {
        const loadedDocs = JSON.parse(saved);
        let hasGuide = loadedDocs.some((d: Document) => d.id === "guide");
        if (!hasGuide) {
          return [defaultDocuments[0], ...loadedDocs];
        }
        return loadedDocs.map((d: Document) => {
          if (d.id === "guide" && !d.isPinned) {
            return { ...d, isPinned: true };
          }
          return d;
        });
      }
    } catch {
    }
    return defaultDocuments;
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("wm-settings");
      if (saved) {
        try {
          setSettings(JSON.parse(saved));
        } catch {
          localStorage.removeItem("wm-settings");
        }
      }
    } catch {
    }
  }, []);

  const loadResources = async () => {
    try {
      await initDB();
      const loadedResources = await getAllResources();
      setResources(loadedResources as ResourceImage[]);
    } catch (error) {
      console.error("Failed to load resources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const saveSettings = (settingsToSave: AppSettings) => {
    try {
      const settingsStr = JSON.stringify(settingsToSave);
      localStorage.setItem("wm-settings", settingsStr);
    } catch {
      const minimalSettings: AppSettings = {
        homeBg: null,
        mapBg: null,
        docsBg: null,
        boardBg: null,
        partyBg: null,
        userNickname: settingsToSave.userNickname,
        userAvatar: null,
        sessionHistory: settingsToSave.sessionHistory || [],
      };
      try {
        localStorage.setItem("wm-settings", JSON.stringify(minimalSettings));
      } catch {
        const tinySettings: Partial<AppSettings> = {
          userNickname: settingsToSave.userNickname,
          sessionHistory: settingsToSave.sessionHistory || [],
        };
        localStorage.setItem("wm-settings", JSON.stringify(tinySettings));
      }
    }
  };

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem("wm-documents", JSON.stringify(documents));
    } catch {
    }
  }, [documents]);

  const addDocument = (doc: Omit<Document, "id" | "createdAt" | "updatedAt">) => {
    const newDoc: Document = {
      ...doc,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDocuments((prev) => [...prev, newDoc]);
  };

  const updateDocument = (id: string, doc: Partial<Document>) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, ...doc, updatedAt: new Date().toISOString() }
          : d
      )
    );
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const addResource = async (image: Omit<ResourceImage, "id" | "createdAt">) => {
    const newImage: ResourceImage = {
      ...image,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    await addResourceDB(newImage);
    setResources((prev) => [...prev, newImage]);
  };

  const deleteResource = async (id: string) => {
    await deleteResourceDB(id);
    setResources((prev) => prev.filter((img) => img.id !== id));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const verifyPassword = (password: string) => {
    return password === PASSWORD;
  };

  return (
    <AppContext.Provider
      value={{
        resources,
        settings,
        isLoading,
        addResource,
        deleteResource,
        updateSettings,
        verifyPassword,
        loadResources,
        documents,
        addDocument,
        updateDocument,
        deleteDocument,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
