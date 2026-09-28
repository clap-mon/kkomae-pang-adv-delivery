"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";

interface ShankWrapActionModalProps {
  isOpen: boolean;
  wrapTargetCount?: number;
  currentWrapCount: number;
  threadColor: string;
  totalHoles: number;
  onWrapOnce: () => void;
  onWrapComplete: () => void;
  onReset: () => void;
}

export default function ShankWrapActionModal({
  isOpen,
  wrapTargetCount = 3,
  currentWrapCount,
  threadColor,
  totalHoles,
  onWrapOnce,
  onWrapComplete,
  onReset,
}: ShankWrapActionModalProps) {
  const [accumAngle, setAccumAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoWrapping, setIsAutoWrapping] = useState(false);
  const [cursorSvgPos, setCursorSvgPos] = useState<{ x: number; y: number }>({ x: 275, y: 155 });
  const [isTightening, setIsTightening] = useState(false);
  const [tightenToast, setTightenToast] = useState("");

  const prevAngleRef = useRef<number | null>(null);
  const accumAngleRef = useRef<number>(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number | null>(null);

  // 감기 회차 변경 시 누적 각도 리셋 (비동기 마이크로태스크 안전 리셋)
  useEffect(() => {
    queueMicrotask(() => {
      accumAngleRef.current = 0;
      setAccumAngle(0);
    });
  }, [currentWrapCount]);

  // 컴포넌트 언마운트 시 애니메이션 프레임 취소 정리
  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const isCompleted = currentWrapCount >= wrapTargetCount;
  const progressPercent = Math.min(100, Math.round((currentWrapCount / wrapTargetCount) * 100));

  // 중심 기준 좌표 (단추 밑 실기둥 중심)
  const CENTER_X = 200;
  const CENTER_Y = 155;

  // 🌀 1바퀴씩 감을수록 원이 점점 안쪽으로 조여드는 나선형(Spiral) 반경 계산
  const stepRx = 30 / Math.max(1, wrapTargetCount);
  const stepRy = 11 / Math.max(1, wrapTargetCount);
  const currentSpiralRx = Math.max(42, 75 - (currentWrapCount * stepRx) - (accumAngle / (Math.PI * 2)) * stepRx);
  const currentSpiralRy = Math.max(15, 26 - (currentWrapCount * stepRy) - (accumAngle / (Math.PI * 2)) * stepRy);

  // 마우스 화면 좌표 -> SVG 내부 좌표 변환
  const getSvgCoordinates = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 275, y: 155 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 400;
    const y = ((clientY - rect.top) / rect.height) * 280;
    return { x, y };
  };

  // 포인터 다운
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isCompleted) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setIsDragging(true);

    const svgPos = getSvgCoordinates(e.clientX, e.clientY);
    setCursorSvgPos(svgPos);

    const angle = Math.atan2(svgPos.y - CENTER_Y, svgPos.x - CENTER_X);
    prevAngleRef.current = angle;
  };

  // 포인터 이동 (실시간 바늘/실 위치 & 회전 각도 계산)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isCompleted) return;

    const svgPos = getSvgCoordinates(e.clientX, e.clientY);
    setCursorSvgPos(svgPos);

    const currentAngle = Math.atan2(svgPos.y - CENTER_Y, svgPos.x - CENTER_X);

    if (prevAngleRef.current !== null) {
      let diff = currentAngle - prevAngleRef.current;
      // 각도 점프 보정 (-PI ~ PI 범위)
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;

      // 시계방향/반시계방향 모두 자연스럽게 감김 인정 (양방향 회전 지원)
      const absDiff = Math.abs(diff);
      // 지나치게 큰 순간 점프(1.5rad 이상)는 드래그 튐으로 간주하여 무시
      if (absDiff > 0.005 && absDiff < 1.5) {
        accumAngleRef.current += absDiff;
        const currentAccum = accumAngleRef.current;

        // 🌟 330도(약 5.8rad, 92%) 이상 회전 시 1바퀴 팽팽히 감김 인정!
        if (currentAccum >= 5.8) {
          accumAngleRef.current = 0;
          setAccumAngle(0);
          triggerTighten();
          onWrapOnce();
        } else {
          setAccumAngle(currentAccum);
        }
      }
    }
    prevAngleRef.current = currentAngle;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setIsDragging(false);
    prevAngleRef.current = null;
    // 뗐을 때 현재 나선형 둘레 위치로 복귀
    if (!isCompleted) {
      const angle = (accumAngleRef.current || accumAngle) % (Math.PI * 2);
      setCursorSvgPos({
        x: CENTER_X + Math.cos(angle) * currentSpiralRx,
        y: CENTER_Y + Math.sin(angle) * currentSpiralRy,
      });
    }
  };

  // 촥! 조여지는 스냅 연출 트리거
  const triggerTighten = () => {
    setIsTightening(true);
    const newCount = currentWrapCount + 1;
    setTightenToast(`촥! ${newCount}회차 팽팽하게 감기 완료! 🪢✨`);
    setTimeout(() => setIsTightening(false), 450);
    setTimeout(() => setTightenToast(""), 1600);
  };

  // 원클릭 1바퀴 팽팽히 회전 감기 애니메이션 핸들러
  const handleWrapButtonClick = () => {
    if (isCompleted || isAutoWrapping) return;
    setIsAutoWrapping(true);

    const startTime = performance.now();
    const duration = 400; // 0.4초 동안 1바퀴 부드럽게 휙 회전

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      // 부드러운 가감속 이징 (easeInOutCubic)
      const ease = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const currentAngle = ease * (Math.PI * 2);
      setAccumAngle(currentAngle);

      // 손잡이 위치도 동기화 회전
      const rx = Math.max(42, 75 - (currentWrapCount * stepRx) - (ease * stepRx));
      const ry = Math.max(15, 26 - (currentWrapCount * stepRy) - (ease * stepRy));
      setCursorSvgPos({
        x: CENTER_X + Math.cos(currentAngle) * rx,
        y: CENTER_Y + Math.sin(currentAngle) * ry,
      });

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        accumAngleRef.current = 0;
        setAccumAngle(0);
        setIsAutoWrapping(false);
        triggerTighten();
        onWrapOnce();
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  // 🌀 실시간으로 기둥 둘레를 휘감는 부드러운 나선형 아크 (Arc)
  const currentArcPath = useMemo(() => {
    if (accumAngle <= 0.05) return null;
    const points: string[] = [];
    const steps = Math.min(36, Math.max(10, Math.floor((accumAngle / (Math.PI * 2)) * 36)));
    const startRx = 75 - (currentWrapCount * stepRx);
    const startRy = 26 - (currentWrapCount * stepRy);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const theta = t * accumAngle;
      const currentR_x = Math.max(40, startRx - t * stepRx);
      const currentR_y = Math.max(14, startRy - t * stepRy);
      const px = CENTER_X + Math.cos(theta) * currentR_x;
      const py = CENTER_Y + Math.sin(theta) * currentR_y;
      points.push(`${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return points.join(" ");
  }, [accumAngle, currentWrapCount, stepRx, stepRy]);

  // 실기둥 둘레의 현재 감김 끝점 (마우스 손잡이로 이어질 접선 지점)
  const currentWrapPoint = useMemo(() => {
    const angle = accumAngle % (Math.PI * 2);
    return {
      x: CENTER_X + Math.cos(angle) * currentSpiralRx,
      y: CENTER_Y + Math.sin(angle) * currentSpiralRy,
    };
  }, [accumAngle, currentSpiralRx, currentSpiralRy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 select-none animate-fadeIn">
      <div className="bg-[#FFFDF7] border-5 border-[#6E4720] rounded-[2.5rem] p-5 sm:p-7 shadow-[10px_10px_0px_0px_#6E4720] w-full max-w-lg relative text-center flex flex-col items-center">
        
        {/* 상단 타이틀 뱃지 */}
        <div className="inline-flex items-center gap-2 bg-[#FEEBC8] border-3 border-[#6E4720] px-4 py-1.5 rounded-full text-[#5C3A16] font-black text-xs sm:text-sm shadow-xs mb-2.5">
          <span>🧵 단추달기 핵심 스텝</span>
          <span className="text-[#E76F51]">●</span>
          <span>{wrapTargetCount}회 실기둥 감기</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-[#5C3A16] mb-1">
          단추 밑 실 다발을 뱅글뱅글 감아주세요!
        </h3>
        <p className="text-xs text-[#8C6239] font-bold mb-3.5">
          실을 기둥 둘레로 {wrapTargetCount}바퀴 감아 <span className="text-[#E76F51] font-black">단단하고 튼튼한 실기둥</span>을 만듭니다.
        </p>

        {/* 🌟 중앙 대형 단추 & 실기둥 인터랙티브 캔버스 뷰 */}
        <div 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`relative w-full h-[270px] sm:h-[300px] bg-gradient-to-b from-[#F5EBE1] to-[#E9DAC8] border-4 border-[#6E4720] rounded-3xl overflow-hidden shadow-inner flex flex-col items-center justify-center cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
        >
          {/* 중앙 SVG 비주얼: 단추 + 실기둥 다발 + 3D 실타래 코일 + 회전 가이드 + 천 */}
          <svg ref={svgRef} className="w-full h-full pointer-events-none" viewBox="0 0 400 280">
            <defs>
              {/* 단추 우드 그라데이션 */}
              <linearGradient id="buttonWood" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E9D5C3" />
                <stop offset="50%" stopColor="#D4B996" />
                <stop offset="100%" stopColor="#B38F68" />
              </linearGradient>
              <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* 1. 하단 천 (옷감 단면) */}
            <g transform="translate(50, 215)">
              <rect x="0" y="0" width="300" height="24" rx="10" fill="#E2D4C0" stroke="#6E4720" strokeWidth="3" />
              <line x1="20" y1="12" x2="280" y2="12" stroke="#BFA88F" strokeWidth="2" strokeDasharray="8 6" />
            </g>

            {/* 2. 🪡 중심 단추 고정 실 다발 (기본 코어 기둥) */}
            <g transform="translate(200, 155)">
              {/* 단추에서 천으로 꿰매진 기본 실 다발 */}
              <path
                d="M -6 -60 L -4 60 M 0 -60 L 0 60 M 6 -60 L 4 60"
                fill="none"
                stroke={threadColor}
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.75"
              />
            </g>

            {/* 3. 🎯 점진적 나선형 회전 가이드 링 (단추 밑 기둥 둘레) */}
            {!isCompleted && (
              <g transform="translate(200, 155)">
                {/* 둥근 점선 타원 궤적 */}
                <ellipse 
                  cx="0" 
                  cy="0" 
                  rx={currentSpiralRx} 
                  ry={currentSpiralRy} 
                  fill="none" 
                  stroke="#F59E0B" 
                  strokeWidth="2.5" 
                  strokeDasharray="6 4" 
                  opacity="0.85"
                />
                {/* 시계방향 회전 유도 화살표 */}
                <g fill="#D97706">
                  <path d={`M 0 ${-currentSpiralRy} L 7 ${-currentSpiralRy - 4} L 7 ${-currentSpiralRy + 4} Z`} />
                  <path d={`M ${currentSpiralRx} 0 L ${currentSpiralRx + 4} -7 L ${currentSpiralRx - 4} -7 Z`} />
                  <path d={`M 0 ${currentSpiralRy} L -7 ${currentSpiralRy + 4} L -7 ${currentSpiralRy - 4} Z`} />
                  <path d={`M ${-currentSpiralRx} 0 L ${-currentSpiralRx - 4} 7 L ${-currentSpiralRx + 4} 7 Z`} />
                </g>
              </g>
            )}

            {/* 4. 🌀 층층이 감겨 쌓이는 3D 입체 실기둥 실타래 코일 (Shank Coils) */}
            <g transform="translate(200, 140)" className={isTightening ? "animate-knot-bounce" : ""}>
              {/* 감겨진 도톰한 실기둥 코일들 */}
              {Array.from({ length: currentWrapCount }).map((_, idx) => {
                const coilY = 55 - (idx * (48 / wrapTargetCount));
                const coilRadius = Math.max(16, 24 - idx * 1.2);
                return (
                  <g key={idx} className="animate-popIn">
                    {/* 뒤쪽 실 그림자 */}
                    <ellipse cx="0" cy={coilY} rx={coilRadius} ry="6" fill="none" stroke="#4A2E16" strokeWidth="7.5" />
                    {/* 앞쪽 실 */}
                    <ellipse cx="0" cy={coilY} rx={coilRadius} ry="6" fill="none" stroke={threadColor} strokeWidth="5.5" />
                    {/* 텐션 하이라이트 광택 */}
                    <path
                      d={`M ${-coilRadius} ${coilY} A ${coilRadius} 6 0 0 0 ${coilRadius} ${coilY}`}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      opacity="0.65"
                    />
                  </g>
                );
              })}

              {/* 🌟 현재 실시간으로 단추 밑을 휘감는 실타래 아크 (Arc) */}
              {!isCompleted && currentArcPath && (
                <path
                  d={currentArcPath}
                  fill="none"
                  stroke={threadColor}
                  strokeWidth="5"
                  strokeLinecap="round"
                  transform="translate(-200, -140)"
                  className="animate-pulse"
                />
              )}
            </g>

            {/* 5. 🪢 실시간 마우스 추적 실 가닥 & 손잡이 */}
            {!isCompleted && (
              <g>
                {/* 실기둥 둘레의 감김 끝점에서 마우스 손잡이로 자연스럽게 이어지는 팽팽한 실 곡선 */}
                <path 
                  d={`M ${currentWrapPoint.x} ${currentWrapPoint.y} Q ${(currentWrapPoint.x + cursorSvgPos.x) / 2} ${(currentWrapPoint.y + cursorSvgPos.y) / 2 - 8} ${cursorSvgPos.x} ${cursorSvgPos.y}`}
                  fill="none"
                  stroke={threadColor} 
                  strokeWidth="4" 
                  strokeLinecap="round"
                />
                
                {/* 커서 위치의 실타래 손잡이 */}
                <g transform={`translate(${cursorSvgPos.x}, ${cursorSvgPos.y})`}>
                  {/* 손잡이 펄스 링 */}
                  <circle cx="0" cy="0" r="14" fill="#E76F51" fillOpacity="0.25" stroke="#E76F51" strokeWidth="2" className="animate-ping" />
                  <circle cx="0" cy="0" r="10" fill="#FFFFFF" stroke="#6E4720" strokeWidth="2.5" />
                  <circle cx="0" cy="0" r="4" fill={threadColor} />
                  {/* 실 손잡이 아이콘 */}
                  <text x="6" y="-6" fontSize="16" className="drop-shadow-sm">🪡</text>
                </g>
              </g>
            )}

            {/* 6. 상단 대형 단추 (텐션 반응 바운스) */}
            <g 
              transform={`translate(200, ${isTightening ? 98 : 95})`} 
              filter="url(#dropShadow)"
              className="transition-transform duration-150"
            >
              <circle cx="0" cy="0" r="52" fill="url(#buttonWood)" stroke="#6E4720" strokeWidth="4" />
              <circle cx="0" cy="0" r="42" fill="none" stroke="#6E4720" strokeWidth="2" strokeDasharray="4 3" opacity="0.6" />

              {/* 단추 구멍 & 땀 */}
              {totalHoles === 2 ? (
                <>
                  <circle cx="-16" cy="0" r="6.5" fill="#3D2314" stroke="#6E4720" strokeWidth="2" />
                  <circle cx="16" cy="0" r="6.5" fill="#3D2314" stroke="#6E4720" strokeWidth="2" />
                  <line x1="-16" y1="0" x2="16" y2="0" stroke={threadColor} strokeWidth="6" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <circle cx="-14" cy="-14" r="5.5" fill="#3D2314" stroke="#6E4720" strokeWidth="2" />
                  <circle cx="14" cy="-14" r="5.5" fill="#3D2314" stroke="#6E4720" strokeWidth="2" />
                  <circle cx="-14" cy="14" r="5.5" fill="#3D2314" stroke="#6E4720" strokeWidth="2" />
                  <circle cx="14" cy="14" r="5.5" fill="#3D2314" stroke="#6E4720" strokeWidth="2" />
                  <line x1="-14" y1="-14" x2="14" y2="14" stroke={threadColor} strokeWidth="5" strokeLinecap="round" />
                  <line x1="14" y1="-14" x2="-14" y2="14" stroke={threadColor} strokeWidth="5" strokeLinecap="round" />
                </>
              )}
            </g>
          </svg>

          {/* 🌟 1회 조임 완료 팝업 토스트 */}
          {tightenToast && (
            <div className="absolute top-4 bg-gradient-to-r from-amber-500 to-emerald-500 text-white font-black text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-lg border-2 border-white animate-bounce flex items-center gap-1.5">
              <span>✨</span>
              <span>{tightenToast}</span>
            </div>
          )}

          {/* 중앙 인터랙션 안내 텍스트 오버레이 */}
          {!isCompleted ? (
            <div className="absolute bottom-3 bg-[#5C3A16]/85 backdrop-blur-xs text-white text-[11px] sm:text-xs font-black px-4 py-1.5 rounded-full pointer-events-none shadow-sm flex items-center gap-2">
              <span className="text-amber-300">🌀</span>
              <span>
                {isDragging 
                  ? `실을 팽팽히 둘러 감는 중! (${Math.round((accumAngle / (Math.PI * 2)) * 100)}%)` 
                  : `${currentWrapCount + 1}회차: 손잡이를 잡고 단추 밑을 시계방향으로 둘러 감으세요!`}
              </span>
            </div>
          ) : (
            <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-xs flex flex-col items-center justify-center text-white pointer-events-none animate-fadeIn p-4 text-center">
              <div className="text-4xl mb-1.5 animate-bounce">🪢 ✂️ ✨</div>
              <div className="font-black text-lg sm:text-xl text-emerald-300 drop-shadow-md mb-1">
                {wrapTargetCount}회 실기둥 완성!
              </div>
              <p className="text-xs text-emerald-100 font-bold max-w-xs">
                단추 밑에서 천 뒷면(안쪽)으로 실을 빼서 튼튼하게 매듭지어 완성합니다!
              </p>
            </div>
          )}
        </div>

        {/* 🌟 하단 컨트롤 및 진행률 바 */}
        <div className="w-full mt-3.5 flex flex-col gap-2.5">
          
          {/* 진행률 뱃지 및 프로그레스 바 */}
          <div className="bg-white/95 border-2 border-[#6E4720] rounded-2xl p-2.5 flex flex-col gap-1.5 shadow-xs">
            <div className="flex justify-between items-center text-xs font-black text-[#5C3A16]">
              <span>🌀 실기둥 {wrapTargetCount}회 감기 진행도</span>
              <span className="text-[#E76F51]">{currentWrapCount} / {wrapTargetCount} 회 감김 ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-[#E5E7EB] h-3.5 rounded-full overflow-hidden border border-[#6E4720]">
              <div 
                className="bg-gradient-to-r from-amber-400 via-orange-400 to-[#E76F51] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 액션 버튼 영역 */}
          {!isCompleted ? (
            <div className="flex gap-2">
              <button
                onClick={handleWrapButtonClick}
                disabled={isAutoWrapping}
                className={`flex-1 bg-[#E76F51] hover:bg-[#D65D3F] border-3 border-[#6E4720] shadow-[3px_3px_0_0_#6E4720] text-white py-3 rounded-2xl font-black text-sm active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 ${
                  isAutoWrapping ? 'opacity-70 cursor-wait' : 'cursor-pointer'
                }`}
              >
                <span className={isAutoWrapping ? "animate-spin" : ""}>🌀</span>
                <span>{isAutoWrapping ? "단추 밑을 감는 중..." : "1바퀴 팽팽히 둘러 감기 (+1)"}</span>
              </button>

              <button
                onClick={onReset}
                className="bg-white hover:bg-[#FFF9E6] border-2 border-[#6E4720] shadow-[2px_2px_0_0_#6E4720] text-[#5C3A16] px-3.5 py-3 rounded-2xl font-black text-xs active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                title="처음부터 다시 감기"
              >
                <span>🔄 다시</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onWrapComplete}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-3 border-[#6E4720] shadow-[4px_4px_0_0_#6E4720] text-white py-3.5 rounded-2xl font-black text-sm sm:text-base active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 animate-bounce-short"
            >
              <span>🪢</span>
              <span>천 뒷면으로 실 빼서 매듭짓고 완성! ✂️</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
