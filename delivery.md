# 꼬매팡 어드벤처 (KkomaePang Adventure) 최종 납품 가이드 (DELIVERY)

- **프로젝트명**: 꼬매팡 어드벤처 (KkomaePang Adventure) - 3D 전통 실과 게이미피케이션 어드벤처
- **납품 버전**: v1.0.0 (Production Ready)
- **납품 일자**: 2026-09-28
- **기술 스택**: Next.js 16.3.2 (App Router), React 19.2.8, Three.js 0.185.1, Tailwind CSS v4

---

## 1. 프로젝트 개요

**꼬매팡 어드벤처(KkomaePang Adventure)**는 전통 전래동화(콩쥐의 바느질 성장기) 서사와 정밀 3D 물리 시뮬레이션을 결합한 **실감형 실과 교육 게이미피케이션 웹 애플리케이션**입니다.

- **주요 기능**:
  1. **콩쥐 바느질 일기 (시나리오 모드 5부작)**:
     - 1화: 깨진 독 메우기 (기초 홈질)
     - 2화: 복주머니 깁기 (튼튼한 박음질)
     - 3화: 배자 솔기 수선 (테두리 감침질)
     - 4화: 왕실 잔치 꽃단추 (기둥감기 단추달기)
     - 5화: 어전 침선 과거시험 (장원급제 실과 퀴즈)
  2. **조선 5대 보물 퍼즐 완결판**:
     - 시나리오 완수 시 골패 조각 획득 및 3x2 완성형 보물 퍼즐 복원
     - 비밀 보물함(어전 황금바늘 스킨) 해금 시스템
  3. **3D 리얼 손바느질 인터랙션**:
     - Three.js 기반 바늘/실 3차원 물리 궤적, 휠/키보드 깊이 조준, 매듭/장력 판정
  4. **무지연 오디오 합성 엔진**:
     - Web Audio API 기반 오리지널 한국형 BGM 및 실감 손바느질 효과음 내장

---

## 2. Vercel 원클릭 배포 가이드 (발주처용)

본 프로젝트는 Vercel 클라우드 배포에 100% 최적화되어 있으며, 별도의 데이터베이스나 서버 구축 없이 즉시 전 세계 배포가 가능합니다.

### 배포 절차
1. **Vercel 로그인** 후 대시보드 우측 상단 **[Add New...]** ➡️ **[Project]**를 선택합니다.
2. 전달받은 GitHub 저장소(`kkomae-pang-adv`)를 선택하고 **[Import]**를 클릭합니다.
3. **Configure Project** 설정:
   - **Framework Preset**: `Next.js` (자동 감지됨)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `next build` (기본값)
   - **Output Directory**: `.next` (기본값)
   - **Environment Variables**: **별도 설정 불필요** (공란으로 유지)
4. **[Deploy]** 버튼을 클릭하면 약 1~2분 내로 컴파일 및 사전 렌더링이 완료되고 공식 서비스 URL이 즉시 발급됩니다.

> 💡 **맞춤 도메인 설정**: 배포 완료 후 Vercel 대시보드의 `Settings` ➡️ `Domains` 메뉴에서 기관 전용 도메인을 등록하실 수 있습니다.

---

## 3. 로컬 환경 개발 및 빌드 검증

발주처 내부 보안망 또는 로컬 환경에서 직접 실행 및 검증할 경우 아래 명령어를 사용합니다.

```bash
# 1. 의존성 패키지 설치 (Node.js 20 이상 권장)
npm install

# 2. 로컬 개발 서버 실행 (기본 포트 3001)
npm run dev

# 3. 프로덕션 빌드 무결성 검증
npm run build

# 4. ESLint 코드 무결성 점검
npm run lint
```

---

## 4. 주요 디렉터리 및 산출물 구조

```
kkomae-pang-adv/
├── public/                     # 정적 에셋 (썸네일, 배너, PWA 매니페스트)
│   ├── images/
│   │   ├── story/              # 콩쥐 시나리오 5부작 배경 및 캐릭터 에셋
│   │   ├── fabrics/            # 전통 원단 및 스킨 텍스처
│   │   └── kkomaepang_adventure_thumbnail_v3.webp # 대표 SNS 썸네일 (WebP 최적화)
│   ├── kkomae_pang_hero_banner.webp # 히어로 배너 (WebP 최적화)
│   └── manifest.json           # PWA 웹 앱 매니페스트
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 루트 레이아웃 (SEO/OG 메타데이터, 뷰포트 고정)
│   │   ├── page.tsx            # 메인 애플리케이션 및 모드 네비게이션
│   │   ├── Real3DSewingCanvas.tsx # Three.js 기반 3D 바느질 물리 시뮬레이션
│   │   ├── StoryModeLobby.tsx  # 콩쥐 시나리오 5부작 선택 로비
│   │   ├── StoryDialogOverlay.tsx # 동화책 연출형 대사 및 일러스트 오버레이
│   │   ├── ScenarioQuizModal.tsx # 5화 어전 과거시험 실과 퀴즈 모달
│   │   ├── TreasurePuzzleModal.tsx # 5대 보물 골패 퍼즐 및 황금바늘 보물함
│   │   └── globals.css         # Tailwind v4 기반 글로벌 스타일
│   └── lib/
│       ├── storyData.ts        # 콩쥐 바느질 일기 5부작 대사/미션 데이터
│       └── soundEffects.ts     # Web Audio API 오디오 합성 엔진
├── delivery.md                 # 본 납품 설명서
├── next.config.ts              # Next.js 프레임워크 설정
├── package.json                # 프로젝트 의존성 명세
└── tsconfig.json               # TypeScript 환경 설정
```

---

## 5. 지적 재산권 및 저작권 안내 (Notice)

- 본 소프트웨어 및 포함된 3D 바느질 물리 시뮬레이션 알고리즘, 전래동화 시나리오 에셋 일체는 본 과업 납품 계약에 의거하여 발주처에 정식 제공되는 산출물입니다.
- 계약 외 무단 복제, 제3자 상업적 재판매 또는 목적 외의 핵심 엔진 무단 전용을 금합니다.
- **Copyright (c) 2026. All rights reserved.**
