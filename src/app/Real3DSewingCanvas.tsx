"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { playPassSound } from "../lib/soundEffects";

function disposeGroup(group: THREE.Group) {
  while (group.children.length > 0) {
    const child = group.children[0];
    if (child instanceof THREE.Mesh) {
      if (child.geometry) {
        child.geometry.dispose();
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
    group.remove(child);
  }
}

interface FabricSkinProp {
  id: string;
  name: string;
  frontBg: string;
  frontLine: string;
  backBg: string;
  backLine: string;
  patternType: "cotton" | "grid" | "denim" | "gingham" | "dots" | "herringbone" | "carbon" | "flower" | "stripe" | "quilt";
  reqStars: number;
  icon: string;
}

interface Real3DSewingCanvasProps {
  courseId?: string;
  currentLevel?: number;
  totalHoles: number;
  isCurve: boolean;
  currentHoleIndex: number;
  currentStep?: {
    fromIndex: number;
    toIndex: number;
    isFront: boolean;
    isShankWrap?: boolean;
    wrapTargetCount?: number;
    isKnotFinish?: boolean;
  };
  completedStitches: { fromIndex: number; toIndex: number; isFront: boolean; isShankWrap?: boolean }[];
  isDragging: boolean;
  threadColor: string;
  needleSkinId: string;
  fabricSkin?: FabricSkinProp;
  controlMode?: "pc" | "tablet";
  isTutorialMode?: boolean;
  tutorialStep?: number;
  isTutorialLocked?: boolean;
  onTutorialEvent?: (eventName: "NEEDLE_LIFTED" | "RETICLE_LOCKED" | "HOLE_PIERCED" | "VIEW_ROTATED") => void;
  onPointerDown: () => void;
  onPointerMove: (normalizedX: number, normalizedY: number) => void;
  onPointerUp: () => void;
  onHolePassed: (nextIndex: number) => void;
  onError: (msg: string) => void;
}

export default function Real3DSewingCanvas({
  courseId,
  totalHoles,
  isCurve,
  currentHoleIndex,
  currentStep,
  completedStitches,
  threadColor,
  needleSkinId,
  fabricSkin,
  controlMode = "pc",
  isTutorialMode = false,
  tutorialStep = 1,
  isTutorialLocked = false,
  onTutorialEvent,
  currentLevel = 1,
  onPointerDown,
  onPointerUp,
  onHolePassed,
  onError,
}: Real3DSewingCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [orbitMode, setOrbitMode] = useState(false);
  const [autoSnap, setAutoSnap] = useState(true);
  const frontTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const backTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const nudgeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const needleGroupRef = useRef<THREE.Group | null>(null);
  const dynamicThreadMeshRef = useRef<THREE.Mesh | null>(null);
  const guideLineMeshRef = useRef<THREE.Line | null>(null);
  const shadowReticleMeshRef = useRef<THREE.Mesh | null>(null);
  const targetHoleIndicatorMeshRef = useRef<THREE.Mesh | null>(null);
  const completedStitchesGroupRef = useRef<THREE.Group | null>(null);
  const tangleParticlesGroupRef = useRef<THREE.Group | null>(null);
  const shankWrapGuideGroupRef = useRef<THREE.Group | null>(null);
  const liveShankCoilsGroupRef = useRef<THREE.Group | null>(null);
  const shakeIntensityRef = useRef(0);
  const isTutorialLockedRef = useRef(isTutorialLocked);
  const controlModeRef = useRef(controlMode);
  const orbitModeRef = useRef(orbitMode);
  const autoSnapRef = useRef(autoSnap);
  const tutorialStepRef = useRef(tutorialStep);

  // 🛡️ 부모 리렌더링 시 3D WebGL 씬 불필요한 재생성 방지용 Ref (깜빡임 완벽 차단!)
  const onHolePassedRef = useRef(onHolePassed);
  useEffect(() => {
    onHolePassedRef.current = onHolePassed;
  }, [onHolePassed]);

  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const onPointerUpRef = useRef(onPointerUp);
  useEffect(() => {
    onPointerUpRef.current = onPointerUp;
  }, [onPointerUp]);

  const currentStepRef = useRef(currentStep);
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  const completedStitchesRef = useRef(completedStitches);
  useEffect(() => {
    completedStitchesRef.current = completedStitches;
  }, [completedStitches]);

  const onTutorialEventRef = useRef(onTutorialEvent);
  useEffect(() => {
    onTutorialEventRef.current = onTutorialEvent;
  }, [onTutorialEvent]);

  useEffect(() => {
    isTutorialLockedRef.current = isTutorialLocked;
  }, [isTutorialLocked]);

  useEffect(() => {
    controlModeRef.current = controlMode;
  }, [controlMode]);

  useEffect(() => {
    orbitModeRef.current = orbitMode;
  }, [orbitMode]);

  useEffect(() => {
    autoSnapRef.current = autoSnap;
  }, [autoSnap]);

  useEffect(() => {
    tutorialStepRef.current = tutorialStep;
  }, [tutorialStep]);

  // 온스크린 조준 버튼 (위/아래 탭 및 롱프레스)
  const handleNudgeOffsetZ = useCallback((deltaDirection: "up" | "down") => {
    if (isTutorialLockedRef.current) return;
    const state = sewingStateRef.current;
    const curStep = currentStepRef.current;
    const isFront = curStep ? curStep.isFront : state.currentHoleIndex % 2 === 0;
    // up: 화면 위쪽(시각적 위), down: 화면 아래쪽(시각적 아래)
    const sign = isFront ? (deltaDirection === "up" ? -1 : 1) : (deltaDirection === "up" ? 1 : -1);
    const step = 0.22 * sign;
    state.offsetZ = THREE.MathUtils.clamp(state.offsetZ + step, -3.5, 3.5);
  }, []);

  // 에러 연속 폭증 방지 쿨다운 타이머 및 3D 충격/파티클 트리거
  const lastErrorTimeRef = useRef(0);
  const errorLockUntilRef = useRef(0); // 🛡️ 에러 직후 관통(PIERCING) 판정 절대 차단 타이머
  const dragStartTimeRef = useRef(0); // 🛡️ 바늘 집어올리기 직후 빗맞힘 에러 유예 타이머
  const prevNeedleYRef = useRef(0); // 바늘 수직 이동(상승 vs 하강) 감지용

  const trigger3DTangleEffect = useCallback((pos: THREE.Vector3) => {
    shakeIntensityRef.current = 1.0;

    // 꼬인 실밥 스파크 파티클 스폰
    if (tangleParticlesGroupRef.current) {
      const pGroup = tangleParticlesGroupRef.current;
      const count = 12;
      for (let i = 0; i < count; i++) {
        const pGeo = new THREE.TorusGeometry(0.04 + Math.random() * 0.05, 0.012, 4, 8);
        const pMat = new THREE.MeshBasicMaterial({
          color: Math.random() > 0.4 ? threadColor : "#FF453A",
          transparent: true,
          opacity: 0.9,
        });
        const pMesh = new THREE.Mesh(pGeo, pMat);
        pMesh.position.copy(pos).add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        ));
        const velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.12,
          0.05 + Math.random() * 0.08,
          (Math.random() - 0.5) * 0.12
        );
        pMesh.userData = { velocity, life: 1.0 };
        pGroup.add(pMesh);
      }
    }
  }, [threadColor]);

  const safeOnError = useCallback((msg: string, customPos?: THREE.Vector3) => {
    const now = Date.now();
    // 관통 진행 중 또는 완료 상태에서는 빗맞힘 에러 완전 차단
    if (sewingStateRef.current && (sewingStateRef.current.actionPhase === "PIERCING" || sewingStateRef.current.actionPhase === "PASSED")) {
      return;
    }

    if (now - lastErrorTimeRef.current > 900) {
      lastErrorTimeRef.current = now;
      errorLockUntilRef.current = now + 700; // 🛡️ 에러 후 700ms 동안 관통 성공 진입 차단

      const state = sewingStateRef.current;
      if (state) {
        // 드래그 즉시 해제 및 아치 미도달 리셋 (재도전 유도)
        state.isDragging = false;
        state.hasReachedApex = false;

        const curStep = currentStepRef.current;
        const isFront = curStep ? curStep.isFront : state.currentHoleIndex % 2 === 0;
        state.needleTargetPos.y = isFront ? 1.55 : -1.55;
        state.needlePos.y = isFront ? 1.35 : -1.35;
      }

      if (customPos) {
        trigger3DTangleEffect(customPos);
      } else if (state) {
        trigger3DTangleEffect(state.needlePos);
      }
      onErrorRef.current(msg);
    }
  }, [trigger3DTangleEffect]);

  const safeOnErrorRef = useRef(safeOnError);
  useEffect(() => {
    safeOnErrorRef.current = safeOnError;
  }, [safeOnError]);

  // 3D 시점 회전 (우클릭 Orbit)
  const orbitStateRef = useRef({
    isOrbiting: false,
    prevX: 0,
    prevY: 0,
    theta: 0,
    phi: Math.PI * 0.32,
    radius: 13.5,
    autoTransition: true,
  });

  // 3D 구멍 위치 계산 (1화: 8구멍 장단시침, 2화: 14구멍 복합홈질, 3화: 12구멍 네모패치박음질)
  const holePositions = useMemo(() => {
    // 🎓 실전 튜토리얼 전용: 천 중앙에 딱 2개의 구멍만 깔끔하게 배치!
    if (isTutorialMode) {
      return [
        new THREE.Vector3(-2.8, 0, 0),
        new THREE.Vector3(2.8, 0, 0),
      ];
    }

    if (courseId === "button") {
      // 🔘 3코스 단추 달기 3D 구멍 좌표 (가로 우선 Z자 표준 순서: 1:좌상, 2:우상, 3:좌하, 4:우하)
      if (totalHoles === 2) {
        return [
          new THREE.Vector3(-0.75, 0, 0),
          new THREE.Vector3(0.75, 0, 0),
        ];
      }
      return [
        new THREE.Vector3(-0.60, 0, -0.60), // 0번 (1번 구멍: 좌상)
        new THREE.Vector3(0.60, 0, -0.60),  // 1번 (2번 구멍: 우상)
        new THREE.Vector3(-0.60, 0, 0.60),  // 2번 (3번 구멍: 좌하)
        new THREE.Vector3(0.60, 0, 0.60),   // 3번 (4번 구멍: 우하)
      ];
    }

    // 🪡 1화 (시침질): 8구멍 정통 장단 시침질 3D 구멍 X좌표 (장-단-장-단-장-단-장)
    if (courseId === "running" && currentLevel === 1) {
      let xs: number[] = [];
      if (totalHoles === 8) {
        xs = [-7.8, -4.2, -3.4, 0.2, 1.0, 4.6, 5.4, 7.8];
      } else if (totalHoles === 6) {
        xs = [-7.2, -3.2, -2.4, 2.4, 3.2, 7.2];
      } else if (totalHoles === 4) {
        xs = [-7.0, -0.6, 0.6, 7.0];
      } else {
        const stepX = 15.6 / Math.max(1, totalHoles - 1);
        xs = Array.from({ length: totalHoles }, (_, i) => -7.8 + i * stepX);
      }
      return xs.map((x) => new THREE.Vector3(x, 0, 0));
    }

    // 🔮 2화 (홈질): 한국 전통 요술 복주머니 둘레 솔기 U자형 14구멍 등간격 배치 (주머니 봉합)
    if (courseId === "running" && currentLevel === 2 && totalHoles === 14) {
      const controlPoints = [
        new THREE.Vector3(-4.4, 0, -2.0), // 0번 시작 (황금 매듭 좌측 끝 바로 아래)
        new THREE.Vector3(-5.2, 0, -1.2), // 좌측 어깨 곡선
        new THREE.Vector3(-5.8, 0, 0.4),  // 좌측 옆구리 (최대 외곽)
        new THREE.Vector3(-5.2, 0, 2.2),  // 좌하단 코너
        new THREE.Vector3(-3.8, 0, 3.2),  // 좌측 밑단
        new THREE.Vector3(-1.8, 0, 3.5),  // 하단 바닥 중앙 좌
        new THREE.Vector3(0, 0, 3.6),     // 중앙 바닥
        new THREE.Vector3(1.8, 0, 3.5),   // 하단 바닥 중앙 우
        new THREE.Vector3(3.8, 0, 3.2),   // 우측 밑단
        new THREE.Vector3(5.2, 0, 2.2),   // 우하단 코너
        new THREE.Vector3(5.8, 0, 0.4),   // 우측 옆구리 (최대 외곽)
        new THREE.Vector3(5.2, 0, -1.2),  // 우측 어깨 곡선
        new THREE.Vector3(4.4, 0, -2.0),  // 13번 끝 (황금 매듭 우측 끝 바로 아래)
      ];
      const uCurve = new THREE.CatmullRomCurve3(controlPoints, false, "centripetal", 0.5);
      return uCurve.getSpacedPoints(13); // 호의 길이 기준 완벽한 등간격 14개 점!
    }

    // 👘 3화 (박음질): 14구멍 완전 대칭 균일 직사각형 덧댐 패치 수선 박음질 (테두리 둘레)
    if (courseId === "backstitch" && (totalHoles === 14 || totalHoles === 12)) {
      return [
        // 1. 상단 가로변 (좌 ➔ 우: 0~4번, Z = -2.8, 간격 2.8로 완전 균일)
        new THREE.Vector3(-5.6, 0, -2.8), // 0번 (좌상 코너)
        new THREE.Vector3(-2.8, 0, -2.8), // 1번
        new THREE.Vector3(0, 0, -2.8),    // 2번 (상단 중앙)
        new THREE.Vector3(2.8, 0, -2.8),   // 3번
        new THREE.Vector3(5.6, 0, -2.8),   // 4번 (우상 코너)

        // 2. 우측 세로변 (상 ➔ 하: 5~7번, X = 5.6, 간격 1.867로 완전 균일)
        new THREE.Vector3(5.6, 0, -0.933), // 5번
        new THREE.Vector3(5.6, 0, 0.933),  // 6번
        new THREE.Vector3(5.6, 0, 2.8),    // 7번 (우하 코너)

        // 3. 하단 가로변 (우 ➔ 좌: 8~11번, Z = 2.8, 간격 2.8로 완전 균일)
        new THREE.Vector3(2.8, 0, 2.8),    // 8번
        new THREE.Vector3(0, 0, 2.8),      // 9번 (하단 중앙)
        new THREE.Vector3(-2.8, 0, 2.8),   // 10번
        new THREE.Vector3(-5.6, 0, 2.8),   // 11번 (좌하 코너)

        // 4. 좌측 세로변 (하 ➔ 상: 12~13번, X = -5.6, 간격 1.867로 완전 균일)
        new THREE.Vector3(-5.6, 0, 0.933),  // 12번
        new THREE.Vector3(-5.6, 0, -0.933), // 13번 (0번 코너와 완벽 연결)
      ];
    }

    const startX = -7.5;
    const endX = 7.5;
    return Array.from({ length: totalHoles }, (_, i) => {
      const stepX = (endX - startX) / (totalHoles - 1);
      const x = startX + i * stepX;
      let z = courseId === "whip" ? 1.35 : 0;
      if (isCurve) {
        const t = (i / (totalHoles - 1)) * Math.PI * 2;
        z += Math.sin(t) * (courseId === "whip" ? 0.9 : 1.8);
      }
      return new THREE.Vector3(x, 0, z);
    });
  }, [totalHoles, isCurve, courseId, currentLevel, isTutorialMode]);

  // 실제 손바느질 물리 & 3차원 앞뒤 깊이(Z) 상태 머신
  const sewingStateRef = useRef<{
    isDragging: boolean;
    currentHoleIndex: number;
    actionPhase: "AIMING" | "PIERCING" | "PASSED";
    hasReachedApex: boolean;
    offsetZ: number;
    pierceProgress: number;
    needlePos: THREE.Vector3;
    needleTargetPos: THREE.Vector3;
    mouseNDC: THREE.Vector2;
    startDragX: number;
    wrapAccumAngle: number;
    lastWrapAngle: number | null;
    currentWrapCount: number;
  }>({
    isDragging: false,
    currentHoleIndex,
    actionPhase: "AIMING",
    hasReachedApex: false,
    offsetZ: 0,
    pierceProgress: 0,
    needlePos: new THREE.Vector3(0, 0, 0),
    needleTargetPos: new THREE.Vector3(0, 0, 0),
    mouseNDC: new THREE.Vector2(0, 0),
    startDragX: 0,
    wrapAccumAngle: 0,
    lastWrapAngle: null,
    currentWrapCount: 0,
  });

  // 🎓 튜토리얼 단계별 안전 홀드 및 중복 방지 타이머 Refs
  const tutorialHoldFramesRef = useRef(0);
  const tutorialTriggeredRef = useRef(false);
  const tutorialAccumRotationRef = useRef(0);

  // 구멍, 스텝 또는 튜토리얼 스텝 변경 시 바늘 물리 위치 안전 초기화
  useEffect(() => {
    currentStepRef.current = currentStep;
    tutorialHoldFramesRef.current = 0;
    tutorialTriggeredRef.current = false;
    tutorialAccumRotationRef.current = 0;

    const isFront = currentStep ? currentStep.isFront : currentHoleIndex % 2 === 0;
    const state = sewingStateRef.current;
    state.isDragging = false;
    state.currentHoleIndex = currentHoleIndex;
    state.actionPhase = "AIMING";
    state.hasReachedApex = false;
    state.wrapAccumAngle = 0;
    state.lastWrapAngle = null;
    state.currentWrapCount = 0;
    state.pierceProgress = 0;
    orbitStateRef.current.autoTransition = true;
    if (courseId === "button") {
      orbitStateRef.current.theta = 0.52;
      orbitStateRef.current.phi = isFront ? Math.PI * 0.22 : Math.PI * 0.78;
    } else {
      orbitStateRef.current.theta = 0;
      orbitStateRef.current.phi = isFront ? Math.PI * 0.32 : Math.PI * 0.68;
    }

    // 스테이지/스텝 전환 직후 0.6초간 에러 발생 방지 안전 가드
    lastErrorTimeRef.current = Date.now() + 600;

    if (isTutorialMode) {
      if (tutorialStep === 1) {
        state.offsetZ = 0;
      } else if (tutorialStep === 2) {
        // 2단계: 처음부터 1.6으로 즉시 빗겨나간 위치에 정적으로 대기 (회전 애니메이션 제거!)
        state.offsetZ = 1.6;
      } else if (tutorialStep === 3) {
        state.offsetZ = 0;
        state.hasReachedApex = true;
      }
    } else {
      // 일반 게임 모드 랜덤 깊이 오프셋
      if (courseId === "button") {
        // 🔘 단추 달기 전용: 작은 단추 구멍에 맞게 바늘이 구멍 근처에 단정하게 위치하도록 미세 오프셋 적용
        state.offsetZ = (Math.random() - 0.5) * 0.28;
      } else {
        const isLuckyAligned = Math.random() < (currentLevel === 1 ? 0.50 : 0.35);
        if (isLuckyAligned) {
          state.offsetZ = (Math.random() - 0.5) * 0.20;
        } else {
          const randomSign = Math.random() < 0.5 ? -1 : 1;
          const randomDist = 0.90 + Math.random() * 1.60;
          state.offsetZ = randomSign * randomDist;
        }
      }
    }

    const fromIdx = currentStep ? currentStep.fromIndex : currentHoleIndex;
    const toIdx = currentStep ? currentStep.toIndex : currentHoleIndex + 1;

    const fromHole = holePositions[fromIdx];
    const nextHole = holePositions[toIdx];

    if (fromHole) {
      let initY = isFront ? 2.35 : -2.35;
      let initX = fromHole.x;
      let initZ = fromHole.z + state.offsetZ;

      if (isTutorialMode) {
        if (tutorialStep === 1) {
          initX = fromHole.x;
          initY = 0.65;
          initZ = fromHole.z;
        } else if (tutorialStep === 2) {
          // 🎓 2단계: 1단계에서 들어올려 손을 뗀 현재 위치를 그대로 유지! (순간이동 방지)
          initX = state.needlePos.x !== 0 ? state.needlePos.x : fromHole.x;
          initY = Math.max(1.2, state.needlePos.y !== 0 ? state.needlePos.y : 1.35);
          initZ = fromHole.z + state.offsetZ;
          state.hasReachedApex = true;
        } else if (tutorialStep === 3) {
          // 🎓 3단계: 조준 완료된 위치 그대로 대기!
          initX = state.needlePos.x !== 0 ? state.needlePos.x : (nextHole ? nextHole.x : fromHole.x);
          initY = Math.max(1.2, state.needlePos.y !== 0 ? state.needlePos.y : 1.35);
          initZ = nextHole ? nextHole.z : fromHole.z;
          state.hasReachedApex = true;
        } else if (tutorialStep === 4) {
          // 🎓 4단계: 1번->2번 관통 완료 후 2번 구멍 밑(안면)에서 꽂힌 채 대기!
          initX = nextHole ? nextHole.x : 2.8;
          initY = -1.05;
          initZ = nextHole ? nextHole.z : 0;
          state.hasReachedApex = true;
        }
      } else if (courseId === "button") {
        if (currentStep?.isShankWrap) {
          initX = 0.85;
          initY = 0.30;
          initZ = 0;
        } else if (isFront) {
          initY = 2.15;
        } else {
          // 🌟 천 밑 시야에서 바늘이 화면 아래로 꺼지지 않고 또렷하게 바로 보이도록 -1.25로 상향
          initY = -1.25;
        }
      }

      const initPos = new THREE.Vector3(initX, initY, initZ);
      state.needlePos.copy(initPos);
      state.needleTargetPos.copy(initPos);

      // 가이드선 생성 (구멍 간 거리에 비례하는 우아한 포물선 아치 곡선)
      if (guideLineMeshRef.current && nextHole) {
        const dx = Math.abs(nextHole.x - fromHole.x);
        const dz = Math.abs(nextHole.z - fromHole.z);
        const distXZ = Math.sqrt(dx * dx + dz * dz);

        // 짧은 땀은 아담하게(최소 1.2), 긴 땀은 웅장하게(최대 2.45) 비례 스케일링
        const dynamicHeight = Math.min(2.45, Math.max(1.20, distXZ * 0.60));
        const archY = isFront 
          ? (courseId === "button" ? 2.65 : dynamicHeight) 
          : (courseId === "button" ? -2.65 : -dynamicHeight);

        const pStart = new THREE.Vector3(fromHole.x, isFront ? 0.18 : -0.18, fromHole.z);
        const pNext = new THREE.Vector3(nextHole.x, isFront ? 0.18 : -0.18, nextHole.z);
        const pMid1 = new THREE.Vector3(fromHole.x + (nextHole.x - fromHole.x) * 0.25, archY, fromHole.z);
        const pMid2 = new THREE.Vector3(fromHole.x + (nextHole.x - fromHole.x) * 0.75, archY, nextHole.z);

        const guideCurve = new THREE.CubicBezierCurve3(pStart, pMid1, pMid2, pNext);
        const pts = guideCurve.getPoints(24);
        guideLineMeshRef.current.geometry.dispose();
        guideLineMeshRef.current.geometry = new THREE.BufferGeometry().setFromPoints(pts);
        guideLineMeshRef.current.computeLineDistances();
      }
    }
  }, [currentHoleIndex, currentStep, holePositions, isTutorialMode, tutorialStep, currentLevel, courseId]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 580;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const defaultBg = fabricSkin?.patternType === "carbon" 
      ? "#0F172A" 
      : fabricSkin?.patternType === "denim" 
      ? "#0F1E36" 
      : "#FAF6F0";
    scene.background = new THREE.Color(defaultBg);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    camera.position.set(0, 7.5, 11);
    camera.lookAt(0, 0, 0);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    // 4. 조명 (그림자 칙칙함 없이 화사하고 따뜻한 천연 자연광)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xf5ebe0, 1.2);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffdf7, 1.5);
    dirLight.position.set(5, 14, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0xfffbeb, 0.9);
    backLight.position.set(-5, -14, -6);
    scene.add(backLight);

    // 5. 3D 패브릭(천) 메쉬
    // 🌟 2화 전용 여부 확인 (도깨비 두비의 요술 복주머니)
    const isPouchEpisode = courseId === "running" && currentLevel === 2 && totalHoles === 14;

    const frontBg = fabricSkin?.frontBg || "#FFFDF9";
    const frontLine = fabricSkin?.frontLine || "#EADBCA";
    const backBg = fabricSkin?.backBg || "#F5EDE0";
    const backLine = fabricSkin?.backLine || "#D8C7B2";
    const patternType = fabricSkin?.patternType || "cotton";

    // 🔮 복주머니 펠트는 둥근 곡면 형태로 인해 사각형 테두리 스티치가 잘려나가는 것을 방지하기 위해 테두리 스티치 생략
    const frontTexCanvas = createFabricTexture(frontBg, frontLine, patternType, true, isPouchEpisode);
    const frontTexture = new THREE.CanvasTexture(frontTexCanvas);
    frontTexture.colorSpace = THREE.SRGBColorSpace;
    frontTexture.wrapS = THREE.ClampToEdgeWrapping;
    frontTexture.wrapT = THREE.ClampToEdgeWrapping;
    frontTexture.repeat.set(1, 1);

    const backTexCanvas = createFabricTexture(backBg, backLine, patternType, false, isPouchEpisode);
    const backTexture = new THREE.CanvasTexture(backTexCanvas);
    backTexture.colorSpace = THREE.SRGBColorSpace;
    backTexture.wrapS = THREE.ClampToEdgeWrapping;
    backTexture.wrapT = THREE.ClampToEdgeWrapping;
    backTexture.repeat.set(1, 1);

    frontTextureRef.current = frontTexture as THREE.CanvasTexture;
    backTextureRef.current = backTexture as THREE.CanvasTexture;

    // 🌟 뽀송뽀송하고 포근한 리얼 수공예 펠트 패브릭 머티리얼 (빛반사 클리핑 완벽 방지, 무광 흡광)
    const fabricMaterials = [
      new THREE.MeshStandardMaterial({ color: frontBg, roughness: 0.95 }),
      new THREE.MeshStandardMaterial({ color: frontBg, roughness: 0.95 }),
      new THREE.MeshStandardMaterial({
        map: frontTexture,
        roughness: 0.95,
        metalness: 0.0,
      }),
      new THREE.MeshStandardMaterial({
        map: backTexture,
        roughness: 0.95,
        metalness: 0.0,
      }),
      new THREE.MeshStandardMaterial({ color: frontBg, roughness: 0.95 }),
      new THREE.MeshStandardMaterial({ color: frontBg, roughness: 0.95 }),
    ];

    // 🌟 에피소드별 동적 천 크기 및 카메라 시야 거리 최적화
    // 2화 (복주머니 홈질): 가로 14.8, 세로 9.4의 복주머니 비율
    // 3화 (12구멍 네모 박음질): 세로를 11.8로 대폭 확장하여 직사각형 둘레를 넉넉하게 돌 수 있음
    let fabricWidth = 19.0;
    let fabricDepth = 9.4;

    if (isPouchEpisode) {
      fabricWidth = 14.8;
      fabricDepth = 9.4;
    } else if (courseId === "backstitch" && totalHoles === 12) {
      fabricWidth = 20.0;
      fabricDepth = 11.8;
    } else if (courseId === "button") {
      fabricWidth = 17.5;
      fabricDepth = 9.2;
    }

    // 🌟 3D 도톰한 라운드 펠트 지오메트리 (2화: 도깨비 두비의 요술 복주머니, 기타: 라운드 사각 펠트)
    if (isPouchEpisode) {
      // 🔮 2화 전용: 한국 전통 '3D 요술 복주머니(두루주머니)' 입체 펠트
      const pouchShape = createPouchShape(fabricWidth, fabricDepth);

      // 겉면 (윗면) 펠트 메쉬 (두께 0.13, 표면 Y: 0.0 ~ +0.13)
      const topGeo = new THREE.ExtrudeGeometry(pouchShape, {
        depth: 0.11,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.04,
        bevelThickness: 0.01,
      });
      topGeo.rotateX(Math.PI / 2);
      topGeo.center();
      topGeo.translate(0, 0.065, 0);
      assignPouchUVs(topGeo, fabricWidth, fabricDepth);

      const topMat = [
        new THREE.MeshStandardMaterial({ map: frontTexture, roughness: 0.95, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ color: frontBg, roughness: 0.95 }),
      ];
      const topMesh = new THREE.Mesh(topGeo, topMat);
      topMesh.renderOrder = 1;
      topMesh.receiveShadow = true;
      scene.add(topMesh);

      // 안면 (아랫면) 펠트 메쉬 (두께 0.13, 표면 Y: -0.13 ~ 0.0)
      const bottomGeo = new THREE.ExtrudeGeometry(pouchShape, {
        depth: 0.11,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.04,
        bevelThickness: 0.01,
      });
      bottomGeo.rotateX(Math.PI / 2);
      bottomGeo.center();
      bottomGeo.translate(0, -0.065, 0);
      assignPouchUVs(bottomGeo, fabricWidth, fabricDepth);

      const bottomMat = [
        new THREE.MeshStandardMaterial({ map: backTexture, roughness: 0.95, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ color: frontBg, roughness: 0.95 }),
      ];
      const bottomMesh = new THREE.Mesh(bottomGeo, bottomMat);
      bottomMesh.renderOrder = 1;
      bottomMesh.receiveShadow = true;
      scene.add(bottomMesh);
    } else {
      const fabricGeo = new RoundedBoxGeometry(fabricWidth, 0.26, fabricDepth, 8, 1.2);
      const fabricMesh = new THREE.Mesh(fabricGeo, fabricMaterials);
      fabricMesh.receiveShadow = true;
      scene.add(fabricMesh);
    }

    // 👘 3화 전용: 찢어진 배자 상처 부위에 살포시 얹힌 '고운 옥색 덧댐 누빔 비단 사각 패치' (Patch Mesh)
    if (courseId === "backstitch" && (totalHoles === 14 || totalHoles === 12)) {
      // 덧댐 옥색 누빔 패치 크기: 가로 12.6, 세로 7.0, 두께 0.08 (14개 구멍이 패치 테두리 안쪽 0.7 시접선을 직접 관통하여 배자에 고정!)
      const patchGeo = new RoundedBoxGeometry(12.6, 0.08, 7.0, 4, 0.35);
      const patchTexCanvas = createSilkPatchTexture();
      const patchTexture = new THREE.CanvasTexture(patchTexCanvas);
      patchTexture.colorSpace = THREE.SRGBColorSpace;
      
      const patchMat = new THREE.MeshStandardMaterial({
        map: patchTexture,
        roughness: 0.75,
        metalness: 0.05,
      });
      const patchMesh = new THREE.Mesh(patchGeo, patchMat);
      patchMesh.position.set(0, 0.15, 0); // 원단 윗면 바로 위에 안착
      patchMesh.castShadow = true;
      patchMesh.receiveShadow = true;
      scene.add(patchMesh);
    }

    // 6. 구멍 3D 메탈 림 (윗면 및 아랫면 양방향 림 장착 & 관통 홀)
    const rimMat = new THREE.MeshStandardMaterial({ color: "#5C3A16", metalness: 0.4, roughness: 0.4 });
    const holeGroup = new THREE.Group();
    const isBackstitchPatch = courseId === "backstitch" && (totalHoles === 14 || totalHoles === 12);
    const isPouch = courseId === "running" && currentLevel === 2 && totalHoles === 14;

    holePositions.forEach((pos) => {
      // 🌟 3화 패치(0.20), 2화 복주머니(0.145), 일반 펠트(0.134)로 표면 위로 선명하게 돌출!
      const topRimY = isBackstitchPatch ? 0.20 : isPouch ? 0.145 : 0.134;
      const bottomRimY = isBackstitchPatch ? -0.134 : isPouch ? -0.145 : -0.134;

      const ringGeo = new THREE.TorusGeometry(0.26, 0.040, 12, 24);
      // 윗면 구멍 림
      const ringMeshTop = new THREE.Mesh(ringGeo, rimMat);
      ringMeshTop.rotation.x = Math.PI / 2;
      ringMeshTop.position.set(pos.x, topRimY, pos.z);
      ringMeshTop.renderOrder = 5; // 원단 및 패치 메쉬 위에 항상 선명하게 렌더링
      holeGroup.add(ringMeshTop);

      // 아랫면 구멍 림
      const ringMeshBottom = new THREE.Mesh(ringGeo, rimMat);
      ringMeshBottom.rotation.x = Math.PI / 2;
      ringMeshBottom.position.set(pos.x, bottomRimY, pos.z);
      ringMeshBottom.renderOrder = 5;
      holeGroup.add(ringMeshBottom);

      // 관통 실린더 홀 (패치/복주머니 윗면에서 천 바닥까지 완벽 관통)
      const cylHeight = isBackstitchPatch ? 0.42 : isPouch ? 0.38 : 0.30;
      const cylY = isBackstitchPatch ? 0.035 : 0;
      const holeCylGeo = new THREE.CylinderGeometry(0.23, 0.23, cylHeight, 16);
      const holeCylMat = new THREE.MeshBasicMaterial({ color: "#180D05" });
      const holeCyl = new THREE.Mesh(holeCylGeo, holeCylMat);
      holeCyl.position.set(pos.x, cylY, pos.z);
      holeCyl.renderOrder = 4;
      holeGroup.add(holeCyl);
    });
    scene.add(holeGroup);

    // 6.5. 🔘 3D 단추 오브젝트 (실제 관통 구멍이 뚫린 정밀 단추 메쉬)
    if (courseId === "button") {
      const buttonGroup = create3DButtonWithHoles(currentLevel, totalHoles);
      scene.add(buttonGroup);
    }

    // 7. 완성된 스티치 그룹
    const stitchesGroup = new THREE.Group();
    completedStitchesGroupRef.current = stitchesGroup;
    scene.add(stitchesGroup);

    // 8. 🌟 이미지 기반 일체형 손바느질 바늘
    const needleGroup = create3DNeedle(needleSkinId);
    needleGroupRef.current = needleGroup;
    scene.add(needleGroup);

    // 9. 🌟 정통 두 겹 실 (Parallel Double Strand Loop)
    const threadGeo = new THREE.BufferGeometry();
    const threadMat = new THREE.MeshStandardMaterial({ color: threadColor, roughness: 0.35 });
    const dynamicThreadMesh = new THREE.Mesh(threadGeo, threadMat);
    dynamicThreadMeshRef.current = dynamicThreadMesh;
    scene.add(dynamicThreadMesh);

    // 10. 가이드 점선
    const guideMat = new THREE.LineDashedMaterial({
      color: 0xe76f51,
      dashSize: 0.3,
      gapSize: 0.2,
      opacity: 0.65,
      transparent: true,
    });
    const guideGeo = new THREE.BufferGeometry();
    const guideMesh = new THREE.Line(guideGeo, guideMat);
    guideLineMeshRef.current = guideMesh;
    scene.add(guideMesh);

    // 11. 🌟 바늘 끝 천 표면 표적 그림자 조준점 (Drop Shadow Reticle)
    const reticleGeo = new THREE.RingGeometry(0.06, 0.22, 24);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: "#FF3B30", // 선명한 고대비 레드-앰버 표적
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthTest: false, // 단추/천 메쉬에 묻히지 않음
    });
    const shadowReticleMesh = new THREE.Mesh(reticleGeo, reticleMat);
    shadowReticleMesh.rotation.x = Math.PI / 2;
    shadowReticleMesh.position.set(0, 0.64, 0);
    shadowReticleMesh.renderOrder = 999;
    shadowReticleMeshRef.current = shadowReticleMesh;
    scene.add(shadowReticleMesh);

    // 12. 🌟 목표 구멍 노란색 펄스 가이드 링 (Target Indicator: 1~3단계 전 코스 상시 지원)
    const yellowRingGeo = new THREE.TorusGeometry(0.34, 0.045, 16, 32);
    const yellowRingMat = new THREE.MeshBasicMaterial({
      color: "#FBBF24",
      transparent: true,
      opacity: 0.9,
      depthTest: false,
    });
    const targetIndicatorMesh = new THREE.Mesh(yellowRingGeo, yellowRingMat);
    targetIndicatorMesh.rotation.x = Math.PI / 2;
    targetIndicatorMesh.renderOrder = 998;
    targetIndicatorMesh.visible = true;
    targetHoleIndicatorMeshRef.current = targetIndicatorMesh;
    scene.add(targetIndicatorMesh);

    // 13. 🌟 엉킴 충격 파티클 그룹 (Tangle Sparks)
    const tangleParticlesGroup = new THREE.Group();
    tangleParticlesGroupRef.current = tangleParticlesGroup;
    scene.add(tangleParticlesGroup);

    // 14. 🌟 실기둥 360° 원형 회전 가이드 링 & 화살표 그룹
    const shankWrapGuideGroup = new THREE.Group();
    const wrapGuideRingGeo = new THREE.TorusGeometry(0.85, 0.038, 16, 48);
    const wrapGuideRingMat = new THREE.MeshBasicMaterial({
      color: "#00F0FF", // 사이버 틴트 네온 시안 회전 링
      transparent: true,
      opacity: 0.90,
      depthTest: false,
    });
    const wrapGuideRing = new THREE.Mesh(wrapGuideRingGeo, wrapGuideRingMat);
    wrapGuideRing.rotation.x = Math.PI / 2;
    wrapGuideRing.position.set(0, 0.30, 0);
    wrapGuideRing.renderOrder = 997;
    shankWrapGuideGroup.add(wrapGuideRing);

    // 회전 방향 화살표 콘들 (시계 방향 3개)
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const coneGeo = new THREE.ConeGeometry(0.08, 0.20, 12);
      const coneMat = new THREE.MeshBasicMaterial({ color: "#FFCC00", depthTest: false });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(Math.cos(angle) * 0.85, 0.30, Math.sin(angle) * 0.85);
      cone.rotation.y = -angle + Math.PI / 2;
      cone.rotation.z = -Math.PI / 2;
      cone.renderOrder = 997;
      shankWrapGuideGroup.add(cone);
    }
    shankWrapGuideGroup.visible = false;
    shankWrapGuideGroupRef.current = shankWrapGuideGroup;
    scene.add(shankWrapGuideGroup);

    // 15. 🌟 실시간 감기는 실기둥 코일 그룹
    const liveShankCoilsGroup = new THREE.Group();
    liveShankCoilsGroupRef.current = liveShankCoilsGroup;
    scene.add(liveShankCoilsGroup);

    // 16. 레이캐스터
    const raycaster = new THREE.Raycaster();

    // 15. 60FPS 애니메이션 루프
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // 🌟 에러 발생 시 카메라 셰이크 진동 연출
      let shakeOffsetX = 0;
      let shakeOffsetY = 0;
      let shakeOffsetZ = 0;
      if (shakeIntensityRef.current > 0.01) {
        const intensity = shakeIntensityRef.current;
        shakeOffsetX = (Math.random() - 0.5) * intensity * 0.35;
        shakeOffsetY = (Math.random() - 0.5) * intensity * 0.35;
        shakeOffsetZ = (Math.random() - 0.5) * intensity * 0.35;
        shakeIntensityRef.current *= 0.88; // 매 프레임 감쇠
      } else {
        shakeIntensityRef.current = 0;
      }

      // 카메라 시점 및 줌 거리 보간 (실기둥 감기 시 초근접 줌인!)
      const orb = orbitStateRef.current;
      const state = sewingStateRef.current;
      const curStep = currentStepRef.current;
      const fromIdx = curStep ? curStep.fromIndex : state.currentHoleIndex;
      const toIdx = curStep ? curStep.toIndex : state.currentHoleIndex + 1;
      const isFront = curStep ? curStep.isFront : fromIdx % 2 === 0;
      const fromHole = holePositions[fromIdx];
      const nextHole = holePositions[toIdx];

      // 🔍 튜토리얼 모드 및 실기둥 감기 단계 다이나믹 줌인 & 룩앳 설정
      const isShankWrapStep = curStep?.isShankWrap === true;
      let baseCameraRadius = 13.8;
      if (courseId === "backstitch" && (totalHoles === 14 || totalHoles === 12)) {
        baseCameraRadius = 16.8; // 3화 14구멍 네모 박음질: 시원하고 넉넉한 쿼터뷰 확보
      } else if (courseId === "button") {
        baseCameraRadius = 13.2;
      }
      const targetRadius = isShankWrapStep ? 4.6 : baseCameraRadius;
      // 🎓 튜토리얼일 때는 카메라가 위(2.55)를 올려다보게 하여, 천과 바늘이 화면 하단 25~30% 위치로 쑥 내려오도록 배치!
      const targetLookAtY = isTutorialMode ? 2.55 : (isShankWrapStep ? 0.28 : 0);

      orb.radius = THREE.MathUtils.lerp(orb.radius, targetRadius, 0.08);

      if (orb.autoTransition && !orb.isOrbiting) {
        if (courseId === "button") {
          if (isShankWrapStep) {
            // 🔘 실기둥 감기 전용 쿼터 클로즈업 각도 (단추 밑 틈이 시원하게 보이는 앵글)
            orb.phi = THREE.MathUtils.lerp(orb.phi, Math.PI * 0.40, 0.08);
            orb.theta = THREE.MathUtils.lerp(orb.theta, 0.35, 0.08);
          } else if (state.actionPhase === "PIERCING") {
            const p = THREE.MathUtils.smoothstep(state.pierceProgress, 0, 1);
            const startPhi = isFront ? Math.PI * 0.22 : Math.PI * 0.78;
            const endPhi = isFront ? Math.PI * 0.78 : Math.PI * 0.22;
            const targetPhi = THREE.MathUtils.lerp(startPhi, endPhi, p);
            orb.phi = THREE.MathUtils.lerp(orb.phi, targetPhi, 0.08);
            orb.theta = THREE.MathUtils.lerp(orb.theta, 0.52, 0.05);
          } else {
            // 🔘 [단추 달기 전용]: 4개 구멍이 한눈에 마름모로 펼쳐져 세로/가로 조준이 쉬운 30° 대각선 쿼터뷰 탑-다운 앵글!
            const targetPhi = isFront ? Math.PI * 0.22 : Math.PI * 0.78;
            orb.phi = THREE.MathUtils.lerp(orb.phi, targetPhi, 0.08);
            orb.theta = THREE.MathUtils.lerp(orb.theta, 0.52, 0.05);
          }
        } else {
          if (state.actionPhase === "PIERCING") {
            // 콕 찌르며 들어갈 때 반대면 각도로 부드럽게 선행 틸트 회전!
            const p = THREE.MathUtils.smoothstep(state.pierceProgress, 0, 1);
            const startPhi = isFront ? Math.PI * 0.30 : Math.PI * 0.70;
            const endPhi = isFront ? Math.PI * 0.70 : Math.PI * 0.30;
            const targetPhi = THREE.MathUtils.lerp(startPhi, endPhi, p);
            orb.phi = THREE.MathUtils.lerp(orb.phi, targetPhi, 0.10);
          } else {
            const targetPhi = isFront ? Math.PI * 0.30 : Math.PI * 0.70;
            orb.phi = THREE.MathUtils.lerp(orb.phi, targetPhi, 0.05);
          }
          orb.theta = THREE.MathUtils.lerp(orb.theta, 0, 0.05);
        }
      }

      // 🌟 1·2단계 목표 구멍 노란색 펄스 링 동기화
      if (targetHoleIndicatorMeshRef.current && nextHole) {
        targetHoleIndicatorMeshRef.current.visible = currentLevel <= 2 && !isShankWrapStep;
        if (currentLevel <= 2 && !isShankWrapStep) {
          const surfaceY = isFront ? 0.135 : -0.135;
          targetHoleIndicatorMeshRef.current.position.set(nextHole.x, surfaceY, nextHole.z);
          const pulseScale = 1.0 + Math.sin(Date.now() * 0.007) * 0.16;
          targetHoleIndicatorMeshRef.current.scale.set(pulseScale, pulseScale, pulseScale);
        }
      }

      const camX = orb.radius * Math.sin(orb.phi) * Math.sin(orb.theta) + shakeOffsetX;
      const camY = orb.radius * Math.cos(orb.phi) + shakeOffsetY + (isShankWrapStep ? 0.20 : 0);
      const camZ = orb.radius * Math.sin(orb.phi) * Math.cos(orb.theta) + shakeOffsetZ;
      camera.position.set(camX, camY, camZ);
      camera.lookAt(0, targetLookAtY, 0);

      // 🌟 엉킴 파티클 시뮬레이션
      if (tangleParticlesGroupRef.current) {
        const pGroup = tangleParticlesGroupRef.current;
        for (let i = pGroup.children.length - 1; i >= 0; i--) {
          const p = pGroup.children[i] as THREE.Mesh;
          if (p.userData && p.userData.velocity) {
            p.position.add(p.userData.velocity);
            p.userData.velocity.y -= 0.003; // 미세 중력
            p.rotation.x += 0.08;
            p.rotation.y += 0.1;
            p.userData.life -= 0.035;
            if (p.material instanceof THREE.MeshBasicMaterial) {
              p.material.opacity = Math.max(0, p.userData.life);
            }
            if (p.userData.life <= 0) {
              pGroup.remove(p);
              p.geometry.dispose();
              if (Array.isArray(p.material)) {
                p.material.forEach((m) => m.dispose());
              } else {
                p.material.dispose();
              }
            }
          }
        }
      }

      // 바늘 상태 및 자세 물리 업데이트 (순방향 및 역방향 스텝 완벽 지원)
      if (fromHole && nextHole) {
        const isBackward = nextHole.x < fromHole.x;

        // A. 조준 및 마우스 추적 단계 (휠/키 깊이 연동 또는 실기둥 360도 회전 감기)
        if (state.actionPhase === "AIMING") {
          if (curStep?.isShankWrap) {
            // 🌀 실기둥 전용 360° 원형 회전 가이드 활성화 & 일반 표적/점선 가이드 숨김
            if (shankWrapGuideGroupRef.current) {
              shankWrapGuideGroupRef.current.visible = true;
              shankWrapGuideGroupRef.current.rotation.y += 0.025; // 회전 안내 애니메이션
            }
            if (guideLineMeshRef.current) guideLineMeshRef.current.visible = false;
            if (shadowReticleMeshRef.current) shadowReticleMeshRef.current.visible = false;
            if (targetHoleIndicatorMeshRef.current) targetHoleIndicatorMeshRef.current.visible = false;

            if (state.isDragging) {
              raycaster.setFromCamera(state.mouseNDC, camera);
              const wrapPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.30);
              const intersect = new THREE.Vector3();
              if (raycaster.ray.intersectPlane(wrapPlane, intersect)) {
                const currentAngle = Math.atan2(intersect.z, intersect.x);
                if (state.lastWrapAngle !== null) {
                  let diff = currentAngle - state.lastWrapAngle;
                  if (diff > Math.PI) diff -= Math.PI * 2;
                  if (diff < -Math.PI) diff += Math.PI * 2;
                  state.wrapAccumAngle += Math.abs(diff);

                  const wrapTarget = curStep?.wrapTargetCount || 3;
                  const requiredAngle = wrapTarget * Math.PI * 2;

                  // 1바퀴 돌 때마다 실시간 3D 코일 링 추가 & 사운드!
                  if (state.wrapAccumAngle >= (state.currentWrapCount + 1) * Math.PI * 2) {
                    state.currentWrapCount++;
                    playPassSound();

                    if (liveShankCoilsGroupRef.current) {
                      const count = state.currentWrapCount;
                      const coilY = 0.08 + (count / wrapTarget) * 0.40;
                      const coilGeo = new THREE.TorusGeometry(0.18, 0.038, 8, 24);
                      const coilMat = new THREE.MeshStandardMaterial({
                        color: threadColor,
                        roughness: 0.4,
                      });
                      const coilMesh = new THREE.Mesh(coilGeo, coilMat);
                      coilMesh.rotation.x = Math.PI / 2;
                      coilMesh.position.set(0, coilY, 0);
                      liveShankCoilsGroupRef.current.add(coilMesh);
                    }
                  }

                  if (state.wrapAccumAngle >= requiredAngle) {
                    state.actionPhase = "PASSED";
                    if (shankWrapGuideGroupRef.current) shankWrapGuideGroupRef.current.visible = false;
                    onHolePassedRef.current(toIdx);
                  }
                }
                state.lastWrapAngle = currentAngle;

                // 바늘을 단추 아래(Y=0.30) 둘레에 원형 배치 & 접선 방향 회전
                const radius = 0.85;
                state.needleTargetPos.set(Math.cos(currentAngle) * radius, 0.30, Math.sin(currentAngle) * radius);
              }
            } else {
              state.lastWrapAngle = null;
              state.needleTargetPos.set(0.85, 0.30, 0);
            }
          } else {
            // 일반 바느질 스텝일 때는 실기둥 회전 가이드 숨김
            if (shankWrapGuideGroupRef.current) shankWrapGuideGroupRef.current.visible = false;
            if (isTutorialMode && tutorialStepRef.current === 4) {
              if (guideLineMeshRef.current) guideLineMeshRef.current.visible = false;
              if (shadowReticleMeshRef.current) shadowReticleMeshRef.current.visible = false;
              if (targetHoleIndicatorMeshRef.current) targetHoleIndicatorMeshRef.current.visible = false;
            } else {
              if (guideLineMeshRef.current) guideLineMeshRef.current.visible = true;
            }
          }

          if (!curStep?.isShankWrap && state.isDragging) {
            raycaster.setFromCamera(state.mouseNDC, camera);

            const isButtonCourse = courseId === "button";
            const isButtonUp = isButtonCourse && !isFront;

            // 작업 평면 (출발 구멍과 목표 구멍을 잇는 방향에 맞춘 수직 평면)
            const moveVec = nextHole.clone().sub(fromHole);
            const moveDir = moveVec.lengthSq() > 0.001 ? moveVec.clone().normalize() : new THREE.Vector3(1, 0, 0);
            const planeNormal = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), moveDir).normalize();
            if (planeNormal.lengthSq() < 0.01) planeNormal.set(0, 0, 1);
            const sewingPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, fromHole);

            const intersect = new THREE.Vector3();
            if (raycaster.ray.intersectPlane(sewingPlane, intersect)) {
              const minX = Math.min(fromHole.x, nextHole.x) - 0.75;
              const maxX = Math.max(fromHole.x, nextHole.x) + 0.75;
              const minZ = Math.min(fromHole.z, nextHole.z) - 0.75;
              const maxZ = Math.max(fromHole.z, nextHole.z) + 0.75;

              intersect.x = THREE.MathUtils.clamp(intersect.x, minX, maxX);
              intersect.z = THREE.MathUtils.clamp(intersect.z, minZ, maxZ) + state.offsetZ;

              // 🔘 [단추 달기 전용 X/Z 자석 흡착]: 작은 4개 단추 구멍 조준을 돕기 위해 목표 구멍 근처에서 부드럽게 흡착 유도
              if (isButtonCourse && nextHole) {
                const targetDistXZ = Math.hypot(intersect.x - nextHole.x, intersect.z - nextHole.z);
                if (targetDistXZ <= 1.25) {
                  const snapFactor = isButtonUp ? 0.35 : 0.22;
                  intersect.x = THREE.MathUtils.lerp(intersect.x, nextHole.x, snapFactor);
                  intersect.z = THREE.MathUtils.lerp(intersect.z, nextHole.z, snapFactor);
                }
              }

              if (isButtonUp) {
                // 단추 밑에서 위로 솟아오르기 (천 밑 -1.65에서 단추 위 1.75까지: 화면 아래로 가라앉음 방지)
                intersect.y = THREE.MathUtils.clamp(intersect.y, -1.65, 1.75);
              } else if (isFront) {
                // 상단 안내 메시지 바를 뚫고 나가지 않도록 최대 높이를 2.95로 시원하게 확장
                intersect.y = THREE.MathUtils.clamp(intersect.y, 0.05, 2.95);
              } else {
                intersect.y = THREE.MathUtils.clamp(intersect.y, -2.95, -0.05);
              }
              state.needleTargetPos.copy(intersect);

              // 🌟 아치 정점(Apex) 도달 체크 (바늘을 충분히 들어올려야만 찌르기 인정, 안면일 때 판정을 부드럽게 완화)
              if (isFront && intersect.y >= 1.25) {
                state.hasReachedApex = true;
              } else if (!isFront && (isButtonUp ? intersect.y >= -0.75 : intersect.y <= -1.05)) {
                state.hasReachedApex = true;
              }
            }
          }

          // 🎓 튜토리얼 2단계 대기 중: 휠/WS 조작 시 Z위치 실시간 동기화
          if (isTutorialMode && tutorialStepRef.current === 2 && !state.isDragging) {
            state.needleTargetPos.z = (fromHole ? fromHole.z : 0) + state.offsetZ;
          } else if (isTutorialMode && tutorialStepRef.current === 4 && nextHole) {
            state.needleTargetPos.set(nextHole.x, -1.05, nextHole.z);
          }

          state.needlePos.lerp(state.needleTargetPos, 0.35);

          // 점진적 바늘 각도 보간 (3차원 조준)
          if (needleGroupRef.current) {
            needleGroupRef.current.position.copy(state.needlePos);

            const isButtonCourse = courseId === "button";
            const isButtonUp = isButtonCourse && !isFront;
            const fullDist = Math.max(0.01, fromHole.distanceTo(nextHole));
            const curDist = state.needlePos.distanceTo(fromHole);
            const progress = THREE.MathUtils.clamp(curDist / fullDist, 0, 1);

            // 아래에서 위로 들어갈 때는 표적이 천 밑면(-0.135)에, 위에서 아래로 꽂을 때는 단추 윗면(0.63) 또는 패치 윗면(0.20)에 표시!
            let targetSurfaceY: number;
            if (isButtonCourse) {
              targetSurfaceY = isFront ? 0.63 : -0.135;
            } else if (courseId === "backstitch" && totalHoles === 12) {
              targetSurfaceY = isFront ? 0.20 : -0.135; // 🌟 3화 패치 윗면 표적
            } else {
              targetSurfaceY = isFront ? 0.135 : -0.135;
            }

            let currentDir: THREE.Vector3;
            if (isTutorialMode && tutorialStepRef.current === 4) {
              // 🎓 4단계: 겉면에서 안면으로 관통 완료되어 2번 구멍 밑에 꽂혀 대기 중인 상태!
              // 바늘 끝(Tip, 로컬 +Z)이 천 아래(음수 Y)를 똑바로 향하고, 바늘 귀(Tail, 로컬 -Z)가 천 구멍(위쪽)을 향함!
              currentDir = new THREE.Vector3(0, -1.0, 0);
            } else {
              let standDir: THREE.Vector3;
              if (isButtonCourse) {
                standDir = new THREE.Vector3(0, isFront ? -1.0 : 1.0, 0);
              } else {
                standDir = new THREE.Vector3(isBackward ? -0.25 : 0.25, isFront ? 1.0 : -1.0, 0).normalize();
              }

              // 🌟 휠/키로 조작된 Z축 오프셋을 실시간 조준 목표에 즉시 반영!
              const targetHoleSurface = new THREE.Vector3(nextHole.x, targetSurfaceY, nextHole.z + state.offsetZ);
              const aimDir = targetHoleSurface.clone().sub(state.needlePos).normalize();

              const leanWeight = THREE.MathUtils.smoothstep(progress, 0.08, 0.75);
              currentDir = standDir.clone().lerp(aimDir, leanWeight).normalize();
            }

            needleGroupRef.current.lookAt(state.needlePos.clone().add(currentDir));
            needleGroupRef.current.updateMatrixWorld(true);

            // 🌟 뾰족한 바늘 끝(Needle Tip)의 실제 3차원 월드 좌표 추출
            const needleTipWorld = new THREE.Vector3(0, 0, 0.72).applyMatrix4(
              needleGroupRef.current.matrixWorld
            );

            // 🌟 다음 목표 구멍과의 2D(XZ) 수평 거리 선제 계산
            const dxToNext = needleTipWorld.x - nextHole.x;
            const dzToNext = needleTipWorld.z - nextHole.z;
            const distXZToNext = Math.sqrt(dxToNext * dxToNext + dzToNext * dzToNext);

            // 🎯 튜토리얼 2단계 조준(Lock-on) 정밀 조건:
            // 표적이 노란 목표 구멍 링(반경 0.34) 안에 시각적으로 쏙 들어왔을 때만 초록색으로 점등!
            // 1) 휠/WS/버튼 조준으로 Z 오프셋이 구멍 링 안으로 정렬된 경우 (|offsetZ| <= 0.30)
            // 2) 바늘을 마우스/터치로 잡고 노란 구멍 위로 정확히 가져온 경우 (distXZToNext <= 0.35)
            const isReticleLockedOn = isTutorialMode && tutorialStepRef.current === 2 && (
              Math.abs(state.offsetZ) <= 0.30 ||
              (state.isDragging && distXZToNext <= 0.35)
            );

            // 🌟 표적 그림자 조준점(표적): 천 밑면 또는 단추 표면에 실시간 투영!
            if (shadowReticleMeshRef.current) {
              // 🎓 튜토리얼 1단계는 '바늘 들어올리기'만 집중하도록 조준점을 숨기고, 2단계부터 노출!
              if (isTutorialMode && tutorialStepRef.current === 1) {
                shadowReticleMeshRef.current.visible = false;
              } else {
                shadowReticleMeshRef.current.visible = true;
                const reticleOffsetY = isFront ? 0.015 : -0.015;

                // 튜토리얼 2단계 조준 성공 시 초록색으로 빛남
                if (isReticleLockedOn) {
                  (shadowReticleMeshRef.current.material as THREE.MeshBasicMaterial).color.set("#10B981");
                } else {
                  (shadowReticleMeshRef.current.material as THREE.MeshBasicMaterial).color.set("#FF3B30");
                }

                if (state.isDragging) {
                  // 드래그 중: 바늘 끝 바로 아래/위 투영
                  shadowReticleMeshRef.current.position.set(needleTipWorld.x, targetSurfaceY + reticleOffsetY, needleTipWorld.z);
                  const heightFactor = Math.max(0.1, 1 - Math.abs(needleTipWorld.y - targetSurfaceY) / 3.0);
                  (shadowReticleMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.45 + heightFactor * 0.45;
                } else {
                  // 대기 중: 미리 조준 중인 목표 착지점에 실시간 표시!
                  shadowReticleMeshRef.current.position.set(nextHole.x, targetSurfaceY + reticleOffsetY, nextHole.z + state.offsetZ);
                  (shadowReticleMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.85;
                }
              }
            }

            // 🌟 목표 구멍 노란색 펄스 가이드 링 (Target Indicator) 실시간 추적 & 펄스 애니메이션!
            if (targetHoleIndicatorMeshRef.current) {
              if (nextHole) {
                targetHoleIndicatorMeshRef.current.visible = true;
                const ringOffsetY = isFront ? 0.015 : -0.015;
                targetHoleIndicatorMeshRef.current.position.set(nextHole.x, targetSurfaceY + ringOffsetY, nextHole.z);
                const time = Date.now() * 0.005;
                const scale = 1.0 + Math.sin(time) * 0.12;
                targetHoleIndicatorMeshRef.current.scale.set(scale, scale, scale);
                (targetHoleIndicatorMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.80 + Math.sin(time) * 0.20;
              } else {
                targetHoleIndicatorMeshRef.current.visible = false;
              }
            }

            // 🎓 튜토리얼 2단계 미션: 표적이 노란 구멍 링 안에 정확히 일치(초록색 Lock-on)하여 안정적으로 유지되었을 때만 통과!
            if (isTutorialMode && tutorialStepRef.current === 2 && !tutorialTriggeredRef.current) {
              if (isReticleLockedOn) {
                tutorialHoldFramesRef.current += 1;
                // 약 0.16초(10프레임) 동안 표적이 구멍 안에 안정적으로 머물렀을 때 통과
                if (tutorialHoldFramesRef.current >= 10) {
                  tutorialTriggeredRef.current = true;
                  onTutorialEventRef.current?.("RETICLE_LOCKED");
                }
              } else {
                tutorialHoldFramesRef.current = Math.max(0, tutorialHoldFramesRef.current - 1);
              }
            }

            // 🌟 3차원 정밀 구멍 찌르기 판정
            if (state.isDragging) {
              // 🎓 튜토리얼 1단계 미션: 바늘을 충분히 높이 들기 (태블릿 터치 및 마우스 모두 쾌적한 즉각 반응)
              if (isTutorialMode && tutorialStepRef.current === 1 && !tutorialTriggeredRef.current) {
                const currentNeedleHeight = Math.max(state.needlePos.y, needleTipWorld.y);
                if (currentNeedleHeight >= 0.72) {
                  tutorialHoldFramesRef.current += 1;
                  if (tutorialHoldFramesRef.current >= 4) {
                    tutorialTriggeredRef.current = true;
                    onTutorialEventRef.current?.("NEEDLE_LIFTED");
                  }
                } else {
                  tutorialHoldFramesRef.current = Math.max(0, tutorialHoldFramesRef.current - 1);
                }
              }

              const dx = needleTipWorld.x - nextHole.x;
              const dz = needleTipWorld.z - nextHole.z;
              const distXZ = Math.sqrt(dx * dx + dz * dz);
              const distY = Math.abs(needleTipWorld.y - targetSurfaceY);

              const isNearTargetHole = distXZ <= 0.75;
              const hasProgressedPastHalf = progress >= 0.25 || (isButtonUp && state.needlePos.y >= -0.7);

              // 🧲 스마트 풀 오토스냅 (Smart Full Auto-Snap)
              // 📱 태블릿 모드에서 오토스냅이 켜져 있을 때만 자동 유도 (PC 모드 및 튜토리얼 2단계 조준 실습 시 100% 비활성화)
              const isTablet = controlModeRef.current === "tablet";
              const shouldAutoSnap = isTablet && autoSnapRef.current && (!isTutorialMode || tutorialStepRef.current !== 2);
              if (shouldAutoSnap && (progress >= 0.20 || isNearTargetHole)) {
                const snapStrength = isNearTargetHole ? 0.22 : 0.10;
                state.offsetZ = THREE.MathUtils.lerp(state.offsetZ, 0, snapStrength);
              }

              // 🔘 [단추 달기 전용 자석 스냅]: 좁은 4개 구멍 조준 보조 (아래에서 위로 솟아오를 때 강력 흡착 유도)
              if (courseId === "button") {
                if (progress >= 0.15 || isNearTargetHole || distXZ <= 1.25) {
                  const buttonSnapStrength = isButtonUp
                    ? (isNearTargetHole ? 0.65 : 0.40)
                    : (isNearTargetHole ? 0.45 : 0.25);
                  state.offsetZ = THREE.MathUtils.lerp(state.offsetZ, 0, buttonSnapStrength);
                }
              }

              // 바늘 수직 이동 변화량 및 하강 여부 감지
              const deltaY = state.needlePos.y - prevNeedleYRef.current;
              prevNeedleYRef.current = state.needlePos.y;
              const isMovingDownward = isFront ? (deltaY < -0.002) : (deltaY > 0.002);
              const isDragGracePeriod = Date.now() - dragStartTimeRef.current < 280;

              // 🛡️ 에러 직후 쿨다운 중일 때는 어떠한 관통 판정도 실행하지 않음
              if (Date.now() < errorLockUntilRef.current) {
                return;
              }

              // 🔘 단추 달기 솟기 판정: 천 밑면에서 단추 구멍으로 밀어올릴 때 (시원하고 부드러운 쏙! 관통 보장)
              if (isButtonUp) {
                // 반경 0.95 & 높이 -0.45로 대폭 완화하여 표적이 맞으면 즉각 쏙 관통!
                if (distXZ <= 0.95 && needleTipWorld.y >= -0.45 && state.isDragging) {
                  state.hasReachedApex = true; // 솟아오를 때 억울한 아치 미달 에러 원천 차단
                  state.actionPhase = "PIERCING";
                  state.pierceProgress = 0;
                  if (isTutorialMode && tutorialStepRef.current === 3 && !tutorialTriggeredRef.current) {
                    tutorialTriggeredRef.current = true;
                    onTutorialEventRef.current?.("HOLE_PIERCED");
                  }
                } else if (distXZ > 1.35 && needleTipWorld.y >= 0.85 && !isDragGracePeriod) {
                  // 바늘이 구멍을 완전히 빗겨나 단추 위 허공으로 쑥 치솟았을 때만 안내 (구멍 근처에서는 절대 에러 없음!)
                  safeOnErrorRef.current("단추 구멍 위치를 조준하며 천 밑에서 올려보세요!");
                  return;
                }
              } else if (distY <= 0.35 && hasProgressedPastHalf && state.isDragging) {
                // 🎓 튜토리얼 3단계: 사용자가 마우스로 직접 아래로 끌어내려 찔렀을 때만 관통 인정!
                const isTutorialReady = !isTutorialMode || (tutorialStepRef.current === 3 && needleTipWorld.y <= 0.22);

                // 단추 꽂기 및 일반 바느질 꽂기 판정 (단추달기에서만 0.55 완화, 일반 코스는 0.38 유지)
                const pierceDistLimit = courseId === "button" ? 0.55 : 0.38;
                if (distXZ <= pierceDistLimit && isTutorialReady) {
                  if (!state.hasReachedApex) {
                    // 아치에 도달하지 않은 상태에서 바닥에 붙어 전진만 하려 할 때만 에러 (드래그 시작 직후 집어올리는 도중에는 에러 없음!)
                    if (progress >= 0.65 && !isDragGracePeriod && isMovingDownward) {
                      safeOnErrorRef.current(
                        isFront
                          ? (courseId === "button" ? "곡선 아치를 그리며 단추 구멍으로 꽂아보세요!" : "바늘을 위로 충분히 들어 올린 후 꽂아보세요!")
                          : "잘 보이지 않아 바느질을 실수할 때에는 시점을 변경해보세요!"
                      );
                      return;
                    }
                  } else {
                    state.actionPhase = "PIERCING";
                    state.pierceProgress = 0;
                    if (isTutorialMode && tutorialStepRef.current === 3 && !tutorialTriggeredRef.current) {
                      tutorialTriggeredRef.current = true;
                      onTutorialEventRef.current?.("HOLE_PIERCED");
                    }
                  }
                } else if (distXZ > pierceDistLimit && distY <= 0.24) {
                  // 🛡️ 튜토리얼 1, 2단계 중에는 빗맞힘 에러 완전 차단 (조준 실습 중 불필요한 실패 방지)
                  if (isTutorialMode && tutorialStepRef.current <= 2) {
                    return;
                  }
                  // 🛡️ 빗맞힘 에러는:
                  // 1) 바늘을 충분히 높이 들었다가 (hasReachedApex === true)
                  // 2) 클릭 후 280ms 유예 시간이 지났고 (!isDragGracePeriod)
                  // 3) 실제로 아래로 내려꽂는 중(isMovingDownward)에만 발생!
                  // (바늘을 집어 들기 위해 클릭하는 순간에는 절대 빗맞힘 에러가 나지 않음!)
                  if (state.hasReachedApex && !isDragGracePeriod && isMovingDownward) {
                    safeOnErrorRef.current(
                      isFront
                        ? "구멍을 빗맞혔어요! 휠/WS키 또는 버튼으로 구멍을 조준해 보세요!"
                        : "잘 보이지 않아 바느질을 실수할 때에는 시점을 변경해보세요!"
                    );
                    return;
                  }
                }
              }
            }
          }
        }

        // B. 콕 찌르기 (PIERCING) 단계
        else if (state.actionPhase === "PIERCING") {
          state.pierceProgress += 0.055;

          const isButtonCourse = courseId === "button";
          const targetSurfaceY = isButtonCourse 
            ? 0.63 
            : (courseId === "backstitch" && totalHoles === 12 && isFront ? 0.20 : (isFront ? 0.045 : -0.045));
          const targetHoleSurface = new THREE.Vector3(nextHole.x, targetSurfaceY, nextHole.z);

          let pierceDir: THREE.Vector3;
          if (isButtonCourse) {
            pierceDir = new THREE.Vector3(0, isFront ? -1.0 : 1.0, 0);
          } else {
            pierceDir = new THREE.Vector3(isBackward ? -0.45 : 0.45, isFront ? -1.0 : 1.0, 0).normalize();
          }

          const needleCurrentPos = targetHoleSurface.clone().add(pierceDir.clone().multiplyScalar((state.pierceProgress - 0.5) * 1.5));
          state.needlePos.copy(needleCurrentPos);

          if (needleGroupRef.current) {
            needleGroupRef.current.position.copy(state.needlePos);
            needleGroupRef.current.lookAt(state.needlePos.clone().add(pierceDir));
          }

          if (state.pierceProgress >= 1.0) {
            state.actionPhase = "PASSED";
            onHolePassedRef.current(toIdx);
          }
        }

        // C. 동적 실 렌더링 (시작 시 바늘귀 실 꼬리 vs 관통 후 평행 두 겹 실)
        if (needleGroupRef.current) {
          needleGroupRef.current.updateMatrixWorld(true);
          const needleMat = needleGroupRef.current.matrixWorld;

          const localZAxis = new THREE.Vector3(0, 0, 1).transformDirection(needleMat).normalize();

          // 🪡 바늘 맨 뒤쪽 꽁무니 끝점 (바늘 엉덩이)
          const needleTailWorld = new THREE.Vector3(0, 0, -0.62).applyMatrix4(needleMat);

          // 🪡 단추달기 천 밑(안면) 시작일 때만 꽁무니 실 꼬리 단독 모드, 그 외 모든 코스는 출발 구멍과 꽁무니 직결!
          const isNeedleTailOnly = courseId === "button" && completedStitchesRef.current.length === 0 && !isFront;

          let tubeGeo: THREE.TubeGeometry;

          if (isNeedleTailOnly) {
            // 🔘 [단추달기 천 밑 시작] 바늘 꽁무니에서 뒤쪽으로 부드럽게 늘어지는 실 꼬리
            const needleBackDir = localZAxis.clone().negate();
            const sagVec = new THREE.Vector3(0, isFront ? -0.35 : 0.35, 0);

            const tailMid = needleTailWorld.clone().add(needleBackDir.clone().multiplyScalar(0.6)).add(sagVec.clone().multiplyScalar(0.5));
            const tailEnd = needleTailWorld.clone().add(needleBackDir.clone().multiplyScalar(1.2)).add(sagVec);

            const threadCurve = new THREE.CatmullRomCurve3([
              needleTailWorld,
              tailMid,
              tailEnd,
            ], false, "centripetal", 0.4);

            tubeGeo = new THREE.TubeGeometry(threadCurve, 16, 0.022, 8, false);
          } else if (isTutorialMode && tutorialStepRef.current === 4 && nextHole) {
            // 🎓 [튜토리얼 4단계] 1번->2번 겉면 1땀이 완성되었으므로, 2번 구멍 밑면(-0.135)에서 바늘 꽁무니로 쏙 연결
            const startCenter = new THREE.Vector3(nextHole.x, -0.135, nextHole.z);
            const midVec = needleTailWorld.clone().sub(startCenter);
            const cp1 = startCenter.clone().add(midVec.clone().multiplyScalar(0.5));

            const threadCurve = new THREE.CatmullRomCurve3([
              startCenter,
              cp1,
              needleTailWorld,
            ], false, "centripetal", 0.4);

            tubeGeo = new THREE.TubeGeometry(threadCurve, 12, 0.022, 8, false);
          } else {
            // 🧵 [깔끔한 바늘 꽁무니 직결 실] 출발 구멍(fromHole)에서 바늘 꽁무니까지 매끄럽게 연결되는 실!
            let startY = isFront ? 0.135 : -0.135;
            if (courseId === "button" && isFront) {
              startY = 0.63; // 🔘 단추 윗면 구멍 표면 높이!
            } else if (courseId === "backstitch" && isFront) {
              startY = 0.205; // 🌟 3화 패치 윗면 위로 확실하게 실이 노출!
            }
            const startCenter = new THREE.Vector3(fromHole.x, startY, fromHole.z);

            const midVec = needleTailWorld.clone().sub(startCenter);
            const dist = midVec.length();
            const sagAmount = Math.max(0.03, 0.16 - dist * 0.015);
            const sagVec = new THREE.Vector3(0, isFront ? -sagAmount : sagAmount, 0);

            const cp1 = startCenter.clone().add(midVec.clone().multiplyScalar(0.33)).add(sagVec);
            const cp2 = startCenter.clone().add(midVec.clone().multiplyScalar(0.66)).add(sagVec.clone().multiplyScalar(0.6));

            const threadCurve = new THREE.CatmullRomCurve3([
              startCenter,
              cp1,
              cp2,
              needleTailWorld,
            ], false, "centripetal", 0.4);

            tubeGeo = new THREE.TubeGeometry(threadCurve, 24, 0.022, 8, false);
          }

          if (dynamicThreadMeshRef.current) {
            dynamicThreadMeshRef.current.geometry.dispose();
            dynamicThreadMeshRef.current.geometry = tubeGeo;
            dynamicThreadMeshRef.current.renderOrder = 10;
            (dynamicThreadMeshRef.current.material as THREE.MeshStandardMaterial).color.set(threadColor);
          }
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // 🌟 마우스 휠 리스너 (W/S 키와 완벽히 일치: 휠 위 = 화면 위 / 휠 아래 = 화면 아래)
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isTutorialLockedRef.current) return;
      const state = sewingStateRef.current;
      const curStep = currentStepRef.current;
      const fromIdx = curStep ? curStep.fromIndex : state.currentHoleIndex;
      const isFront = curStep ? curStep.isFront : fromIdx % 2 === 0;
      const sign = isFront ? 1 : -1;
      const delta = e.deltaY * 0.0035 * sign;
      state.offsetZ = THREE.MathUtils.clamp(state.offsetZ + delta, -3.5, 3.5);
    };
    container.addEventListener("wheel", handleWheel, { passive: false });

    // 🌟 키보드 W/S / 방향키 리스너 (W: 화면 위쪽, S: 화면 아래쪽)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTutorialLockedRef.current) return;
      const state = sewingStateRef.current;
      const curStep = currentStepRef.current;
      const fromIdx = curStep ? curStep.fromIndex : state.currentHoleIndex;
      const isFront = curStep ? curStep.isFront : fromIdx % 2 === 0;
      const sign = isFront ? 1 : -1;
      const step = 0.18 * sign;

      if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") {
        state.offsetZ = THREE.MathUtils.clamp(state.offsetZ - step, -3.5, 3.5);
      } else if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") {
        state.offsetZ = THREE.MathUtils.clamp(state.offsetZ + step, -3.5, 3.5);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    const handleGlobalPointerUp = () => {
      if (orbitStateRef.current.isOrbiting) {
        orbitStateRef.current.isOrbiting = false;
      }
      if (sewingStateRef.current.isDragging) {
        // 🎓 태블릿 터치 및 마우스 드래그 구제: 손을 떼는 순간 바늘이 위로 들려 있었다면 1단계 통과 즉각 인정!
        if (isTutorialMode && tutorialStepRef.current === 1 && !tutorialTriggeredRef.current) {
          const state = sewingStateRef.current;
          const currentH = Math.max(state.needlePos.y, state.needleTargetPos.y);
          if (currentH >= 0.70) {
            tutorialTriggeredRef.current = true;
            onTutorialEventRef.current?.("NEEDLE_LIFTED");
          }
        }
        sewingStateRef.current.isDragging = false;
      }
      onPointerUpRef.current();
    };
    window.addEventListener("pointerup", handleGlobalPointerUp);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointerup", handleGlobalPointerUp);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [totalHoles, isCurve, threadColor, needleSkinId, fabricSkin?.id, holePositions, isTutorialMode, courseId, currentLevel]);

  // 🎨 원단 스킨 변경 실시간 연동 훅 (3D 씬 파괴 없이 텍스처만 즉각 갱신!)
  useEffect(() => {
    if (!frontTextureRef.current || !backTextureRef.current) return;
    const patternType = fabricSkin?.patternType || "cotton";

    const frontBg = fabricSkin?.frontBg || "#F6EFE6";
    const frontLine = fabricSkin?.frontLine || "#C49A6C";
    const backBg = fabricSkin?.backBg || "#ECE2D3";
    const backLine = fabricSkin?.backLine || "#B38656";

    const isPouch = courseId === "running" && currentLevel === 2 && totalHoles === 14;
    const newFrontCanvas = createFabricTexture(frontBg, frontLine, patternType, true, isPouch);
    const newBackCanvas = createFabricTexture(backBg, backLine, patternType, false, isPouch);

    frontTextureRef.current.image = newFrontCanvas;
    frontTextureRef.current.needsUpdate = true;
    backTextureRef.current.image = newBackCanvas;
    backTextureRef.current.needsUpdate = true;
  }, [fabricSkin?.id, courseId, currentLevel, totalHoles]);

  // 🪡 바늘 스킨 변경 실시간 연동 훅 (3D 씬 파괴 없이 바늘 머티리얼 즉각 갱신!)
  useEffect(() => {
    if (!needleGroupRef.current) return;
    applyNeedleSkin(needleGroupRef.current, needleSkinId);
  }, [needleSkinId]);

  // 완성된 땀 렌더링 (st.isFront 그대로 반영)
  useEffect(() => {
    if (!completedStitchesGroupRef.current) return;
    const group = completedStitchesGroupRef.current;
    disposeGroup(group);

    completedStitches.forEach((st) => {
      // 🛡️ 실기둥 스텝 땀은 단추 밑 입체 기둥이므로 단추 윗면 땀 렌더링에서 제외 (대각선 실 버그 방지)
      if (courseId === "button" && st.isShankWrap) return;

      const p1 = holePositions[st.fromIndex];
      const p2 = holePositions[st.toIndex];
      if (!p1 || !p2) return;

      const isFront = st.isFront;
      let surfaceY = isFront ? 0.135 : -0.135;
      if (courseId === "button" && isFront) {
        surfaceY = 0.63; // 단추 위 표면 높이
      } else if (courseId === "backstitch" && isFront) {
        surfaceY = 0.205; // 🌟 3화 패치 윗면 위로 확실하게 실이 노출!
      }

      const startPt = new THREE.Vector3(p1.x, surfaceY, p1.z);
      const endPt = new THREE.Vector3(p2.x, surfaceY, p2.z);

      let stitchCurve: THREE.Curve<THREE.Vector3>;
      if (courseId === "whip") {
        // 🌀 진짜 감침질: 천의 앞 모서리 바깥을 360° 둥글게 감싸 도는 사선 나선형 스플라인!
        const midX = (p1.x + p2.x) * 0.5;
        const maxEdgeZ = Math.max(p1.z, p2.z);
        const pts = [
          new THREE.Vector3(p1.x, 0.22, p1.z),
          new THREE.Vector3(p1.x + (p2.x - p1.x) * 0.25, 0.20, maxEdgeZ + 0.7),
          new THREE.Vector3(midX, 0, maxEdgeZ + 1.15),
          new THREE.Vector3(p1.x + (p2.x - p1.x) * 0.75, -0.20, maxEdgeZ + 0.7),
          new THREE.Vector3(p2.x, -0.22, p2.z),
        ];
        stitchCurve = new THREE.CatmullRomCurve3(pts, false, "centripetal", 0.5);
      } else {
        stitchCurve = new THREE.LineCurve3(startPt, endPt);
      }

      const tubeGeo = new THREE.TubeGeometry(stitchCurve, courseId === "whip" ? 16 : 6, 0.042, 6, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: threadColor,
        roughness: 0.35,
      });
      const stitchMesh = new THREE.Mesh(tubeGeo, tubeMat);
      stitchMesh.renderOrder = 10; // 패치 메쉬 위에 항상 선명하게 렌더링
      stitchMesh.castShadow = true;
      group.add(stitchMesh);

      // 🔘 단추 달기일 때: 단추 구멍(0.63)과 천 구멍(0.135)을 잇는 수직 실 다발 2가닥 추가!
      if (courseId === "button" && isFront) {
        const v1Geo = new THREE.CylinderGeometry(0.028, 0.028, 0.50, 8);
        const v1Mesh = new THREE.Mesh(v1Geo, tubeMat);
        v1Mesh.position.set(p1.x, 0.38, p1.z);
        group.add(v1Mesh);

        const v2Geo = new THREE.CylinderGeometry(0.028, 0.028, 0.50, 8);
        const v2Mesh = new THREE.Mesh(v2Geo, tubeMat);
        v2Mesh.position.set(p2.x, 0.38, p2.z);
        group.add(v2Mesh);
      }
    });

    // 🌀 실기둥 단계 완료 후: 단추 밑 꼿꼿한 실기둥 코일 메쉬 렌더링!
    if (courseId === "button") {
      const hasWrapStep = completedStitches.some((st) => st.isShankWrap) || completedStitches.length >= (totalHoles === 2 ? 6 : 8);
      if (hasWrapStep) {
        const shankCylGeo = new THREE.CylinderGeometry(0.18, 0.20, 0.50, 16);
        const shankMat = new THREE.MeshStandardMaterial({
          color: threadColor,
          roughness: 0.4,
        });
        const shankMesh = new THREE.Mesh(shankCylGeo, shankMat);
        shankMesh.position.set(0, 0.29, 0);
        group.add(shankMesh);

        // 🌀 실기둥 래핑 링들: 3회 감기 표준에 맞춘 정밀 3단 도톰 코일 질감!
        const coilHeights = [0.16, 0.28, 0.40];
        coilHeights.forEach((y) => {
          const coilRingGeo = new THREE.TorusGeometry(0.20, 0.042, 8, 24);
          const coilRing = new THREE.Mesh(coilRingGeo, shankMat);
          coilRing.rotation.x = Math.PI / 2;
          coilRing.position.set(0, y, 0);
          group.add(coilRing);
        });
      }
    }
  }, [completedStitches, holePositions, threadColor, courseId, totalHoles]);

  // 포인터 이벤트
  const handlePointerDownInternal = (e: React.PointerEvent) => {
    e.preventDefault();
    if (isTutorialLockedRef.current) return;

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    // 📱 두 손가락 이상 터치 시: 즉시 360도 카메라 시점 회전으로 자동 전환!
    if (activePointersRef.current.size >= 2) {
      orbitStateRef.current.isOrbiting = true;
      orbitStateRef.current.prevX = e.clientX;
      orbitStateRef.current.prevY = e.clientY;
      orbitStateRef.current.autoTransition = false;
      sewingStateRef.current.isDragging = false;
      return;
    }

    // 마우스 우클릭(2) 또는 태블릿 시점 회전 모드가 켜진 경우
    if (e.button === 2 || (controlModeRef.current === "tablet" && orbitModeRef.current)) {
      orbitStateRef.current.isOrbiting = true;
      orbitStateRef.current.prevX = e.clientX;
      orbitStateRef.current.prevY = e.clientY;
      orbitStateRef.current.autoTransition = false;
      return;
    }

    // 마우스 좌클릭(0) 또는 태블릿 기본 바늘 드래그
    if (e.button === 0) {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      // 상단 안내 바 영역(상단 20%) 침범을 막기 위해 ny의 상한선을 0.65로 클램핑
      const rawNy = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      const ny = THREE.MathUtils.clamp(rawNy, -0.95, 0.65);

      const state = sewingStateRef.current;
      state.mouseNDC.set(nx, ny);
      state.isDragging = true;
      state.startDragX = e.clientX;
      dragStartTimeRef.current = Date.now();
      prevNeedleYRef.current = state.needlePos.y;
      onPointerDown();
    }
  };

  const handlePointerMoveInternal = (e: React.PointerEvent) => {
    if (activePointersRef.current.has(e.pointerId)) {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // 🛡️ 포인터 버튼을 누르고 있지 않은데 드래그 상태가 남아있다면 즉시 강제 해제
    if (e.buttons === 0 && activePointersRef.current.size === 0) {
      if (sewingStateRef.current.isDragging || orbitStateRef.current.isOrbiting) {
        handlePointerUpInternal(e);
      }
      return;
    }

    if (!mountRef.current) return;

    if (orbitStateRef.current.isOrbiting) {
      const dx = e.clientX - orbitStateRef.current.prevX;
      const dy = e.clientY - orbitStateRef.current.prevY;
      orbitStateRef.current.prevX = e.clientX;
      orbitStateRef.current.prevY = e.clientY;

      orbitStateRef.current.theta -= dx * 0.008;
      orbitStateRef.current.phi = THREE.MathUtils.clamp(
        orbitStateRef.current.phi - dy * 0.008,
        0.1,
        Math.PI - 0.1
      );

      if (isTutorialMode && tutorialStepRef.current === 4 && !tutorialTriggeredRef.current) {
        tutorialAccumRotationRef.current += (Math.abs(dx) + Math.abs(dy)) * 0.008;
        if (tutorialAccumRotationRef.current >= 0.45) {
          tutorialTriggeredRef.current = true;
          onTutorialEventRef.current?.("VIEW_ROTATED");
        }
      }
      return;
    }

    if (sewingStateRef.current.isDragging) {
      const rect = mountRef.current.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const rawNy = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      const ny = THREE.MathUtils.clamp(rawNy, -0.95, 0.65);
      sewingStateRef.current.mouseNDC.set(nx, ny);
    }
  };

  const handlePointerUpInternal = (e?: React.PointerEvent) => {
    if (e) {
      activePointersRef.current.delete(e.pointerId);
      if (e.currentTarget && typeof e.currentTarget.releasePointerCapture === "function") {
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {}
      }
    } else {
      activePointersRef.current.clear();
    }

    if (activePointersRef.current.size === 0) {
      if (orbitStateRef.current.isOrbiting) {
        orbitStateRef.current.isOrbiting = false;
      }
      if (sewingStateRef.current.isDragging) {
        sewingStateRef.current.isDragging = false;
      }
      onPointerUp();
    }
  };

  // 롱프레스 연속 조준 타이머 핸들러
  const startContinuousNudge = (direction: "up" | "down") => {
    handleNudgeOffsetZ(direction);
    if (nudgeIntervalRef.current) clearInterval(nudgeIntervalRef.current);
    nudgeIntervalRef.current = setInterval(() => {
      handleNudgeOffsetZ(direction);
    }, 110);
  };

  const stopContinuousNudge = () => {
    if (nudgeIntervalRef.current) {
      clearInterval(nudgeIntervalRef.current);
      nudgeIntervalRef.current = null;
    }
  };

  return (
    <div
      ref={mountRef}
      className="relative w-full h-[580px] rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing border-[5px] border-[#6E4720] shadow-2xl touch-none select-none"
      onPointerDown={handlePointerDownInternal}
      onPointerMove={handlePointerMoveInternal}
      onPointerUp={handlePointerUpInternal}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 🌟 우측 상단: 태블릿 전용 뷰 옵션 툴바 (오토스냅, 태블릿 시점 회전) */}
      {controlMode === "tablet" && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-30 pointer-events-auto">
          {/* 🪡 바늘 조작 / 🔄 시점 회전 토글 (태블릿 전용) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOrbitMode((prev) => !prev);
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-black text-xs border-2 shadow-[2px_2px_0_0_#6E4720] transition-all cursor-pointer ${
              orbitMode
                ? "bg-[#2A9D8F] text-white border-[#1F6E64] animate-pulse"
                : "bg-white/90 backdrop-blur-md text-[#5C3A16] border-[#6E4720] hover:bg-amber-50"
            }`}
          >
            <span className="text-sm">{orbitMode ? "🔄" : "🪡"}</span>
            <span>{orbitMode ? "시점 회전" : "바늘 조작"}</span>
          </button>

          {/* 🎯 스마트 풀 오토스냅 토글 (태블릿 전용) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setAutoSnap((prev) => !prev);
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-black text-xs border-2 shadow-[2px_2px_0_0_#6E4720] transition-all cursor-pointer ${
              autoSnap
                ? "bg-emerald-600 text-white border-emerald-800"
                : "bg-stone-200/90 backdrop-blur-md text-stone-700 border-stone-400"
            }`}
          >
            <span>{autoSnap ? "🎯 오토스냅: ON" : "🎯 오토스냅: OFF"}</span>
          </button>
        </div>
      )}

      {/* 📱 태블릿 모드 온스크린 컨트롤러 오버레이 */}
      {controlMode === "tablet" && (
        <>

          {/* 🎮 좌측 하단: [▲ 앞] / [▼ 뒤] 컴팩트 미니 D-Pad 조준기 (하단 바와 간섭 제로) */}
          <div className="absolute left-3.5 bottom-12 flex flex-col items-center z-30 pointer-events-auto">
            <div className="flex flex-col gap-1 bg-white/85 backdrop-blur-md p-1 rounded-2xl border-2 border-[#6E4720] shadow-[3px_3px_0_0_#6E4720]">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  startContinuousNudge("up");
                }}
                onPointerUp={(e) => {
                  e.stopPropagation();
                  stopContinuousNudge();
                }}
                onPointerLeave={stopContinuousNudge}
                className="w-11 h-10 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-[#5C3A16] font-black text-sm rounded-xl border border-[#6E4720] shadow-2xs active:translate-y-0.5 transition-all flex flex-col items-center justify-center cursor-pointer select-none"
                title="앞(위)으로 조준"
              >
                <span className="text-xs">▲</span>
                <span className="text-[9px] -mt-1 font-black">앞</span>
              </button>

              <button
                type="button"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  startContinuousNudge("down");
                }}
                onPointerUp={(e) => {
                  e.stopPropagation();
                  stopContinuousNudge();
                }}
                onPointerLeave={stopContinuousNudge}
                className="w-11 h-10 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-[#5C3A16] font-black text-sm rounded-xl border border-[#6E4720] shadow-2xs active:translate-y-0.5 transition-all flex flex-col items-center justify-center cursor-pointer select-none"
                title="뒤(아래)로 조준"
              >
                <span className="text-[9px] -mb-1 font-black">뒤</span>
                <span className="text-xs">▼</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// 🌟 바늘 스킨 4종별 정밀 3D 머티리얼 속성 (PBR + 자체 발광 광채)
