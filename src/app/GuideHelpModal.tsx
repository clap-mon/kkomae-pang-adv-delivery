"use client";

import { useState } from "react";

interface GuideHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTutorial?: () => void;
}

type GuideTab = "controls" | "episodes" | "tips";

/** 📖 꼬매팡 어드벤처 모험 가이드 모달 (3D 전용 & 스토리 맞춤 최적화) */
export default function GuideHelpModal({
  isOpen,
  onClose,
  onStartTutorial,
}: GuideHelpModalProps) {
  const [guideModalTab, setGuideModalTab] = useState<GuideTab>("controls");
  const [controlMode, setControlMode] = useState<"pc" | "tablet">("pc");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#FFFDF7] border-4 sm:border-5 border-[#6E4720] rounded-[2rem] p-4 sm:p-5 w-full max-w-lg sm:max-w-xl shadow-[8px_8px_0px_0px_#6E4720] relative flex flex-col max-h-[92vh]">
        {/* 상단 타이틀 헤더 */}
        <div className="flex justify-between items-center mb-2.5 border-b-2 border-[#6E4720] pb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">📖</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#5C3A16]">꼬매팡 어드벤처 사용 안내</h2>
              <p className="text-[11px] sm:text-xs font-bold text-[#8C6239]">콩쥐와 함께하는 3D 실전 바느질과 모험 비법을 배워봐요!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-100 hover:bg-slate-200 border-2 border-[#6E4720] rounded-xl font-black text-base sm:text-lg flex items-center justify-center shadow-[2px_2px_0px_0px_#6E4720] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer text-[#5C3A16]"
            aria-label="설명서 닫기"
          >
            ✕
          </button>
        </div>

        {/* 3대 탭 네비게이션: 3D 조작법 / 에피소드별 바느질 / 모험 꿀팁 */}
        <div className="flex bg-[#EFE3D0] p-1 rounded-xl border-2 border-[#6E4720] mb-3 gap-1 shrink-0">
          <button
            onClick={() => setGuideModalTab("controls")}
            className={`flex-1 py-1.5 rounded-lg font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap break-keep ${
              guideModalTab === "controls"
                ? "bg-[#6E4720] text-white shadow-xs"
                : "text-[#5C3A16] hover:bg-white/60"
            }`}
          >
            <span>🎮</span>
            <span>3D 조작법</span>
          </button>
          <button
            onClick={() => setGuideModalTab("episodes")}
            className={`flex-1 py-1.5 rounded-lg font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap break-keep ${
              guideModalTab === "episodes"
                ? "bg-[#6E4720] text-white shadow-xs"
                : "text-[#5C3A16] hover:bg-white/60"
            }`}
          >
            <span>🧵</span>
            <span>에피소드별 바느질</span>
          </button>
          <button
            onClick={() => setGuideModalTab("tips")}
            className={`flex-1 py-1.5 rounded-lg font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap break-keep ${
              guideModalTab === "tips"
                ? "bg-[#6E4720] text-white shadow-xs"
                : "text-[#5C3A16] hover:bg-white/60"
            }`}
          >
            <span>⭐</span>
            <span>모험 꿀팁</span>
          </button>
        </div>

        {/* 본문 스크롤 영역 */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-2.5 mb-2.5">
          {/* 탭 1: 🎮 3D 기본 조작법 (PC vs 태블릿 토글) */}
          {guideModalTab === "controls" && (
            <div className="flex flex-col gap-2.5">
              {/* 모드 상태 배너 및 토글 버튼 */}
              <div className="flex items-center justify-between bg-amber-100/70 border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold text-[#5C3A16] break-keep">
                <span className="flex items-center gap-1.5">
                  <span>{controlMode === "tablet" ? "📱 태블릿(터치) 조작 모드" : "💻 PC(마우스·키보드) 조작 모드"}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setControlMode(controlMode === "tablet" ? "pc" : "tablet")}
                  className="bg-white border border-[#6E4720] px-2.5 py-0.5 rounded-md text-[11px] font-black text-[#5C3A16] hover:bg-amber-50 cursor-pointer whitespace-nowrap shadow-2xs"
                >
                  {controlMode === "tablet" ? "💻 PC 모드로 보기" : "📱 태블릿 모드로 보기"}
                </button>
              </div>

              {controlMode === "tablet" ? (
                <>
                  <div className="bg-[#EEF5FC] border-2 border-[#6E4720] rounded-xl p-3 shadow-xs">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">👆</span>
                      <h3 className="font-black text-[#5C3A16] text-xs sm:text-sm break-keep">1. 손가락으로 바늘 들기 & 구멍 찌르기</h3>
                    </div>
                    <p className="text-xs sm:text-[12.5px] text-slate-700 font-semibold leading-relaxed break-keep">
                      바늘을 손가락으로 누른 채 위로 올리면 <b>둥근 무지개 모양</b>으로 쑥 들려요. 다음 구멍 위에서 아래로 내리면 <b>&apos;콕!&apos;</b> 하고 들어가요.
                    </p>
                  </div>

                  <div className="bg-[#D1FAE5] border-2 border-[#6E4720] rounded-xl p-3 shadow-xs">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">🎯</span>
                      <h3 className="font-black text-[#5C3A16] text-xs sm:text-sm break-keep">2. [▲ 앞 / ▼ 뒤] 버튼 (앞뒤 구멍 조준)</h3>
                    </div>
                    <p className="text-xs sm:text-[12.5px] text-slate-700 font-semibold leading-relaxed break-keep">
                      화면 왼쪽의 <b>[▲ 앞 / ▼ 뒤] 버튼</b>을 누르면 바늘 그림자가 앞뒤로 움직여요. 노란 구멍에 그림자가 닿아 <b>초록색</b>이 되면 조준 성공! 손가락을 구멍 근처로만 가져가도 자석처럼 쏙 맞춰져요.
                    </p>
                  </div>

                  <div className="bg-[#FEF3C7] border-2 border-[#6E4720] rounded-xl p-3 shadow-xs">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">🔄</span>
                      <h3 className="font-black text-[#5C3A16] text-xs sm:text-sm break-keep">3. [🔄 시점] 버튼 & 2손가락 밀기 (천 돌려보기)</h3>
                    </div>
                    <p className="text-xs sm:text-[12.5px] text-slate-700 font-semibold leading-relaxed break-keep">
                      왼쪽 위의 <b>[🔄 시점] 버튼</b>을 켜고 화면을 밀거나 손가락 2개로 화면을 밀면 천을 자유롭게 돌려가며 <b>천의 앞면과 뒷면</b>을 모두 살펴볼 수 있어요.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-[#EEF5FC] border-2 border-[#6E4720] rounded-xl p-3 shadow-xs">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">🖱️</span>
                      <h3 className="font-black text-[#5C3A16] text-xs sm:text-sm break-keep">1. 마우스 왼쪽 버튼 (바늘 들기 & 구멍 찌르기)</h3>
                    </div>
                    <p className="text-xs sm:text-[12.5px] text-slate-700 font-semibold leading-relaxed break-keep">
                      마우스 왼쪽 버튼을 누른 채 위로 끌면 <b>둥근 무지개 모양</b>으로 바늘이 번쩍 들려요. 다음 구멍 위에서 아래로 내리면 <b>&apos;콕!&apos;</b> 하고 들어가요.
                    </p>
                  </div>

                  <div className="bg-[#D1FAE5] border-2 border-[#6E4720] rounded-xl p-3 shadow-xs">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">🎡</span>
                      <h3 className="font-black text-[#5C3A16] text-xs sm:text-sm break-keep">2. 마우스 휠 / W·S 키 (앞뒤 구멍 조준)</h3>
                    </div>
                    <p className="text-xs sm:text-[12.5px] text-slate-700 font-semibold leading-relaxed break-keep">
                      마우스 휠을 굴리거나 키보드 <b>W / S 키</b>(또는 방향키)를 누르면 바늘 그림자가 앞뒤로 움직여요. 노란 구멍에 그림자가 쏙 맞아 <b>초록색</b>으로 변하면 조준 성공!
                    </p>
                  </div>

                  <div className="bg-[#FEF3C7] border-2 border-[#6E4720] rounded-xl p-3 shadow-xs">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">🔄</span>
                      <h3 className="font-black text-[#5C3A16] text-xs sm:text-sm break-keep">3. 마우스 오른쪽 버튼 (천 360° 돌려보기)</h3>
                    </div>
                    <p className="text-xs sm:text-[12.5px] text-slate-700 font-semibold leading-relaxed break-keep">
                      마우스 오른쪽 버튼을 누른 채 마우스를 움직이면 천을 360° 자유롭게 돌려가며 <b>천의 앞면과 뒷면</b>을 쉽게 확인할 수 있어요.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 탭 2: 🧵 에피소드별 바느질 안내 */}
          {guideModalTab === "episodes" && (
            <div className="flex flex-col gap-2.5">
              <div className="bg-[#FFF9E6] border-2 border-[#E76F51] rounded-xl p-3 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#E76F51] text-white text-[10px] font-black">1화</span>
                  <h3 className="font-black text-xs sm:text-sm text-[#E76F51] break-keep">시침질 (두비의 구멍 난 주머니 고치기)</h3>
                </div>
                <p className="text-xs sm:text-[12.5px] text-slate-700 font-semibold leading-relaxed break-keep">
                  천의 앞면과 뒷면을 넓은 간격으로 땀을 떠서 꿰매요. 옷감을 임시로 고정할 때 쓰는 가장 기초적인 바느질 기법이에요.
                </p>
              </div>

              <div className="bg-[#EEF5FC] border-2 border-sky-400 rounded-xl p-3 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-sky-600 text-white text-[10px] font-black">2화</span>
                  <h3 className="font-black text-xs sm:text-sm text-sky-800 break-keep">홈질 (새미의 찢어진 옷감 수선)</h3>
                </div>
                <p className="text-xs sm:text-[12.5px] text-slate-700 font-semibold leading-relaxed break-keep">
                  천의 앞뒤를 촘촘하고 일정한 간격으로 이어주는 가장 친근한 손바느질이에요. 옷단을 꿰매거나 주름을 잡을 때 써요.
                </p>
              </div>

              <div className="bg-[#F3E8FF] border-2 border-[#9D4EDD] rounded-xl p-3 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#7B2CBF] text-white text-[10px] font-black">3화</span>
                  <h3 className="font-black text-xs sm:text-sm text-[#7B2CBF] break-keep">박음질 (온박음질, 튼튼한 옷감 잇기)</h3>
                </div>
                <p className="text-xs sm:text-[12.5px] text-slate-700 font-semibold leading-relaxed break-keep">
                  두 땀 앞으로 나아간 뒤 <b>한 땀 뒤로 돌아와 메우는</b> 튼튼한 바느질이에요. 재봉틀로 박은 것처럼 가장 튼튼하게 옷감을 이어줘요.
                </p>
              </div>

              <div className="bg-[#E6FFFA] border-2 border-[#2A9D8F] rounded-xl p-3 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#1D7066] text-white text-[10px] font-black">4화</span>
                  <h3 className="font-black text-xs sm:text-sm text-[#1D7066] break-keep">꽃단추 달기와 실기둥 세우기</h3>
                </div>
                <p className="text-xs sm:text-[12.5px] text-slate-700 font-semibold leading-relaxed break-keep">
                  4구멍 꽃단추를 튼튼하게 단 뒤, 단추 밑을 마우스나 손가락으로 <b>뱅글뱅글 3회 감아 튼튼한 실기둥</b>을 세우고 뒷면에서 매듭을 완성해요.
                </p>
              </div>

              <div className="bg-[#FEF3C7] border-2 border-[#D97706] rounded-xl p-3 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#D97706] text-white text-[10px] font-black">5화</span>
                  <h3 className="font-black text-xs sm:text-sm text-[#B45309] break-keep">관아 본청 퀴즈 문답과 대망의 장원급제</h3>
                </div>
                <p className="text-xs sm:text-[12.5px] text-slate-700 font-semibold leading-relaxed break-keep">
                  침선장 사또가 내리는 10가지 바느질 상식 퀴즈를 모두 통과하여 ‘조선 제일 침선 낭자’ 칭호와 어사화, 교지를 받아요!
                </p>
              </div>
            </div>
          )}

          {/* 탭 3: ⭐ 모험 꿀팁 & 안내 */}
          {guideModalTab === "tips" && (
            <div className="flex flex-col gap-2.5">
              <div className="bg-[#E0F2FE] border-2 border-[#0284C7] rounded-xl p-3 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">💻</span>
                  <h3 className="font-black text-xs sm:text-sm text-sky-950 break-keep">마우스 사용 강력 권장!</h3>
                </div>
                <p className="text-xs sm:text-[12.5px] text-slate-700 font-semibold leading-relaxed break-keep">
                  꼬매팡 어드벤처는 <b>PC, 노트북, 크롬북에서 마우스로 조작</b>할 때 휠을 이용한 앞뒤 조준과 곡선 바느질을 가장 정교하고 실감 나게 즐길 수 있어요!
                </p>
              </div>

              <div className="bg-[#FFE4E6] border-2 border-[#E11D48] rounded-xl p-3 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">🧶</span>
                  <h3 className="font-black text-xs sm:text-sm text-red-900 break-keep">실 엉킴 막는 2대 원칙</h3>
                </div>
                <div className="text-xs sm:text-[12.5px] text-slate-700 font-semibold leading-relaxed space-y-1 break-keep">
                  <p>1. 바닥에 딱 붙어 직선으로 가지 말고, 위로 볼록한 <b>둥근 무지개 곡선</b>을 그려주세요.</p>
                  <p>2. 바늘 그림자가 노란 구멍에 딱 맞아 <b>초록색으로 변했을 때</b> 콕 찔러 넣으세요.</p>
                </div>
              </div>

              <div className="bg-[#FEF3C7] border-2 border-[#F59E0B] rounded-xl p-3 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">⭐</span>
                  <h3 className="font-black text-xs sm:text-sm text-amber-950 break-keep">별 3개(⭐⭐⭐)와 재봉함 보물</h3>
                </div>
                <p className="text-xs sm:text-[12.5px] text-slate-700 font-semibold leading-relaxed break-keep">
                  실수 없이 빠르게 완성하면 별 3개를 받아요! 모은 별로 상단의 <b>🧺 재봉함</b>에서 예쁜 무지개 실과 반짝이는 바늘, 알록달록 천 디자인을 열어보세요.
                </p>
              </div>

              {onStartTutorial && (
                <div className="bg-[#D1FAE5] border-2 border-emerald-500 rounded-xl p-3 shadow-xs flex items-center justify-between gap-2">
                  <div>
                    <h3 className="font-black text-xs sm:text-sm text-emerald-950 break-keep">🎓 3D 바느질 기본 조작 연습</h3>
                    <p className="text-[11px] sm:text-xs text-emerald-800 font-semibold mt-0.5">
                      바늘 들기와 조준 감각을 4단계 튜토리얼로 바로 연습해보세요.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onStartTutorial();
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3 py-2 rounded-lg border border-black shadow-xs shrink-0 cursor-pointer"
                  >
                    연습 시작하기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 하단 생성형 AI 제작 명시 및 닫기 버튼 */}
        <div className="sticky bottom-0 bg-[#FFFDF7] pt-2.5 border-t-2 border-[#6E4720] flex flex-col sm:flex-row justify-between items-center gap-2 shrink-0">
          <p className="text-[10.5px] sm:text-[11px] text-stone-500 font-semibold text-center sm:text-left break-keep">
            ※ 본 프로그램에 활용된 이미지와 캐릭터는 생성형 AI로 제작되었습니다.
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-[#6E4720] hover:bg-[#5C3A16] text-white px-7 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>확인하고 닫기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
