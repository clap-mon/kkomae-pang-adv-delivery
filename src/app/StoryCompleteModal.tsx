'use client';

import { StoryEpisode, STORY_EPISODES } from '../data/storyEpisodes';

interface StoryCompleteModalProps {
  episode: StoryEpisode;
  timer: number;
  mistakeCount: number;
  onNextEpisode?: () => void;
  onReplay: () => void;
  onGoLobby: () => void;
  onOpenCertificate?: () => void;
}

export default function StoryCompleteModal({
  episode,
  timer,
  mistakeCount,
  onNextEpisode,
  onReplay,
  onGoLobby,
  onOpenCertificate,
}: StoryCompleteModalProps) {
  const isFinalEpisode = episode.id === 5;
  const nextEpisode = STORY_EPISODES.find((ep) => ep.id === episode.id + 1);

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-[#FFFDF7] border-4 border-[#6E4720] rounded-3xl p-4 sm:p-5 w-full max-w-md shadow-[6px_6px_0px_#6E4720] text-center relative overflow-hidden animate-popIn max-h-[92vh] overflow-y-auto">
        
        {/* 상단 장식 리본/뱃지 */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 border-2 border-[#6E4720] text-[#5C3A16] text-xs font-black mb-2 shadow-2xs">
          <span>{isFinalEpisode ? '👑' : episode.icon}</span>
          <span>{isFinalEpisode ? '관아 침선 과거시험 장원급제!' : `제 ${episode.id}화 수선 완수!`}</span>
        </div>

        {/* 별점 축하 연출 */}
        <div className="flex justify-center items-center gap-1.5 mb-1.5">
          <span className="text-3xl text-amber-400 drop-shadow-[0_2px_4px_rgba(245,158,11,0.4)] animate-bounce">★</span>
          <span className="text-4xl text-amber-400 drop-shadow-[0_2px_4px_rgba(245,158,11,0.4)] scale-110 animate-bounce delay-100">★</span>
          <span className="text-3xl text-amber-400 drop-shadow-[0_2px_4px_rgba(245,158,11,0.4)] animate-bounce delay-200">★</span>
        </div>

        {/* 에피소드 제목 & 기법 */}
        <h3 className="text-lg sm:text-xl font-black text-[#3D2314] tracking-tight mb-1 break-keep text-pretty">
          {episode.title}
        </h3>
        <p className="text-xs text-[#8C5D35] font-extrabold mb-3.5 break-keep">
          기법: {episode.techniqueName}
        </p>

        {/* 🎁 스토리 완료 보상 카드 (황금빛 테두리 & 입체 음영) */}
        <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-2 border-amber-400 rounded-2xl p-3 mb-3.5 shadow-sm text-center relative overflow-hidden">
          <div className="text-[11px] font-black text-amber-800 mb-1 flex items-center justify-center gap-1">
            <span>✨</span>
            <span>에피소드 수선 보상 획득!</span>
            <span>✨</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-black text-[#45260A] break-keep">
            <span className="text-xl sm:text-2xl">{episode.rewardIcon}</span>
            <span>{episode.rewardText}</span>
          </div>
        </div>

        {/* ⏱️ 플레이 기록 요약 박스 */}
        <div className="bg-[#FAF4E6] border border-[#D9C4A1] rounded-xl p-2.5 mb-3.5 grid grid-cols-2 gap-2 text-center text-xs font-bold text-[#633E1D]">
          <div>
            <div className="text-[11px] text-[#9E7A5A]">수선 소요 시간</div>
            <div className="text-sm font-black text-[#3D2314] mt-0.5">{timer}초</div>
          </div>
          <div className="border-l border-[#D9C4A1]">
            <div className="text-[11px] text-[#9E7A5A]">실 엉킴 횟수</div>
            <div className="text-sm font-black text-[#3D2314] mt-0.5">{mistakeCount}회</div>
          </div>
        </div>

        {/* 📖 다음 이야기 안내 박스 (다음 화가 있을 때) */}
        {nextEpisode && (
          <div className="bg-amber-100/70 border border-amber-300 rounded-xl p-2.5 mb-4 text-center">
            <div className="text-[10px] font-black text-amber-900 mb-0.5">
              다음 이야기 예고 ➔
            </div>
            <p className="text-xs font-black text-[#422206] break-keep text-pretty">
              제 {nextEpisode.id}화: {nextEpisode.title}
            </p>
          </div>
        )}

        {/* 🔘 액션 버튼 그룹 */}
        <div className="flex flex-col gap-2">
          {nextEpisode && onNextEpisode ? (
            <button
              onClick={onNextEpisode}
              className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-[#3D2314] py-3 rounded-2xl font-black text-sm sm:text-base border-3 border-[#6E4720] shadow-[3px_3px_0px_#6E4720] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>제 {nextEpisode.id}화 이야기로 계속하기</span>
              <span>➔</span>
            </button>
          ) : isFinalEpisode && onOpenCertificate ? (
            <button
              onClick={onOpenCertificate}
              className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-[#3D2314] py-3 rounded-2xl font-black text-sm sm:text-base border-3 border-[#6E4720] shadow-[3px_3px_0px_#6E4720] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 animate-bounce-short"
            >
              <span>장원급제 교지 확인하기 📜</span>
              <span>➔</span>
            </button>
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onGoLobby}
              className="bg-white hover:bg-stone-50 border-2 border-[#6E4720] text-[#5C3A16] py-2.5 rounded-xl font-black text-xs active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-[2px_2px_0px_#6E4720]"
            >
              <span>📖 이야기 목록</span>
            </button>

            <button
              onClick={onReplay}
              className="bg-white hover:bg-stone-50 border-2 border-[#6E4720] text-[#5C3A16] py-2.5 rounded-xl font-black text-xs active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-[2px_2px_0px_#6E4720]"
            >
              <span>다시하기 🔁</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