function getNeedleMaterialProps(skinId: string) {
  if (skinId === "gold") {
    // 👑 24K 전설의 황금 바늘: 눈부신 24K 순금 메탈릭 반사광 & 찬란한 스펙큘러 블링블링 하이라이트
    return {
      color: new THREE.Color("#FFF066"),
      emissive: new THREE.Color("#F59E0B"),
      emissiveIntensity: 0.40,
      metalness: 0.95,
      roughness: 0.06,
    };
  } else if (skinId === "crystal") {
    // 💎 오로라 크리스탈 바늘: 신비로운 보랏빛 오로라 보석 광채
    return {
      color: new THREE.Color("#C084FC"),
      emissive: new THREE.Color("#9333EA"),
      emissiveIntensity: 0.48,
      metalness: 0.35,
      roughness: 0.10,
    };
  } else if (skinId === "silver") {
    // ✨ 신비한 은빛 바늘: 눈부신 백은색과 푸른빛이 감도는 은은한 은빛 광채
    return {
      color: new THREE.Color("#F8FAFC"),
      emissive: new THREE.Color("#64748B"),
      emissiveIntensity: 0.25,
      metalness: 0.70,
      roughness: 0.14,
    };
  }
  // 🪡 basic: 전통 무쇠 바늘 (중후하고 단단한 스틸 철제 무쇠빛)
  return {
    color: new THREE.Color("#64748B"),
    emissive: new THREE.Color("#1E293B"),
    emissiveIntensity: 0.06,
    metalness: 0.50,
    roughness: 0.35,
  };
}

