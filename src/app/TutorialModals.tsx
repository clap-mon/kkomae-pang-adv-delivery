"use client";

import Image from "next/image";

interface TutorialStep2IntroModalProps {
  isOpen: boolean;
  controlMode: "pc" | "tablet";
  onStartStep2: () => void;
}

/** 🎯 3D 튜토리얼 2단계 전환 코칭 팝업 (방향 조절 가이드) */
export function TutorialStep2IntroModal({
  isOpen,
  controlMode,
  onStartStep2,
}: TutorialStep2IntroModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#FFFDF7] border-4 border-[#6E4720] rounded-[2rem] p-4 sm:p-5 w-full max-w-sm sm:max-w-md shadow-[8px_8px_0px_0px_#6E4720] relative text-center animate-popIn max-h-[90vh] overflow-y-auto">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 border-3 border-[#6E4720] rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-2.5 shadow-xs">
          🎯
        </div>

        <span className="bg-amber-400 text-[#5C3A16] font-black text-xs px-2.5 py-0.5 rounded-full border-2 border-[#6E4720] shadow-2xs inline-block mb-1">
          미션 2단계 가이드
        </span>

        <h3 className="text-lg sm:text-xl font-black text-[#5C3A16] mb-1.5">
          앞뒤 방향은 어떻게 맞출까요?
        </h3>

        <p className="text-xs sm:text-sm text-stone-700 font-bold mb-3 leading-relaxed">
          바늘을 번쩍 들어 올렸지만, <br className="hidden sm:inline" />
          <span className="text-[#E76F51]">천 표면의 그림자 표적</span>이 살짝 빗겨나 있네요!
        </p>

        {/* 모드별 조작 방법 카드 */}
        <div className="bg-[#FFF9E6] border-2 border-[#6E4720] rounded-xl p-3 mb-4 text-left text-xs font-bold text-[#5C3A16] shadow-xs">
          {controlMode === "tablet" ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-emerald-800">
                <span className="text-base">📱</span>
                <span>화면 좌측의 <b>[▲ 앞 / ▼ 뒤] 조준 버튼</b>을 탭하세요!</span>
              </div>
              <p className="text-[11px] text-stone-600 pl-5">
                버튼을 누르면 표적이 앞뒤로 움직이며 노란 구멍과 일치 시 <b>초록색(Lock-on)</b>으로 바뀝니다. (풀 오토스냅도 지원)
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-emerald-800">
                <span className="text-base">🎡</span>
                <span><b>마우스 휠</b>을 굴리거나 <b>W·S 키</b>를 누르세요!</span>
              </div>
              <p className="text-[11px] text-stone-600 pl-5">
                휠/키를 조작하면 그림자 표적이 앞뒤로 이동하며 노란 구멍에 맞으면 <b>초록색(Lock-on)</b>으로 바뀝니다!
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onStartStep2}
          className="w-full bg-[#2A9D8F] hover:bg-[#21867A] border-3 border-[#6E4720] shadow-[3px_3px_0_0_#6E4720] text-white py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>🎯</span>
          <span>조준 실습 시작하기!</span>
        </button>
      </div>
    </div>
  );
}

interface TutorialCompletionModalProps {
  isOpen: boolean;
  onGoModeSelect?: () => void;
  onStartStory?: () => void;
  onReplayTutorial: () => void;
}

/** 🎯 3D 바느질 기초 4대 조작 튜토리얼 완료 축하 모달 */
export function TutorialCompletionModal({
  isOpen,
  onGoModeSelect,
  onStartStory,
  onReplayTutorial,
}: TutorialCompletionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl p-4 sm:p-6 text-center shadow-2xl border border-stone-200/80 z-50 w-full max-w-sm sm:max-w-md animate-popIn relative overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* 상단 히어로 배너 */}
        <div className="relative w-full h-32 sm:h-36 rounded-2xl overflow-hidden mb-3 border border-stone-100 shadow-inner bg-amber-50/50">
          <Image
            src="/images/complete-hero.webp"
            alt="3D 바느질 완주 그래픽"
            width={400}
            height={160}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-stone-200 text-[10px] font-bold text-stone-700 shadow-xs">
            3D 튜토리얼 완료
          </div>
        </div>

        <h3 className="text-lg sm:text-xl font-black mb-1 text-stone-900 tracking-tight">
          3D 바느질 4대 조작 마스터 완료!
        </h3>
        <p className="text-xs text-stone-600 font-medium mb-3 leading-relaxed">
          바늘 들기, 표적 조준, 찌르기, 360° 시점 회전까지<br />
          3D 바느질의 모든 핵심 조작을 완벽하게 익혔습니다.<br />
          <span className="text-[#E76F51] font-bold">이제 콩쥐와 함께 신비로운 바느질 모험을 떠나보세요!</span>
        </p>

        {/* 4대 조작 마스터 체크 그리드 */}
        <div className="grid grid-cols-2 gap-1.5 mb-4 text-left">
          <div className="bg-stone-50 border border-stone-200/70 rounded-lg p-2 flex items-start gap-1.5">
            <span className="w-4 h-4 rounded-md bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">✓</span>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-stone-800">1. 바늘 높이 들기</div>
              <div className="text-[10px] text-stone-500 truncate">마우스 좌클릭 드래그</div>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200/70 rounded-lg p-2 flex items-start gap-1.5">
            <span className="w-4 h-4 rounded-md bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">✓</span>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-stone-800">2. 표적 그림자 조준</div>
              <div className="text-[10px] text-stone-500 truncate">휠 / W·S 키 조준</div>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200/70 rounded-lg p-2 flex items-start gap-1.5">
            <span className="w-4 h-4 rounded-md bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">✓</span>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-stone-800">3. 구멍 찌르기</div>
              <div className="text-[10px] text-stone-500 truncate">첫 땀 완성</div>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200/70 rounded-lg p-2 flex items-start gap-1.5">
            <span className="w-4 h-4 rounded-md bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">✓</span>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-stone-800">4. 360° 시점 회전</div>
              <div className="text-[10px] text-stone-500 truncate">마우스 우클릭 드래그</div>
            </div>
          </div>
        </div>

        {/* 액션 버튼 그룹 */}
        <div className="flex flex-col gap-2">
          {onStartStory && (
            <button
              type="button"
              onClick={onStartStory}
              className="w-full bg-[#FDE047] hover:bg-[#FACC15] text-slate-950 py-3 rounded-xl font-black text-xs sm:text-sm border-2 border-black shadow-[3px_3px_0_0_#000] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>📖</span>
              <span>콩쥐의 바느질 모험 시작하기 ➔</span>
            </button>
          )}

          {onGoModeSelect && (
            <button
              type="button"
              onClick={onGoModeSelect}
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 py-2.5 rounded-xl font-bold text-xs sm:text-sm border border-stone-300 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>📋</span>
              <span>모드 선택 화면으로 가기</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReplayTutorial}
            className="w-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 py-2 rounded-xl font-semibold text-xs active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            <span>🔄</span>
            <span>3D 조작 다시 연습하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
