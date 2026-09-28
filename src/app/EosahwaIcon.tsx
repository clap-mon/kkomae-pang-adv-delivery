import React from "react";

interface EosahwaIconProps {
  size?: number | string;
  className?: string;
  title?: string;
}

/**
 * 🎓 장원급제 어사화(御賜花) 전용 전통 벡터 아이콘
 * - 조선시대 장원급제자 복두(검은 관모)
 * - 높은 포물선을 그리며 앞으로 늘어지는 2가닥 금빛 꽃가지(화지)
 * - 가지를 따라 알록달록 꿰어진 삼색/오색 지화(한지 꽃)
 */
export const EosahwaIcon: React.FC<EosahwaIconProps> = ({
  size = 36,
  className = "",
  title = "장원급제 어사화",
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      aria-label={title}
      role="img"
    >
      <title>{title}</title>

      {/* ✨ 장원급제 영예의 황금 반짝이 빛 */}
      <circle cx="20" cy="3" r="1" fill="#FFD166" opacity="0.9" />
      <path
        d="M 39 10 L 40 12 L 42 13 L 40 14 L 39 16 L 38 14 L 36 13 L 38 12 Z"
        fill="#FFC300"
        opacity="0.85"
      />

      {/* 🌿 1. 어사화 꽃가지 2가닥 (유려한 포물선 아치 곡선) */}
      {/* 바깥쪽 긴 줄기 */}
      <path
        d="M 32 25 C 35 7, 19 1.5, 6 15 C 3 19, 2 24, 4 29"
        stroke="#D49A3D"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* 안쪽 줄기 */}
      <path
        d="M 30 26 C 31 11, 19 6.5, 10 18 C 7 22, 6 26, 8 31"
        stroke="#C68928"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* 🌸 2. 줄기에 달린 전통 오색 지화(꽃들) */}
      {/* [바깥 줄기 꽃들] */}
      {/* 꽃 1: 상단 중앙 - 황금 노랑 꽃 */}
      <g transform="translate(23, 4.5)">
        <circle cx="0" cy="0" r="3.2" fill="#FFC300" stroke="#B8860B" strokeWidth="0.6" />
        <circle cx="0" cy="0" r="1.3" fill="#FFF" />
      </g>

      {/* 꽃 2: 좌상단 꺾임 - 화사한 홍매화(다홍) 꽃 */}
      <g transform="translate(14, 8)">
        <circle cx="0" cy="0" r="3.4" fill="#FF3B5C" stroke="#9E002B" strokeWidth="0.6" />
        <circle cx="0" cy="0" r="1.4" fill="#FFD1DC" />
      </g>

      {/* 꽃 3: 좌측 중간 - 청록/바다색 꽃 */}
      <g transform="translate(7, 16.5)">
        <circle cx="0" cy="0" r="3.2" fill="#06D6A0" stroke="#007F5F" strokeWidth="0.6" />
        <circle cx="0" cy="0" r="1.3" fill="#E8FDF5" />
      </g>

      {/* 꽃 4: 좌측 하단 끝 - 고운 자색(보라) 꽃 */}
      <g transform="translate(4, 27)">
        <circle cx="0" cy="0" r="3.0" fill="#9D4EDD" stroke="#5A189A" strokeWidth="0.6" />
        <circle cx="0" cy="0" r="1.2" fill="#F3E8FF" />
      </g>

      {/* [안쪽 줄기 꽃들] */}
      {/* 꽃 5: 안쪽 상단 - 다홍 꽃 */}
      <g transform="translate(21, 10.5)">
        <circle cx="0" cy="0" r="2.8" fill="#FF597B" stroke="#B31E45" strokeWidth="0.6" />
        <circle cx="0" cy="0" r="1.1" fill="#FFF" />
      </g>

      {/* 꽃 6: 안쪽 중간 - 황금 노랑 꽃 */}
      <g transform="translate(12, 15)">
        <circle cx="0" cy="0" r="2.8" fill="#FFD166" stroke="#C79218" strokeWidth="0.6" />
        <circle cx="0" cy="0" r="1.1" fill="#FFF" />
      </g>

      {/* 꽃 7: 안쪽 하단 - 청파랑 꽃 */}
      <g transform="translate(8, 24)">
        <circle cx="0" cy="0" r="2.8" fill="#118AB2" stroke="#073B4C" strokeWidth="0.6" />
        <circle cx="0" cy="0" r="1.1" fill="#E0F2FE" />
      </g>

      {/* 🎩 3. 조선시대 복두 (검은 사모 관모) */}
      {/* 좌우 사모 뿔(날개) - 흑단색 */}
      {/* 우측 날개 */}
      <path
        d="M 38 33 L 45.5 32 C 46.5 33 46.5 35 45.5 36 L 38 35.5 Z"
        fill="#1F2421"
        stroke="#111"
        strokeWidth="0.8"
      />
      {/* 좌측 날개 */}
      <path
        d="M 26 34 L 18.5 34.5 C 17.5 33.5 17.5 32 18.5 31.5 L 26 32.5 Z"
        fill="#1F2421"
        stroke="#111"
        strokeWidth="0.8"
      />

      {/* 복두 상단 봉우리 (뒤통수 턱) */}
      <rect
        x="27"
        y="23"
        width="10"
        height="8"
        rx="2.5"
        fill="#1E2022"
        stroke="#0E1012"
        strokeWidth="1.2"
      />
      {/* 상단 봉우리 금빛 갓끈/매듭 포인트 */}
      <rect x="29" y="27" width="6" height="1.2" rx="0.6" fill="#D4AF37" opacity="0.8" />

      {/* 복두 본체 (모자 하단) */}
      <path
        d="M 24 30.5 C 24 29 25.5 28 27.5 28 L 36.5 28 C 38.5 28 40 29 40 30.5 L 40.5 38.5 C 40.5 40 39 41 37 41 L 27 41 C 25 41 23.5 40 23.5 38.5 Z"
        fill="#2B2D42"
        stroke="#111318"
        strokeWidth="1.3"
      />

      {/* 모자 앞면 양감 하이라이트 */}
      <path
        d="M 26.5 31 L 37.5 31 C 38.5 31 39 31.8 39 33 L 25 33 C 25 31.8 25.5 31 26.5 31 Z"
        fill="#414460"
        opacity="0.45"
      />

      {/* 🔴 모자 턱끈 (전통 홍색 매듭 끈) */}
      <path
        d="M 27 40 C 26 42.5 24 44.5 23 46"
        stroke="#E63946"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M 37 40 C 38 42.5 40 44.5 41 46"
        stroke="#E63946"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default EosahwaIcon;