// 🪡 바늘 그룹 내 메쉬 머티리얼 실시간 적용 헬퍼
function applyNeedleSkin(group: THREE.Group, skinId: string) {
  const props = getNeedleMaterialProps(skinId);
  group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      child.material.color.copy(props.color);
      child.material.emissive.copy(props.emissive);
      child.material.emissiveIntensity = props.emissiveIntensity;
      child.material.metalness = props.metalness;
      child.material.roughness = props.roughness;
      child.material.needsUpdate = true;
    }
  });
}

// 🪡 길쭉하고 시원한 타원형 슬릿 바늘귀를 갖춘 정밀 일체형 손바느질 바늘 3D 생성 함수
function create3DNeedle(skinId: string): THREE.Group {
  const needleGroup = new THREE.Group();

  const props = getNeedleMaterialProps(skinId);
  const needleMat = new THREE.MeshStandardMaterial({
    color: props.color,
    emissive: props.emissive,
    emissiveIntensity: props.emissiveIntensity,
    metalness: props.metalness,
    roughness: props.roughness,
  });

  // 1. 이미지의 바늘 2D 외곽선 (시원하게 길쭉한 헤드)
  const needleShape = new THREE.Shape();
  needleShape.moveTo(0, 0.72);
  needleShape.lineTo(0.046, -0.22);
  needleShape.lineTo(0.052, -0.42);
  needleShape.absarc(0, -0.42, 0.052, 0, Math.PI, false);
  needleShape.lineTo(-0.046, -0.22);
  needleShape.lineTo(0, 0.72);

  // 2. 바늘귀: 시원하고 길쭉한 슬릿 타원형 구멍 (세로 길이 0.125)
  const eyeHolePath = new THREE.Path();
  eyeHolePath.absellipse(0, -0.42, 0.024, 0.125, 0, Math.PI * 2, true, 0);
  needleShape.holes.push(eyeHolePath);

  // 3. 둥글고 매끄러운 3D 압출
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.035,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    bevelSize: 0.012,
    bevelThickness: 0.014,
  };

  const needleGeo = new THREE.ExtrudeGeometry(needleShape, extrudeSettings);
  needleGeo.center();

  const needleMesh = new THREE.Mesh(needleGeo, needleMat);
  needleMesh.rotation.x = Math.PI / 2;
  needleMesh.rotation.y = Math.PI;
  needleMesh.castShadow = true;
  needleGroup.add(needleMesh);

  return needleGroup;
}

