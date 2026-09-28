"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Real3DSewingCanvas from "./Real3DSewingCanvas";
import { ThreadSpoolIcon, NeedleSwatchIcon, FabricSwatchIcon } from "./WardrobeSwatches";
import StoryDialogOverlay from "./StoryDialogOverlay";
import StoryQuizModal from "./StoryQuizModal";
import StoryModeLobby from "./StoryModeLobby";
import StoryCompleteModal from "./StoryCompleteModal";
import { STORY_EPISODES } from "../data/storyEpisodes";
import CertificateModal from "./CertificateModal";
import InteractiveTutorialOverlay from "./InteractiveTutorialOverlay";
import { TutorialStep2IntroModal, TutorialCompletionModal } from "./TutorialModals";
import ShankWrapActionModal from "./ShankWrapActionModal";
import GuideHelpModal from "./GuideHelpModal";
import { EosahwaIcon } from "./EosahwaIcon";
import {
  playTangleSound,
  playPassSound,
  playClearFanfare,
  playSnipSound,
  setBgmMuted,
  isBgmMuted as checkIsBgmMuted,
  setSfxMuted,
  isSfxMuted as checkIsSfxMuted,
  startBgm,
  unlockAudioContext,
} from "../lib/soundEffects";

// --- 스토리 및 바느질 기법 타입 ---
export type CourseId = "running" | "backstitch" | "button" | "quiz";

// --- 스킨 설정 ---
interface ThreadSkin {
  id: string;
  name: string;
  color: string;
  dashColor: string;
  reqStars: number;
  icon: string;
  storyEpReq?: number; // 📖 스토리 클리어 시 즉시 무료 해금 연계
  badge?: string;
}

interface NeedleSkin {
  id: string;
  name: string;
  gradId: string;
  stroke: string;
  reqStars: number;
  icon: string;
  storyEpReq?: number; // 📖 스토리 클리어 시 즉시 무료 해금 연계
  badge?: string;
}

const THREAD_SKINS: ThreadSkin[] = [
  { id: "red", name: "클래식 레드", color: "#E76F51", dashColor: "#C85A3D", reqStars: 0, icon: "🧵" },
  { id: "blue", name: "오션 에메랄드", color: "#2A9D8F", dashColor: "#1D7066", reqStars: 2, storyEpReq: 1, icon: "🧶", badge: "스토리 1화 특전" },
  { id: "gold", name: "선셋 앰버", color: "#E9C46A", dashColor: "#C29A38", reqStars: 4, icon: "✨" },
  { id: "purple", name: "로열 바이올렛", color: "#9D4EDD", dashColor: "#7B2CBF", reqStars: 6, icon: "🔮" },
  { id: "silk_blue", name: "청아한 비단 명주실", color: "#3A86FF", dashColor: "#93C5FD", reqStars: 5, storyEpReq: 3, icon: "🧵", badge: "스토리 3화 특전" },
];

const NEEDLE_SKINS: NeedleSkin[] = [
  { id: "basic", name: "기본 무쇠 바늘", gradId: "needleBasic", stroke: "#1E293B", reqStars: 0, icon: "🪡" },
  { id: "silver", name: "신비한 은빛 바늘", gradId: "needleSilver", stroke: "#475569", reqStars: 2, storyEpReq: 2, icon: "✨", badge: "스토리 2화 특전" },
  { id: "crystal", name: "오로라 크리스탈 바늘", gradId: "needleCrystal", stroke: "#4C1D95", reqStars: 4, storyEpReq: 4, icon: "💎", badge: "스토리 4화 특전" },
  { id: "gold", name: "전설의 황금 바늘", gradId: "needleGold", stroke: "#854D0E", reqStars: 5, storyEpReq: 5, icon: "👑", badge: "스토리 5화 장원급제 특전" },
];

interface FabricSkin {
  id: string;
  name: string;
  frontBg: string;
  frontLine: string;
  backBg: string;
  backLine: string;
  patternType: "cotton" | "grid" | "denim" | "gingham" | "dots" | "herringbone" | "carbon" | "flower" | "stripe" | "quilt";
  reqStars: number;
  icon: string;
  previewBg: string;
  storyEpReq?: number;
  badge?: string;
}

const FABRIC_SKINS: FabricSkin[] = [
  // 🌿 [Tier 1: 입문 베이직 3종 - 무료 ★0]
  {
    id: "cotton_natural",
    name: "내추럴 크림 펠트 코튼",
    frontBg: "#F6EFE6",
    frontLine: "#C49A6C",
    backBg: "#ECE2D3",
    backLine: "#B38656",
    patternType: "cotton",
    reqStars: 0,
    icon: "🧵",
    previewBg: "#F6EFE6",
  },
  {
    id: "grid_beige",
    name: "모던 웜베이지 모눈 격자",
    frontBg: "#FAF5EB",
    frontLine: "#8D6E63",
    backBg: "#EFE5D5",
    backLine: "#795548",
    patternType: "grid",
    reqStars: 0,
    icon: "📐",
    previewBg: "#FAF5EB",
  },
  {
    id: "gingham_amber",
    name: "선셋 옐로우 깅엄 체크",
    frontBg: "#FEF3C7",
    frontLine: "#F59E0B",
    backBg: "#FDE68A",
    backLine: "#D97706",
    patternType: "gingham",
    reqStars: 0,
    icon: "🏁",
    previewBg: "#FEF3C7",
  },
  // 👖 [Tier 2: 감성 데일리 3종 - 별 3개 ★3]
  {
    id: "denim_blue",
    name: "헤비 인디고 데님",
    frontBg: "#1D3557",
    frontLine: "#457B9D",
    backBg: "#14213D",
    backLine: "#2A476F",
    patternType: "denim",
    reqStars: 3,
    icon: "👖",
    previewBg: "#1D3557",
  },
  {
    id: "sakura_pink",
    name: "러블리 벚꽃 도트",
    frontBg: "#FDF2F8",
    frontLine: "#F472B6",
    backBg: "#FCE7F3",
    backLine: "#DB2777",
    patternType: "dots",
    reqStars: 3,
    icon: "🌸",
    previewBg: "#FDF2F8",
  },
  {
    id: "stripe_lavender",
    name: "라벤더 코튼 스트라이프",
    frontBg: "#FAF5FF",
    frontLine: "#8B5CF6",
    backBg: "#F3E8FF",
    backLine: "#7C3AED",
    patternType: "stripe",
    reqStars: 3,
    icon: "🪻",
    previewBg: "#FAF5FF",
  },
  // 🌲 [Tier 3: 클래식 & 프리미엄 3종 - 별 4개 ★4]
  {
    id: "herringbone_olive",
    name: "올리브 클래식 헤링본",
    frontBg: "#ECFDF5",
    frontLine: "#059669",
    backBg: "#D1FAE5",
    backLine: "#047857",
    patternType: "herringbone",
    reqStars: 4,
    icon: "🌲",
    previewBg: "#ECFDF5",
  },
  {
    id: "flower_red",
    name: "빈티지 레트로 플라워",
    frontBg: "#FFFDF5",
    frontLine: "#DC2626",
    backBg: "#F7F3E9",
    backLine: "#B91C1C",
    patternType: "flower",
    reqStars: 4,
    icon: "🌷",
    previewBg: "#FFFDF5",
  },
  {
    id: "carbon_dark",
    name: "모던 차콜 카본 격자",
    frontBg: "#1E293B",
    frontLine: "#475569",
    backBg: "#0F172A",
    backLine: "#334155",
    patternType: "carbon",
    reqStars: 4,
    icon: "🌌",
    previewBg: "#1E293B",
  },
  // 👑 [Tier 4: 최상위 럭셔리 마스터피스 1종 - 별 5개 ★5 / 스토리 5화]
  {
    id: "quilt_gold",
    name: "빈티지 패치워크 퀼트 누비",
    frontBg: "#FAF5E9",
    frontLine: "#D97706",
    backBg: "#FFF8E7",
    backLine: "#D97706",
    patternType: "quilt",
    reqStars: 5,
    storyEpReq: 5,
    icon: "👑",
    badge: "스토리 5화 장원급제 특전",
    previewBg: "#F59E0B",
  },
];

interface CompletedStitch {
  fromIndex: number;
  toIndex: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  isFront: boolean;
  isShankWrap?: boolean;
}

// --- 스텝 시퀀스 설정 (박음질, 홈질, 시침질, 단추 달기 지원) ---
export interface StitchStep {
  stepIndex: number;
  fromIndex: number;
  toIndex: number;
  isFront: boolean;
  hintText: string;
  isShankWrap?: boolean;
  wrapTargetCount?: number;
  isKnotFinish?: boolean;
}

