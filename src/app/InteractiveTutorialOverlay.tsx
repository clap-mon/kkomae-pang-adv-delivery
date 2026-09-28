"use client";

interface InteractiveTutorialOverlayProps {
  isActive: boolean;
  tutorialStep: number;
  controlMode: "pc" | "tablet";
  isTutorialLocked: boolean;
  tutorialToast: string;
  clearedStep?: number | null;
  onProceedNextStep?: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onExit: () => void;
}

const TUTORIAL_STEPS_INFO = [
  { step: 1, label: "바늘 들기", icon: "🪡" },
  { step: 2, label: "표적 조준", icon: "🎯" },
  { step: 3, label: "구멍 찌르기", icon: "⬇️" },
  { step: 4, label: "시점 회전", icon: "🔄" },
];

/** 🎓 3D 실전 인터랙티브 튜토리얼 코칭 HUD 오버레이 */
export default function InteractiveTutorialOverlay({
  isActive,
  tutorialStep,
  controlMode,
  isTutorialLocked,
  tutorialToast,
  clearedStep = null,
  onProceedNextStep,
  onPrevStep,
  onNextStep,
  onExit,
}: InteractiveTutorialOverlayProps) {
  if (!isActive) return null;

  return (
    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 z-40 flex flex-col gap-2 pointer-events-none">
      {/* 1. 상단 HUD 메인 바 */}
      <div className="bg-black/90 backdrop-blur-md text-white border-2 sm:border-3 border-amber-400 rounded-2xl p-2.5 sm:p-3.5 shadow-2xl animate-popIn pointer-events-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
          {/* 4단계 스텝 칩스 (단계별 분리감 시각화) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {TUTORIAL_STEPS_INFO.map((s) => {
              const isDone = tutorialStep > s.step;
              const isCurrent = tutorialStep === s.step;
              return (
                <div
                  key={s.step}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-black transition-all ${
                    isDone
                      ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400/50"
                      : isCurrent
                      ? "bg-amber-400 text-amber-950 shadow-md ring-2 ring-amber-300 scale-105"
                      : "bg-white/10 text-stone-400 border border-white/10"
                  }`}
                >
                  <span>{isDone ? "✓" : s.icon}</span>
                  <span>{s.step}단계: {s.label}</span>
                </div>
              );
            })}
          </div>

          {/* 이전 / 다음 / 종료 버튼 그룹 */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
            {tutorialStep > 1 && (
              <button
                type="button"
                onClick={onPrevStep}
                className="text-[11px] sm:text-xs bg-white/20 hover:bg-white/30 text-white font-bold px-2 sm:px-2.5 py-1 rounded-lg border border-white/40 cursor-pointer"
              >
                ⏮️ 이전
              </button>
            )}
            {tutorialStep < 4 && (
              <button
                type="button"
                onClick={onNextStep}
                className="text-[11px] sm:text-xs bg-white/20 hover:bg-white/30 text-white font-bold px-2 sm:px-2.5 py-1 rounded-lg border border-white/40 cursor-pointer"
              >
                다음 ⏩
              </button>
            )}
            <button
              type="button"
              onClick={onExit}
              className="text-[11px] sm:text-xs bg-red-600 hover:bg-red-700 text-white font-black px-2.5 py-1 rounded-lg border border-red-400 cursor-pointer shadow-xs ml-0.5"
            >
              종료 ✕
            </button>
          </div>
        </div>

        {/* 단계별 핵심 코칭 문구 */}
        <div className="bg-white/10 rounded-xl p-2 sm:p-2.5 border border-white/20 text-xs font-bold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base sm:text-lg shrink-0">👉</span>
            <span className="text-amber-100 text-[11px] sm:text-xs leading-tight">
              {controlMode === "tablet" ? (
                <>
                  {tutorialStep === 1 && "손가락으로 바늘을 꾹 누른 채 위쪽으로 드래그하여 번쩍 들어 올리세요!"}
                  {tutorialStep === 2 && "화면 좌측의 [▲ 앞 / ▼ 뒤] 조준 버튼으로 표적을 노란 구멍에 맞추세요!"}
                  {tutorialStep === 3 && "조준 완료! 그대로 손가락을 아래로 내려 노란 구멍 속으로 바늘을 쏙 꽂아보세요!"}
                  {tutorialStep === 4 && "좌측 상단의 [🔄 시점 회전] 버튼을 켜고 화면을 밀어 천 뒷면을 확인해보세요!"}
                </>
              ) : (
                <>
                  {tutorialStep === 1 && "마우스 왼쪽 버튼을 꾹 누른 채 위쪽으로 드래그하여 바늘을 위로 번쩍 들어 올리세요!"}
                  {tutorialStep === 2 && "마우스 휠(또는 W·S 키)을 굴려 빗겨나간 바늘 그림자를 노란 구멍에 맞추세요!"}
                  {tutorialStep === 3 && "조준 완료! 그대로 마우스를 아래로 내려 노란 구멍 속으로 바늘을 쏙 꽂아보세요!"}
                  {tutorialStep === 4 && "마우스 오른쪽 버튼(우클릭)을 누른 채 마우스를 돌려 천 뒷면(안면)을 확인해보세요!"}
                </>
              )}
            </span>
          </div>

          {/* 조작 가이드 인디케이터 배지 */}
          <span
            className={`text-[10px] sm:text-[11px] px-2.5 py-1 rounded-lg font-black whitespace-nowrap shrink-0 transition-all ${
              isTutorialLocked
                ? "bg-amber-500/40 text-amber-200 ring-2 ring-amber-400 animate-pulse"
                : "bg-amber-400/30 text-amber-200"
            }`}
          >
            {isTutorialLocked
              ? "⏳ 미션 완료!"
              : controlMode === "tablet"
              ? tutorialStep === 1
                ? "👆 터치 드래그"
                : tutorialStep === 2
                ? "🎯 ▲/▼ 조준"
                : tutorialStep === 3
                ? "🎯 아래로 찌르기"
                : "🔄 시점 토글"
              : tutorialStep === 1
              ? "🖱️ 좌클릭 드래그"
              : tutorialStep === 2
              ? "🎡 마우스 휠 / W·S"
              : tutorialStep === 3
              ? "🎯 아래로 찌르기"
              : "🖱️ 우클릭 회전"}
          </span>
        </div>
      </div>

      {/* 2. 단계 완료 축하 & 다음 단계 진행 인터미션 카드 */}
      {clearedStep !== null && onProceedNextStep && (
        <div className="bg-[#FFFDF7] border-3 sm:border-4 border-[#6E4720] rounded-2xl p-3 sm:p-4 shadow-[5px_5px_0_0_#6E4720] text-center animate-popIn pointer-events-auto max-w-md mx-auto w-full">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xl sm:text-2xl animate-bounce">
              {clearedStep === 1 ? "👏" : clearedStep === 2 ? "🎯" : "✨"}
            </span>
            <h3 className="text-sm sm:text-base font-black text-[#5C3A16]">
              {clearedStep === 1 && "1단계 바늘 들어올리기 완료!"}
              {clearedStep === 2 && "2단계 표적 조준(Lock-on) 완료!"}
              {clearedStep === 3 && "3단계 첫 땀 찌르기 성공!"}
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs text-stone-600 font-bold mb-2.5 leading-relaxed">
            {clearedStep === 1 && "바늘을 위로 번쩍 들었습니다! 이제 빗겨나간 그림자 표적을 구멍에 맞추는 조준 실습을 시작합니다."}
            {clearedStep === 2 && "그림자 표적이 목표 구멍에 정확히 일치했습니다! 이제 바늘을 찔러 첫 땀을 완성해보세요."}
            {clearedStep === 3 && "천 겉면에 첫 땀이 예쁘게 놓였습니다! 이제 마우스 우클릭으로 천의 뒷면을 확인해보세요."}
          </p>
          <button
            type="button"
            onClick={onProceedNextStep}
            className="w-full bg-[#E76F51] hover:bg-[#D45E41] text-white font-black text-xs sm:text-sm py-2.5 rounded-xl border-2 border-[#6E4720] shadow-[2px_2px_0_0_#6E4720] flex items-center justify-center gap-1.5 transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            <span>
              {clearedStep === 1 && "🎯 2단계 표적 조준 실습하기 ➔"}
              {clearedStep === 2 && "⬇️ 3단계 구멍 찌르러 가기 ➔"}
              {clearedStep === 3 && "🔄 4단계 360° 시점 확인하기 ➔"}
            </span>
          </button>
        </div>
      )}

      {/* 3. 토스트 알림 (일반 단계 달성 시) */}
      {tutorialToast && !clearedStep && (
        <div className="bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl border border-white/40 shadow-lg animate-bounce flex items-center justify-center gap-1.5 pointer-events-auto max-w-fit mx-auto">
          <span>✨</span>
          <span>{tutorialToast}</span>
        </div>
      )}
    </div>
  );
}