// 🌟 1024x512 초고화질 리얼 핸드메이드 펠트 패브릭 텍스처 엔진
function createFabricTexture(
  bgColor: string,
  patternColor: string,
  patternType: "cotton" | "grid" | "denim" | "gingham" | "dots" | "herringbone" | "carbon" | "flower" | "stripe" | "quilt" = "cotton",
  isFront: boolean = true,
  skipBorderStitch: boolean = false
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const w = 1024;
  const h = 512;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // 1. 따뜻하고 포근한 펠트 베이스 바탕 채우기
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  // 2. 도톰한 펠트 원단 단면의 쿠션 입체감 (안쪽으로 은은한 모서리 섀도우)
  const edgeGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.55);
  edgeGrad.addColorStop(0, "rgba(0,0,0,0)");
  edgeGrad.addColorStop(0.85, "rgba(0,0,0,0.03)");
  edgeGrad.addColorStop(1, "rgba(0,0,0,0.12)");
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, 0, w, h);

  // 3. 보슬보슬한 양모/목화 펠트 섬유 (Heather Wool Felt Fibers) 절차적 생성
  // 밝은 단모 털(울 솜털) 1,000개
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1.2;
  ctx.lineCap = "round";
  for (let i = 0; i < 1000; i++) {
    const rx = (i * 137.5) % w;
    const ry = (i * 269.3) % h;
    const len = 4 + (i % 7);
    const angle = ((i * 47) % 360) * (Math.PI / 180);
    ctx.globalAlpha = 0.12 + ((i % 5) * 0.04);
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + Math.cos(angle) * len, ry + Math.sin(angle) * len);
    ctx.stroke();
  }

  // 어두운 펠트 헤더 섬유(천연 모화 슬럽) 800개
  ctx.strokeStyle = patternColor;
  ctx.lineWidth = 1.0;
  for (let i = 0; i < 800; i++) {
    const rx = (i * 223.7) % w;
    const ry = (i * 181.1) % h;
    const len = 3 + (i % 6);
    const angle = ((i * 83) % 360) * (Math.PI / 180);
    ctx.globalAlpha = 0.08 + ((i % 4) * 0.03);
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + Math.cos(angle) * len, ry + Math.sin(angle) * len);
    ctx.stroke();
  }
  ctx.globalAlpha = 1.0;

  // 4. 패턴별 고유 스타일 렌더링
  ctx.strokeStyle = patternColor;
  ctx.fillStyle = patternColor;

  if (patternType === "denim") {
    // 👖 헤비 인디고 데님: 리얼 사선 능직 Twill & 씨실 스펙클
    ctx.lineWidth = 4.0;
    ctx.globalAlpha = 0.28;
    for (let i = -w; i <= w * 2; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + h, h);
      ctx.stroke();
    }
  } else if (patternType === "gingham") {
    // 🏁 선셋 옐로우 깅엄 체크
    const blockSize = 64;
    ctx.globalAlpha = 0.24;
    for (let x = 0; x < w; x += blockSize) {
      for (let y = 0; y < h; y += blockSize) {
        if ((Math.floor(x / blockSize) + Math.floor(y / blockSize)) % 2 === 0) {
          ctx.fillRect(x, y, blockSize, blockSize);
        }
      }
    }
  } else if (patternType === "dots") {
    // 🌸 러블리 벚꽃 도트
    const spacing = 56;
    for (let x = 28; x < w; x += spacing) {
      for (let y = 28; y < h; y += spacing) {
        ctx.globalAlpha = 0.38;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (patternType === "stripe") {
    // 🪻 라벤더 핀스트라이프 (정갈한 수직 줄무늬)
    ctx.lineWidth = 3.5;
    ctx.globalAlpha = 0.35;
    for (let x = 12; x < w; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
  } else if (patternType === "flower") {
    // 🌷 빈티지 레트로 플라워 (앙증맞은 5엽 미니 꽃과 잎사귀)
    const stepX = 64;
    const stepY = 64;
    for (let x = 32; x < w; x += stepX) {
      for (let y = 32; y < h; y += stepY) {
        const ox = ((Math.floor(y / stepY) % 2) * 32);
        const fx = x + ox;
        if (fx >= w) continue;
        // 잎사귀 (올리브 그린)
        ctx.fillStyle = "#16A34A";
        ctx.globalAlpha = 0.50;
        ctx.beginPath();
        ctx.ellipse(fx + 7, y + 6, 5, 2.5, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        // 꽃잎 5개 (레드)
        ctx.fillStyle = patternColor;
        ctx.globalAlpha = 0.60;
        for (let a = 0; a < 5; a++) {
          const angle = (a * 72) * (Math.PI / 180);
          ctx.beginPath();
          ctx.arc(fx + Math.cos(angle) * 4.5, y + Math.sin(angle) * 4.5, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        // 꽃 중심 (골드 옐로우)
        ctx.fillStyle = "#F59E0B";
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(fx, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (patternType === "herringbone") {
    // 🌲 올리브 클래식 헤링본
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.30;
    const colW = 40;
    for (let x = 0; x < w; x += colW) {
      const isUp = Math.floor(x / colW) % 2 === 0;
      for (let y = 0; y < h; y += 14) {
        ctx.beginPath();
        if (isUp) {
          ctx.moveTo(x, y);
          ctx.lineTo(x + colW, y + 12);
        } else {
          ctx.moveTo(x, y + 12);
          ctx.lineTo(x + colW, y);
        }
        ctx.stroke();
      }
    }
  } else if (patternType === "carbon") {
    // 🌌 모던 차콜 카본 격자
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.25;
    for (let i = 0; i <= w; i += 24) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h);
      ctx.stroke();
    }
    for (let i = 0; i <= h; i += 24) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(w, i);
      ctx.stroke();
    }
  } else if (patternType === "quilt") {
    // 👑 최고급 빈티지 패치워크 퀼트: 초경량 100% 동기식 벡터 렌더러 (로딩 0초, 용량 0, 깜빡임 0%)
    const cols = 8;
    const rows = 4;
    const pw = w / cols; // 128px
    const ph = h / rows; // 128px

    // 윗면(화사한 빈티지 파스텔) vs 아랫면(차분하게 톤다운된 세피아 린넨 안감) 전용 감성 팔레트
    const frontPalette = [
      "#F3C882", // 따뜻한 머스타드 오커
      "#E2856E", // 빈티지 테라코타 코랄
      "#8AA782", // 세이지 올리브 그린
      "#769BB0", // 더스티 파우더 블루
      "#F7ECCB", // 바닐라 버터밀크
      "#CE8B9D", // 앤틱 로즈 핑크
      "#A592B8", // 빈티지 라벤더 더스크
      "#CCA172", // 골든 허니 캐러멜
    ];

    const backPalette = [
      "#FFE4D6", // 🍑 화사한 베이비 살구 피치
      "#FFF3B0", // 🍋 달콤한 레몬 버터 옐로우
      "#C8E6C9", // 🌿 산뜻한 소프트 민트 그린
      "#BBDEFB", // 💧 맑은 베이비 파우더 블루
      "#F8BBD0", // 🍓 사랑스러운 스트로베리 밀크 핑크
      "#E1BEE7", // 🪻 부드러운 라벤더 마카롱
      "#FFE0B2", // 🥐 따뜻한 밀크티 바닐라
      "#B2DFDB", // 🫧 청량한 소프트 아쿠아
    ];

    const palette = isFront ? frontPalette : backPalette;
    const stitchColor = isFront ? "#4A2E18" : "#8C4F44"; // 앞면: 앤틱 다크브라운, 뒷면: 따뜻한 로즈 테라코타 브라운

    // 1) 32개 사각 패치 블록 및 고유 빈티지 모티프 드로잉
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const px = c * pw;
        const py = r * ph;
        const colorIdx = (c * 3 + r * 5 + 1) % palette.length;
        const patchBg = palette[colorIdx];

        // 패치 바탕색
        ctx.fillStyle = patchBg;
        ctx.fillRect(px, py, pw, ph);

        // 패치 내부 미니 모티프 (잔꽃, 도트, 깅엄 체크, 사선 스트라이프)
        const motifType = (c * 2 + r * 3) % 5;
        ctx.save();
        ctx.beginPath();
        ctx.rect(px, py, pw, ph);
        ctx.clip();

        if (motifType === 0) {
          // 🌸 앙증맞은 4개의 미니 플로럴 잔꽃
          const flowerPositions = [
            { x: px + 36, y: py + 36 },
            { x: px + 92, y: py + 36 },
            { x: px + 36, y: py + 92 },
            { x: px + 92, y: py + 92 },
          ];
          for (const pos of flowerPositions) {
            // 올리브/민트 잎사귀
            ctx.fillStyle = isFront ? "#658252" : "#5B9279";
            ctx.globalAlpha = 0.50;
            ctx.beginPath();
            ctx.ellipse(pos.x + 8, pos.y + 6, 5, 2.5, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();

            // 꽃잎 5개 (앞면: 앤틱 레드/오렌지, 뒷면: 상큼한 로즈핑크/피치샤벳)
            const frontFlower = colorIdx % 2 === 0 ? "#C95D63" : "#E28743";
            const backFlower = colorIdx % 2 === 0 ? "#FF6B8B" : "#FF9248";
            ctx.fillStyle = isFront ? frontFlower : backFlower;
            ctx.globalAlpha = 0.75;
            for (let a = 0; a < 5; a++) {
              const ang = (a * 72) * (Math.PI / 180);
              ctx.beginPath();
              ctx.arc(pos.x + Math.cos(ang) * 5.5, pos.y + Math.sin(ang) * 5.5, 4.2, 0, Math.PI * 2);
              ctx.fill();
            }
            // 꽃술 도트
            ctx.fillStyle = isFront ? "#FFEAA7" : "#FFF9C4";
            ctx.globalAlpha = 0.95;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (motifType === 1) {
          // ⚪ 정갈한 폴카 도트 (화사하고 깨끗한 화이트 펄)
          ctx.fillStyle = "#FFFFFF";
          ctx.globalAlpha = isFront ? 0.35 : 0.45;
          const dStep = 32;
          for (let dx = px + 16; dx < px + pw; dx += dStep) {
            for (let dy = py + 16; dy < py + ph; dy += dStep) {
              ctx.beginPath();
              ctx.arc(dx, dy, 5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        } else if (motifType === 2) {
          // 🏁 마이크로 깅엄 체크
          ctx.fillStyle = isFront ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.06)";
          const checkSize = 16;
          for (let cx = px; cx < px + pw; cx += checkSize) {
            for (let cy = py; cy < py + ph; cy += checkSize) {
              if ((Math.floor(cx / checkSize) + Math.floor(cy / checkSize)) % 2 === 0) {
                ctx.fillRect(cx, cy, checkSize, checkSize);
              }
            }
          }
        } else if (motifType === 3) {
          // 📐 빈티지 사선 핀스트라이프
          ctx.strokeStyle = isFront ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.25)";
          ctx.lineWidth = 2.5;
          for (let s = -ph; s < pw + ph; s += 18) {
            ctx.beginPath();
            ctx.moveTo(px + s, py);
            ctx.lineTo(px + s + ph, py + ph);
            ctx.stroke();
          }
        }
        ctx.restore();

        // 2) 엠보싱 섀도우 (패치별 도톰한 쿠션감)
        const patchGrad = ctx.createRadialGradient(px + pw / 2, py + ph / 2, pw * 0.25, px + pw / 2, py + ph / 2, pw * 0.55);
        patchGrad.addColorStop(0, "rgba(255,255,255,0.12)");
        patchGrad.addColorStop(1, "rgba(0,0,0,0.10)");
        ctx.fillStyle = patchGrad;
        ctx.fillRect(px, py, pw, ph);

        // 3) 각 패치 테두리의 정갈한 손바느질 러닝 스티치 (Handmade Stitch 땀)
        const m = 8; // 패치 테두리 안쪽 8px 오프셋
        ctx.save();
        ctx.setLineDash([7, 5]); // 7px 실땀 + 5px 간격
        ctx.lineWidth = 2.0;

        // 스티치 엠보싱 그림자
        ctx.strokeStyle = "rgba(0,0,0,0.22)";
        ctx.strokeRect(px + m + 0.8, py + m + 0.8, pw - m * 2, ph - m * 2);

        // 메인 스티치 실
        ctx.strokeStyle = stitchColor;
        ctx.globalAlpha = 0.85;
        ctx.strokeRect(px + m, py + m, pw - m * 2, ph - m * 2);
        ctx.restore();
      }
    }

    // 4) 패치 간 이음새 홈(Seam Groove) 선명화
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 1.6;
    for (let c = 1; c < cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * pw, 0);
      ctx.lineTo(c * pw, h);
      ctx.stroke();
    }
    for (let r = 1; r < rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * ph);
      ctx.lineTo(w, r * ph);
      ctx.stroke();
    }
  }

  // 📐 십자수/자수 가이드 모눈 그리드 (2번 모던 웜베이지 모눈 격자 스킨 전용)
  if (patternType === "grid") {
    // 1) 32px 보조 모눈 (확실한 가시성)
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isFront ? "#8C6239" : "#A67C52";
    ctx.globalAlpha = 0.28;
    for (let i = 0; i <= w; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h);
      ctx.stroke();
    }
    for (let i = 0; i <= h; i += 32) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(w, i);
      ctx.stroke();
    }
    // 2) 96px 주 모눈 (선명한 기준선)
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = isFront ? "#5C3A16" : "#7A4D20";
    ctx.globalAlpha = 0.55;
    for (let i = 0; i <= w; i += 96) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h);
      ctx.stroke();
    }
    for (let i = 0; i <= h; i += 96) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(w, i);
      ctx.stroke();
    }
    // 3) 주 모눈 교차점 조준 도트 (Crosshair Dots)
    ctx.fillStyle = isFront ? "#5C3A16" : "#7A4D20";
    ctx.globalAlpha = 0.70;
    for (let x = 0; x <= w; x += 96) {
      for (let y = 0; y <= h; y += 96) {
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 🧵 5. [핵심] 레퍼런스 2~3번 사진 속 정갈한 손바느질 러닝 스티치 테두리 (Handmade Running Stitch Border)
  // 가장자리 4면 둘레를 따라 둥글게 감싸며, 굵은 땀과 바늘구멍 딤플 음영으로 진짜 손으로 꿰맨 수공예 펠트 완성!
  // (복주머니 등 전용 형태 메쉬에서는 잘림 현상 방지를 위해 생략)
  if (!skipBorderStitch) {
    ctx.save();
    const stitchInset = 32;
    const cornerRadius = 36;
    const rectX = stitchInset;
    const rectY = stitchInset;
    const rectW = w - stitchInset * 2;
    const rectH = h - stitchInset * 2;

    // 둥근 사각형 경로 생성 헬퍼
    const createRoundedPath = (x: number, y: number, width: number, height: number, radius: number) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.arcTo(x + width, y, x + width, y + radius, radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
      ctx.lineTo(x + radius, y + height);
      ctx.arcTo(x, y + height, x, y + height - radius, radius);
      ctx.lineTo(x, y + radius);
      ctx.arcTo(x, y, x + radius, y, radius);
      ctx.closePath();
    };

    // 1) 펠트 테두리 은은한 접힘선 (Fabric Hem Crease)
    ctx.strokeStyle = patternColor;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = isFront ? 0.20 : 0.28;
    createRoundedPath(rectX - 10, rectY - 10, rectW + 20, rectH + 20, cornerRadius + 6);
    ctx.stroke();

    // 2) 굵고 또렷한 손바느질 러닝 스티치 땀 (18px 실 땀, 14px 간격)
    let stitchColor = "#C49A6C"; // 기본: 따뜻한 수공예 카멜 골드
    if (patternType === "grid") stitchColor = "#8D6E63"; // 코코아 브라운
    else if (patternType === "denim") stitchColor = "#F59E0B"; // 황금 옐로우
    else if (patternType === "gingham") stitchColor = "#D97706"; // 앰버 오렌지
    else if (patternType === "dots") stitchColor = "#EC4899"; // 비비드 핑크
    else if (patternType === "stripe") stitchColor = "#7C3AED"; // 딥 바이올렛
    else if (patternType === "herringbone") stitchColor = "#65A30D"; // 올리브 라임
    else if (patternType === "flower") stitchColor = "#16A34A"; // 싱그러운 올리브 그린
    else if (patternType === "carbon") stitchColor = "#00F0FF"; // 네온 시안
    else if (patternType === "quilt") stitchColor = "#F59E0B"; // 임페리얼 골드

    // 땀 아래 살짝 깔리는 부드러운 스티치 그림자
    ctx.setLineDash([18, 14]);
    ctx.lineCap = "round";
    ctx.lineWidth = 5.5;
    ctx.strokeStyle = "rgba(0,0,0,0.22)";
    ctx.globalAlpha = 1.0;
    createRoundedPath(rectX, rectY + 1.5, rectW, rectH, cornerRadius);
    ctx.stroke();

    // 메인 스티치 실 땀
    ctx.lineWidth = 5.0;
    ctx.strokeStyle = stitchColor;
    ctx.globalAlpha = isFront ? 0.95 : 0.85;
    createRoundedPath(rectX, rectY, rectW, rectH, cornerRadius);
    ctx.stroke();

    // 스티치 윗면 볼륨 하이라이트 (도톰한 실 질감)
    ctx.lineWidth = 2.0;
    ctx.strokeStyle = "#FFFFFF";
    ctx.globalAlpha = isFront ? 0.40 : 0.25;
    createRoundedPath(rectX, rectY - 0.8, rectW, rectH, cornerRadius);
    ctx.stroke();

    ctx.restore();
  }
  return canvas;
}

// 🔘 실제 관통 구멍이 뚫린 3D 단추 메쉬 생성기 (Shape Extrude With Holes)
function create3DButtonWithHoles(level: number, totalHoles: number): THREE.Group {
  const buttonGroup = new THREE.Group();

  let buttonColor = "#EFA442"; // 🌟 1단계: 따뜻하고 화사한 천연 호박(Amber) 골든 단추
  let roughness = 0.22;
  let metalness = 0.14;

  if (level === 2) {
    buttonColor = "#93C5FD"; // 2단계: 파스텔 스카이블루
    roughness = 0.3;
    metalness = 0.1;
  } else if (level === 3) {
    buttonColor = "#F06292"; // 🌸 3단계: 화사한 전통 매화 꽃단추 (고운 로즈 핑크)
    roughness = 0.22;
    metalness = 0.15;
  }

  const buttonMat = new THREE.MeshStandardMaterial({
    color: buttonColor,
    roughness,
    metalness,
  });

  // 1. 단추 외곽 2D Shape (레벨 3은 5개의 둥근 꽃잎이 탐스럽게 피어난 전통 매화 꽃단추!)
  const buttonShape = new THREE.Shape();
  if (level === 3) {
    // 🌸 [전통 5엽 매화 꽃단추 셰이프]: 부드럽고 둥근 5개 꽃잎 곡선
    const petals = 5;
    const baseRadius = 1.48;
    const petalDepth = 0.26;
    const segments = 80;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const r = baseRadius + petalDepth * Math.cos(petals * theta);
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      if (i === 0) {
        buttonShape.moveTo(x, z);
      } else {
        buttonShape.lineTo(x, z);
      }
    }
    buttonShape.closePath();
  } else {
    // 1·2단계: 클래식 원형 단추
    buttonShape.absarc(0, 0, 1.55, 0, Math.PI * 2, false);
  }

  // 2. 단추 구멍들 (뚫릴 Hole Path 추가)
  const holeRadius = 0.22;
  if (totalHoles === 2) {
    const h1 = new THREE.Path();
    h1.absarc(-0.75, 0, holeRadius, 0, Math.PI * 2, true);
    buttonShape.holes.push(h1);

    const h2 = new THREE.Path();
    h2.absarc(0.75, 0, holeRadius, 0, Math.PI * 2, true);
    buttonShape.holes.push(h2);
  } else {
    // 4구멍 (가로 우선 Z자 표준 순서: 1:좌상, 2:우상, 3:좌하, 4:우하)
    const offsets = [
      { x: -0.60, z: -0.60 }, // 1번 (좌상)
      { x: 0.60, z: -0.60 },  // 2번 (우상)
      { x: -0.60, z: 0.60 },  // 3번 (좌하)
      { x: 0.60, z: 0.60 },   // 4번 (우하)
    ];
    offsets.forEach((pt) => {
      const h = new THREE.Path();
      h.absarc(pt.x, pt.z, holeRadius, 0, Math.PI * 2, true);
      buttonShape.holes.push(h);
    });
  }

  // 3. 둥글고 부드러운 3D 압출 (높이 0.14)
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.14,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.04,
    bevelThickness: 0.04,
  };

  const buttonGeo = new THREE.ExtrudeGeometry(buttonShape, extrudeSettings);
  buttonGeo.center();

  const buttonMesh = new THREE.Mesh(buttonGeo, buttonMat);
  buttonMesh.rotation.x = Math.PI / 2; // 평평하게 눕힘
  buttonMesh.position.set(0, 0.55, 0); // 천(0.04) 위 Y=0.55에 붕 띄워 실기둥 공간 확보!
  buttonMesh.castShadow = true;
  buttonMesh.receiveShadow = true;
  buttonGroup.add(buttonMesh);

  // 4. 단추 외곽 림 테두리 (1·2단계 클래식 원형 단추일 때만 원형 림 추가, 3단계 꽃단추는 순수 5엽 꽃잎 셰이프 유지)
  if (level !== 3) {
    const rimGeo = new THREE.TorusGeometry(1.50, 0.06, 12, 32);
    const rimMesh = new THREE.Mesh(rimGeo, buttonMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.set(0, 0.63, 0);
    buttonGroup.add(rimMesh);
  }

  // 5. 각 단추 구멍 상단에 선명한 골드/메탈 테두리 림 링 배치 & 직관적 번호 마커
  const holeRimMat = new THREE.MeshStandardMaterial({
    color: level === 3 ? "#D4AF37" : "#5C3A16",
    metalness: 0.5,
    roughness: 0.3,
  });

  const holeCoords = totalHoles === 2 
    ? [{ x: -0.75, z: 0 }, { x: 0.75, z: 0 }]
    : [
        { x: -0.60, z: -0.60 }, // 1번
        { x: 0.60, z: -0.60 },  // 2번
        { x: -0.60, z: 0.60 },  // 3번
        { x: 0.60, z: 0.60 },   // 4번
      ];

  holeCoords.forEach((pt, idx) => {
    // 구멍 표면 림 (단추 윗면 0.63)
    const hRimGeo = new THREE.TorusGeometry(0.24, 0.035, 8, 20);
    const hRimMesh = new THREE.Mesh(hRimGeo, holeRimMat);
    hRimMesh.rotation.x = Math.PI / 2;
    hRimMesh.position.set(pt.x, 0.63, pt.z);
    buttonGroup.add(hRimMesh);

    // 구멍 내부 관통 어두운 실린더 (단추 위 0.63에서 천 아래 -0.04까지)
    const hCylGeo = new THREE.CylinderGeometry(0.20, 0.20, 0.68, 16);
    const hCylMat = new THREE.MeshBasicMaterial({ color: "#110B06" });
    const hCyl = new THREE.Mesh(hCylGeo, hCylMat);
    hCyl.position.set(pt.x, 0.30, pt.z);
    buttonGroup.add(hCyl);

    // 🏷️ 구멍 식별 번호 마커 (①, ②, ③, ④) 텍스처 배지
    const badgeCanvas = document.createElement("canvas");
    badgeCanvas.width = 128;
    badgeCanvas.height = 128;
    const ctx = badgeCanvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, 128, 128);
      ctx.beginPath();
      ctx.arc(64, 64, 52, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFDF7";
      ctx.fill();
      ctx.lineWidth = 8;
      ctx.strokeStyle = "#6E4720";
      ctx.stroke();

      ctx.fillStyle = "#E76F51";
      ctx.font = "bold 66px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${idx + 1}`, 64, 66);
    }
    const badgeTex = new THREE.CanvasTexture(badgeCanvas);
    const badgeMat = new THREE.MeshBasicMaterial({
      map: badgeTex,
      transparent: true,
      depthTest: false,
    });
    const badgeGeo = new THREE.PlaneGeometry(0.30, 0.30);
    const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
    badgeMesh.rotation.x = -Math.PI / 2;
    // 구멍 외곽 바깥쪽으로 단정하게 위치
    const offX = totalHoles === 2 ? (idx === 0 ? -0.34 : 0.34) : (pt.x < 0 ? -0.34 : 0.34);
    const offZ = totalHoles === 2 ? 0 : (pt.z < 0 ? -0.26 : 0.26);
    badgeMesh.position.set(pt.x + offX, 0.64, pt.z + offZ);
    buttonGroup.add(badgeMesh);
  });

  return buttonGroup;
}

// 👘 3화 전용: 찢어진 배자 상처와 정갈한 수선 덧댐 누빔 비단 텍스처 엔진 (Quilted Silk Patch)
function createSilkPatchTexture(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const w = 512;
  const h = 256;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // 1. 맑고 고운 전통 옥색(비취색) 비단 누빔 베이스
  ctx.fillStyle = "#BCE5D6";
  ctx.fillRect(0, 0, w, h);

  // 2. 비단 결 은은한 옥빛 가로 광택 결선
  ctx.strokeStyle = "rgba(42, 157, 143, 0.18)";
  ctx.lineWidth = 1.0;
  for (let y = 0; y < h; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // 3. ✨ 전통 다이아몬드 누빔(퀼팅) 텍스처 - 짙은 옥색 자수 실밥 격자선
  ctx.save();
  ctx.strokeStyle = "rgba(18, 94, 82, 0.28)";
  ctx.lineWidth = 1.2;
  const quiltSpacing = 28;
  // 좌상 ➔ 우하 대각선 누빔
  for (let x = -h; x < w + h; x += quiltSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + h, h);
    ctx.stroke();
  }
  // 우상 ➔ 좌하 대각선 누빔
  for (let x = -h; x < w + h; x += quiltSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - h, h);
    ctx.stroke();
  }
  ctx.restore();

  return canvas;
}

// 🔮 2화 전용: 한국 전통 '요술 복주머니(두루주머니)' 2D 단면 Shape 모델링
function createPouchShape(width: number, depth: number): THREE.Shape {
  const shape = new THREE.Shape();
  const hw = width / 2;
  const hd = depth / 2;

  // 한국 전통 두루주머니 곡선 실루엣 (컴팩트한 14구멍 최적화)
  const neckW = hw * 0.65; // 조임 목 너비
  const topW = hw * 0.78;  // 상단 주름 입구 너비
  const bellyW = hw * 0.94; // 몸통 최대 너비 (좌우로 과도하게 부풀지 않는 단정한 실루엣)

  // 상단 좌측 주름 입구 시작점
  shape.moveTo(-topW, -hd);
  // 상단 입구 물결 주름 (가운데로)
  shape.quadraticCurveTo(-topW * 0.5, -hd + 0.30, 0, -hd + 0.08);
  shape.quadraticCurveTo(topW * 0.5, -hd + 0.30, topW, -hd);

  // 우측 입구 ➔ 우측 목(조임부)
  shape.quadraticCurveTo(topW * 0.88, -hd * 0.65, neckW, -hd * 0.45);

  // 우측 목 ➔ 우측 몸통 볼록 곡선 (Belly)
  shape.bezierCurveTo(bellyW * 1.02, -hd * 0.1, bellyW * 1.02, hd * 0.45, bellyW * 0.80, hd * 0.82);

  // 우측 하단 ➔ 중앙 바닥 완만하고 포근한 둥근 곡선
  shape.quadraticCurveTo(bellyW * 0.40, hd, 0, hd);

  // 중앙 바닥 ➔ 좌측 하단 둥근 곡선
  shape.quadraticCurveTo(-bellyW * 0.40, hd, -bellyW * 0.80, hd * 0.82);

  // 좌측 하단 ➔ 좌측 몸통 볼록 곡선
  shape.bezierCurveTo(-bellyW * 1.02, hd * 0.45, -bellyW * 1.02, -hd * 0.1, -neckW, -hd * 0.45);

  // 좌측 목 ➔ 상단 좌측 주름 입구
  shape.quadraticCurveTo(-topW * 0.88, -hd * 0.65, -topW, -hd);

  return shape;
}

// 🎨 복주머니 지오메트리 전용 UV 프로젝션 매핑 헬퍼
function assignPouchUVs(geo: THREE.BufferGeometry, width: number, depth: number) {
  const pos = geo.attributes.position;
  const uvs = geo.attributes.uv;
  if (!pos || !uvs) return;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const u = (x + width / 2) / width;
    const v = 1.0 - (z + depth / 2) / depth;
    uvs.setXY(i, Math.max(0, Math.min(1, u)), Math.max(0, Math.min(1, v)));
  }
  uvs.needsUpdate = true;
}