export default function KkomaePangPage() {
  // 앱 전체 뷰 모드: 'landing' (랜딩) vs 'mode-select' (모드 선택) vs 'course-select' (4대 코스 선택 맵) vs 'game' (3D 바느질 게임)
  const [appViewMode, setAppViewMode] = useState<"landing" | "mode-select" | "course-select" | "game">("landing");
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [isBgmMuted, setIsBgmMuted] = useState<boolean>(() => checkIsBgmMuted());
  const [isSfxMuted, setIsSfxMuted] = useState<boolean>(() => checkIsSfxMuted());

  // 📱 스마트폰 접속 원천 차단 및 PC/태블릿 이용 안내 오버레이 상태
  const [showMobileNotice, setShowMobileNotice] = useState<boolean>(false);

  useEffect(() => {
    const checkDeviceSize = () => {
      if (typeof window === "undefined") return;

      const ua = navigator.userAgent || "";
      // 1. 대화면 태블릿 판별 (iPad, 안드로이드 태블릿 등은 차단하지 않고 정상 허용)
      const isTablet =
        /iPad|PlayBook|Silk/i.test(ua) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
        (/Android/i.test(ua) && !/Mobile/i.test(ua));

      // 2. 스마트폰 전용 UA 판별 (iPhone, Android Mobile 등)
      const isPhoneUA =
        !isTablet &&
        (/iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(ua) ||
          (/Android/i.test(ua) && /Mobile/i.test(ua)));

      // 3. 화면 크기 단변 판별 (가로/세로 회전 고려)
      const shortestDimension = Math.min(window.innerWidth, window.innerHeight);
      const screenShortest =
        typeof window.screen !== "undefined"
          ? Math.min(window.screen.width, window.screen.height)
          : shortestDimension;

      // 스마트폰 UA이거나 화면 단변이 680px 미만인 소형 스마트폰 환경이면 즉시 차단
      const isMobileDevice =
        isPhoneUA || (!isTablet && (shortestDimension < 680 || screenShortest < 680));

      setShowMobileNotice(isMobileDevice);
    };

    checkDeviceSize();
    window.addEventListener("resize", checkDeviceSize);
    window.addEventListener("orientationchange", checkDeviceSize);
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener("change", checkDeviceSize);
    }
    const timer = setTimeout(checkDeviceSize, 150);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkDeviceSize);
      window.removeEventListener("orientationchange", checkDeviceSize);
      if (window.screen && window.screen.orientation) {
        window.screen.orientation.removeEventListener("change", checkDeviceSize);
      }
    };
  }, []);

  // 🎵 BGM 토글 핸들러
  const handleToggleBgm = useCallback(() => {
    setIsBgmMuted((prev) => {
      const next = !prev;
      setBgmMuted(next);
      return next;
    });
  }, []);

  // 🔔 효과음 토글 핸들러
  const handleToggleSfx = useCallback(() => {
    setIsSfxMuted((prev) => {
      const next = !prev;
      setSfxMuted(next);
      return next;
    });
  }, []);

  // 🎶 랜딩 화면 첫 접속 및 전 화면에서 배경음 자동 재생 (브라우저 오토플레이 정책 완벽 대응)
  useEffect(() => {
    if (isBgmMuted) {
      return;
    }

    // 1. 초기 즉시 재생 시도 (브라우저 정책 허용 시 즉시 시작)
    startBgm();

    // 2. 브라우저의 오디오 자동재생(Autoplay Policy) 차단 시, 화면 첫 터치/클릭 즉시 오디오 언락 및 재생
    const handleFirstInteraction = () => {
      if (!checkIsBgmMuted()) {
        unlockAudioContext();
      }
      window.removeEventListener("pointerdown", handleFirstInteraction, true);
      window.removeEventListener("click", handleFirstInteraction, true);
      window.removeEventListener("touchstart", handleFirstInteraction, true);
      window.removeEventListener("keydown", handleFirstInteraction, true);
    };

    window.addEventListener("pointerdown", handleFirstInteraction, true);
    window.addEventListener("click", handleFirstInteraction, true);
    window.addEventListener("touchstart", handleFirstInteraction, true);
    window.addEventListener("keydown", handleFirstInteraction, true);

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction, true);
      window.removeEventListener("click", handleFirstInteraction, true);
      window.removeEventListener("touchstart", handleFirstInteraction, true);
      window.removeEventListener("keydown", handleFirstInteraction, true);
    };
  }, [isBgmMuted]);


  // 🎓 실전 인터랙티브 튜토리얼(체험 연습) 상태
  const [isTutorialActive, setIsTutorialActive] = useState<boolean>(false);
  const [tutorialStep, setTutorialStep] = useState<number>(1);
  const tutorialStepRef = useRef<number>(1);
  useEffect(() => {
    tutorialStepRef.current = tutorialStep;
  }, [tutorialStep]);
  const [tutorialCompleted, setTutorialCompleted] = useState<boolean>(false);
  const [tutorialClearedStep, setTutorialClearedStep] = useState<number | null>(null);

  // 현재 선택된 코스 및 레벨 상태
  const [currentCourseId, setCurrentCourseId] = useState<CourseId>("running");
  const [currentLevel, setCurrentLevel] = useState(1);

  // 코스별 진행도 (해금 단계 및 별점)
  const [courseProgress, setCourseProgress] = useState<Record<CourseId, { unlockedLevels: number[]; levelStars: Record<number, number> }>>({
    running: { unlockedLevels: [1], levelStars: { 1: 0, 2: 0, 3: 0 } },
    backstitch: { unlockedLevels: [1], levelStars: { 1: 0, 2: 0, 3: 0 } },
    button: { unlockedLevels: [1], levelStars: { 1: 0, 2: 0, 3: 0 } },
    quiz: { unlockedLevels: [1], levelStars: { 1: 0, 2: 0, 3: 0 } },
  });

  // 스킨 상태
  const [selectedThread, setSelectedThread] = useState<string>("red");
  const [selectedNeedle, setSelectedNeedle] = useState<string>("basic");
  const [selectedFabric, setSelectedFabric] = useState<string>("cotton_natural");

  // 모달 상태
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
  const [wardrobeTab, setWardrobeTab] = useState<"thread" | "needle" | "fabric" | "treasures">("thread");
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isCertificateGyoji, setIsCertificateGyoji] = useState(false); // 📜 스토리 5화 장원급제 교지 모드 여부
  const [studentName, setStudentName] = useState("바느질 꿈나무");

  // 📖 [콩쥐의 바느질 일기] 스토리 모드 상태
  const [isStoryMode, setIsStoryMode] = useState<boolean>(false);
  const [currentStoryEpisodeId, setCurrentStoryEpisodeId] = useState<number>(1);
  const [storyPhase, setStoryPhase] = useState<"lobby" | "intro" | "sewing" | "quiz" | "success" | "complete-modal">("lobby");
  const [clearedStoryEpisodeIds, setClearedStoryEpisodeIds] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("kkomae_story_cleared");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 바느질 인터랙션 상태
  const [isDragging, setIsDragging] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedStitches, setCompletedStitches] = useState<CompletedStitch[]>([]);

  const [mistakeCount, setMistakeCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasError, setHasError] = useState(false);

  // 🌟 실 엉킴 연출 이펙트 상태
  const [isTangledEffect, setIsTangledEffect] = useState(false);
  const [isBadgeBouncing, setIsBadgeBouncing] = useState(false);
  const [floatingTangle, setFloatingTangle] = useState<{ id: number; text: string } | null>(null);

  const [transitionMsg, setTransitionMsg] = useState("");

  // 🌀 단추 실기둥 감기 전용 팝업 모달 상태
  const [isShankWrapModalOpen, setIsShankWrapModalOpen] = useState(false);
  const [shankWrapCount, setShankWrapCount] = useState(0);

  // ✂️ 3화 전용: 변(줄) 완성 및 실자르기 확인 모달 상태
  const [sideCutModalData, setSideCutModalData] = useState<{
    isOpen: boolean;
    completedSideTitle: string;
    nextSideTitle: string;
    nextStepIdx: number;
    hintText: string;
  }>({
    isOpen: false,
    completedSideTitle: "",
    nextSideTitle: "",
    nextStepIdx: 0,
    hintText: "",
  });

  // 🎓 튜토리얼 2단계(방향/조준 가이드) 코칭 팝업 상태
  const [showTutorialStep2IntroModal, setShowTutorialStep2IntroModal] = useState(false);

  // 📱 디바이스 조작 모드 (PC 마우스/키보드 vs 태블릿/터치)
  const [controlMode, setControlMode] = useState<"pc" | "tablet">(() => {
    if (typeof window !== "undefined") {
      const isTouchDevice = "ontouchstart" in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
      return isTouchDevice ? "tablet" : "pc";
    }
    return "pc";
  });

  const errorTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadedFromStorageRef = useRef(false);
  const safeUntilRef = useRef<number>(0);
  const isTutorialFinishingRef = useRef(false);

  // 📖 현재 선택된 스토리 에피소드 데이터
  const currentStoryEpisode = useMemo(() => {
    return STORY_EPISODES.find((ep) => ep.id === currentStoryEpisodeId) || STORY_EPISODES[0];
  }, [currentStoryEpisodeId]);

  // 🌟 현재 레벨 및 설정 (스토리 또는 튜토리얼 전용)
  const levelConfig = useMemo(() => {
    if (isTutorialActive) {
      return {
        level: 1,
        name: "3D 바느질 조작 튜토리얼",
        badge: "튜토리얼",
        desc: "3D 4대 기본 조작을 익혀보세요!",
        totalHoles: 2,
        isCurve: false,
        archHeight: 120,
        tolerance: 120,
      };
    }
    return {
      level: currentStoryEpisode.targetLevel,
      name: currentStoryEpisode.techniqueName,
      badge: currentStoryEpisode.badge,
      desc: currentStoryEpisode.subTitle,
      totalHoles: currentStoryEpisode.totalHoles || 4,
      isCurve: currentStoryEpisode.isCurve || false,
      archHeight: currentStoryEpisode.archHeight || 120,
      tolerance: currentStoryEpisode.tolerance || 120,
    };
  }, [isTutorialActive, currentStoryEpisode]);

  const currentCourse = useMemo(() => {
    return {
      id: isTutorialActive ? "running" : currentStoryEpisode.targetCourseId,
      name: levelConfig.name,
      title: currentStoryEpisode.title,
      levels: [{ level: 1 }],
    };
  }, [isTutorialActive, currentStoryEpisode, levelConfig]);

  // 📖 스토리 에피소드 선택 및 시작 핸들러
  const handleSelectStoryEpisode = (epId: number) => {
    const ep = STORY_EPISODES.find((e) => e.id === epId) || STORY_EPISODES[0];
    setCurrentStoryEpisodeId(epId);

    if (ep.targetCourseId === "quiz") {
      // 5화: 개념 확인 퀴즈
      setStoryPhase("intro");
    } else {
      // 1~4화: 실제 바느질 코스 연동
      setCurrentCourseId(ep.targetCourseId as CourseId);
      setCurrentLevel(ep.targetLevel);
      handleReset();
      setStoryPhase("intro");
    }
  };

  // 📖 인트로 대화 완료 후 본 게임/퀴즈 시작
  const handleIntroComplete = () => {
    if (currentStoryEpisode.targetCourseId === "quiz") {
      setStoryPhase("quiz");
    } else {
      setStoryPhase("sewing");
      setAppViewMode("game");
      handleReset();
    }
  };

  // 📖 스토리 에피소드 성공 대화 종료 후 전용 완료 모달 진입
  const handleShowStoryCompleteModal = () => {
    setClearedStoryEpisodeIds((prev) => {
      const next = prev.includes(currentStoryEpisodeId) ? prev : [...prev, currentStoryEpisodeId];
      try {
        localStorage.setItem("kkomae_story_cleared", JSON.stringify(next));
      } catch {
        // 무시
      }
      return next;
    });

    // 👑 5화 과거시험 장원급제 완료 시 보너스 별점 3개 지급
    if (currentStoryEpisodeId === 5) {
      setCourseProgress((prev) => ({
        ...prev,
        quiz: {
          unlockedLevels: [1],
          levelStars: { ...(prev.quiz?.levelStars || {}), 1: 3 },
        },
      }));
    }

    setStoryPhase("complete-modal");
  };

  // 📖 스토리 에피소드 클리어 핸들러 (로비로 복귀)
  const handleFinishStoryEpisode = () => {
    setStoryPhase("lobby");
    setAppViewMode("course-select");
  };

  // 📖 스토리 진행도 리셋 핸들러
  const handleResetStoryProgress = () => {
    setClearedStoryEpisodeIds([]);
    try {
      localStorage.removeItem("kkomae_story_cleared");
    } catch {
      // 무시
    }
  };

  // 🌟 로컬 저장소(localStorage)에서 데이터 불러오기 (하위 호환 지원)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedRaw = localStorage.getItem("KKOMAE_PANG_DATA_V1") || localStorage.getItem("GGOMAE_PANG_DATA_V1") || localStorage.getItem("SEWING_LEGEND_DATA_V1");
        if (savedRaw) {
          const data = JSON.parse(savedRaw);
          if (data.courseProgress && typeof data.courseProgress === "object") {
            setCourseProgress((prev) => ({ ...prev, ...data.courseProgress }));
          } else if (data.unlockedLevels || data.levelStars) {
            // 기존 홈질(running) 데이터 마이그레이션
            setCourseProgress((prev) => ({
              ...prev,
              running: {
                unlockedLevels: data.unlockedLevels || [1],
                levelStars: data.levelStars || { 1: 0, 2: 0, 3: 0 },
              },
            }));
          }
          if (data.currentCourseId) {
            setCurrentCourseId(data.currentCourseId);
          }
          if (data.selectedThread) {
            setSelectedThread(data.selectedThread);
          }
          if (data.selectedNeedle) {
            setSelectedNeedle(data.selectedNeedle);
          }
          if (data.selectedFabric) {
            setSelectedFabric(data.selectedFabric);
          }
          if (data.studentName) {
            setStudentName(data.studentName);
          }
        }

        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get("view") === "game") {
            setAppViewMode("game");
          } else if (urlParams.get("view") === "courses") {
            setAppViewMode("course-select");
          }
        }
      } catch (e) {
        console.warn("Failed to read KkomaePang game data from localStorage", e);
      } finally {
        isLoadedFromStorageRef.current = true;
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // 🌟 데이터 변경 시 로컬 저장소(localStorage)에 자동 영구 저장
  useEffect(() => {
    if (!isLoadedFromStorageRef.current) return;
    try {
      const payload = {
        courseProgress,
        currentCourseId,
        selectedThread,
        selectedNeedle,
        selectedFabric,
        studentName,
      };
      localStorage.setItem("KKOMAE_PANG_DATA_V1", JSON.stringify(payload));
    } catch (e) {
      console.warn("Failed to save KkomaePang game data to localStorage", e);
    }
  }, [courseProgress, currentCourseId, selectedThread, selectedNeedle, selectedFabric, studentName]);

  // 🔄 재봉함 획득 별 및 진행도 안전 초기화 핸들러
  const handleResetAllProgress = () => {
    if (typeof window === "undefined") return;
    const isConfirmed = window.confirm(
      "정말 획득한 별과 재봉함 기록을 초기화할까요?\n모든 코스 진행도가 1단계로 되돌아가고 기본 도구(클래식 레드 실, 실버 메탈 바늘, 모던 웜베이지 원단)로 초기화됩니다."
    );
    if (!isConfirmed) return;

    const defaultProgress: Record<string, { unlockedLevels: number[]; levelStars: Record<number, number> }> = {
      running: { unlockedLevels: [1], levelStars: { 1: 0, 2: 0, 3: 0 } },
      backstitch: { unlockedLevels: [1], levelStars: { 1: 0, 2: 0, 3: 0 } },
      button: { unlockedLevels: [1], levelStars: { 1: 0, 2: 0, 3: 0 } },
      whip: { unlockedLevels: [1], levelStars: { 1: 0, 2: 0, 3: 0 } },
    };

    setCourseProgress(defaultProgress);
    setSelectedThread("red");
    setSelectedNeedle("basic");
    setSelectedFabric("cotton_natural");

    try {
      localStorage.removeItem("KKOMAE_PANG_DATA_V1");
      localStorage.removeItem("GGOMAE_PANG_DATA_V1");
      localStorage.removeItem("SEWING_LEGEND_DATA_V1");
    } catch (e) {
      console.warn("Failed to clear game storage", e);
    }

    playPassSound();
    alert("🌟 모든 별과 진행도가 안전하게 초기화되었습니다!");
  };

  // 🪡 바느질 구멍 좌표 (튜토리얼 또는 스토리 에피소드에서 직접 로드)
  const holePoints = useMemo(() => {
    if (isTutorialActive) {
      return [
        { index: 0, x: 340, y: 320 },
        { index: 1, x: 600, y: 320 },
      ];
    }
    return currentStoryEpisode.holePoints || [
      { index: 0, x: 100, y: 320 },
      { index: 1, x: 300, y: 320 },
      { index: 2, x: 360, y: 320 },
      { index: 3, x: 580, y: 320 },
      { index: 4, x: 640, y: 320 },
      { index: 5, x: 840, y: 320 },
    ];
  }, [isTutorialActive, currentStoryEpisode]);

  const totalStars = useMemo(() => {
    let sum = 0;
    Object.values(courseProgress).forEach((prog) => {
      if (prog && prog.levelStars) {
        Object.values(prog.levelStars).forEach((s) => {
          sum += s || 0;
        });
      }
    });
    return sum;
  }, [courseProgress]);

  const activeThread = useMemo(() => {
    return THREAD_SKINS.find((t) => t.id === selectedThread) || THREAD_SKINS[0];
  }, [selectedThread]);

  const activeNeedle = useMemo(() => {
    return NEEDLE_SKINS.find((n) => n.id === selectedNeedle) || NEEDLE_SKINS[0];
  }, [selectedNeedle]);

  const activeFabric = useMemo(() => {
    return FABRIC_SKINS.find((f) => f.id === selectedFabric) || FABRIC_SKINS[0];
  }, [selectedFabric]);

  // 🪡 바느질 땀 진행 스텝 (튜토리얼 또는 스토리 에피소드에서 직접 로드)
  const stitchSteps = useMemo(() => {
    if (isTutorialActive) {
      return [{
        stepIndex: 0,
        fromIndex: 0,
        toIndex: 1,
        isFront: true,
        hintText: "⬇️ [튜토리얼] 1번 구멍에서 바늘을 쑥 뽑아 2번 구멍으로 꽂으세요!",
      }];
    }
    return currentStoryEpisode.stitchSteps || [];
  }, [isTutorialActive, currentStoryEpisode]);

  const currentStep = useMemo(() => {
    return stitchSteps[currentStepIndex] || stitchSteps[0] || {
      stepIndex: 0,
      fromIndex: 0,
      toIndex: 1,
      isFront: true,
      hintText: "⬇️ 겉면으로 꽂기",
    };
  }, [stitchSteps, currentStepIndex]);

  const currentHoleIndex = currentStep.fromIndex;
  const currentIsFront = currentStep.isFront;

  const handleStageClear = () => {
    // 🛡️ 성공 직후 에러 발생 원천 차단 쿨다운 및 잔여 상태 즉각 완전 정리
    safeUntilRef.current = Date.now() + 2000;
    setIsDragging(false);
    setHasError(false);
    setIsTangledEffect(false);
    setFloatingTangle(null);
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }

    if (isTutorialActive) {
      setTutorialCompleted(true);
      return;
    }

    // 📖 [콩쥐의 바느질 일기] 스토리 모드인 경우: 일반 완료 모달을 띄우지 않고 성공 대화창으로 즉시 진입
    if (isStoryMode && storyPhase === "sewing") {
      setIsDragging(false);
      setStoryPhase("success");
      return;
    }

    setIsSuccess(true);
    setIsDragging(false);
    playClearFanfare();

    // 별점 산정 (시간 압박 없는 힐링 모드: 엉킴/실수 횟수 기준)
    let stars = 1;
    if (mistakeCount <= 1) {
      stars = 3;
    } else if (mistakeCount <= 3) {
      stars = 2;
    }

    // 코스별 최고 별점 및 다음 레벨 해금
    setCourseProgress((prev) => {
      const curCourseProg = prev[currentCourseId] || { unlockedLevels: [1], levelStars: {} };
      const newStars = {
        ...curCourseProg.levelStars,
        [currentLevel]: Math.max(curCourseProg.levelStars[currentLevel] || 0, stars),
      };
      const totalLevels = currentCourse.levels.length;
      const newUnlocked = [...curCourseProg.unlockedLevels];
      if (currentLevel < totalLevels && !newUnlocked.includes(currentLevel + 1)) {
        newUnlocked.push(currentLevel + 1);
      }
      return {
        ...prev,
        [currentCourseId]: {
          unlockedLevels: newUnlocked,
          levelStars: newStars,
        },
      };
    });
  };

  const triggerError = (msg: string) => {
    // 🌟 스테이지/레벨 전환 직후 안전 무적 쿨다운 가드
    if (Date.now() < safeUntilRef.current) return;

    setIsDragging(false);
    setMistakeCount((prev) => prev + 1);
    setHasError(true);

    // 🔊 Web Audio API 엉킴 탄성음 & 경고음 재생
    playTangleSound();

    // 📳 진동 피드백 (모바일 지원 환경)
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate([60, 40, 80]);
      } catch {
        // 무시
      }
    }

    // 💥 시각 이펙트 트리거
    setIsTangledEffect(true);
    setIsBadgeBouncing(true);

    // 💡 사용자의 핵심 피드백: 천 안면(아래)에서 바느질하다 엉킴이 발생한 경우 친절한 시점 변경 코칭 안내!
    let displayMsg = msg;
    if (!currentIsFront) {
      displayMsg = "잘 보이지 않아 바느질을 실수할 때에는 시점을 변경해보세요! 🔄";
    }

    setFloatingTangle({
      id: Date.now(),
      text: displayMsg.startsWith("💥") ? displayMsg : `💥 ${displayMsg}`,
    });

    setTimeout(() => {
      setIsTangledEffect(false);
    }, 850);

    setTimeout(() => {
      setIsBadgeBouncing(false);
    }, 650);

    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
    }
    errorTimerRef.current = setTimeout(() => {
      setHasError(false);
      setFloatingTangle(null);
      errorTimerRef.current = null;
    }, 2200);
  };

  // ⏪ 한 땀 뒤로가기 (Undo) 핸들러
  const handleUndoStitch = useCallback(() => {
    if (currentStepIndex <= 0 || isSuccess) return;

    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
    safeUntilRef.current = Date.now() + 800; // 되돌린 후 0.8초간 에러 방지 가드

    setIsDragging(false);
    setHasError(false);
    setIsTangledEffect(false);
    setFloatingTangle(null);

    const prevStepIdx = currentStepIndex - 1;
    setCurrentStepIndex(prevStepIdx);
    setCompletedStitches((prev) => prev.slice(0, -1));
    setSideCutModalData((prev) => ({ ...prev, isOpen: false }));

    // 단추 실기둥 스텝 복구 처리
    if (stitchSteps[prevStepIdx]?.isShankWrap) {
      setIsShankWrapModalOpen(true);
      setShankWrapCount(0);
    } else {
      setIsShankWrapModalOpen(false);
      setShankWrapCount(0);
    }

    // 🔊 되돌리기 효과음 & 안내 배너
    playPassSound();
    const isPrevFront = stitchSteps[prevStepIdx]?.isFront ?? true;
    setTransitionMsg(`⏪ [한 땀 되돌리기] 직전 땀을 풀었습니다! (${isPrevFront ? "천 겉면" : "천 안면"})`);
    setTimeout(() => setTransitionMsg(""), 2000);
  }, [currentStepIndex, isSuccess, stitchSteps, playPassSound]);

  // ✂️ 3화 변 완성 후 다음 줄 시작 확인 핸들러
  const handleConfirmNextSide = useCallback(() => {
    const targetIdx = sideCutModalData.nextStepIdx;
    setSideCutModalData((prev) => ({ ...prev, isOpen: false }));
    safeUntilRef.current = Date.now() + 800;
    setIsDragging(false);
    setCurrentStepIndex(targetIdx);
    playPassSound();
    setTransitionMsg("⬆️ 바늘이 천 위로 쏙 뚫고 나왔습니다! (천 겉면)");
    setTimeout(() => setTransitionMsg(""), 1800);
  }, [sideCutModalData.nextStepIdx, playPassSound]);

  // ⌨️ 키보드 단축키 (Ctrl+Z 또는 Backspace)로 한 땀 되돌리기 지원
  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        handleUndoStitch();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleUndoStitch();
      }
    };
    window.addEventListener("keydown", handleKeyDownGlobal);
    return () => window.removeEventListener("keydown", handleKeyDownGlobal);
  }, [handleUndoStitch]);

  const handleReset = useCallback(() => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
    safeUntilRef.current = Date.now() + 600; // 전환 후 0.6초간 안전 가드
    setIsDragging(false);
    setIsSuccess(false);
    setCurrentStepIndex(0);
    setCompletedStitches([]);
    setMistakeCount(0);
    setTimer(0);
    setHasError(false);
    setIsShankWrapModalOpen(false);
    setShankWrapCount(0);
    playPassSound();
    setTransitionMsg("🔄 처음 1번째 땀으로 초기화되었습니다!");
    setTimeout(() => setTransitionMsg(""), 2000);
  }, [playPassSound]);

  // 🌀 실기둥 1바퀴 감기 핸들러
  const handleShankWrapOnce = () => {
    playPassSound();
    const wrapTarget = currentStep?.wrapTargetCount || 3;
    setShankWrapCount((prev) => {
      const next = Math.min(wrapTarget, prev + 1);
      return next;
    });
  };

  // 🌀 실기둥 감기 완료 및 다음 스텝 전환 핸들러
  const handleShankWrapComplete = () => {
    setIsShankWrapModalOpen(false);
    playPassSound();

    const fromIdx = currentStep.fromIndex;
    const toIdx = currentStep.toIndex;
    const fromHole = holePoints[fromIdx];
    const nextHole = holePoints[toIdx];

    if (fromHole && nextHole) {
      setCompletedStitches((prev) => [
        ...prev,
        {
          fromIndex: fromIdx,
          toIndex: toIdx,
          from: fromHole,
          to: nextHole,
          isFront: false, // 🛡️ 단추 윗면에 대각선 실이 그어지지 않도록 false 처리
          isShankWrap: true,
        },
      ]);
    }

    const nextStepIdx = currentStepIndex + 1;
    if (nextStepIdx >= stitchSteps.length) {
      handleStageClear();
    } else {
      setCurrentStepIndex(nextStepIdx);
    }
  };

  // 🌀 실기둥 리셋 핸들러
  const handleShankWrapReset = () => {
    setShankWrapCount(0);
  };

  // 🎓 실전 인터랙티브 튜토리얼 제어 핸들러
  const [tutorialToast, setTutorialToast] = useState<string>("");
  const [isTutorialLocked, setIsTutorialLocked] = useState<boolean>(false);

  // 🎓 3D 실전 인터랙티브 튜토리얼 바로 시작 핸들러
  const handleOpenTutorialSelect = () => {
    startInteractiveTutorial();
  };

  const startInteractiveTutorial = () => {
    setShowGuideModal(false);
    setCurrentCourseId("running");
    setCurrentLevel(1);
    setCurrentStepIndex(0);
    setCompletedStitches([]);
    setMistakeCount(0);
    setTimer(0);
    setIsSuccess(false);
    setHasError(false);
    setIsTutorialActive(true);
    setTutorialStep(1);
    setTutorialCompleted(false);
    setTutorialClearedStep(null);
    setShowTutorialStep2IntroModal(false);
    isTutorialFinishingRef.current = false;
    setIsTutorialLocked(false);
    setTutorialToast("");
    setAppViewMode("game");
  };

  const exitInteractiveTutorial = () => {
    setIsTutorialActive(false);
    setTutorialCompleted(false);
    setTutorialClearedStep(null);
    setShowTutorialStep2IntroModal(false);
    isTutorialFinishingRef.current = false;
    setIsTutorialLocked(false);
    setTutorialStep(1);
    setTutorialToast("");
    setCurrentStepIndex(0);
    setCompletedStitches([]);
    handleReset();
    setAppViewMode("mode-select");
  };

  // 🎯 튜토리얼 2단계 조준 실습 시작 핸들러
  const handleStartTutorialStep2 = () => {
    setShowTutorialStep2IntroModal(false);
    setTutorialClearedStep(null);
    setTutorialStep(2);
    setCompletedStitches([]);
    setIsTutorialLocked(false);
    setTutorialToast("");
  };

  // 🎯 튜토리얼 다음 단계 진행 버튼 핸들러 (딱딱 떨어지는 명확한 분리감)
  const handleProceedNextTutorialStep = () => {
    if (tutorialClearedStep === 1) {
      setTutorialClearedStep(null);
      setShowTutorialStep2IntroModal(true);
    } else if (tutorialClearedStep === 2) {
      setTutorialClearedStep(null);
      setTutorialStep(3);
      setCompletedStitches([]);
      setIsTutorialLocked(false);
      setTutorialToast("");
    } else if (tutorialClearedStep === 3) {
      setTutorialClearedStep(null);
      setTutorialStep(4);
      setIsTutorialLocked(false);
      setTutorialToast("");
    }
  };

  const handleTutorialEvent = (eventName: "NEEDLE_LIFTED" | "RETICLE_LOCKED" | "HOLE_PIERCED" | "VIEW_ROTATED") => {
    if (!isTutorialActive) return;
    const currentStepNum = tutorialStepRef.current;

    if (eventName === "NEEDLE_LIFTED" && currentStepNum === 1) {
      playPassSound();
      setIsTutorialLocked(true);
      setCompletedStitches([]);
      // 1단계 완료 즉시 코칭 팝업 연결
      setTimeout(() => {
        setShowTutorialStep2IntroModal(true);
      }, 350);
    } else if (eventName === "RETICLE_LOCKED" && currentStepNum === 2) {
      playPassSound();
      setIsTutorialLocked(true);
      setTutorialToast("🎯 2단계 조준 완료! 3단계 구멍 찌르기로 이동합니다.");
      setCompletedStitches([]);
      // 2단계 조준 성공 시 0.65초 후 3단계(구멍 찌르기)로 자동 매끄럽게 연결!
      setTimeout(() => {
        setTutorialClearedStep(null);
        setTutorialStep(3);
        tutorialStepRef.current = 3;
        setIsTutorialLocked(false);
        setTutorialToast("");
      }, 650);
    } else if (eventName === "HOLE_PIERCED" && currentStepNum === 3) {
      playPassSound();
      setIsTutorialLocked(true);
      setCompletedStitches([{ 
        fromIndex: 0, 
        toIndex: 1, 
        from: holePoints[0] || { index: 0, x: 340, y: 320 }, 
        to: holePoints[1] || { index: 1, x: 600, y: 320 }, 
        isFront: true 
      }]);
      setTutorialClearedStep(3); // 3단계 완료 인터미션 카드 노출!
    } else if (eventName === "VIEW_ROTATED" && currentStepNum === 4) {
      if (isTutorialFinishingRef.current) return;
      isTutorialFinishingRef.current = true;

      playPassSound();
      setTutorialToast("🎉 4단계 완료! 천 뒷면 확인 성공!");
      setTimeout(() => {
        setTutorialToast("");
        setTutorialCompleted(true);
        isTutorialFinishingRef.current = false;
      }, 1000);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-5 bg-transparent select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* SVG 그라데이션 정의 */}
      <svg className="w-0 h-0 absolute pointer-events-none">
        <defs>
          <linearGradient id="needleSilver" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#E2E8F0" />
            <stop offset="70%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="needleGold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="35%" stopColor="#FDE047" />
            <stop offset="70%" stopColor="#CA8A04" />
            <stop offset="100%" stopColor="#854D0E" />
          </linearGradient>
          <linearGradient id="needleCrystal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#C084FC" />
            <stop offset="70%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
          <linearGradient id="needleBackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="50%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
        </defs>
      </svg>

      {/* ── [A. 꼬매팡 메인 랜딩 화면 뷰 (전통 침선함 스타일 둥근 브라운 테두리 적용)] ── */}
      {appViewMode === "landing" ? (
        <div className="w-full max-w-[720px] sm:max-w-[760px] bg-[#FFFDF7] border-4 sm:border-5 border-[#6E4720] rounded-[2.5rem] p-4 sm:p-6 md:p-7 shadow-[8px_8px_0px_0px_#6E4720] relative my-auto animate-fade-in flex flex-col items-center">
          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-5 sm:gap-6">
            {/* [좌측] 대형 히어로 3D 일러스트 카드 (1:1 정사각형 형태) */}
            <div className="w-full max-w-[340px] sm:max-w-[370px] md:max-w-[380px] bg-white border-4 border-black rounded-[32px] p-2 sm:p-2.5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative shrink-0">
            <div className="relative w-full aspect-square rounded-[22px] overflow-hidden border-2 border-black bg-[#FAF6F0] flex items-center justify-center">
              <Image
                src="/images/kkomaepang_adventure_thumbnail_v3.webp"
                alt="꼬매팡 어드벤처 - 콩쥐의 바느질 모험 썸네일"
                width={420}
                height={420}
                priority
                className="w-full h-full object-cover block rounded-[20px]"
              />
            </div>
          </div>

          {/* [우측] 설명 배너 + 주요 액션 버튼 그룹 (컴팩트 슬림 폭 적용) */}
          <div className="w-full max-w-[260px] sm:max-w-[275px] md:max-w-[285px] flex flex-col gap-2.5 sm:gap-3 shrink-0">
            {/* 1. 메인 서브타이틀 배너 (자수 스티치 띠지 & 3대 핵심 캡슐 뱃지) */}
            <div className="w-full bg-[#FFFDF7] border-3 sm:border-4 border-black rounded-2xl p-1.5 sm:p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-full border-2 border-dashed border-[#C49A6C]/70 rounded-xl py-2 px-2 sm:px-2.5 flex flex-col items-center justify-center gap-1.5 bg-[#FAF6F0]/70">
                <h1 className="text-[13.5px] sm:text-[14.5px] font-black text-[#5C3A16] tracking-tight text-center leading-snug break-keep flex flex-col items-center justify-center">
                  <span>콩쥐와 함께하는</span>
                  <span>실시간 3D 바느질 모험!</span>
                </h1>
                <div className="flex flex-col items-center justify-center gap-1 mt-1 w-full">
                  {/* 1행: 3D 기초 바느질 시뮬레이션 단독 배치 */}
                  <span className="bg-[#EEF5FC] text-sky-800 border border-sky-300 px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-black shadow-2xs flex items-center gap-1">
                    <span>🧵</span>
                    <span>3D 기초 바느질 시뮬레이션</span>
                  </span>

                  {/* 2행: 신개념 콩쥐 동화 + 초등 실과 연계 나란히 배치 */}
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap">
                    <span className="bg-[#FEF3C7] text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-black shadow-2xs flex items-center gap-1">
                      <span>📖</span>
                      <span>신개념 콩쥐 동화</span>
                    </span>
                    <span className="bg-[#DCFCE7] text-emerald-900 border border-emerald-300 px-1.5 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-black shadow-2xs flex items-center gap-1">
                      <span>🎒</span>
                      <span>초등 실과 연계</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. 주요 액션 버튼 (시작하기 & 사용 안내) */}
            <div className="w-full flex flex-col gap-2 sm:gap-2.5">
              {/* 시작하기! 버튼 (모드 선택 화면으로 이동) */}
              <button
                onClick={() => {
                  setAppViewMode("mode-select");
                  if (!isBgmMuted) {
                    startBgm();
                  }
                }}
                className="w-full py-2.5 sm:py-3 bg-[#d1fae5] hover:bg-emerald-300 text-slate-950 font-black text-lg sm:text-xl border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>시작하기!</span>
                <span className="text-xl sm:text-2xl">🚀</span>
              </button>

              {/* 사용 안내 버튼 */}
              <button
                onClick={() => setShowGuideModal(true)}
                className="w-full py-2.5 sm:py-3 bg-[#ffe4e6] hover:bg-pink-300 text-slate-950 font-black text-lg sm:text-xl border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>사용 안내</span>
                <span className="text-xl sm:text-2xl">📖</span>
              </button>
            </div>

            {/* 3. 사운드(배경음 & 효과음) 토글 버튼 2열 (사용 안내 바로 아래로 조화롭게 배치) */}
            <div className="w-full grid grid-cols-2 gap-2">
              {/* 🎵 배경음 On/Off 토글 버튼 */}
              <button
                onClick={handleToggleBgm}
                className={`py-2 px-1.5 rounded-xl font-black text-xs sm:text-[13px] border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                  isBgmMuted
                    ? "bg-stone-200 text-stone-600 hover:bg-stone-300"
                    : "bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
                }`}
                title={isBgmMuted ? "배경음 켜기" : "배경음 끄기"}
              >
                <span>{isBgmMuted ? "🔇" : "🎵"}</span>
                <span>{isBgmMuted ? "배경음 끔" : "배경음"}</span>
              </button>

              {/* 🔔 효과음 On/Off 토글 버튼 */}
              <button
                onClick={handleToggleSfx}
                className={`py-2 px-1.5 rounded-xl font-black text-xs sm:text-[13px] border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                  isSfxMuted
                    ? "bg-stone-200 text-stone-600 hover:bg-stone-300"
                    : "bg-amber-400 text-amber-950 hover:bg-amber-300"
                }`}
                title={isSfxMuted ? "효과음 켜기" : "효과음 끄기"}
              >
                <span>{isSfxMuted ? "🔕" : "🔔"}</span>
                <span>{isSfxMuted ? "효과음 끔" : "효과음"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      ) : appViewMode === "mode-select" ? (
        /* ── [B-1. 바느질 모드 선택 화면 (튜토리얼 vs 시나리오 스토리 vs 자유 코스 연습)] ── */
        <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-[2.5rem] shadow-2xl border-4 border-[#6E4720] relative flex flex-col gap-6 my-auto animate-fade-in">
          {/* 상단 헤더 */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setAppViewMode("landing")}
              className="flex items-center gap-1.5 bg-white hover:bg-amber-50 text-[#5C3A16] font-black text-xs sm:text-sm px-3.5 py-2 rounded-xl border-2 border-[#6E4720] shadow-[2px_2px_0_0_#6E4720] transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <span>🏠</span>
              <span>처음으로</span>
            </button>
            <div className="flex items-center gap-1.5">
              {/* 🎵 배경음 On/Off */}
              <button
                onClick={handleToggleBgm}
                className={`px-2.5 py-1.5 rounded-xl font-black text-xs border-2 border-[#6E4720] shadow-[2px_2px_0_0_#6E4720] transition-all flex items-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                  isBgmMuted ? "bg-stone-200 text-stone-500" : "bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
                }`}
                title={isBgmMuted ? "배경음 켜기" : "배경음 끄기"}
              >
                <span>{isBgmMuted ? "🔇" : "🎵"}</span>
                <span>{isBgmMuted ? "배경음 끔" : "배경음"}</span>
              </button>
              {/* 🔔 효과음 On/Off */}
              <button
                onClick={handleToggleSfx}
                className={`px-2.5 py-1.5 rounded-xl font-black text-xs border-2 border-[#6E4720] shadow-[2px_2px_0_0_#6E4720] transition-all flex items-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                  isSfxMuted ? "bg-stone-200 text-stone-500" : "bg-amber-400 text-[#5C3A16] hover:bg-amber-300"
                }`}
                title={isSfxMuted ? "효과음 켜기" : "효과음 끄기"}
              >
                <span>{isSfxMuted ? "🔕" : "🔔"}</span>
                <span>{isSfxMuted ? "효과음 끔" : "효과음"}</span>
              </button>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/90 text-[#6E4720] text-xs font-black rounded-full border border-amber-300 mb-2 shadow-2xs">
              <span>🧵</span>
              <span>바느질 모드 선택</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
              어떤 방식으로 바느질을 시작할까요?
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-600">
              3D 조작법을 먼저 익히고, 콩쥐와 함께 신비로운 바느질 모험 속으로 떠나보세요!
            </p>
          </div>

          {/* 2대 핵심 모드 대형 선택 카드 그리드 (1x2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 max-w-3xl mx-auto w-full">
            {/* 1. 🎓 3D 바느질 조작 튜토리얼 (초보 필수) */}
            <div
              onClick={handleOpenTutorialSelect}
              className="bg-gradient-to-b from-emerald-50 to-emerald-100 border-4 border-black rounded-3xl p-6 sm:p-7 shadow-[5px_5px_0_0_#000] hover:-translate-y-1.5 hover:shadow-[7px_7px_0_0_#000] transition-all cursor-pointer flex flex-col justify-between select-none group"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <span className="px-3 py-1 bg-emerald-400 text-black text-xs font-black rounded-lg border-2 border-black">
                    초보 필수
                  </span>
                  <span className="text-4xl group-hover:scale-125 transition-transform">🎓</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-950 mb-2 flex items-center gap-1.5">
                  <span>3D 바느질 조작 기본연습</span>
                </h3>
                <div className="flex flex-col gap-2 my-3 text-left">
                  <div className="flex items-center gap-2 text-xs sm:text-[13.5px] font-bold text-slate-800 break-keep">
                    <span className="text-emerald-700 font-black text-base shrink-0">•</span>
                    <span>바늘들기, 조준하기, 콕찌르기, 천뒤집기</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-[13.5px] font-bold text-slate-800 break-keep">
                    <span className="text-emerald-700 font-black text-base shrink-0">•</span>
                    <span>본격 모험을 떠나기전 조작법 익히기</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t-2 border-emerald-300">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenTutorialSelect();
                  }}
                  className="w-full py-3.5 bg-[#10B981] hover:bg-emerald-500 text-white font-black text-sm rounded-xl border-3 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center gap-2 transition-colors cursor-pointer active:translate-y-0.5"
                >
                  <span>3D 조작 연습 시작</span>
                  <span>➔</span>
                </button>
              </div>
            </div>

            {/* 2. 📖 콩쥐의 바느질 모험 (추천 스토리) */}
            <div
              onClick={() => {
                setIsStoryMode(true);
                setStoryPhase("lobby");
                setAppViewMode("course-select");
              }}
              className="bg-gradient-to-b from-amber-50 to-yellow-100 border-4 border-black rounded-3xl p-6 sm:p-7 shadow-[5px_5px_0_0_#000] hover:-translate-y-1.5 hover:shadow-[7px_7px_0_0_#000] transition-all cursor-pointer flex flex-col justify-between select-none group"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <span className="px-3 py-1 bg-amber-400 text-black text-xs font-black rounded-lg border-2 border-black">
                    메인 스토리
                  </span>
                  <span className="text-4xl group-hover:scale-125 transition-transform">📖</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-950 mb-2 flex items-center gap-1.5">
                  <span>콩쥐의 바느질 모험</span>
                </h3>
                <div className="flex flex-col gap-2 my-3 text-left">
                  <div className="flex items-center gap-2 text-xs sm:text-[13.5px] font-bold text-slate-800 break-keep">
                    <span className="text-amber-700 font-black text-base shrink-0">•</span>
                    <span>콩쥐와 함께하는 기초바느질 모험</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-[13.5px] font-bold text-slate-800 break-keep">
                    <span className="text-amber-700 font-black text-base shrink-0">•</span>
                    <span>사또의 시험을 통과하고 장원급제 도전하기</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t-2 border-amber-300">
                <button
                  type="button"
                  className="w-full py-3.5 bg-[#FDE047] hover:bg-yellow-300 text-black font-black text-sm rounded-xl border-3 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center gap-2 transition-colors cursor-pointer active:translate-y-0.5"
                >
                  <span>이야기 시작하기</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : appViewMode === "course-select" ? (
        /* ── [B. 꼬매팡 5대 손바느질 코스 선택 화면 (Course Select View)] ── */
        <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md p-5 sm:p-7 rounded-[2.5rem] shadow-2xl border-4 border-[#6E4720] relative flex flex-col gap-5">
          {/* 코스 선택 헤더 */}
          <div className="w-full flex flex-wrap justify-between items-center bg-[#FFF9E6] border-3 border-[#6E4720] rounded-2xl px-4 py-3 shadow-[4px_4px_0_0_#6E4720] gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAppViewMode("mode-select")}
                className="flex items-center gap-1.5 bg-white hover:bg-amber-50 text-[#5C3A16] font-black text-xs sm:text-sm px-3.5 py-2 rounded-xl border-2 border-[#6E4720] shadow-[2px_2px_0_0_#6E4720] transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                title="모드 선택 화면으로 돌아가기"
              >
                <span>⬅️</span>
                <span>모드 선택</span>
              </button>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#5C3A16] flex items-center gap-2">
                  <span>📖 콩쥐의 바느질 일기</span>
                </h2>
                <p className="text-xs font-bold text-[#8C6239] hidden sm:block">
                  두비 요정과 함께 찢어진 소품을 수선하고 사또의 과거 시험에 도전하세요!
                </p>
              </div>
            </div>

            {/* 헤더 우측 액션 버튼들 (모드 스위치, 설명서, 재봉함) */}
            <div className="flex items-center gap-2">
              {/* 💻 PC / 📱 태블릿 모드 토글 */}
              <div className="flex bg-[#E8DCC9] p-0.5 rounded-xl border-2 border-[#6E4720] gap-0.5">
                <button
                  type="button"
                  onClick={() => setControlMode("pc")}
                  className={`px-2 py-1 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                    controlMode === "pc"
                      ? "bg-[#6E4720] text-white shadow-xs"
                      : "text-[#5C3A16] hover:bg-white/60"
                  }`}
                  title="PC 모드 (마우스/키보드)"
                >
                  <span>💻</span>
                  <span className="hidden sm:inline">PC</span>
                </button>
                <button
                  type="button"
                  onClick={() => setControlMode("tablet")}
                  className={`px-2 py-1 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                    controlMode === "tablet"
                      ? "bg-[#2A9D8F] text-white shadow-xs"
                      : "text-[#5C3A16] hover:bg-white/60"
                  }`}
                  title="태블릿 모드 (터치 조작)"
                >
                  <span>📱</span>
                  <span className="hidden sm:inline">태블릿</span>
                </button>
              </div>

              <button
                onClick={() => setShowGuideModal(true)}
                className="flex items-center gap-1 bg-white hover:bg-slate-100 text-[#5C3A16] font-black text-xs sm:text-sm px-3 py-2 rounded-xl border-2 border-[#6E4720] shadow-[2px_2px_0_0_#6E4720] transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              >
                <span>📖</span>
                <span>설명서</span>
              </button>

              {/* 🎵 배경음 On/Off */}
              <button
                onClick={handleToggleBgm}
                className={`px-2.5 py-2 rounded-xl font-black text-xs sm:text-sm border-2 border-[#6E4720] shadow-[2px_2px_0_0_#6E4720] transition-all flex items-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                  isBgmMuted ? "bg-stone-200 text-stone-500" : "bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
                }`}
                title={isBgmMuted ? "배경음 켜기" : "배경음 끄기"}
              >
                <span>{isBgmMuted ? "🔇" : "🎵"}</span>
                <span className="hidden sm:inline">{isBgmMuted ? "배경음 끔" : "배경음"}</span>
              </button>

              {/* 🔔 효과음 On/Off */}
              <button
                onClick={handleToggleSfx}
                className={`px-2.5 py-2 rounded-xl font-black text-xs sm:text-sm border-2 border-[#6E4720] shadow-[2px_2px_0_0_#6E4720] transition-all flex items-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                  isSfxMuted ? "bg-stone-200 text-stone-500" : "bg-amber-400 text-[#5C3A16] hover:bg-amber-300"
                }`}
                title={isSfxMuted ? "효과음 켜기" : "효과음 끄기"}
              >
                <span>{isSfxMuted ? "🔕" : "🔔"}</span>
                <span className="hidden sm:inline">{isSfxMuted ? "효과음 끔" : "효과음"}</span>
              </button>

              <button
                onClick={() => setIsWardrobeOpen(true)}
                className="flex items-center gap-1.5 bg-[#F4A261] hover:bg-[#E76F51] text-white font-black text-xs sm:text-sm px-3 py-2 rounded-xl border-2 border-[#6E4720] shadow-[2px_2px_0_0_#6E4720] transition-all cursor-pointer"
              >
                <span>🧺</span>
                <span className="hidden sm:inline">재봉함</span>
                <span className="bg-white/30 px-1.5 py-0.5 rounded-full text-xs">⭐ {totalStars}</span>
              </button>
            </div>
          </div>

          {/* 📖 콩쥐의 에피소드 로비 렌더링 */}
          <StoryModeLobby
            episodes={STORY_EPISODES}
            clearedEpisodeIds={clearedStoryEpisodeIds}
            onSelectEpisode={handleSelectStoryEpisode}
            onResetProgress={handleResetStoryProgress}
          />
        </div>
      ) : (
        /* ── [C. 꼬매팡 3D 바느질 게임 플레이 뷰] ── */
        <div className="w-full max-w-5xl bg-white/95 backdrop-blur-md p-4 sm:p-6 rounded-[2.5rem] shadow-2xl border-4 border-[#6E4720] relative">
        
        {/* 상단 헤더 바 (극세사 컴팩트 & 1줄 단정 정렬) */}
        <header className="w-full flex flex-wrap justify-between items-center bg-[#FFF9E6] border-3 border-[#6E4720] rounded-2xl px-4 py-2.5 shadow-[4px_4px_0_0_#6E4720] gap-2.5 mb-2.5">
          
          {/* [좌측] 코스목록 뒤로가기 + 코스/단계 타이틀 */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (isTutorialActive) {
                  exitInteractiveTutorial();
                } else {
                  setAppViewMode("course-select");
                }
              }}
              className="flex items-center gap-1.5 bg-white hover:bg-amber-50 text-[#5C3A16] font-black text-xs px-3 py-1.5 rounded-xl border-2 border-[#6E4720] shadow-[2px_2px_0_0_#6E4720] transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              title={isTutorialActive ? "모드 선택 메뉴로 이동" : "이야기 목록으로 이동"}
            >
              <span>{isTutorialActive ? "📋" : "📖"}</span>
              <span>{isTutorialActive ? "메뉴선택" : "이야기 목록"}</span>
            </button>

            <div className="flex items-center gap-2.5">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {isStoryMode && (
                    <span className="px-2.5 py-0.5 rounded-lg font-black text-xs bg-[#6E4720] text-[#FFF2D6] border border-[#5C3A16] shadow-xs tracking-wider shrink-0">
                      {currentStoryEpisode.badge}
                    </span>
                  )}
                  <h2 className="text-base sm:text-lg font-black text-[#2E1807] tracking-tight leading-tight drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]">
                    {isTutorialActive ? "실전 튜토리얼" : currentStoryEpisode.title}
                  </h2>
                </div>
                <p className="text-xs sm:text-[13px] font-bold text-[#A84A1A] leading-snug mt-0.5 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E76F51] shrink-0"></span>
                  <span>{isTutorialActive ? `미션 ${tutorialStep}/4` : currentStoryEpisode.subTitle}</span>
                </p>
              </div>
            </div>
          </div>
          
          {/* [우측] 엉킴/타이머 + 2D/3D 토글 + 재봉함 + 설명서 */}
          <div className="flex flex-wrap items-center gap-2">

            {/* 2. 엉킴(실수) HUD (일반 게임 모드일 때만 노출) */}
            {!isTutorialActive && (
              <div className={`flex items-center bg-white border-2 border-[#6E4720] rounded-xl shadow-[2px_2px_0_0_#6E4720] text-xs font-black overflow-hidden transition-all ${
                isBadgeBouncing ? "animate-knot-bounce ring-4 ring-red-400 scale-105" : ""
              }`}>
                <div className={`px-3 py-1 flex items-center gap-1.5 transition-colors ${
                  mistakeCount === 0 
                    ? "bg-emerald-50 text-emerald-800" 
                    : mistakeCount <= 2 
                      ? "bg-amber-50 text-amber-900" 
                      : "bg-red-500 text-white animate-pulse"
                }`}>
                  <span>{mistakeCount === 0 ? "🧵" : "🧶"}</span>
                  <span>엉킴: {mistakeCount}</span>
                </div>
              </div>
            )}

            {/* ⏪ 한 땀 되돌리기 (Undo) 버튼 */}
            {!isTutorialActive && (
              <button
                type="button"
                onClick={handleUndoStitch}
                disabled={currentStepIndex === 0 || isSuccess}
                className={`flex items-center gap-1 font-black text-xs px-2.5 py-1.5 rounded-xl border-2 transition-all select-none ${
                  currentStepIndex === 0 || isSuccess
                    ? "bg-stone-200/80 text-stone-400 border-stone-300 cursor-not-allowed shadow-none opacity-60"
                    : "bg-[#FFF2D6] hover:bg-[#FFE5B4] text-[#5C3A16] border-[#6E4720] shadow-[2px_2px_0_0_#6E4720] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                }`}
                title={currentStepIndex === 0 ? "되돌릴 땀이 없습니다" : "직전 땀을 한 땀 풉니다 (단축키: Ctrl+Z 또는 Backspace)"}
              >
                <span className="text-sm leading-none">⏪</span>
                <span>되돌리기</span>
              </button>
            )}

            {/* 🔄 처음부터 다시하기 버튼 */}
            {!isTutorialActive && (
              <button
                type="button"
                onClick={handleReset}
                disabled={(currentStepIndex === 0 && completedStitches.length === 0) || isSuccess}
                className={`flex items-center gap-1 font-black text-xs px-2 py-1.5 rounded-xl border-2 transition-all select-none ${
                  (currentStepIndex === 0 && completedStitches.length === 0) || isSuccess
                    ? "bg-stone-200/80 text-stone-400 border-stone-300 cursor-not-allowed shadow-none opacity-60"
                    : "bg-white hover:bg-rose-50 text-rose-700 border-[#6E4720] shadow-[2px_2px_0_0_#6E4720] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                }`}
                title="처음 1번째 땀부터 다시 시작합니다"
              >
                <span className="leading-none">🔄</span>
                <span className="hidden sm:inline">처음부터</span>
              </button>
            )}

            {/* 3. PC / 태블릿 조작 모드 토글 */}
            <div className="flex bg-[#E8DCC9] p-0.5 rounded-xl border-2 border-[#6E4720] gap-0.5">
              <button
                type="button"
                onClick={() => setControlMode("pc")}
                className={`px-2 py-1 rounded-lg font-black text-xs transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  controlMode === "pc"
                    ? "bg-[#6E4720] text-white shadow-xs"
                    : "text-[#5C3A16] hover:bg-white/60"
                }`}
                title="PC 모드 (마우스/키보드)"
              >
                <span>💻</span>
                <span className="hidden sm:inline">PC</span>
              </button>
              <button
                type="button"
                onClick={() => setControlMode("tablet")}
                className={`px-2 py-1 rounded-lg font-black text-xs transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  controlMode === "tablet"
                    ? "bg-[#2A9D8F] text-white shadow-xs"
                    : "text-[#5C3A16] hover:bg-white/60"
                }`}
                title="태블릿 모드 (터치 조작)"
              >
                <span>📱</span>
                <span className="hidden sm:inline">태블릿</span>
              </button>
            </div>

            {/* 4. 재봉함 버튼 */}
            <button
              onClick={() => setIsWardrobeOpen(true)}
              className="flex items-center gap-1 bg-[#F4A261] hover:bg-[#E76F51] text-white font-black text-xs px-2.5 py-1.5 rounded-xl border-2 border-[#6E4720] shadow-[2px_2px_0_0_#6E4720] transition-all cursor-pointer"
              title="재봉함 열기"
            >
              <span>🧺</span>
              <span className="hidden md:inline">재봉함</span>
              <span className="bg-white/30 px-1.5 py-0.2 rounded-full text-[10px]">⭐ {totalStars}</span>
            </button>

            {/* 6. 🎵 배경음 On/Off */}
            <button
              onClick={handleToggleBgm}
              className={`px-2 py-1.5 rounded-xl font-black text-xs border-2 border-[#6E4720] shadow-[2px_2px_0_0_#6E4720] transition-all flex items-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                isBgmMuted ? "bg-stone-200 text-stone-500" : "bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
              }`}
              title={isBgmMuted ? "배경음 켜기" : "배경음 끄기"}
            >
              <span>{isBgmMuted ? "🔇" : "🎵"}</span>
              <span className="hidden sm:inline">{isBgmMuted ? "배경음 끔" : "배경음"}</span>
            </button>

            {/* 7. 🔔 효과음 On/Off */}
            <button
              onClick={handleToggleSfx}
              className={`px-2 py-1.5 rounded-xl font-black text-xs border-2 border-[#6E4720] shadow-[2px_2px_0_0_#6E4720] transition-all flex items-center gap-1 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                isSfxMuted ? "bg-stone-200 text-stone-500" : "bg-amber-400 text-[#5C3A16] hover:bg-amber-300"
              }`}
              title={isSfxMuted ? "효과음 켜기" : "효과음 끄기"}
            >
              <span>{isSfxMuted ? "🔕" : "🔔"}</span>
              <span className="hidden sm:inline">{isSfxMuted ? "효과음 끔" : "효과음"}</span>
            </button>
          </div>
        </header>

        {/* 바느질 캔버스 (2D 단면 모드 vs 3D WebGL 리얼 뷰 동적 지원) */}
        <div className="w-full relative overflow-hidden rounded-3xl">
          
          {/* 🌟 엉킴 발생 시 전체 화면 붉은 비네트 플래시 충격파 */}
          {isTangledEffect && (
            <div className="absolute inset-0 pointer-events-none rounded-3xl z-50 animate-red-vignette border-8 border-red-500/80 shadow-[inset_0_0_80px_rgba(239,68,68,0.6)]" />
          )}

          {/* 🌟 엉킴 발생 시 다이내믹 플로팅 경고 팝업 */}
          {floatingTangle && (
            <div 
              key={floatingTangle.id}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none animate-tangle-pop"
            >
              <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-sm sm:text-base px-4 py-2 rounded-2xl border-3 border-white shadow-[0_10px_25px_rgba(220,38,38,0.5)] flex items-center gap-2 whitespace-nowrap">
                <span>{floatingTangle.text}</span>
              </div>
            </div>
          )}

          {/* 🕶️ Three.js WebGL 기반 리얼 3D 바느질 시뮬레이션 (어드벤처 3D 전용) */}
          <div className={`relative w-full h-[580px] rounded-3xl overflow-hidden ${hasError ? 'animate-shake' : ''}`}>
              {/* 🎓 3D 실전 튜토리얼 코칭 HUD 오버레이 */}
              <InteractiveTutorialOverlay
                isActive={isTutorialActive}
                tutorialStep={tutorialStep}
                controlMode={controlMode}
                isTutorialLocked={isTutorialLocked}
                tutorialToast={tutorialToast}
                clearedStep={tutorialClearedStep}
                onProceedNextStep={handleProceedNextTutorialStep}
                onPrevStep={() => {
                  if (tutorialStep > 1) {
                    setTutorialStep(tutorialStep - 1);
                    setTutorialClearedStep(null);
                    setIsTutorialLocked(false);
                    setTutorialToast("");
                  }
                }}
                onNextStep={() => {
                  if (tutorialStep < 4) {
                    setTutorialStep(tutorialStep + 1);
                    setTutorialClearedStep(null);
                    setIsTutorialLocked(false);
                    setTutorialToast("");
                  }
                }}
                onExit={exitInteractiveTutorial}
              />

              <Real3DSewingCanvas
                key={`${currentCourseId}-${currentLevel}-${isTutorialActive ? "tutorial" : "game"}-${activeFabric.id}`}
                courseId={currentCourseId}
                currentLevel={currentLevel}
                totalHoles={levelConfig.totalHoles}
                isCurve={levelConfig.isCurve}
                currentHoleIndex={currentHoleIndex}
                currentStep={currentStep}
                completedStitches={completedStitches.map((st) => ({
                  fromIndex: st.fromIndex,
                  toIndex: st.toIndex,
                  isFront: st.isFront,
                  isShankWrap: st.isShankWrap,
                }))}
                isDragging={isDragging}
                threadColor={activeThread.color}
                needleSkinId={activeNeedle.id}
                fabricSkin={activeFabric}
                controlMode={controlMode}
                isTutorialMode={isTutorialActive}
                tutorialStep={tutorialStep}
                isTutorialLocked={isTutorialLocked}
                onTutorialEvent={handleTutorialEvent}
                onPointerDown={() => {
                  if (isTutorialLocked) return;
                  setIsDragging(true);
                  setHasError(false);
                }}
                onPointerMove={() => {}}
                onPointerUp={() => {
                  setIsDragging(false);
                }}
                onHolePassed={() => {
                  const fromIdx = currentStep.fromIndex;
                  const toIdx = currentStep.toIndex;
                  const fromHole = holePoints[fromIdx];
                  const nextHole = holePoints[toIdx];

                  // 🛡️ 성공 직후 에러 발생 원천 차단 쿨다운 및 잔여 에러 상태 즉시 정리
                  safeUntilRef.current = Date.now() + 850;
                  setHasError(false);
                  setIsTangledEffect(false);
                  setFloatingTangle(null);
                  if (errorTimerRef.current) {
                    clearTimeout(errorTimerRef.current);
                    errorTimerRef.current = null;
                  }

                  // 🔊 3D 관통 성공 사운드 (일반 모드에서만 재생, 튜토리얼은 이벤트 핸들러에서 1회 재생)
                  if (!isTutorialActive) {
                    playPassSound();
                  }

                  if (fromHole && nextHole) {
                    setCompletedStitches((prev) => [
                      ...prev,
                      {
                        fromIndex: fromIdx,
                        toIndex: toIdx,
                        from: fromHole,
                        to: nextHole,
                        isFront: currentStep.isFront,
                      },
                    ]);
                  }
                  setIsDragging(false);

                  const nextStepIdx = currentStepIndex + 1;
                  if (currentStoryEpisodeId === 3 && (nextStepIdx === 7 || nextStepIdx === 12 || nextStepIdx === 19)) {
                    let completedTitle = "";
                    let nextTitle = "";
                    let hint = "";
                    if (nextStepIdx === 7) {
                      completedTitle = "상단 가로줄";
                      nextTitle = "우측 세로줄";
                      hint = "우측 6번 구멍에서 올라온 새 바늘로 5번(오른쪽 위 모서리) 구멍에 되돌아 꽂아주세요!";
                    } else if (nextStepIdx === 12) {
                      completedTitle = "우측 세로줄";
                      nextTitle = "하단 가로줄";
                      hint = "하단 9번 구멍에서 올라온 새 바늘로 8번(오른쪽 아래 모서리) 구멍에 되돌아 꽂아주세요!";
                    } else if (nextStepIdx === 19) {
                      completedTitle = "하단 가로줄";
                      nextTitle = "좌측 세로줄";
                      hint = "좌측 13번 구멍에서 올라온 새 바늘로 12번(왼쪽 아래 모서리) 구멍에 되돌아 꽂아주세요!";
                    }
                    setSideCutModalData({
                      isOpen: true,
                      completedSideTitle: completedTitle,
                      nextSideTitle: nextTitle,
                      nextStepIdx: nextStepIdx,
                      hintText: hint,
                    });
                    playSnipSound();
                  } else if (isTutorialActive) {
                    // 튜토리얼 모드 중 3단계 완료
                    handleTutorialEvent("HOLE_PIERCED");
                  } else {
                    if (nextStepIdx >= stitchSteps.length) {
                      handleStageClear();
                    } else {
                      setCurrentStepIndex(nextStepIdx);
                      if (stitchSteps[nextStepIdx]?.isShankWrap) {
                        setIsShankWrapModalOpen(true);
                        setShankWrapCount(0);
                      }
                    }
                  }
                }}
                onError={(msg) => triggerError(msg)}
              />

              {/* 3D 모드 상단 안내 배지 (어드벤처 퀘스트 전용) */}
              {!isTutorialActive && (
                <div className="absolute top-3.5 left-3.5 z-40 pointer-events-none flex flex-wrap items-center gap-1.5 max-w-[calc(100%-250px)]">
                  {/* 🏷️ 현재 바느질 기법 명시 뱃지 */}
                  {currentCourseId === "running" && (
                    <div className={`text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md border-2 flex items-center gap-1 ${
                      currentLevel === 1 ? 'bg-amber-600 border-amber-800' : 'bg-emerald-600 border-emerald-800'
                    }`}>
                      <span>{currentLevel === 1 ? "🧵 8구멍 장단시침" : "🪡 14구멍 복합홈질"}</span>
                    </div>
                  )}
                  {currentCourseId === "backstitch" && (
                    <div className="text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md border-2 flex items-center gap-1 bg-indigo-600 border-indigo-800">
                      <span>🪢 네모 덧댐 박음질</span>
                    </div>
                  )}
                  {currentCourseId === "button" && (
                    <div className="text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md border-2 flex items-center gap-1 bg-purple-600 border-purple-800">
                      <span>🔘 꽃단추 & 실기둥</span>
                    </div>
                  )}
                  <div className={`text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md border-2 flex items-center gap-1 ${
                    currentStep.isShankWrap
                      ? 'bg-[#00A8FF] border-[#0077B6]'
                      : currentIsFront ? 'bg-[#E76F51] border-[#B84E34]' : 'bg-[#8C6239] border-[#5C3A16]'
                  }`}>
                    <span>{currentStep.isShankWrap ? "🌀" : currentIsFront ? "☀️" : "🌑"}</span>
                    <span>{currentStep.isShankWrap ? "실기둥 회전 감기" : currentIsFront ? "천의 겉면 (앞면)" : "천의 안면 (뒷면)"}</span>
                  </div>
                  <div className="bg-[#6E4720] text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md border-2 border-[#8C6A43] flex items-center gap-1">
                    <span>🧵</span>
                    <span>{currentStepIndex + 1} / {stitchSteps.length} 땀</span>
                  </div>
                  {currentStepIndex > 0 && !isSuccess && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUndoStitch();
                      }}
                      className="pointer-events-auto bg-[#FFF2D6] hover:bg-[#FFE5B4] text-[#5C3A16] text-xs font-black px-2 py-0.5 rounded-xl border-2 border-[#6E4720] shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer transition-all select-none"
                      title="직전 한 땀 되돌리기 (Undo)"
                    >
                      <span className="text-[13px] leading-none">⏪</span>
                      <span>1땀 되돌리기</span>
                    </button>
                  )}
                  {currentStep.isShankWrap ? (
                    <div className="bg-gradient-to-r from-[#00C9FF] to-[#92FE9D] text-[#053038] text-xs font-black px-3 py-1 rounded-xl shadow-lg border-2 border-white flex items-center gap-1.5 animate-pulse">
                      <span>🌀</span>
                      <span>단추 밑을 {controlMode === "tablet" ? "손가락으로" : "마우스로"} 뱅글뱅글 {currentStep.wrapTargetCount || 3}회 회전해 실기둥을 감으세요!</span>
                    </div>
                  ) : currentCourseId === "button" && currentStepIndex === 0 ? (
                    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-xs font-black px-3 py-1 rounded-xl shadow-lg border-2 border-white flex items-center gap-1.5 animate-bounce">
                      <span>🔄</span>
                      <span>단추달기는 천 밑(안면)에서 시작합니다! {controlMode === "tablet" ? "[🔄 시점] 토글 또는 2손가락으로" : "마우스 우클릭으로"} 천을 돌려 아래부터 시작하세요!</span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-black text-[#5C3A16] bg-white/95 px-2 py-0.5 rounded-lg border border-[#D4C2A8] shadow-xs">
                      {currentStep.hintText}
                    </span>
                  )}
                </div>
              )}

              {/* ✂️ 변 전환 및 실 매듭/자르기 플로팅 알림 배너 */}
              {transitionMsg && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none whitespace-nowrap animate-bounce">
                  <div className="bg-[#1C120C]/95 text-amber-300 border-2 border-amber-400 shadow-[0_6px_20px_rgba(0,0,0,0.6)] rounded-2xl px-4 py-2 flex items-center gap-2 text-xs sm:text-sm font-black backdrop-blur-md">
                    <span>{transitionMsg}</span>
                  </div>
                </div>
              )}

              {/* 💡 천의 안면(뒷면)일 때 시점 회전 코칭 플로팅 배너 */}
              {!currentIsFront && (
                <div className="absolute bottom-11 sm:bottom-12 left-1/2 -translate-x-1/2 z-40 pointer-events-none whitespace-nowrap animate-pulse">
                  <div className="bg-[#1C120C]/90 text-amber-200 border-2 border-amber-400/60 shadow-[0_4px_16px_rgba(0,0,0,0.5)] rounded-full px-4 py-1.5 flex items-center gap-2 text-xs font-black backdrop-blur-md">
                    <span className="text-sm">🔄</span>
                    <span>바늘과 구멍이 잘 보이지 않을 때에는 시점을 회전시키세요.</span>
                    <span className="text-[10px] text-amber-300/80 font-normal hidden sm:inline">
                      {controlMode === "tablet" ? "(👆 [🔄 시점] 버튼 / 두 손가락)" : "(🖱️ 우클릭 드래그)"}
                    </span>
                  </div>
                </div>
              )}

              {/* 🎮 3D 상시 조작 퀵 바 (캔버스 하단 - PC / 태블릿 동적 분기) */}
              <div className="absolute bottom-2.5 left-3 right-3 z-40 flex flex-wrap items-center justify-center gap-2 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white text-xs font-bold pointer-events-auto shadow-lg">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {controlMode === "tablet" ? (
                    <>
                      <span className="flex items-center gap-1 text-amber-300">
                        <span>👆</span>
                        <span><b>터치 드래그</b>: 바늘 이동·찌르기</span>
                      </span>
                      <span className="flex items-center gap-1 text-emerald-300">
                        <span>🎯</span>
                        <span><b>[▲/▼]</b>: 앞뒤 미세 조준 (오토스냅)</span>
                      </span>
                      <span className="flex items-center gap-1 text-sky-300">
                        <span>🔄</span>
                        <span><b>[🔄 시점] / 2손가락</b>: 3D 회전</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-1 text-amber-300">
                        <span>🖱️</span>
                        <span><b>좌클릭</b>: 높이 조절 & 찌르기</span>
                      </span>
                      <span className="flex items-center gap-1 text-emerald-300">
                        <span>🎡</span>
                        <span><b>휠/WS</b>: 앞뒤 깊이 조준</span>
                      </span>
                      <span className="flex items-center gap-1 text-sky-300">
                        <span>🖱️</span>
                        <span><b>우클릭</b>: 360° 시점 회전</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
        </div>
      </div>
      )}

      {/* 🧺 재봉함 (스킨 커스터마이징 모달) */}
      {isWardrobeOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFF9E6] border-5 border-[#6E4720] rounded-3xl p-5 sm:p-7 w-full max-w-2xl shadow-[8px_8px_0_0_#6E4720] relative max-h-[90vh] overflow-y-auto">
            
            {/* 재봉함 헤더 (타이틀, 별 개수, 별 초기화 버튼) */}
            <div className="flex flex-wrap justify-between items-center mb-4 border-b-3 border-[#6E4720] pb-3.5 gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">🧺</span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#5C3A16]">꼬매팡 재봉함</h2>
                  <p className="text-xs font-bold text-[#8C6239]">별을 모아 나만의 예쁜 바느질 도구를 장착하세요!</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-[#F4A261] text-white px-3 py-1.5 rounded-xl border-2 border-[#6E4720] font-black text-xs sm:text-sm shadow-xs whitespace-nowrap">
                  ⭐ {totalStars}개 보유
                </div>
                <button
                  type="button"
                  onClick={handleResetAllProgress}
                  title="획득한 별 및 진행도 초기화"
                  className="bg-white hover:bg-rose-50 text-rose-700 px-2.5 py-1.5 rounded-xl border-2 border-[#6E4720] font-black text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5 whitespace-nowrap"
                >
                  <span>🔄</span>
                  <span>별 초기화</span>
                </button>
              </div>
            </div>

            {/* 🏷️ 재봉함 4대 탭 메뉴 (실 / 바늘 / 천 / 콩쥐의 보물함) */}
            <div className="flex bg-[#E8DCC9] p-1.5 rounded-2xl border-2 border-[#6E4720] gap-1.5 mb-5 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => setWardrobeTab("thread")}
                className={`flex-1 py-2 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  wardrobeTab === "thread" ? "bg-[#E76F51] text-white shadow-xs" : "text-[#5C3A16] hover:bg-white/60"
                }`}
              >
                <span>🧵</span>
                <span>실 색상</span>
              </button>
              <button
                type="button"
                onClick={() => setWardrobeTab("needle")}
                className={`flex-1 py-2 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  wardrobeTab === "needle" ? "bg-[#2A9D8F] text-white shadow-xs" : "text-[#5C3A16] hover:bg-white/60"
                }`}
              >
                <span>🪡</span>
                <span>바늘 스킨</span>
              </button>
              <button
                type="button"
                onClick={() => setWardrobeTab("fabric")}
                className={`flex-1 py-2 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  wardrobeTab === "fabric" ? "bg-[#6E4720] text-white shadow-xs" : "text-[#5C3A16] hover:bg-white/60"
                }`}
              >
                <span>🎨</span>
                <span>천 디자인</span>
              </button>
              <button
                type="button"
                onClick={() => setWardrobeTab("treasures")}
                className={`flex-1 py-2 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  wardrobeTab === "treasures" ? "bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-xs ring-2 ring-yellow-400/50" : "text-[#5C3A16] hover:bg-white/60"
                }`}
              >
                <span>🏆</span>
                <span>콩쥐의 보물함</span>
              </button>
            </div>

            {/* 탭 1: 🧵 실 색상 선택 */}
            {wardrobeTab === "thread" && (
              <div className="mb-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {THREAD_SKINS.map((th) => {
                    const isStoryUnlocked = Boolean(th.storyEpReq && clearedStoryEpisodeIds.includes(th.storyEpReq));
                    const isUnlocked = totalStars >= th.reqStars || isStoryUnlocked;
                    const isEquipped = selectedThread === th.id;

                    return (
                      <button
                        key={th.id}
                        disabled={!isUnlocked}
                        onClick={() => setSelectedThread(th.id)}
                        className={`p-3.5 rounded-2xl border-2 font-bold text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          isEquipped
                            ? "bg-white border-[#E76F51] ring-3 ring-[#E76F51]/30 shadow-md scale-[1.01]"
                            : isUnlocked
                              ? "bg-white/85 border-[#6E4720] hover:bg-white hover:border-[#E76F51]"
                              : "bg-gray-200 border-gray-400 text-gray-400 cursor-not-allowed opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <ThreadSpoolIcon color={th.color} dashColor={th.dashColor} />
                          <div className="flex flex-col items-start min-w-0">
                            <span className="font-black text-xs sm:text-sm text-[#5C3A16] whitespace-nowrap">{th.name}</span>
                            {th.badge && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100/90 px-1.5 py-0.2 rounded border border-amber-300">
                                {th.badge}
                              </span>
                            )}
                          </div>
                        </div>
                        {isEquipped ? (
                          <span className="whitespace-nowrap shrink-0 text-xs bg-[#E76F51] text-white px-2.5 py-1 rounded-lg font-black shadow-2xs">장착중</span>
                        ) : !isUnlocked ? (
                          <span className="whitespace-nowrap shrink-0 text-xs text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-lg font-black">
                            {th.storyEpReq ? `스토리 ${th.storyEpReq}화 / ⭐${th.reqStars}` : `⭐ ${th.reqStars} 필요`}
                          </span>
                        ) : (
                          <span className="whitespace-nowrap shrink-0 text-xs text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg font-bold">
                            {isStoryUnlocked ? "스토리 해금" : "선택"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 탭 2: 🪡 바늘 스킨 선택 (왕관/다이아몬드 삭제, 실제 바늘 SVG) */}
            {wardrobeTab === "needle" && (
              <div className="mb-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {NEEDLE_SKINS.map((nd) => {
                    const isStoryUnlocked = Boolean(nd.storyEpReq && clearedStoryEpisodeIds.includes(nd.storyEpReq));
                    const isUnlocked = totalStars >= nd.reqStars || isStoryUnlocked;
                    const isEquipped = selectedNeedle === nd.id;

                    return (
                      <button
                        key={nd.id}
                        disabled={!isUnlocked}
                        onClick={() => setSelectedNeedle(nd.id)}
                        className={`p-3 sm:p-3.5 rounded-2xl border-2 font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                          isEquipped
                            ? "bg-white border-[#2A9D8F] ring-3 ring-[#2A9D8F]/30 shadow-md scale-[1.02]"
                            : isUnlocked
                              ? "bg-white/85 border-[#6E4720] hover:bg-white hover:border-[#2A9D8F]"
                              : "bg-gray-200 border-gray-400 text-gray-400 cursor-not-allowed opacity-60"
                        }`}
                      >
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-2xs">
                          <NeedleSwatchIcon skinId={nd.id} />
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs sm:text-sm font-black text-[#5C3A16] whitespace-nowrap">{nd.name}</span>
                          {nd.badge && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100/90 px-1.5 py-0.2 rounded border border-amber-300 mt-0.5">
                              {nd.badge}
                            </span>
                          )}
                        </div>
                        {isEquipped ? (
                          <span className="whitespace-nowrap text-xs bg-[#2A9D8F] text-white px-2.5 py-1 rounded-lg font-black shadow-2xs">장착중</span>
                        ) : !isUnlocked ? (
                          <span className="whitespace-nowrap text-xs text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-lg font-black">
                            {nd.storyEpReq ? `스토리 ${nd.storyEpReq}화 / ⭐${nd.reqStars}` : `⭐ ${nd.reqStars} 필요`}
                          </span>
                        ) : (
                          <span className="whitespace-nowrap text-xs text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg font-bold">
                            {isStoryUnlocked ? "스토리 해금" : "선택"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 탭 3: 🎨 천(패브릭) 디자인 선택 */}
            {wardrobeTab === "fabric" && (
              <div className="mb-5">
                <div className="mb-3 px-3.5 py-2.5 bg-amber-50/90 border border-amber-200/90 rounded-xl flex items-center gap-2 text-[11px] sm:text-xs font-bold text-[#6E4720] shadow-2xs">
                  <span className="text-sm shrink-0">💡</span>
                  <span>선택한 디자인이 <strong>3D 바느질 천</strong>으로 적용돼요!</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FABRIC_SKINS.map((fb) => {
                    const isStoryUnlocked = Boolean(fb.storyEpReq && clearedStoryEpisodeIds.includes(fb.storyEpReq));
                    const isUnlocked = totalStars >= fb.reqStars || isStoryUnlocked;
                    const isEquipped = selectedFabric === fb.id;

                    return (
                      <button
                        key={fb.id}
                        disabled={!isUnlocked}
                        onClick={() => setSelectedFabric(fb.id)}
                        className={`p-3.5 rounded-2xl border-2 font-bold text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          isEquipped
                            ? "bg-white border-[#6E4720] ring-3 ring-[#6E4720]/30 shadow-md scale-[1.01]"
                            : isUnlocked
                              ? "bg-white/85 border-[#6E4720] hover:bg-white hover:border-[#E76F51]"
                              : "bg-gray-200 border-gray-400 text-gray-400 cursor-not-allowed opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FabricSwatchIcon patternType={fb.patternType} frontBg={fb.frontBg} frontLine={fb.frontLine} />
                          <div className="flex flex-col items-start min-w-0">
                            <span className="font-black text-xs sm:text-sm text-[#5C3A16] whitespace-nowrap text-left truncate">{fb.name}</span>
                            {fb.badge && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100/90 px-1.5 py-0.2 rounded border border-amber-300 mt-0.5">
                                {fb.badge}
                              </span>
                            )}
                          </div>
                        </div>
                        {isEquipped ? (
                          <span className="whitespace-nowrap shrink-0 text-xs bg-[#6E4720] text-white px-2.5 py-1 rounded-lg font-black shadow-2xs">장착중</span>
                        ) : !isUnlocked ? (
                          <span className="whitespace-nowrap shrink-0 text-xs text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-lg font-black">
                            {fb.storyEpReq ? `스토리 ${fb.storyEpReq}화 / ⭐${fb.reqStars}` : `⭐ ${fb.reqStars}`}
                          </span>
                        ) : (
                          <span className="whitespace-nowrap shrink-0 text-xs text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg font-bold">
                            {isStoryUnlocked ? "스토리 해금" : "선택"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 탭 4: 🏆 콩쥐의 보물함 (3x2 일체형 완결 퍼즐 보드 & 교지) */}
            {wardrobeTab === "treasures" && (
              <div className="mb-3 animate-fadeIn">
                {(() => {
                  const clearedCount = [1, 2, 3, 4, 5].filter(id => clearedStoryEpisodeIds.includes(id)).length;
                  const isAllTreasuresCollected = clearedCount === 5;
                  
                  return (
                    <>
                      {/* 상단 슬림 헤더 (스크롤 방지 컴팩트 설계) */}
                      <div className="mb-2 px-3 py-1.5 bg-gradient-to-r from-stone-900 via-[#4A2E12] to-stone-900 text-amber-100 border border-amber-500/70 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-1.5 shadow-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base">🧩</span>
                          <span className="text-xs sm:text-sm font-black text-amber-200">
                            콩쥐의 5대 보물 퍼즐함
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-stone-950">
                            {clearedCount} / 5 완결 ({Math.round((clearedCount / 5) * 100)}%)
                          </span>
                          {isAllTreasuresCollected && (
                            <span className="text-[11px] font-bold text-amber-300 hidden md:inline animate-pulse">
                              👑 조선 제일 침선 낭자 등극!
                            </span>
                          )}
                        </div>
                        {/* 5개 올클리어 특전 바로가기 버튼 */}
                        {isAllTreasuresCollected && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setSelectedNeedle("gold")}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                                selectedNeedle === "gold"
                                  ? "bg-amber-400 text-stone-950 font-black shadow-xs"
                                  : "bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-400/50"
                              }`}
                            >
                              {selectedNeedle === "gold" ? "황금바늘 장착중 ✓" : "🌟 황금바늘"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedFabric("quilt_gold")}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                                selectedFabric === "quilt_gold"
                                  ? "bg-amber-400 text-stone-950 font-black shadow-xs"
                                  : "bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-400/50"
                              }`}
                            >
                              {selectedFabric === "quilt_gold" ? "퀼트누비 장착중 ✓" : "✨ 퀼트누비"}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 🧩 3x2 일체형 직소 퍼즐 & 교지 보드판 (1 -> 2 -> 3 -> 4 -> 5 -> 6 순차 완성) */}
                      <div className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-b from-[#FAF6EF] to-[#F1E8DA] border-2 border-[#8D6E63]/30 shadow-inner">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          
                          {/* [1] 💮 제 1화 퍼즐 조각: 시침질 마스터 인장 */}
                          {(() => {
                            const isCleared = clearedStoryEpisodeIds.includes(1);
                            return (
                              <div className={`p-2 sm:p-2.5 rounded-xl border-2 transition-all flex flex-col justify-between gap-1 relative overflow-hidden ${
                                isCleared
                                  ? "bg-white border-emerald-400 shadow-2xs ring-1 ring-emerald-400/30"
                                  : "bg-stone-100/90 border-dashed border-stone-300 opacity-60"
                              }`}>
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 whitespace-nowrap shrink-0">
                                    🧩 제 1화 조각
                                  </span>
                                  {isCleared ? (
                                    <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 whitespace-nowrap shrink-0">
                                      맞춤 완료 ✓
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold text-stone-400 whitespace-nowrap shrink-0">미완성 🔒</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 my-0.5">
                                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg border shadow-inner shrink-0 ${
                                    isCleared ? "bg-emerald-100 border-emerald-300" : "bg-stone-200 border-stone-300 text-stone-400"
                                  }`}>
                                    {isCleared ? "💮" : "❓"}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-xs sm:text-[13px] font-black text-[#5C3A16] truncate">시침질 마스터 인장</h4>
                                    <p className="text-[10px] text-stone-500 font-medium truncate">시침질을 통달한 옥새 인장</p>
                                  </div>
                                </div>
                                <div className="pt-1 border-t border-stone-100 flex items-center justify-between text-[10px]">
                                  <span className="font-bold text-teal-700 whitespace-nowrap">🧵 오션 에메랄드 실</span>
                                  <span className={isCleared ? "font-black text-emerald-600 whitespace-nowrap" : "text-stone-400 whitespace-nowrap"}>
                                    {isCleared ? "해금됨" : "1화 필요"}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* [2] 🧧 제 2화 퍼즐 조각: 두비의 복주머니 */}
                          {(() => {
                            const isCleared = clearedStoryEpisodeIds.includes(2);
                            return (
                              <div className={`p-2 sm:p-2.5 rounded-xl border-2 transition-all flex flex-col justify-between gap-1 relative overflow-hidden ${
                                isCleared
                                  ? "bg-white border-rose-400 shadow-2xs ring-1 ring-rose-400/30"
                                  : "bg-stone-100/90 border-dashed border-stone-300 opacity-60"
                              }`}>
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-black text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-300 whitespace-nowrap shrink-0">
                                    🧩 제 2화 조각
                                  </span>
                                  {isCleared ? (
                                    <span className="text-[9px] font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 whitespace-nowrap shrink-0">
                                      맞춤 완료 ✓
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold text-stone-400 whitespace-nowrap shrink-0">미완성 🔒</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 my-0.5">
                                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg border shadow-inner shrink-0 ${
                                    isCleared ? "bg-rose-100 border-rose-300" : "bg-stone-200 border-stone-300 text-stone-400"
                                  }`}>
                                    {isCleared ? "🧧" : "❓"}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-xs sm:text-[13px] font-black text-[#5C3A16] truncate">두비의 복주머니</h4>
                                    <p className="text-[10px] text-stone-500 font-medium truncate">두비가 선물한 감사의 복</p>
                                  </div>
                                </div>
                                <div className="pt-1 border-t border-stone-100 flex items-center justify-between text-[10px]">
                                  <span className="font-bold text-sky-700 whitespace-nowrap">✨ 신비한 은빛 바늘</span>
                                  <span className={isCleared ? "font-black text-rose-600 whitespace-nowrap" : "text-stone-400 whitespace-nowrap"}>
                                    {isCleared ? "해금됨" : "2화 필요"}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* [3] 👘 제 3화 퍼즐 조각: 옥색 비단 조각 */}
                          {(() => {
                            const isCleared = clearedStoryEpisodeIds.includes(3);
                            return (
                              <div className={`p-2 sm:p-2.5 rounded-xl border-2 transition-all flex flex-col justify-between gap-1 relative overflow-hidden ${
                                isCleared
                                  ? "bg-white border-blue-400 shadow-2xs ring-1 ring-blue-400/30"
                                  : "bg-stone-100/90 border-dashed border-stone-300 opacity-60"
                              }`}>
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-black text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-300 whitespace-nowrap shrink-0">
                                    🧩 제 3화 조각
                                  </span>
                                  {isCleared ? (
                                    <span className="text-[9px] font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 whitespace-nowrap shrink-0">
                                      맞춤 완료 ✓
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold text-stone-400 whitespace-nowrap shrink-0">미완성 🔒</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 my-0.5">
                                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg border shadow-inner shrink-0 ${
                                    isCleared ? "bg-blue-100 border-blue-300" : "bg-stone-200 border-stone-300 text-stone-400"
                                  }`}>
                                    {isCleared ? "👘" : "❓"}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-xs sm:text-[13px] font-black text-[#5C3A16] truncate">옥색 비단 조각</h4>
                                    <p className="text-[10px] text-stone-500 font-medium truncate">박음질로 고쳐낸 고운 비단</p>
                                  </div>
                                </div>
                                <div className="pt-1 border-t border-stone-100 flex items-center justify-between text-[10px]">
                                  <span className="font-bold text-blue-700 whitespace-nowrap">🧵 청아한 비단실</span>
                                  <span className={isCleared ? "font-black text-blue-600 whitespace-nowrap" : "text-stone-400 whitespace-nowrap"}>
                                    {isCleared ? "해금됨" : "3화 필요"}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* [4] 🥇 제 4화 퍼즐 조각: 사또의 1등 마패 */}
                          {(() => {
                            const isCleared = clearedStoryEpisodeIds.includes(4);
                            return (
                              <div className={`p-2 sm:p-2.5 rounded-xl border-2 transition-all flex flex-col justify-between gap-1 relative overflow-hidden ${
                                isCleared
                                  ? "bg-white border-amber-400 shadow-2xs ring-1 ring-amber-400/30"
                                  : "bg-stone-100/90 border-dashed border-stone-300 opacity-60"
                              }`}>
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 whitespace-nowrap shrink-0">
                                    🧩 제 4화 조각
                                  </span>
                                  {isCleared ? (
                                    <span className="text-[9px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 whitespace-nowrap shrink-0">
                                      맞춤 완료 ✓
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold text-stone-400 whitespace-nowrap shrink-0">미완성 🔒</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 my-0.5">
                                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg border shadow-inner shrink-0 ${
                                    isCleared ? "bg-amber-100 border-amber-300" : "bg-stone-200 border-stone-300 text-stone-400"
                                  }`}>
                                    {isCleared ? "🥇" : "❓"}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-xs sm:text-[13px] font-black text-[#5C3A16] truncate">사또의 1등 마패</h4>
                                    <p className="text-[10px] text-stone-500 font-medium truncate">단추달기 경연 합격 마패</p>
                                  </div>
                                </div>
                                <div className="pt-1 border-t border-stone-100 flex items-center justify-between text-[10px]">
                                  <span className="font-bold text-purple-700 whitespace-nowrap">💎 크리스탈 바늘</span>
                                  <span className={isCleared ? "font-black text-amber-600 whitespace-nowrap" : "text-stone-400 whitespace-nowrap"}>
                                    {isCleared ? "해금됨" : "4화 필요"}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* [5] 🎓 제 5화 마스터 퍼즐 조각: 장원급제 어사화 */}
                          {(() => {
                            const isCleared = clearedStoryEpisodeIds.includes(5);
                            return (
                              <div className={`p-2 sm:p-2.5 rounded-xl border-2 transition-all flex flex-col justify-between gap-1 relative overflow-hidden ${
                                isCleared
                                  ? "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-amber-500 shadow-xs ring-2 ring-yellow-400/40"
                                  : "bg-stone-100/90 border-dashed border-stone-300 opacity-60"
                              }`}>
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-black text-amber-950 bg-amber-300 px-1.5 py-0.5 rounded border border-amber-500 whitespace-nowrap shrink-0 flex items-center gap-1">
                                    <EosahwaIcon size={13} />
                                    <span>5화 조각</span>
                                  </span>
                                  {isCleared ? (
                                    <span className="text-[9px] font-black text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 animate-pulse whitespace-nowrap shrink-0">
                                      완전 결합 🌟
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold text-stone-400 whitespace-nowrap shrink-0">미완성 🔒</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 my-0.5">
                                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shadow-inner shrink-0 overflow-hidden ${
                                    isCleared ? "bg-gradient-to-br from-amber-200 via-amber-300 to-yellow-400 border-amber-500 p-0.5" : "bg-stone-200 border-stone-300 text-stone-400 text-lg"
                                  }`}>
                                    {isCleared ? <EosahwaIcon size={32} /> : "❓"}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-xs sm:text-[13px] font-black text-[#5C3A16] truncate">장원급제 어사화</h4>
                                    <p className="text-[10px] text-stone-500 font-medium truncate">조선 최고 침선관의 영예</p>
                                  </div>
                                </div>
                                <div className="pt-1 border-t border-amber-200/60 flex items-center justify-between text-[10px]">
                                  <span className="font-bold text-amber-800 whitespace-nowrap flex items-center gap-1">
                                    <EosahwaIcon size={12} />
                                    <span>황금바늘/퀼트누비</span>
                                  </span>
                                  <span className={isCleared ? "font-black text-amber-700 whitespace-nowrap" : "text-stone-400 whitespace-nowrap"}>
                                    {isCleared ? "해금됨" : "5화 필요"}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* [6] 📜 대단원 피날레 슬롯: 장원급제 교지 */}
                          {(() => {
                            const isEp5Cleared = clearedStoryEpisodeIds.includes(5);
                            return (
                              <div
                                onClick={() => {
                                  if (isEp5Cleared) {
                                    setIsCertificateGyoji(true);
                                    setIsCertificateOpen(true);
                                  }
                                }}
                                className={`p-2 sm:p-2.5 rounded-xl border-2 transition-all flex flex-col justify-between gap-1 relative overflow-hidden ${
                                  isEp5Cleared
                                    ? "bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-amber-100 border-amber-400 shadow-md ring-2 ring-amber-400/40 cursor-pointer hover:scale-[1.02] active:scale-98"
                                    : "bg-stone-100/90 border-dashed border-stone-300 opacity-60 text-stone-500 cursor-not-allowed"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border whitespace-nowrap shrink-0 ${
                                    isEp5Cleared
                                      ? "bg-amber-400 text-stone-950 border-amber-300"
                                      : "bg-stone-200 text-stone-600 border-stone-300"
                                  }`}>
                                    📜 공인 교지
                                  </span>
                                  {isEp5Cleared ? (
                                    <span className="text-[9px] font-black text-amber-300 bg-amber-900/60 px-1.5 py-0.5 rounded border border-amber-500/50 whitespace-nowrap shrink-0">
                                      수여 완료 🎖️
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold text-stone-400 whitespace-nowrap shrink-0">급제 시 수여 🔒</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 my-0.5">
                                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg border shadow-inner shrink-0 ${
                                    isEp5Cleared ? "bg-amber-400/20 border-amber-400/60 text-amber-200" : "bg-stone-200 border-stone-300 text-stone-400"
                                  }`}>
                                    📜
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className={`text-xs sm:text-[13px] font-black truncate ${
                                      isEp5Cleared ? "text-amber-200" : "text-[#5C3A16]"
                                    }`}>
                                      장원급제 교지
                                    </h4>
                                    <p className={`text-[10px] truncate ${
                                      isEp5Cleared ? "text-amber-200/80" : "text-stone-400"
                                    }`}>
                                      {isEp5Cleared ? "클릭하여 교지 펼쳐보기" : "5화 과거시험 통과 시 발급"}
                                    </p>
                                  </div>
                                </div>
                                <div className="pt-1 border-t border-amber-500/30 flex items-center justify-between text-[10px]">
                                  {isEp5Cleared ? (
                                    <span className="font-black text-amber-300 flex items-center gap-1 whitespace-nowrap">
                                      <span>👉</span>
                                      <span>[교지 열람하기]</span>
                                    </span>
                                  ) : (
                                    <span className="text-stone-400 whitespace-nowrap">5화 통과 필요</span>
                                  )}
                                  <span className={isEp5Cleared ? "font-black text-amber-400 whitespace-nowrap" : "text-stone-400 whitespace-nowrap"}>
                                    {isEp5Cleared ? "상장 소장중 ✓" : "🔒"}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* 하단 닫기 버튼 */}
            <div className="flex justify-end pt-2 border-t-2 border-[#6E4720]/20">
              <button
                type="button"
                onClick={() => setIsWardrobeOpen(false)}
                className="bg-[#6E4720] hover:bg-[#5C3A16] text-white px-6 py-2 rounded-xl font-black text-sm transition-all cursor-pointer shadow-xs active:translate-x-0.5 active:translate-y-0.5"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🎯 튜토리얼 2단계 조준 가이드 모달 */}
      <TutorialStep2IntroModal
        isOpen={showTutorialStep2IntroModal}
        controlMode={controlMode}
        onStartStep2={handleStartTutorialStep2}
      />

      {/* 🎯 튜토리얼 완료 축하 모달 */}
      <TutorialCompletionModal
        isOpen={tutorialCompleted}
        onGoModeSelect={() => {
          exitInteractiveTutorial();
        }}
        onStartStory={() => {
          exitInteractiveTutorial();
          setIsStoryMode(true);
          setStoryPhase("lobby");
          setAppViewMode("course-select");
        }}
        onReplayTutorial={() => {
          startInteractiveTutorial();
        }}
      />

      {/* 🌀 4화 전용 꽃단추 실기둥 감기 인터랙션 모달 */}
      <ShankWrapActionModal
        isOpen={isShankWrapModalOpen}
        wrapTargetCount={currentStep.wrapTargetCount || 3}
        currentWrapCount={shankWrapCount}
        threadColor={activeThread.color}
        totalHoles={levelConfig.totalHoles}
        onWrapOnce={handleShankWrapOnce}
        onWrapComplete={handleShankWrapComplete}
        onReset={handleShankWrapReset}
      />

      {/* ✂️ 3화 전용: 변(줄) 완성 및 매듭짓고 실자르기 확인 모달 */}
      <SideCutKnotModal
        isOpen={sideCutModalData.isOpen}
        completedSideTitle={sideCutModalData.completedSideTitle}
        nextSideTitle={sideCutModalData.nextSideTitle}
        hintText={sideCutModalData.hintText}
        onConfirm={handleConfirmNextSide}
      />

      {/* 📜 꼬매팡 마스터 공인 인증서 & 조선시대 장원급제 교지 모달 */}
      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => {
          setIsCertificateOpen(false);
          setIsCertificateGyoji(false);
        }}
        onGoCourseSelect={() => {
          setIsCertificateOpen(false);
          setIsCertificateGyoji(false);
          setAppViewMode("course-select");
        }}
        courseName={currentCourse.name}
        studentName={studentName}
        onStudentNameChange={setStudentName}
        totalStars={totalStars}
        isGyoji={isCertificateGyoji}
      />

      {/* 📖 [콩쥐의 바느질 일기] 인트로 대화창 오버레이 (5화 퀴즈 모달 팝업 시에도 배경으로 자연스럽게 유지) */}
      {isStoryMode && (storyPhase === "intro" || storyPhase === "quiz") && (
        <StoryDialogOverlay
          episodeId={currentStoryEpisodeId}
          dialogLines={currentStoryEpisode.introDialog}
          title={currentStoryEpisode.title}
          onComplete={handleIntroComplete}
          onSkip={handleIntroComplete}
          confirmBtnText={currentStoryEpisode.targetCourseId === "quiz" ? "과거 시험 시작하기 📜" : "바느질 시작하기 🪡"}
          isBackgroundOnly={storyPhase === "quiz"}
        />
      )}

      {/* 📖 [콩쥐의 바느질 일기] 에피소드 성공 완료 대화창 오버레이 */}
      {isStoryMode && storyPhase === "success" && (
        <StoryDialogOverlay
          episodeId={currentStoryEpisodeId}
          dialogLines={currentStoryEpisode.successDialog}
          title={`${currentStoryEpisode.title} 완료!`}
          onComplete={handleShowStoryCompleteModal}
          confirmBtnText={currentStoryEpisodeId === 5 ? "장원급제 보상 확인 ➔" : "수선 완료 & 보상 확인 ➔"}
        />
      )}

      {/* 👑 [콩쥐의 바느질 일기] 5화: 사또의 바느질 과거 시험 퀴즈 모달 (시나리오 팝업 위 레이어드 표시) */}
      {storyPhase === "quiz" && (
        <StoryQuizModal
          questions={currentStoryEpisode.quizQuestions || []}
          onFinishQuiz={() => setStoryPhase("success")}
          onClose={() => {
            setStoryPhase("intro");
          }}
        />
      )}

      {/* 🌟 [콩쥐의 바느질 일기] 스토리 전용 에피소드 완료 팝업 모달 */}
      {isStoryMode && storyPhase === "complete-modal" && (
        <StoryCompleteModal
          episode={currentStoryEpisode}
          timer={timer}
          mistakeCount={mistakeCount}
          onNextEpisode={
            currentStoryEpisodeId < 5
              ? () => {
                  handleSelectStoryEpisode(currentStoryEpisodeId + 1);
                }
              : undefined
          }
          onReplay={() => {
            handleSelectStoryEpisode(currentStoryEpisodeId);
          }}
          onGoLobby={() => {
            handleFinishStoryEpisode();
          }}
          onOpenCertificate={() => {
            setIsCertificateGyoji(true);
            setIsCertificateOpen(true);
            playClearFanfare();
            handleFinishStoryEpisode();
          }}
        />
      )}

      {/* 📖 꼬매팡 어드벤처 사용 안내 모달 */}
      <GuideHelpModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        onStartTutorial={() => {
          setShowGuideModal(false);
          startInteractiveTutorial();
        }}
      />

      {/* 📱 스마트폰 접속 원천 차단 및 PC/태블릿 권장 안내 전면 오버레이 (우회 불가) */}
      {showMobileNotice && (
        <div className="fixed inset-0 bg-[#2C1810]/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 select-none animate-fadeIn overflow-y-auto">
          <div className="bg-[#FFFDF7] border-4 border-black rounded-[28px] p-6 max-w-xs sm:max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center flex flex-col items-center gap-3.5 relative my-auto">
            {/* 상단 안내 뱃지 */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border-2 border-black text-[#5C3A16] text-[11px] font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span>⚠️</span>
              <span>스마트폰 이용 제한 안내</span>
            </div>

            {/* 디바이스 아이콘 */}
            <div className="w-16 h-16 rounded-2xl bg-[#FFF3D6] border-3 border-black flex items-center justify-center text-3xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mt-0.5">
              <span>🖥️</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-base sm:text-lg font-black text-[#5C3A16] tracking-tight break-keep leading-snug">
                스마트폰 환경에서는<br />이용할 수 없어요!
              </h3>
              <p className="text-xs font-bold text-slate-600 leading-relaxed break-keep">
                꼬매팡 어드벤처는 정교한 3D 실전 바느질 조작을 위해 <b>PC 및 태블릿 환경</b>에 최적화되어 있습니다.
              </p>
            </div>

            {/* 권장 기기 안내 박스 */}
            <div className="w-full bg-[#FAF6F0] border-2 border-dashed border-[#C49A6C] rounded-xl p-3 flex flex-col gap-2.5 text-[11px] font-bold text-slate-700 text-left">
              <div className="flex items-start gap-2 text-sky-900">
                <span className="text-base">💻</span>
                <div className="leading-snug">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <b>PC / 노트북 / 크롬북</b>
                    <span className="bg-sky-200 text-sky-950 text-[9px] sm:text-[9.5px] px-1.5 py-0.5 rounded-md font-black border border-sky-400">★ 가장 추천</span>
                  </div>
                  <div className="text-[10px] sm:text-[10.5px] text-sky-800 font-bold mt-0.5 break-keep">
                    🖱️ <b>마우스로 실습</b>할 때 가장 재미있고 정교해요!
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 text-amber-900">
                <span className="text-base">📱</span>
                <div className="leading-snug">
                  <div><b>태블릿 (iPad, 갤럭시 탭)</b></div>
                  <div className="text-[10px] text-slate-500 font-medium">넓은 대화면 터치로 원활하게 플레이 가능</div>
                </div>
              </div>
            </div>

            {/* 하단 안내 문구 */}
            <div className="w-full py-2.5 px-3 bg-[#F1E9DA] border-2 border-[#C49A6C] rounded-xl text-[11px] font-black text-[#5C3A16] leading-snug">
              🧵 PC나 노트북에서 <b>마우스</b>로 즐겁게 실습해 보세요! ✨
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ✂️ 3화 전용: 한 줄(변) 완성 및 매듭짓고 실자르기 확인 모달
function SideCutKnotModal({
  isOpen,
  completedSideTitle,
  nextSideTitle,
  hintText,
  onConfirm,
}: {
  isOpen: boolean;
  completedSideTitle: string;
  nextSideTitle: string;
  hintText: string;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (isOpen) {
      playSnipSound();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-[#FFFDF7] border-4 sm:border-5 border-[#6E4720] rounded-[2.2rem] p-6 sm:p-7 max-w-sm sm:max-w-md w-full shadow-[8px_8px_0px_0px_#6E4720] text-center flex flex-col items-center gap-3.5 relative my-auto">
        {/* 상단 귀여운 가위 & 바늘 뱃지 */}
        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#FFF3D6] border-3 border-[#6E4720] flex items-center justify-center text-3xl sm:text-4xl shadow-[3px_3px_0px_0px_#6E4720] -mt-2 animate-bounce">
          <span>✂️</span>
        </div>

        {/* 타이틀 및 매듭/자르기 알림 배너 */}
        <div className="flex flex-col items-center gap-1.5 w-full">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border-2 border-[#6E4720] text-[#5C3A16] text-xs font-black shadow-xs">
            <span>🪡</span>
            <span>{completedSideTitle} 완성!</span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-[#5C3A16] tracking-tight leading-snug break-keep mt-1">
            실을 매듭짓고 잘랐습니다!
          </h3>

          <p className="text-xs sm:text-[13px] font-bold text-[#6E4720]/90 leading-relaxed break-keep mt-0.5">
            한복 바느질의 정석대로 이전 줄을 깔끔하게 마무리했어요.<br />
            이제 <strong className="text-emerald-700 underline decoration-2">{nextSideTitle}</strong>을 완전히 <b>새로운 실</b>로 시작합니다!
          </p>
        </div>

        {/* 다음 진행 안내 팁 박스 */}
        <div className="w-full bg-[#FAF6F0] border-2 border-dashed border-[#C49A6C] rounded-2xl p-3 sm:p-3.5 flex flex-col gap-1.5 text-xs font-bold text-[#5C3A16] text-left">
          <div className="flex items-center gap-1 text-emerald-800 font-black">
            <span>💡</span>
            <span>새 실 시작 요령</span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#6E4720] leading-snug break-keep pl-4">
            {hintText}
          </p>
        </div>

        {/* 확인 및 다음 줄 시작 버튼 */}
        <button
          type="button"
          onClick={onConfirm}
          className="w-full py-3 sm:py-3.5 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 text-emerald-950 font-black text-base sm:text-lg border-3 border-[#6E4720] rounded-2xl shadow-[4px_4px_0px_0px_#6E4720] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 mt-1"
        >
          <span>🪡</span>
          <span>{nextSideTitle} 새로 시작하기!</span>
          <span className="text-lg">➡️</span>
        </button>
      </div>
    </div>
  );
}
