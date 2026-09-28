"use client";

import { useState } from "react";
import { QuizQuestion } from "../data/storyEpisodes";

interface StoryQuizModalProps {
  questions: QuizQuestion[];
  onFinishQuiz: () => void;
  onClose: () => void;
}

export default function StoryQuizModal({
  questions,
  onFinishQuiz,
  onClose,
}: StoryQuizModalProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [firstTryCorrectCount, setFirstTryCorrectCount] = useState(0);
  const [attemptedCurrent, setAttemptedCurrent] = useState(false);

  const currentQ = questions[currentIdx];

  const handleSelect = (idx: number) => {
    if (showFeedback && isCorrect) return;
    setSelectedOpt(idx);
    const correct = idx === currentQ.answerIndex;
    if (!attemptedCurrent) {
      setAttemptedCurrent(true);
      if (correct) {
        setFirstTryCorrectCount((prev) => prev + 1);
      }
    }
    setIsCorrect(correct);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedOpt(null);
    setAttemptedCurrent(false);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setCleared(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="max-w-xl w-full bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_#000] overflow-hidden flex flex-col">
        {/* 모달 상단 헤더 */}
        <div className="bg-amber-400 p-4 border-b-4 border-black flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👑</span>
            <div>
              <h2 className="font-black text-lg text-black leading-tight">
                사또의 바느질 과거 시험
              </h2>
              <p className="text-xs font-bold text-amber-950">
                손바느질 핵심개념 확인 {questions.length}문항
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white font-black text-xs rounded-full border-2 border-black">
              {cleared ? "시험 완료 🎉" : `문항 ${currentIdx + 1} / ${questions.length}`}
            </span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="w-7 h-7 rounded-full bg-white border-2 border-black font-black text-xs hover:bg-rose-100 hover:text-rose-700 transition-colors flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 바디 영역 */}
        <div className="p-6">
          {!cleared ? (
            <div>
              {/* 진행률 바 */}
              <div className="w-full bg-slate-200 h-2.5 rounded-full border-2 border-black mb-5 overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{
                    width: `${((currentIdx + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>

              {/* 문제 텍스트 */}
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 leading-snug">
                Q{currentIdx + 1}. {currentQ.question}
              </h3>

              {/* 힌트 및 설명 박스 */}
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3 mb-5 text-xs text-amber-950 font-bold flex items-center gap-2">
                <span>💡</span>
                <span>{currentQ.explanation}</span>
              </div>

              {/* 선택지 목록 */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  let btnBg = "bg-white hover:bg-slate-50";
                  const borderCol = "border-black";
                  if (showFeedback) {
                    if (idx === currentQ.answerIndex) {
                      btnBg = "bg-emerald-100 text-emerald-950 border-emerald-600";
                    } else if (idx === selectedOpt && !isCorrect) {
                      btnBg = "bg-rose-100 text-rose-950 border-rose-600";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={showFeedback && isCorrect}
                      className={`w-full p-3 text-left rounded-xl border-2 font-black text-sm md:text-base transition-all flex items-center justify-between shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 ${btnBg} ${borderCol}`}
                    >
                      <div className="flex items-center gap-2.5 flex-1 pr-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 border-2 border-black flex items-center justify-center text-xs shrink-0 font-extrabold">
                          {idx + 1}
                        </span>
                        <span className="break-keep text-pretty">{opt}</span>
                      </div>
                      {showFeedback && idx === currentQ.answerIndex && (
                        <span className="text-emerald-700 font-extrabold text-sm shrink-0">
                          정답! ⭕
                        </span>
                      )}
                      {showFeedback && idx === selectedOpt && !isCorrect && (
                        <span className="text-rose-600 font-extrabold text-sm shrink-0">
                          다시 풀기 ❌
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 피드백 및 해설 박스 */}
              {showFeedback && (
                <div
                  className={`mt-4 p-3.5 rounded-xl border-2 font-bold text-xs md:text-sm animate-fade-in ${
                    isCorrect
                      ? "bg-emerald-50 border-emerald-600 text-emerald-900"
                      : "bg-rose-50 border-rose-600 text-rose-900"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-black mb-1">
                    <span>{isCorrect ? "🎉 명쾌한 정답이오!" : "⚠️ 아깝소! 다시 생각해보시오!"}</span>
                  </div>
                  <p className="break-keep text-pretty">{currentQ.explanation}</p>
                </div>
              )}

              {/* 다음 문제 버튼 */}
              {showFeedback && isCorrect && (
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm rounded-xl border-3 border-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-transform flex items-center gap-2"
                  >
                    <span>
                      {currentIdx < questions.length - 1
                        ? "다음 문제 풀기 ➔"
                        : "시험 결과 확인하기 🏆"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* 시험 클리어 & 장원 급제 화면 */
            <div className="text-center py-2 animate-fade-in">
              <div className="text-5xl sm:text-6xl mb-1.5 animate-bounce">🏆</div>
              <div className="inline-block px-3.5 py-1 bg-amber-100 rounded-full border-2 border-black font-black text-xs text-amber-900 mb-2">
                {firstTryCorrectCount === questions.length ? "👑 과거 시험 만점 장원급제!" : "📜 과거 시험 최종 합격!"}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1.5">
                축하합니다! 대망의 장원 급제요!
              </h3>

              {/* 📊 성적 요약 스탯 박스 (컴팩트 2열) */}
              <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-2.5 mb-3 max-w-sm mx-auto grid grid-cols-2 gap-2 text-center shadow-xs">
                <div>
                  <div className="text-[10.5px] font-bold text-amber-800">1차 시도 정답</div>
                  <div className="text-sm sm:text-base font-black text-emerald-700 mt-0.5">
                    {firstTryCorrectCount} / {questions.length}문항
                  </div>
                </div>
                <div className="border-l border-amber-300">
                  <div className="text-[10.5px] font-bold text-amber-800">최종 통달 현황</div>
                  <div className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                    {questions.length}문항 전원 통과 ✨
                  </div>
                </div>
              </div>

              {/* 📜 장원급제 서사 문구 (어사화 & 교지 일치화) */}
              <p className="text-slate-700 font-bold text-xs sm:text-[13px] max-w-md mx-auto leading-relaxed mb-4 break-keep text-pretty">
                초등 실과 바느질 핵심 개념 <span className="text-amber-700 font-black">{questions.length}문항</span>을 모두 훌륭하게 맞혔습니다!
                <br />
                사또께서 콩쥐에게 <span className="text-amber-700 font-black">‘조선 제일 침선 낭자’</span> 칭호를 내리시고,
                <br />
                머리에는 <span className="text-rose-600 font-black">장원급제 어사화(꽃관)</span>를, 손에는 <span className="text-amber-800 font-black">수선 교지(敎旨)</span>를 하사하셨습니다!
              </p>

              {/* 팥쥐와의 화해 컷씬 박스 */}
              <div className="bg-rose-50 p-3.5 rounded-2xl border-3 border-black mb-4 text-left shadow-[3px_3px_0px_#000]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-rose-200 rounded-xl border-2 border-black flex items-center justify-center text-xl shrink-0">
                    😢
                  </div>
                  <div>
                    <div className="font-black text-xs sm:text-sm text-rose-950">팥쥐의 눈물과 화해</div>
                    <p className="text-[11.5px] sm:text-xs text-slate-700 font-bold mt-0.5 leading-snug">
                      &quot;콩쥐야... 미안해... 나도 너처럼 멋지게 바느질하고 싶었어... 나도 가르쳐줄래?&quot;
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={onFinishQuiz}
                  className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm sm:text-base rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-transform flex items-center gap-2 cursor-pointer"
                >
                  <span>시험 완료! 사또의 교지 하사식 보기</span>
                  <span>📜 ➔</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
