export type SpeakerId = 'kongji' | 'doobi' | 'saemi' | 'patji' | 'magistrate' | 'narrator';

export interface SpeakerInfo {
  id: SpeakerId;
  name: string;
  avatar: string;
  color: string;
  bgColor: string;
  imageSrc?: string;
}

export const SPEAKERS: Record<SpeakerId, SpeakerInfo> = {
  kongji: {
    id: 'kongji',
    name: '콩쥐',
    avatar: '👧',
    color: '#D97706',
    bgColor: '#FEF3C7',
    imageSrc: '/images/story/character_kongji.webp?v=3',
  },
  doobi: {
    id: 'doobi',
    name: '두비 (두꺼비 요정)',
    avatar: '🐸',
    color: '#059669',
    bgColor: '#D1FAE5',
    imageSrc: '/images/story/character_doobi.webp?v=3',
  },
  saemi: {
    id: 'saemi',
    name: '새미 (참새 요정)',
    avatar: '🐦',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    imageSrc: '/images/story/character_saemi.webp?v=3',
  },
  patji: {
    id: 'patji',
    name: '팥쥐',
    avatar: '😠',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    imageSrc: '/images/story/character_patji.webp?v=3',
  },
  magistrate: {
    id: 'magistrate',
    name: '사또',
    avatar: '👑',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    imageSrc: '/images/story/character_magistrate.webp?v=3',
  },
  narrator: {
    id: 'narrator',
    name: '이야기꾼',
    avatar: '📜',
    color: '#4B5563',
    bgColor: '#F3F4F6',
    imageSrc: '/images/story/bg_story_ep1.webp',
  },
};

