"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { DialogLine, SPEAKERS, SpeakerId } from "../data/storyEpisodes";

interface StoryDialogOverlayProps {
  dialogLines: DialogLine[];
  title?: string;
  episodeId?: number;
  onComplete: () => void;
  onSkip?: () => void;
  confirmBtnText?: string;
  isBackgroundOnly?: boolean;
}

export default function StoryDialogOverlay({
  dialogLines,
  title,
  episodeId = 1,
  onComplete,
  onSkip,
  confirmBtnText = "바느질 시작하기 🪡",
  isBackgroundOnly = false,
}: StoryDialogOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");

  const currentLine = dialogLines[currentIndex] || dialogLines[0];
  const speaker = SPEAKERS[currentLine?.speaker as SpeakerId] || SPEAKERS.narrator;
  const isLastLine = currentIndex >= dialogLines.length - 1;
  const isKongjiSpeaking = currentLine?.speaker === "kongji";
  const isSaemiSpeaking = currentLine?.speaker === "saemi";
  const isNarrator = currentLine?.speaker === "narrator";

  // 에피소드 내 첫 번째 지상 상대방 캐릭터 (새미는 지붕 전용이므로 제외)
  const initialGroundSpeakerId: SpeakerId = useMemo(() => {
    for (const line of dialogLines) {
      if (line.speaker !== "kongji" && line.speaker !== "saemi" && line.speaker !== "narrator") {
        return line.speaker;
      }
    }
    return episodeId === 4 || episodeId === 5 ? "magistrate" : "doobi";
  }, [dialogLines, episodeId]);

  // 대화 흐름에 따라 활성화되는 지상 상대방 캐릭터 (파생 상태)
  const activeGroundSpeakerId: SpeakerId = useMemo(() => {
    for (let i = currentIndex; i >= 0; i--) {
      const sp = dialogLines[i]?.speaker;
      if (sp && sp !== "kongji" && sp !== "saemi" && sp !== "narrator") {
        return sp as SpeakerId;
      }
    }
    return initialGroundSpeakerId;
  }, [dialogLines, currentIndex, initialGroundSpeakerId]);

  const groundSpeaker = SPEAKERS[activeGroundSpeakerId] || SPEAKERS.doobi;
  const isGroundSpeaking = currentLine?.speaker === activeGroundSpeakerId;

  // 새미(참새 요정)가 현재 라인까지 한 번이라도 등장했는지 여부
  const hasSaemiAppeared = useMemo(() => {
    for (let i = 0; i <= currentIndex; i++) {
      if (dialogLines[i]?.speaker === "saemi") return true;
    }
    return false;
  }, [dialogLines, currentIndex]);

  // 👘 3화 전용: 팥쥐가 배자를 찢는 대사(인덱스 2) 이후부터 찢어진 배자 배경으로 동적 전환 (수선 완료 시 온전한 배자로 복원)
  const isTornBaeja = useMemo(() => {
    if (episodeId !== 3) return false;
    if (title?.includes("완료")) return false;
    return currentIndex >= 2;
  }, [episodeId, title, currentIndex]);

  const isTyping = Boolean(currentLine && displayedText.length < currentLine.text.length);

  // 타자기 효과
  useEffect(() => {
    if (!currentLine) return;
    let charIdx = 0;
    const fullText = currentLine.text;

    const timer = setInterval(() => {
      charIdx++;
      setDisplayedText(fullText.slice(0, charIdx));
      if (charIdx >= fullText.length) {
        clearInterval(timer);
      }
    }, 22);

    return () => clearInterval(timer);
  }, [currentIndex, currentLine]);

  // 다음 대사 핸들러
  const handleNext = useCallback(() => {
    if (isTyping && currentLine) {
      setDisplayedText(currentLine.text);
      return;
    }

    if (isLastLine) {
      onComplete();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [isTyping, isLastLine, currentLine, onComplete]);

  // 키보드 Space / Enter 지원 (배경 모드일 때는 비활성화)
  useEffect(() => {
    if (isBackgroundOnly) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, isBackgroundOnly]);

  if (!currentLine) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm transition-all select-none animate-fadeIn ${isBackgroundOnly ? 'pointer-events-none' : ''}`}>
      {/* 📖 동화책 메인 컨테이너 카드 */}
      <div className="w-full max-w-4xl bg-[#FFFDF7] rounded-[2.5rem] border-4 sm:border-5 border-[#5C3A16] shadow-[10px_10px_0px_#3D2314] overflow-hidden flex flex-col relative animate-popIn">
        
        {/* 1. 상단 챕터 헤더 바 */}
        <div className="px-5 py-3 bg-[#F4E8D8] border-b-3 border-[#5C3A16] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#5C3A16] text-[#FFE8C2] font-black text-xs rounded-lg shadow-xs">
              📖 제 {episodeId}화
            </span>
            {title && (
              <h3 className="font-black text-xs sm:text-sm text-[#3D2314] truncate max-w-xs sm:max-w-md">
                {title}
              </h3>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#5C3A16] bg-white/80 px-2.5 py-0.5 rounded-lg border border-[#5C3A16]/30">
              {currentIndex + 1} / {dialogLines.length}
            </span>
            {onSkip && !isLastLine && (
              <button
                onClick={onSkip}
                className="px-3 py-1 bg-white hover:bg-amber-100 text-[#5C3A16] font-black text-xs rounded-lg border-2 border-[#5C3A16] shadow-[2px_2px_0px_#5C3A16] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                스킵 ⏩
              </button>
            )}
          </div>
        </div>

        {/* 2. 🎨 [3D 동화책 극장 무대] 고화질 배경 삽화 & 3D 픽사 캐릭터 스탠딩 */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden flex items-end justify-between px-6 sm:px-14 border-b-3 border-[#5C3A16]">
          {/* 에피소드별 생성형 3D 픽사 배경 이미지 (3화는 찢김 상태에 따라 동적 전환) */}
          <div className={`absolute inset-0 pointer-events-none overflow-hidden ${isTornBaeja && currentIndex === 2 ? 'animate-shake' : ''}`}>
            <img
              src={
                episodeId === 1
                  ? "/images/story/bg_story_ep1.webp?v=3"
                  : episodeId === 2
                  ? "/images/story/bg_story_ep2.webp?v=2"
                  : episodeId === 3
                  ? isTornBaeja
                    ? "/images/story/bg_story_ep3_torn.webp?v=2"
                    : "/images/story/bg_story_ep3.webp?v=2"
                  : episodeId === 4
                  ? "/images/story/bg_story_ep4.webp?v=1"
                  : "/images/story/bg_story_ep5.webp?v=1"
              }
              alt="동화 배경"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-center transform scale-105 filter brightness-95 transition-all duration-500"
            />
            {/* 은은한 무대 조명 및 하단 그라데이션 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

            {/* 💥 [3화 전용: 배자 찢김 시각 연출 - 파열 효과음, 느낌표 뱃지, 솔기 펄스 링] */}
            {isTornBaeja && (
              <div className="absolute inset-0 pointer-events-none z-15">
                {/* 1. 찢어진 솔기 위치 펄스 타겟 링 & 라벨 태그 (정밀 픽셀 실밥 좌표 X: 41%, Y: 68% 일치) */}
                <div className="absolute left-[41%] top-[68%] -translate-x-3 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  <span className="relative flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-80" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 bg-red-600 border-2 border-white shadow-lg" />
                  </span>
                  <div className="bg-red-600/95 backdrop-blur-sm text-white text-[11px] sm:text-xs font-black px-2.5 py-1 rounded-full border border-white shadow-xl flex items-center gap-1.5 animate-pulse whitespace-nowrap">
                    <span>⚡</span>
                    <span>찢어진 솔기!</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 👧 [좌측 캐릭터: 3D 콩쥐 스탠딩] */}
          <div
            className={`relative z-10 flex flex-col items-center transition-all duration-300 transform origin-bottom ${
              isKongjiSpeaking
                ? "scale-105 sm:scale-110 drop-shadow-[0_14px_28px_rgba(0,0,0,0.55)] brightness-105 -translate-y-2"
                : isNarrator
                ? "scale-95 opacity-80 brightness-90"
                : "scale-90 opacity-40 brightness-70"
            }`}
          >
            {/* 콩쥐 3D 스탠딩 (투명 누끼 PNG & 입체 드롭 섀도우) */}
            <div className="w-32 sm:w-44 md:w-56 h-48 sm:h-64 md:h-80 flex items-end justify-center relative">
              <img
                src="/images/story/character_kongji.webp?v=2"
                alt="콩쥐"
                loading="lazy"
                decoding="async"
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)] select-none pointer-events-none"
              />
            </div>
            {/* 발 밑 무대 바닥 접촉 그림자 */}
            <div className="w-24 sm:w-36 h-3 bg-black/45 rounded-full blur-[4px] -mt-1 pointer-events-none" />
          </div>

          {/* 🐦 [우상단 지붕 처마: 참새 요정 새미 전용 비행/착지 스탠딩] */}
          <div
            className={`absolute top-2 sm:top-4 right-8 sm:right-24 z-25 flex flex-col items-center transition-all duration-300 transform ${
              hasSaemiAppeared
                ? isSaemiSpeaking
                  ? "opacity-100 scale-110 sm:scale-120 -translate-y-1 drop-shadow-[0_12px_24px_rgba(250,204,21,0.7)] brightness-105"
                  : "opacity-100 scale-95 brightness-95"
                : "opacity-0 -translate-y-8 scale-50 pointer-events-none"
            }`}
          >
            <div className="w-20 sm:w-28 md:w-36 h-20 sm:h-28 md:h-36 flex items-center justify-center relative">
              <img
                src="/images/story/character_saemi.webp?v=2"
                alt="참새 요정 새미"
                loading="lazy"
                decoding="async"
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] select-none pointer-events-none"
              />
            </div>
          </div>

          {/* 🐸/👑 [우측 캐릭터: 3D 지상 상대방 스탠딩 (두비, 사또, 팥쥐 등 동적 교체)] */}
          <div
            className={`relative z-10 flex flex-col items-center transition-all duration-300 transform origin-bottom ${
              isGroundSpeaking
                ? "scale-105 sm:scale-110 drop-shadow-[0_14px_28px_rgba(0,0,0,0.55)] brightness-105 -translate-y-2"
                : isNarrator
                ? "scale-95 opacity-80 brightness-90"
                : "scale-90 opacity-40 brightness-70"
            }`}
          >
            {/* 상대방 3D 스탠딩 (투명 누끼 PNG & 입체 드롭 섀도우) */}
            <div className="w-32 sm:w-44 md:w-56 h-48 sm:h-64 md:h-80 flex items-end justify-center relative">
              <img
                key={groundSpeaker.id}
                src={groundSpeaker.imageSrc || "/images/story/character_doobi.webp?v=2"}
                alt={groundSpeaker.name}
                loading="lazy"
                decoding="async"
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)] select-none pointer-events-none transition-opacity duration-300"
              />
            </div>
            {/* 발 밑 무대 바닥 접촉 그림자 */}
            <div className="w-24 sm:w-36 h-3 bg-black/45 rounded-full blur-[4px] -mt-1 pointer-events-none" />
          </div>
        </div>

        {/* 3. 💬 [하단 대화창 본체 (Dialog Box)] */}
        <div
          onClick={handleNext}
          className="p-4 sm:p-6 bg-white cursor-pointer select-none flex flex-col justify-between min-h-[160px] sm:min-h-[180px]"
        >
          {/* 화자 이름표 & 안내 힌트 */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div
                className="font-black text-xs sm:text-sm px-3 py-1 rounded-xl border-2 border-[#5C3A16] text-[#2E1807] shadow-xs flex items-center gap-2"
                style={{ backgroundColor: speaker.bgColor }}
              >
                {speaker.imageSrc ? (
                  <img
                    src={speaker.imageSrc}
                    alt={speaker.name}
                    loading="lazy"
                    decoding="async"
                    className="w-5 h-5 rounded-full object-cover border border-[#5C3A16]/50 shadow-2xs"
                  />
                ) : (
                  <span>{speaker.avatar}</span>
                )}
                <span>{speaker.name}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-bold hidden sm:inline">
                (클릭 또는 [Space/Enter]로 다음 대사)
              </span>
            </div>
          </div>

          {/* 대사 텍스트 (타자기 애니메이션) */}
          <div className="min-h-[64px] sm:min-h-[76px] flex items-center bg-[#FAF6F0] rounded-2xl p-3.5 sm:p-4 border-2 border-[#5C3A16]/40 text-[#2E1807] font-extrabold text-base sm:text-lg leading-relaxed shadow-inner">
            <p className="w-full break-keep text-pretty whitespace-pre-line">
              {displayedText}
              {isTyping && <span className="inline-block w-2 h-4 ml-1 bg-amber-500 animate-pulse align-middle" />}
            </p>
          </div>

          {/* 💡 [어휘 쏙쏙 배움 카드] 3화 전용: '배자(褙子)' 란? */}
          {episodeId === 3 && (
            <div className="mt-2.5 px-3.5 py-2 bg-[#FFF9EB] rounded-xl border-2 border-[#D4A373]/80 flex items-center gap-2 text-[#5C3A16] text-xs font-bold shadow-2xs animate-fade-in">
              <span className="text-base shrink-0">💡</span>
              <div className="break-keep text-pretty leading-snug">
                <span className="font-black text-[#8B4513] mr-1.5">[배자(褙子)란?]</span>
                저고리 위에 덧입는 소매가 없는 조끼 모양의 고운 우리 전통 한복 옷이에요!
              </div>
            </div>
          )}

          {/* 액션 프롬프트 알림 (미션 목표) */}
          {currentLine.actionPrompt && !isTyping && (
            <div className="mt-2.5 p-2.5 bg-amber-100 rounded-xl border-2 border-amber-600 flex items-center gap-2 text-amber-950 font-black text-xs sm:text-sm animate-bounce">
              <span>🎯</span>
              <span className="break-keep text-pretty">{currentLine.actionPrompt}</span>
            </div>
          )}

          {/* 하단 버튼 바 */}
          <div className="mt-3 flex items-center justify-end gap-2">
            {isLastLine ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete();
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-[#3D2314] font-black text-sm sm:text-base rounded-2xl border-3 border-[#5C3A16] shadow-[3px_3px_0px_#5C3A16] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer animate-bounce-short"
              >
                <span>{confirmBtnText}</span>
                <span>➔</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="px-5 py-2 bg-[#5C3A16] hover:bg-[#4A2E16] text-[#FFF4DE] font-black text-xs sm:text-sm rounded-xl border-2 border-[#3D2314] shadow-[2px_2px_0px_#3D2314] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{isTyping ? "전체 보기" : "다음 대사"}</span>
                <span>➔</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
