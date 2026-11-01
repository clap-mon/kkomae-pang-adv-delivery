"use client";

import { StoryEpisode } from "../data/storyEpisodes";
import { appConfirm } from "@/lib/appDialog";

interface StoryModeLobbyProps {
  episodes: StoryEpisode[];
  clearedEpisodeIds: number[];
  onSelectEpisode: (episodeId: number) => void;
  onResetProgress?: () => void;
}

export default function StoryModeLobby({
  episodes,
  clearedEpisodeIds,
  onSelectEpisode,
  onResetProgress,
}: StoryModeLobbyProps) {
  const isUnlocked = (epId: number) => {
    if (epId === 1) return true;
    return clearedEpisodeIds.includes(epId - 1);
  };

  const allCleared = episodes.every((ep) => clearedEpisodeIds.includes(ep.id));
  const progressPercent = Math.round((clearedEpisodeIds.length / episodes.length) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto py-2 px-1 sm:px-2 animate-fade-in flex flex-col gap-3">
      {/* 1. 슬림하고 명료한 상단 진행도 바 (거대 배너 제거) */}
      <div className="w-full bg-[#FFFDF5] rounded-2xl border-3 border-[#6E4720] px-4 py-3 shadow-[3px_3px_0px_#6E4720] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">📖</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#5C3A16] leading-tight">
                콩쥐의 바느질 일기
              </h2>
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                총 5화 모험
              </span>
            </div>
            <p className="text-xs font-semibold text-[#8C6239] mt-0.5">
              두비 요정과 함께 찢어진 소품을 수선하고 사또의 과거 시험에 도전하세요!
            </p>
          </div>
        </div>

        {/* 미니멀 진행도 게이지 */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <div className="text-right">
            <div className="text-[10px] font-black text-slate-500">진행률</div>
            <div className="text-sm font-black text-[#E76F51]">
              {clearedEpisodeIds.length} / {episodes.length} 완료 ({progressPercent}%)
            </div>
          </div>
          <div className="w-20 sm:w-28 h-3 bg-slate-100 rounded-full border-2 border-[#6E4720] overflow-hidden p-0.5">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {allCleared && <span className="text-lg">🏆</span>}
        </div>
      </div>

      {/* 2. 동화책 챕터 카드 그리드 (1~4화 2열 + 5화 전폭 하이라이트) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
        {episodes.map((ep) => {
          const unlocked = isUnlocked(ep.id);
          const cleared = clearedEpisodeIds.includes(ep.id);
          const isFinal = ep.id === 5;

          // 5화: 대망의 과거시험 장원급제 전폭 하이라이트 카드
          if (isFinal) {
            return (
              <div
                key={ep.id}
                onClick={() => unlocked && onSelectEpisode(ep.id)}
                className={`group relative sm:col-span-2 rounded-2xl border-3 border-[#6E4720] overflow-hidden flex flex-col sm:flex-row transition-all select-none ${
                  unlocked
                    ? cleared
                      ? "bg-gradient-to-r from-amber-50/70 via-white to-amber-50/70 hover:bg-amber-50 shadow-[3px_3px_0px_#6E4720] hover:-translate-y-0.5 cursor-pointer"
                      : "bg-gradient-to-r from-yellow-50 via-amber-50/40 to-yellow-50 hover:from-yellow-100/70 shadow-[4px_4px_0px_#6E4720] hover:-translate-y-1 cursor-pointer ring-2 ring-amber-400"
                    : "bg-stone-100 opacity-60 cursor-not-allowed shadow-[2px_2px_0px_#A08C75]"
                }`}
              >
                {/* 좌측 썸네일 배너 */}
                <div className="relative w-full sm:w-56 h-32 sm:h-auto shrink-0 bg-stone-200 overflow-hidden border-b-2 sm:border-b-0 sm:border-r-2 border-[#6E4720]">
                  {ep.bgImageSrc ? (
                    <img
                      src={ep.bgImageSrc}
                      alt={ep.title}
                      loading="lazy"
                      decoding="async"
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                        !unlocked ? "grayscale contrast-75 brightness-75" : ""
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-amber-100">
                      {ep.icon}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                  {/* 회차 뱃지 */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-950 text-amber-200 border border-amber-400 shadow-xs">
                      {ep.badge}
                    </span>
                  </div>

                  {/* 상태 뱃지 */}
                  <div className="absolute top-2 right-2">
                    {cleared ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-500 text-white border border-emerald-300 shadow-xs flex items-center gap-1">
                        완료 🏆
                      </span>
                    ) : unlocked ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-400 text-slate-950 border border-yellow-200 shadow-xs flex items-center gap-1">
                        최종 본시험 👑
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-stone-700/80 text-stone-200 border border-stone-500 shadow-xs flex items-center gap-1">
                        잠김 🔒
                      </span>
                    )}
                  </div>
                </div>

                {/* 우측 정보 & 액션 */}
                <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-amber-100 text-[#5C3A16] border border-amber-300 shadow-xs">
                        📜 {ep.techniqueName}
                      </span>
                      <h3
                        className={`text-sm sm:text-base font-black leading-tight break-keep ${
                          unlocked ? "text-[#5C3A16]" : "text-stone-500"
                        }`}
                      >
                        {ep.title}
                      </h3>
                    </div>
                    <p className="text-xs font-semibold text-stone-700 break-keep mt-1">
                      🎯 {ep.missionGoal}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-black text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-200/90 w-fit">
                      <span>🎁 최종 보상:</span>
                      <span>{ep.rewardIcon} {ep.rewardText.replace(/ 획득!?$/, "")}</span>
                    </div>
                  </div>

                  <div className="mt-1 flex items-center justify-end">
                    <button
                      type="button"
                      disabled={!unlocked}
                      className={`w-full sm:w-44 py-1.5 sm:py-2 rounded-xl border-2 border-[#6E4720] font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-[2px_2px_0px_#6E4720] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer ${
                        !unlocked
                          ? "bg-stone-200 text-stone-400 border-stone-300 shadow-none cursor-not-allowed"
                          : cleared
                          ? "bg-white hover:bg-amber-100/60 text-[#5C3A16]"
                          : "bg-[#FDE047] hover:bg-yellow-300 text-slate-950 ring-1 ring-amber-400"
                      }`}
                    >
                      {!unlocked ? "1~4화 완료 필요 🔒" : cleared ? "장원급제 다시보기 🔁" : "과거시험 응시하기 ➔"}
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          // 1~4화: 동화책 챕터 카드 (2열 그리드)
          return (
            <div
              key={ep.id}
              onClick={() => unlocked && onSelectEpisode(ep.id)}
              className={`group relative rounded-2xl border-3 border-[#6E4720] overflow-hidden flex flex-col transition-all select-none ${
                unlocked
                  ? cleared
                    ? "bg-white hover:bg-amber-50/40 shadow-[3px_3px_0px_#6E4720] hover:-translate-y-0.5 cursor-pointer"
                    : "bg-[#FFFDF7] hover:bg-yellow-50/60 shadow-[4px_4px_0px_#6E4720] hover:-translate-y-1 cursor-pointer ring-2 ring-amber-400/80"
                  : "bg-stone-100 opacity-60 cursor-not-allowed shadow-[2px_2px_0px_#A08C75]"
              }`}
            >
              {/* 상단 와이드 일러스트 배너 */}
              <div className="relative w-full h-24 sm:h-28 bg-stone-200 overflow-hidden border-b-2 border-[#6E4720]">
                {ep.bgImageSrc ? (
                  <img
                    src={ep.bgImageSrc}
                    alt={ep.title}
                    loading="lazy"
                    decoding="async"
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      !unlocked ? "grayscale contrast-75 brightness-75" : ""
                    }`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl bg-amber-100">
                    {ep.icon}
                  </div>
                )}

                {/* 배너 그라데이션 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                {/* 좌측 상단 회차 칩 */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10.5px] font-black bg-[#5C3A16] text-amber-100 border border-amber-300/60 shadow-xs">
                    {ep.badge}
                  </span>
                </div>

                {/* 우측 상단 상태 뱃지 */}
                <div className="absolute top-2 right-2">
                  {cleared ? (
                    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-black bg-emerald-500 text-white border border-emerald-300 shadow-xs flex items-center gap-1">
                      완료 ✅
                    </span>
                  ) : unlocked ? (
                    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-black bg-amber-400 text-slate-950 border border-yellow-200 shadow-xs flex items-center gap-1">
                      도전 가능 🌟
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-black bg-stone-700/80 text-stone-200 border border-stone-500 shadow-xs flex items-center gap-1">
                      잠김 🔒
                    </span>
                  )}
                </div>

                {/* 일러스트 하단 기법 태그 */}
                <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10.5px] font-extrabold bg-white/95 text-[#5C3A16] border border-amber-300 shadow-xs backdrop-blur-xs truncate max-w-full">
                    🪡 {ep.techniqueName}
                  </span>
                </div>
              </div>

              {/* 하단 본문 정보 영역 */}
              <div className="p-3 flex flex-col justify-between flex-1 gap-1.5">
                <div>
                  <h3
                    className={`text-sm sm:text-[15px] font-black leading-tight break-keep ${
                      unlocked ? "text-[#5C3A16]" : "text-stone-500"
                    }`}
                  >
                    {ep.title}
                  </h3>
                  <p className="text-[11.5px] font-semibold text-stone-600 mt-1 line-clamp-2 break-keep">
                    🎯 {ep.missionGoal}
                  </p>
                </div>

                {/* 보상 정보 & 액션 버튼 */}
                <div className="mt-1 flex flex-col gap-1.5 pt-1.5 border-t border-stone-200/80">
                  <div className="flex items-center gap-1 text-[10.5px] font-semibold text-stone-500 truncate">
                    <span className="shrink-0">🎁 보상:</span>
                    <span className="truncate text-stone-700 font-bold">{ep.rewardIcon} {ep.rewardText.replace(/ 획득!?$/, "")}</span>
                  </div>

                  <button
                    type="button"
                    disabled={!unlocked}
                    className={`w-full py-1.5 rounded-xl border-2 border-[#6E4720] font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-[1.5px_1.5px_0px_#6E4720] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer ${
                      !unlocked
                        ? "bg-stone-200 text-stone-400 border-stone-300 shadow-none cursor-not-allowed"
                        : cleared
                        ? "bg-white hover:bg-amber-100/60 text-[#5C3A16]"
                        : "bg-[#FDE047] hover:bg-yellow-300 text-slate-950 ring-1 ring-amber-400"
                    }`}
                  >
                    {!unlocked ? "이전 화 완료 필요 🔒" : cleared ? "다시하기 🔁" : "도전하기 ➔"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 진행도 초기화 버튼 */}
      {onResetProgress && clearedEpisodeIds.length > 0 && (
        <div className="text-center pt-2">
          <button
            onClick={async () => {
              if (await appConfirm("스토리 진행 기록을 처음부터 다시 시작하시겠습니까?")) {
                onResetProgress();
              }
            }}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 underline underline-offset-4 cursor-pointer"
          >
            스토리 진행 기록 초기화
          </button>
        </div>
      )}
    </div>
  );
}