export interface DialogLine {
  speaker: SpeakerId;
  text: string;
  emotion?: 'normal' | 'sad' | 'happy' | 'surprised' | 'angry' | 'sparkle';
  actionPrompt?: string; // 예: "바늘귀에 실을 꿰어보자!"
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface StitchHolePoint {
  index: number;
  x: number;
  y: number;
}

export interface StitchStepConfig {
  stepIndex: number;
  fromIndex: number;
  toIndex: number;
  isFront: boolean;
  isShankWrap?: boolean;
  wrapTargetCount?: number;
  hintText: string;
}

export interface StoryEpisode {
  id: number;
  title: string;
  subTitle: string;
  techniqueName: string; // 🪡 바느질 기법 개조식 명칭
  missionGoal: string;   // 🎯 개조식 목표
  icon: string;
  badge: string;
  bgImageSrc?: string;   // 🎨 3D 픽사 동화책 무대 배경 이미지
  targetCourseId: 'running' | 'backstitch' | 'button' | 'quiz';
  targetLevel: number; // 1, 2, 3
  introDialog: DialogLine[];
  successDialog: DialogLine[];
  rewardText: string;
  rewardIcon: string;
  quizQuestions?: QuizQuestion[];
  // 🪡 3D 스토리 전용 자립형 바느질 데이터
  totalHoles?: number;
  isCurve?: boolean;
  archHeight?: number;
  tolerance?: number;
  holePoints?: StitchHolePoint[];
  stitchSteps?: StitchStepConfig[];
}

export const STORY_EPISODES: StoryEpisode[] = [
  {
    id: 1,
    title: "은혜 갚은 두꺼비의 요술 복주머니",
    subTitle: "겉감과 안감이 밀리지 않게 임시 고정하기 (기초 시침질)",
    techniqueName: "기초 시침질",
    missionGoal: "복주머니 겉감과 안감 임시 고정",
    icon: "🐸",
    badge: "제 1화",
    bgImageSrc: "/images/story/bg_story_ep1.webp",
    targetCourseId: "running",
    targetLevel: 1, // 🪡 정통 장단시침 (8구멍)
    totalHoles: 8,
    isCurve: false,
    archHeight: 120,
    tolerance: 120,
    holePoints: [
      { index: 0, x: 90, y: 320 },
      { index: 1, x: 270, y: 320 },
      { index: 2, x: 320, y: 320 },
      { index: 3, x: 500, y: 320 },
      { index: 4, x: 550, y: 320 },
      { index: 5, x: 730, y: 320 },
      { index: 6, x: 780, y: 320 },
      { index: 7, x: 860, y: 320 },
    ],
    stitchSteps: [
      { stepIndex: 0, fromIndex: 0, toIndex: 1, isFront: true, hintText: "☀️ [겉면] 길~게 건너뛰어 임시 고정! (2번 구멍으로 꽂기 ⏩)" },
      { stepIndex: 1, fromIndex: 1, toIndex: 2, isFront: false, hintText: "🌑 [안면] 천 밑에서 살짝만 찝고 올라오기! (3번 구멍으로 밀어올리기 🤏)" },
      { stepIndex: 2, fromIndex: 2, toIndex: 3, isFront: true, hintText: "☀️ [겉면] 길~게 건너뛰어 임시 고정! (4번 구멍으로 꽂기 ⏩)" },
      { stepIndex: 3, fromIndex: 3, toIndex: 4, isFront: false, hintText: "🌑 [안면] 천 밑에서 살짝만 찝고 올라오기! (5번 구멍으로 밀어올리기 🤏)" },
      { stepIndex: 4, fromIndex: 4, toIndex: 5, isFront: true, hintText: "☀️ [겉면] 길~게 건너뛰어 임시 고정! (6번 구멍으로 꽂기 ⏩)" },
      { stepIndex: 5, fromIndex: 5, toIndex: 6, isFront: false, hintText: "🌑 [안면] 천 밑에서 살짝만 찝고 올라오기! (7번 구멍으로 밀어올리기 🤏)" },
      { stepIndex: 6, fromIndex: 6, toIndex: 7, isFront: true, hintText: "☀️ [겉면] 마지막 길게 고정하여 장단시침 완성! (8번 구멍으로 꽂기 ⏩)" },
    ],
    introDialog: [
      {
        speaker: "narrator",
        text: "따스한 봄날 오후, 콩쥐가 마당 장독대를 쓸다\n돌 틈에 끼어 버둥거리는 두꺼비를 구해주었어요.",
      },
      {
        speaker: "doobi",
        text: "휴우! 착한 콩쥐, 덕분에 살았소!\n제 머리의 황금 골무가 보이시오? 나는 바느질 수선 요정 두비라고 하오!",
        emotion: "sparkle",
      },
      {
        speaker: "kongji",
        text: "말하는 두꺼비라니... 신기해라!\n그런데 품에 안고 있는 그 알록달록한 색동 주머니는 뭐야?",
        emotion: "surprised",
      },
      {
        speaker: "doobi",
        text: "흑흑... 신비한 마법 구슬들을 담아 다니는 요술 복주머니인데,\n돌부리에 긁혀 옆구리 솔기가 좍 뜯어졌소! 구슬이 다 쏟아지겠소!",
        emotion: "sad",
      },
      {
        speaker: "saemi",
        text: "짹짹! 콩쥐야, 내가 고운 오색 비단실을 물어왔어요!\n두비의 주머니를 함께 꿰매어줘요!",
        emotion: "happy",
      },
      {
        speaker: "doobi",
        text: "콩쥐, 본격적인 바느질 전에 두 장의 천이 비뚤어지거나 밀리지 않도록\n긴 땀과 짧은 땀을 번갈아 꿰매는 '8구멍 정통 장단시침'부터 시작하시오!",
        actionPrompt: "복주머니 천이 어긋나지 않도록 8구멍 장단시침으로 짱짱하게 임시 고정해주세요!",
      },
    ],
    successDialog: [
      {
        speaker: "doobi",
        text: "좋소! 천이 어긋나지 않고 반듯하게 꽉 잡혔소!\n시침질을 완벽하게 마쳤으니 이제 옆구리를 봉합할 준비가 끝났소!",
        emotion: "happy",
      },
      {
        speaker: "kongji",
        text: "천이 짱짱하게 고정되어서 다음 바느질도 아주 수월하겠어!",
        emotion: "sparkle",
      },
      {
        speaker: "doobi",
        text: "훌륭한 첫걸음이오!\n이 기세로 제 2화에서는 촘촘한 홈질로 구슬이 새지 않게 옆구리를 막아봅시다!",
      },
    ],
    rewardText: "오션 에메랄드 실 & 시침질 마스터 인장",
    rewardIcon: "🧵",
  },
  {
    id: 2,
    title: "마법 구슬이 새지 않는 촘촘한 홈질",
    subTitle: "터진 마법 주머니 솔기 복합 홈질로 촘촘히 잇기",
    techniqueName: "복합 홈질",
    missionGoal: "직선과 물결 곡선을 잇는 정밀 홈질",
    icon: "🔮",
    badge: "제 2화",
    bgImageSrc: "/images/story/bg_story_ep2.webp",
    targetCourseId: "running",
    targetLevel: 2, // 🪡 14구멍 복합 홈질
    totalHoles: 14,
    isCurve: true,
    archHeight: 120,
    tolerance: 120,
    holePoints: [
      // 좌측 어깨 및 옆구리 곡선 (0~3번, 황금 매듭 아래 시작)
      { index: 0, x: 330, y: 230 }, // 황금 매듭 좌측 끝 아래 시작
      { index: 1, x: 285, y: 280 }, // 좌측 어깨
      { index: 2, x: 260, y: 355 }, // 좌측 옆구리
      { index: 3, x: 280, y: 430 }, // 좌하단 코너
      // 하단 둥근 밑단 바닥 (4~9번, 균일한 바닥 홈질)
      { index: 4, x: 325, y: 475 },
      { index: 5, x: 380, y: 495 },
      { index: 6, x: 440, y: 500 }, // 바닥 중앙 좌
      { index: 7, x: 520, y: 500 }, // 바닥 중앙 우
      { index: 8, x: 580, y: 495 },
      { index: 9, x: 635, y: 475 },
      // 우측 옆구리 및 어깨 곡선 (10~13번, 황금 매듭 아래 종료)
      { index: 10, x: 680, y: 430 }, // 우하단 코너
      { index: 11, x: 700, y: 355 }, // 우측 옆구리
      { index: 12, x: 675, y: 280 }, // 우측 어깨
      { index: 13, x: 630, y: 230 }, // 황금 매듭 우측 끝 아래 종료
    ],
    stitchSteps: [
      { stepIndex: 0, fromIndex: 0, toIndex: 1, isFront: true, hintText: "☀️ [겉면] 2번 구멍으로 바늘을 쏙 꽂아주세요! ⬇️ (좌측 어깨 시작)" },
      { stepIndex: 1, fromIndex: 1, toIndex: 2, isFront: false, hintText: "🌑 [안면] 천 밑에서 3번 구멍으로 밀어올리세요! ⬆️" },
      { stepIndex: 2, fromIndex: 2, toIndex: 3, isFront: true, hintText: "☀️ [겉면] 4번 구멍으로 바늘을 쏙 꽂아주세요! ⬇️ (좌측 밑단 진입)" },
      { stepIndex: 3, fromIndex: 3, toIndex: 4, isFront: false, hintText: "🌑 [안면] 천 밑에서 5번 구멍으로 밀어올리세요! ⬆️" },
      { stepIndex: 4, fromIndex: 4, toIndex: 5, isFront: true, hintText: "☀️ [겉면] 6번 구멍으로 꽂기! ➡️ (주머니 바닥 홈질)" },
      { stepIndex: 5, fromIndex: 5, toIndex: 6, isFront: false, hintText: "🌑 [안면] 천 밑에서 7번 구멍으로 밀어올리세요! ⬆️" },
      { stepIndex: 6, fromIndex: 6, toIndex: 7, isFront: true, hintText: "☀️ [겉면] 8번 구멍으로 바늘을 쏙 꽂아주세요! ⬇️ (중앙 바닥)" },
      { stepIndex: 7, fromIndex: 7, toIndex: 8, isFront: false, hintText: "🌑 [안면] 천 밑에서 9번 구멍으로 밀어올리기! ➡️" },
      { stepIndex: 8, fromIndex: 8, toIndex: 9, isFront: true, hintText: "☀️ [겉면] 10번 구멍으로 바늘을 쏙 꽂아주세요! ⬇️ (바닥 마무리)" },
      { stepIndex: 9, fromIndex: 9, toIndex: 10, isFront: false, hintText: "🌑 [안면] 11번 구멍으로 밀어올리기! ⤴️ (우측 옆구리 올라가기)" },
      { stepIndex: 10, fromIndex: 10, toIndex: 11, isFront: true, hintText: "☀️ [겉면] 12번 구멍으로 바늘을 쏙 꽂아주세요! ⬇️" },
      { stepIndex: 11, fromIndex: 11, toIndex: 12, isFront: false, hintText: "🌑 [안면] 천 밑에서 13번 구멍으로 밀어올리세요! ⬆️" },
      { stepIndex: 12, fromIndex: 12, toIndex: 13, isFront: true, hintText: "☀️ [겉면] 마지막 14번 구멍으로 꽂아 새지 않는 요술 복주머니 수선 완성! 🎯" },
    ],
    introDialog: [
      {
        speaker: "doobi",
        text: "콩쥐, 시침질로 천을 잘 잡았으니 이제 마법 구슬이 단 하나도 빠져나가지 못하도록\n땀 간격이 고르고 촘촘한 '홈질'로 옆구리 솔기를 단단히 이읍시다!",
      },
      {
        speaker: "kongji",
        text: "일정한 간격으로 천의 겉과 안을 부지런히 넘나들며\n평평한 곳과 물결치는 곳 모두 촘촘하게 꿰매볼게!",
        emotion: "sparkle",
      },
      {
        speaker: "saemi",
        text: "짹짹! 구슬이 절대 새지 않게\n평평한 솔기와 굽이치는 물결 솔기 14개의 구멍을 빈틈없이 촘촘하게 이어주세요!",
      },
      {
        speaker: "doobi",
        text: "바늘 끝을 조준하고 차분하게 찌르시오.\n자, 14구멍 복합 홈질에 도전하시오!",
        actionPrompt: "마법 구슬이 새어나가지 않게 직선과 물결이 교차하는 14구멍 촘촘한 홈질로 솔기를 이어주세요!",
      },
    ],
    successDialog: [
      {
        speaker: "narrator",
        text: "마지막 실을 당기자 터졌던 솔기가 말끔히 메워지며\n마법 구슬들이 별빛처럼 영롱하게 빛났어요!",
      },
      {
        speaker: "doobi",
        text: "우와아! 땀 간격이 자로 잰 듯 촘촘하고 완벽하오!\n마법 구슬이 단 하나도 빠져나가지 않겠소! 보답으로 장독대 비전 '신비한 은빛 바늘'을 선물하겠소!\n우리 콩쥐의 이 고운 솜씨라면, 곧 다가올 사또의 큰잔치 날에도 예쁜 옷을 눈부시게 지어 입을 수 있겠소!",
        emotion: "sparkle",
      },
      {
        speaker: "kongji",
        text: "내가 꿰맨 바느질로 두비의 주머니가 튼튼해지다니 정말 뿌듯해!",
        emotion: "happy",
      },
    ],
    rewardText: "신비한 은빛 바늘 & 요술 복주머니",
    rewardIcon: "🪡",
  },
  {
    id: 3,
    title: "잔칫날 아침, 찢어진 옥색 비단 배자",
    subTitle: "찢어진 배자 상처에 덧댐 비단을 대고 네모 테두리 박음질하기",
    techniqueName: "네모 덧댐 패치 박음질",
    missionGoal: "찢어진 배자에 덧댐 비단을 대고 네모 둘레 박음질 수선",
    icon: "👘",
    badge: "제 3화",
    bgImageSrc: "/images/story/bg_story_ep3.webp",
    targetCourseId: "backstitch",
    targetLevel: 2, // 🪡 14구멍 완전 대칭 네모 덧댐 패치 박음질
    totalHoles: 14,
    isCurve: false,
    archHeight: 120,
    tolerance: 120,
    holePoints: [
      // 1. 상단 가로변 (좌 ➔ 우: 0~4번, Y = 200, 간격 105)
      { index: 0, x: 270, y: 200 }, // 좌상 코너
      { index: 1, x: 375, y: 200 },
      { index: 2, x: 480, y: 200 }, // 상단 중앙
      { index: 3, x: 585, y: 200 },
      { index: 4, x: 690, y: 200 }, // 우상 코너
      // 2. 우측 세로변 (상 ➔ 하: 5~7번, X = 690, 간격 80)
      { index: 5, x: 690, y: 280 },
      { index: 6, x: 690, y: 360 },
      { index: 7, x: 690, y: 440 }, // 우하 코너
      // 3. 하단 가로변 (우 ➔ 좌: 8~11번, Y = 440, 간격 105)
      { index: 8, x: 585, y: 440 },
      { index: 9, x: 480, y: 440 }, // 하단 중앙
      { index: 10, x: 375, y: 440 },
      { index: 11, x: 270, y: 440 }, // 좌하 코너
      // 4. 좌측 세로변 (하 ➔ 상: 12~13번, X = 270, 간격 80)
      { index: 12, x: 270, y: 360 },
      { index: 13, x: 270, y: 280 },
    ],
    stitchSteps: [
      // [1변: 상단 가로줄] 0~4번 구멍 (7스텝: Step 0~6)
      { stepIndex: 0, fromIndex: 1, toIndex: 0, isFront: true, hintText: "⬇️ [상단 1땀] 1번 구멍(왼쪽 위 모서리)으로 뒤로 되돌아 꽂기! ⏪" },
      { stepIndex: 1, fromIndex: 0, toIndex: 2, isFront: false, hintText: "⬆️ [상단 전진] 2칸 앞 3번 구멍으로 밀어올리기! ⏩" },
      { stepIndex: 2, fromIndex: 2, toIndex: 1, isFront: true, hintText: "⬇️ [되돌아박기] 1칸 뒤 2번 구멍으로 되돌아 꽂기! ⏪" },
      { stepIndex: 3, fromIndex: 1, toIndex: 3, isFront: false, hintText: "⬆️ [상단 전진] 2칸 앞 4번 구멍으로 밀어올리기! ⏩" },
      { stepIndex: 4, fromIndex: 3, toIndex: 2, isFront: true, hintText: "⬇️ [되돌아박기] 1칸 뒤 3번 구멍으로 되돌아 꽂기! ⏪" },
      { stepIndex: 5, fromIndex: 2, toIndex: 4, isFront: false, hintText: "⬆️ [오른쪽 위] 2칸 앞 5번 구멍(오른쪽 위 모서리)으로 밀어올리기! ⏩" },
      { stepIndex: 6, fromIndex: 4, toIndex: 3, isFront: true, hintText: "⬇️ [상단 완성] 1칸 뒤 4번 구멍으로 되돌아 꽂기! ✂️ (매듭짓고 실자르기)" },

      // [2변: 우측 세로줄] 4~7번 구멍 (5스텝: Step 7~11) - 5번 구멍(6번)에서 새 실로 독립 시작!
      { stepIndex: 7, fromIndex: 5, toIndex: 4, isFront: true, hintText: "⬇️ [우측 시작] 5번 구멍(오른쪽 위 모서리)으로 되돌아 꽂기! 🪡 (새 실 시작)" },
      { stepIndex: 8, fromIndex: 4, toIndex: 6, isFront: false, hintText: "⬆️ [우측 전진] 2칸 앞 7번 구멍으로 밀어올리기! ⬇️" },
      { stepIndex: 9, fromIndex: 6, toIndex: 5, isFront: true, hintText: "⬇️ [되돌아박기] 1칸 뒤 6번 구멍으로 되돌아 꽂기! ⏪" },
      { stepIndex: 10, fromIndex: 5, toIndex: 7, isFront: false, hintText: "⬆️ [오른쪽 아래] 2칸 앞 8번 구멍(오른쪽 아래 모서리)으로 밀어올리기! ⬇️" },
      { stepIndex: 11, fromIndex: 7, toIndex: 6, isFront: true, hintText: "⬇️ [우측 완성] 1칸 뒤 7번 구멍으로 되돌아 꽂기! ✂️ (매듭짓고 실자르기)" },

      // [3변: 하단 가로줄] 7~11번 구멍 (7스텝: Step 12~18) - 8번 구멍(9번)에서 새 실로 독립 시작!
      { stepIndex: 12, fromIndex: 8, toIndex: 7, isFront: true, hintText: "⬇️ [하단 시작] 8번 구멍(오른쪽 아래 모서리)으로 되돌아 꽂기! 🪡 (새 실 시작)" },
      { stepIndex: 13, fromIndex: 7, toIndex: 9, isFront: false, hintText: "⬆️ [하단 전진] 2칸 앞 10번 구멍으로 밀어올리기! ⬅️" },
      { stepIndex: 14, fromIndex: 9, toIndex: 8, isFront: true, hintText: "⬇️ [되돌아박기] 1칸 뒤 9번 구멍으로 되돌아 꽂기! ⏪" },
      { stepIndex: 15, fromIndex: 8, toIndex: 10, isFront: false, hintText: "⬆️ [하단 전진] 2칸 앞 11번 구멍으로 밀어올리기! ⬅️" },
      { stepIndex: 16, fromIndex: 10, toIndex: 9, isFront: true, hintText: "⬇️ [되돌아박기] 1칸 뒤 10번 구멍으로 되돌아 꽂기! ⏪" },
      { stepIndex: 17, fromIndex: 9, toIndex: 11, isFront: false, hintText: "⬆️ [왼쪽 아래] 2칸 앞 12번 구멍(왼쪽 아래 모서리)으로 밀어올리기! ⬅️" },
      { stepIndex: 18, fromIndex: 11, toIndex: 10, isFront: true, hintText: "⬇️ [하단 완성] 1칸 뒤 11번 구멍으로 되돌아 꽂기! ✂️ (매듭짓고 실자르기)" },

      // [4변: 좌측 세로줄] 11~0번 구멍 (5스텝: Step 19~23) - 12번 구멍(13번)에서 새 실로 독립 시작!
      { stepIndex: 19, fromIndex: 12, toIndex: 11, isFront: true, hintText: "⬇️ [좌측 시작] 12번 구멍(왼쪽 아래 모서리)으로 되돌아 꽂기! 🪡 (새 실 시작)" },
      { stepIndex: 20, fromIndex: 11, toIndex: 13, isFront: false, hintText: "⬆️ [좌측 전진] 2칸 앞 14번 구멍으로 밀어올리기! ⬆️" },
      { stepIndex: 21, fromIndex: 13, toIndex: 12, isFront: true, hintText: "⬇️ [되돌아박기] 1칸 뒤 13번 구멍으로 되돌아 꽂기! ⏪" },
      { stepIndex: 22, fromIndex: 12, toIndex: 0, isFront: false, hintText: "⬆️ [왼쪽 위] 2칸 앞 1번 구멍(왼쪽 위 모서리)으로 밀어올리기! 🎯" },
      { stepIndex: 23, fromIndex: 0, toIndex: 13, isFront: true, hintText: "⬇️ [최종 완성] 14번 구멍으로 되돌아 꽂아 네모 덧댐 박음질 완성! 👑" },
    ],
    introDialog: [
      {
        speaker: "narrator",
        text: "드디어 사또의 큰잔치 날 아침!\n콩쥐가 곱게 다려둔 옥색 비단 배자를 입으려던 찰나...",
      },
      {
        speaker: "patji",
        text: "어쭈! 콩쥐 네가 감히 이런 고운 비단 배자를 입고 잔치에 가겠다고?!\n어림없지, 이얍!",
        emotion: "angry",
      },
      {
        speaker: "narrator",
        text: "심술이 폭발한 팥쥐가 배자를 홱 잡아당겨,\n옆구리 솔기가 좍 터지고 말았어요!",
      },
      {
        speaker: "kongji",
        text: "앗, 내 배자가...\n잔치 시간이 다가오는데 어쩌지...?",
        emotion: "sad",
      },
      {
        speaker: "doobi",
        text: "울지 마시오, 콩쥐!\n찢어진 배자 상처 위에 고운 덧댐 비단을 올리고, 네모 테두리를 가장 튼튼한 '박음질'로 꿰매면 새 옷보다 훨씬 멋지고 짱짱해지오!",
        emotion: "sparkle",
      },
      {
        speaker: "saemi",
        text: "맞아요! 네 모서리를 돌아가며 한 걸음 나아갔다가 반 걸음 되돌아와 꿰매는 온박음질로 테두리를 꽉 잡아주세요!",
      },
      {
        speaker: "doobi",
        text: "팥쥐가 놀라 까무러치도록,\n어디 단단하게 네모 덧댐 박음질로 배자를 고쳐 입읍시다!",
        actionPrompt: "찢어진 배자에 덧댐 비단을 대고 네모 테두리를 한 땀도 풀리지 않는 튼튼한 박음질로 완벽히 수선하세요!",
      },
    ],
    successDialog: [
      {
        speaker: "doobi",
        text: "하하하! 뒤쪽 땀까지 탄탄하게 이어져\n장정이 잡아당겨도 절대 안 뜯어지겠소!",
        emotion: "happy",
      },
      {
        speaker: "kongji",
        text: "정말 짱짱해!\n찢어지기 전보다 훨씬 맵시 있고 튼튼해졌어!",
        emotion: "sparkle",
      },
      {
        speaker: "saemi",
        text: "짹짹! 팥쥐 언니가 보면 깜짝 놀라겠어요!",
      },
    ],
    rewardText: "청아한 비단 명주실 & 옥색 비단 조각",
    rewardIcon: "👘",
  },
  {
    id: 4,
    title: "관아의 침선 경연, 꽃단추와 실기둥",
    subTitle: "관아 시험장 최고 난도 실기 과제! 꽃단추달고 실기둥 만들기",
    techniqueName: "단추달기 & 실기둥",
    missionGoal: "꽃단추달고 실기둥 만들기",
    icon: "🔘",
    badge: "제 4화",
    bgImageSrc: "/images/story/bg_story_ep4.webp",
    targetCourseId: "button",
    targetLevel: 3, // 4구멍 X자 단추 + 실기둥
    totalHoles: 4,
    isCurve: false,
    archHeight: 120,
    tolerance: 120,
    holePoints: [
      { index: 0, x: 380, y: 320 },
      { index: 1, x: 440, y: 320 },
      { index: 2, x: 500, y: 320 },
      { index: 3, x: 560, y: 320 },
    ],
    stitchSteps: [
      { stepIndex: 0, fromIndex: 0, toIndex: 0, isFront: false, hintText: "🔄 [시작] 단추달기는 천 밑에서 시작합니다! ①번 구멍으로 밀어올리세요!" },
      { stepIndex: 1, fromIndex: 0, toIndex: 3, isFront: true, hintText: "⬇️ [대각선 1회] ①번 ➡️ ④번 구멍으로 대각선 푹 꽂기!" },
      { stepIndex: 2, fromIndex: 3, toIndex: 0, isFront: false, hintText: "⬆️ [대각선 2회] 천 밑에서 ①번 구멍으로 다시 쏙 밀어올리기!" },
      { stepIndex: 3, fromIndex: 0, toIndex: 3, isFront: true, hintText: "⬇️ [대각선 2회] ④번 구멍으로 푹 꽂아 첫 번째 대각선 완성!" },
      { stepIndex: 4, fromIndex: 3, toIndex: 1, isFront: false, hintText: "⬆️ [대각선 이동] 천 밑에서 ②번 구멍(우상)으로 쏙 밀어올리기!" },
      { stepIndex: 5, fromIndex: 1, toIndex: 2, isFront: true, hintText: "⬇️ [대각선 1회] ②번 ➡️ ③번 구멍(좌하)으로 대각선 교차 푹 꽂기!" },
      { stepIndex: 6, fromIndex: 2, toIndex: 1, isFront: false, hintText: "⬆️ [대각선 2회] 천 밑에서 ②번 구멍으로 다시 쏙 밀어올리기!" },
      { stepIndex: 7, fromIndex: 1, toIndex: 2, isFront: true, hintText: "⬇️ [대각선 2회] ③번 구멍으로 푹 꽂아 완벽한 X자 크로스 완성!" },
      { stepIndex: 8, fromIndex: 2, toIndex: 0, isFront: false, isShankWrap: true, wrapTargetCount: 3, hintText: "🌀 [실기둥 감기] 단추 아래를 뱅글뱅글 3회 감아 완벽한 정장 실기둥 만들기!" },
    ],
    introDialog: [
      {
        speaker: "narrator",
        text: "사또의 큰잔치가 열린 관아 마당에 도착하자,\n고을 최고의 바느질 장인을 선발하는 '침선(針線) 경연'의 방이 성대하게 붙어 있었어요!",
      },
      {
        speaker: "doobi",
        text: "콩쥐! 그대의 뛰어난 바느질 솜씨라면 당당히 장원에 오를 수 있소!\n어서 관아 경연장으로 갑시다!",
        emotion: "sparkle",
      },
      {
        speaker: "magistrate",
        text: "흠! 이번 침선 경연의 최고 난도 실기 과제는\n'꽃단추달기와 실기둥 세우기'로다!\n단추를 옷감에 바짝 붙여 달면 반대편 단추구멍 천이 들어갈 틈이 없어 옷이 안 잠기거나 흉하게 구겨지느니라!",
      },
      {
        speaker: "saemi",
        text: "맞아요! 단추구멍이 있는 반대편 옷감의 '두께'만큼,\n단추 밑에 실을 3회 뱅글뱅글 감아 도톰한 '실기둥'을 세워야 옷이 쏙 끼워져 평평하고 맵시 있게 잠겨요!",
        emotion: "sparkle",
      },
      {
        speaker: "kongji",
        text: "아하! 반대편 옷감 두께를 위한 여유 공간이었군요!\n단추 밑으로 바늘을 빼내어 실을 짱짱하게 감아 완벽한 실기둥을 세워볼게요!",
        emotion: "happy",
        actionPrompt: "사또의 침선 경연 실기 과제! 4구멍 꽃단추를 달고 도톰한 실기둥을 단단히 세워주세요!",
      },
    ],
    successDialog: [
      {
        speaker: "magistrate",
        text: "오오! 단추 밑에 도톰하고 단단하게 선 저 완벽한 실기둥을 보아라!\n옷이 한 치의 어긋남도 없이 쏙 여며지는구나! 네가 단연 실기 시험 1등이로다!",
        emotion: "sparkle",
      },
      {
        speaker: "doobi",
        text: "만세! 우리 콩쥐가 실기 시험 1등을 차지했소!\n이제 사또 나으리가 좌정하신 관아 본청의 최종 문답 시험만 통과하면 대망의 장원급제요!",
        emotion: "happy",
      },
      {
        speaker: "kongji",
        text: "두비와 함께 정성껏 연습한 덕분이야!\n마지막 관문도 최선을 다할게!",
        emotion: "sparkle",
      },
    ],
    rewardText: "오로라 크리스탈 바늘 & 실기 1등 마패",
    rewardIcon: "🥇",
  },
  {
    id: 5,
    title: "관아 본청의 최종 문답, 대망의 장원급제",
    subTitle: "사또 나으리 앞 손바느질 개념문제 통달하기",
    techniqueName: "손바느질 침선 과거시험",
    missionGoal: "손바느질 개념문제 통달하기",
    icon: "📜",
    badge: "제 5화 (최종)",
    bgImageSrc: "/images/story/bg_story_ep5.webp?v=3",
    targetCourseId: "quiz",
    targetLevel: 1,
    introDialog: [
      {
        speaker: "narrator",
        text: "실기 시험 1등을 차지한 콩쥐가 사또 나으리가 좌정하신 관아 본청에 들어서자,\n온 고을 사람들의 이목이 집중되었어요!",
      },
      {
        speaker: "patji",
        text: "에엣?! 콩쥐 제가 어떻게 실기 1등을 한 거야?\n말도 안 돼!",
        emotion: "surprised",
      },
      {
        speaker: "magistrate",
        text: "실기 1등 낭자, 솜씨는 뛰어나나 진정한 침선 장원급제자가 되려면\n이론과 안전 수칙도 통달해야 하느니라!\n내 친히 손바느질 핵심개념 10문제를 낼 터이니 실력을 증명해 보거라!",
        emotion: "sparkle",
      },
      {
        speaker: "kongji",
        text: "두비와 함께 익힌 손바느질의 모든 원리라면 자신 있어요!\n사또 나으리, 시험을 내어 주세요!",
        actionPrompt: "사또의 손바느질 과거시험 핵심개념 10문항을 모두 맞혀 장원급제하세요!",
      },
    ],
    successDialog: [
      {
        speaker: "magistrate",
        text: "대망의 장원급제로다! 어사화를 머리에 꽂고 교지를 받으라!\n네가 우리 고을 최고의 침선 낭자이며, 조정에도 으뜸 침선관으로 천거하겠노라!",
        emotion: "sparkle",
      },
      {
        speaker: "patji",
        text: "으앙... 콩쥐야 미안해... 실은 네 솜씨가 너무 부러워서 심술을 부렸어...\n나도 너처럼 멋지게 바느질하고 싶어...",
        emotion: "sad",
      },
      {
        speaker: "kongji",
        text: "팥쥐야, 울지 마. 바늘과 실만 있으면 누구나 장인이 될 수 있어.\n내가 처음부터 다 가르쳐줄게!",
        emotion: "happy",
      },
      {
        speaker: "doobi",
        text: "얼씨구 좋다!\n미움은 실밥처럼 잘라내고, 우애는 단단한 박음질로 영원히 이어졌도다!",
        emotion: "sparkle",
      },
    ],
    rewardText: "전설의 황금 바늘 & 퀼트 누비 & 장원급제 어사화",
    rewardIcon: "👑",
    quizQuestions: [
      {
        id: 1,
        question: "손바느질을 할 때 실이 쉽게 엉키거나 꼬이지 않도록 준비하는 가장 적당한 실의 길이는?",
        options: ["키만큼 길게 잰 길이", "손가락 한 마디 길이 (약 3cm)", "바늘귀에서 손목까지 약 10cm", "팔 한쪽 길이 (약 40~50cm)"],
        answerIndex: 3,
        explanation: "실이 너무 길면 바느질 도중 쉽게 엉키므로, 팔 한쪽 길이(약 40~50cm)로 잘라 쓰는 것이 가장 적당해요.",
      },
      {
        id: 2,
        question: "바느질을 시작할 때, 첫 땀에서 실이 천을 쑥 빠져나가지 않도록 실 끝에 짓는 것은?",
        options: ["시작 매듭", "끝 매듭", "실기둥", "주름잡기"],
        answerIndex: 0,
        explanation: "바느질 시작 전 실 끝에 '시작 매듭'을 지어야 천에 걸려 빠져나가지 않아요.",
      },
      {
        id: 3,
        question: "두 장의 천이 비뚤어지거나 밀리지 않도록 임시로 널찍하게(약 2~3cm) 꿰매어 두는 바느질은?",
        options: ["박음질", "시침질", "감침질", "공그르기"],
        answerIndex: 1,
        explanation: "시침질은 본 바느질 전에 두 겹의 천이 어긋나지 않도록 널찍하게 임시 고정하고 나중에 뜯어내는 바느질이에요.",
      },
      {
        id: 4,
        question: "땀의 간격과 크기를 일정하게(약 0.2~0.4cm) 천의 위아래로 연속해서 오가며 꿰매는 가장 기본적이고 대중적인 손바느질은?",
        options: ["홈질", "박음질", "감침질", "단추달기"],
        answerIndex: 0,
        explanation: "홈질은 땀과 땀 사이 간격을 고르게 오가며 꿰매는 가장 기초적인 바느질이며, 주름을 잡을 때도 쓰여요.",
      },
      {
        id: 5,
        question: "앞으로 한 땀 나아갔다가 다시 뒤로 되돌아와 꿰매어, 재봉틀로 박은 것처럼 겉에서 빈틈이 없고 가장 튼튼한 바느질은?",
        options: ["시침질", "홈질", "박음질", "실뜯기"],
        answerIndex: 2,
        explanation: "박음질은 뒤로 되돌아와 빈틈없이 메우므로 옷의 솔기나 주머니처럼 힘을 많이 받는 곳에 가장 튼튼해요.",
      },
      {
        id: 6,
        question: "옷감의 가장자리가 풀리지 않도록 실로 올을 비스듬히 감싸며 꿰매거나, 두 장의 천 끝을 맞대어 이을 때 쓰는 바느질은?",
        options: ["감침질", "시침질", "홈질", "박음질"],
        answerIndex: 0,
        explanation: "감침질은 옷감 가장자리의 올이 풀리지 않도록 비스듬하게 감싸거나 천 가장자리를 맞붙여 꿰맬 때 사용해요.",
      },
      {
        id: 7,
        question: "단을 접어 넣고 실밥이 천의 겉면이나 안면에서 거의 보이지 않도록 옷 밑단을 깔끔하게 처리할 때 사용하는 바느질은?",
        options: ["박음질", "시침질", "공그르기", "주름질"],
        answerIndex: 2,
        explanation: "공그르기는 접힌 단 속으로 바늘을 통과시켜 겉과 안 모두에서 실밥이 거의 드러나지 않게 밑단을 꿰매는 바느질이에요.",
      },
      {
        id: 8,
        question: "두꺼운 옷감에 구멍 단추를 달 때, 옷이 울지 않고 편안하게 여며지도록 단추 밑에 실을 3~4회 감아 '실기둥'을 세우는 이유는?",
        options: ["실의 색깔을 돋보이게 하려고", "단추가 헐렁하게 흔들거리게 하려고", "반대쪽 옷감 두께가 들어갈 공간을 만들기 위해", "바늘이 부러지는 것을 막기 위해"],
        answerIndex: 2,
        explanation: "옷감이 겹쳐서 여며지는 두께만큼 단추와 천 사이에 여유 공간이 있어야 옷이 불룩해지지 않고 쏙 잠겨요.",
      },
      {
        id: 9,
        question: "두꺼운 천을 통과할 때 바늘귀를 손끝으로 힘껏 밀어야 하는데, 손가락이 찔리지 않도록 가운뎃손가락 끝에 끼는 안전 도구는?",
        options: ["핀쿠션", "골무", "쪽가위", "초크"],
        answerIndex: 1,
        explanation: "골무(Thimble)는 바늘을 꾹 누를 때 손가락 끝이 찔리거나 굳은살이 배기지 않도록 보호해 주는 안전 도구예요.",
      },
      {
        id: 10,
        question: "바느질 도구를 안전하게 다루는 올바른 방법으로 가장 적절한 것은?",
        options: [
          "사용하던 바늘은 잃어버리지 않게 입에 물고 있는다.",
          "가위를 다른 사람에게 건넬 때는 뾰족한 칼날을 쥐고 손잡이를 상대방 쪽으로 향하게 건넨다.",
          "쓰고 난 시침핀은 책상이나 방바닥에 흩어놓는다.",
          "바느질이 끝나면 실을 이빨로 힘껏 물어뜯는다."
        ],
        answerIndex: 1,
        explanation: "가위를 전달할 때는 뾰족한 날 쪽을 내가 잡고 손잡이가 상대방을 향하게 건네야 안전사고를 예방할 수 있어요.",
      },
    ],
  },
];
