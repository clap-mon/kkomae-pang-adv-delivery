// 🧵 1. 실패(Spool) 스와치 아이콘
export function ThreadSpoolIcon({ color, dashColor }: { color: string; dashColor?: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" className="shrink-0 drop-shadow-xs">
      {/* 상단 목재 플랜지 */}
      <rect x="7" y="4" width="18" height="4" rx="2" fill="#8C6239" stroke="#5C3A16" strokeWidth="1.5" />
      {/* 하단 목재 플랜지 */}
      <rect x="7" y="24" width="18" height="4" rx="2" fill="#8C6239" stroke="#5C3A16" strokeWidth="1.5" />
      {/* 중앙 실패 기둥 및 실 다발 */}
      <rect x="9" y="8" width="14" height="16" rx="2" fill={color} stroke="#5C3A16" strokeWidth="1.2" />
      {/* 감긴 실 결 라인들 */}
      <line x1="9" y1="11" x2="23" y2="11" stroke={dashColor || "rgba(255,255,255,0.4)"} strokeWidth="1" strokeDasharray="2 1" />
      <line x1="9" y1="14" x2="23" y2="14" stroke={dashColor || "rgba(255,255,255,0.4)"} strokeWidth="1" strokeDasharray="2 1" />
      <line x1="9" y1="17" x2="23" y2="17" stroke={dashColor || "rgba(255,255,255,0.4)"} strokeWidth="1" strokeDasharray="2 1" />
      <line x1="9" y1="20" x2="23" y2="20" stroke={dashColor || "rgba(255,255,255,0.4)"} strokeWidth="1" strokeDasharray="2 1" />
    </svg>
  );
}

// 🪡 2. 고품격 바늘 스와치 아이콘 (왕관/다이아몬드 대신 진짜 바늘 일러스트)
export function NeedleSwatchIcon({ skinId }: { skinId: string }) {
  if (skinId === "gold") {
    // 👑 24K 전설의 황금 바늘 (찬란한 순금 메탈릭 & 블링블링 스파클)
    return (
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none" className="shrink-0 drop-shadow-md">
        <defs>
          <linearGradient id="goldNeedleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="18%" stopColor="#FFF7B2" />
            <stop offset="42%" stopColor="#FFDF00" />
            <stop offset="68%" stopColor="#F59E0B" />
            <stop offset="85%" stopColor="#FFFBEB" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="goldSheenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#FFF3A8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        {/* 황금 바늘 외곽 후광 글로우 */}
        <path
          d="M32 7 L12 29 C11.5 29.5 10.5 30.5 8 32 C9.5 29.5 10.5 28.5 11 28 L30 5 C30.8 4 32.5 4.5 33 5.5 C33.3 6 32.8 6.5 32 7 Z"
          stroke="#FDE047"
          strokeWidth="3.5"
          strokeOpacity="0.35"
        />
        {/* 바늘 몸통 (대각선 메탈릭 바디) */}
        <path
          d="M32 7 L12 29 C11.5 29.5 10.5 30.5 8 32 C9.5 29.5 10.5 28.5 11 28 L30 5 C30.8 4 32.5 4.5 33 5.5 C33.3 6 32.8 6.5 32 7 Z"
          fill="url(#goldNeedleGrad)"
          stroke="#B45309"
          strokeWidth="0.8"
        />
        {/* 바늘 칼날 광택 스펙큘러 라인 */}
        <path
          d="M30.5 6.2 L12 27.2"
          stroke="url(#goldSheenGrad)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
        {/* 바늘귀 (타원 구멍) */}
        <ellipse cx="29" cy="8" rx="1.3" ry="2.5" transform="rotate(45 29 8)" fill="#78350F" />
        <ellipse cx="29" cy="8" rx="1.3" ry="2.5" transform="rotate(45 29 8)" stroke="#FFEAA7" strokeWidth="0.5" fill="none" />
        {/* 🌟 블링블링 금빛 스파클 스타 3개 */}
        {/* 메인 대형 스타 */}
        <path d="M16 11 L17.5 14.5 L21 16 L17.5 17.5 L16 21 L14.5 17.5 L11 16 L14.5 14.5 Z" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="0.5" />
        <circle cx="16" cy="16" r="1" fill="#FFFFFF" />
        {/* 보조 소형 스타 1 (바늘 끝 쪽) */}
        <path d="M9 25 L9.8 27 L12 27.8 L9.8 28.6 L9 31 L8.2 28.6 L6 27.8 L8.2 27 Z" fill="#FDE047" opacity="0.95" />
        {/* 보조 소형 스타 2 (바늘귀 쪽) */}
        <path d="M26 4 L26.6 5.5 L28 6.1 L26.6 6.7 L26 8 L25.4 6.7 L24 6.1 L25.4 5.5 Z" fill="#FFFFFF" opacity="0.90" />
      </svg>
    );
  }

  if (skinId === "crystal") {
    // 🔮 오로라 크리스탈 바늘
    return (
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none" className="shrink-0 drop-shadow-sm">
        <defs>
          <linearGradient id="crystalNeedleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A5F3FC" />
            <stop offset="30%" stopColor="#C084FC" />
            <stop offset="70%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#67E8F9" />
          </linearGradient>
        </defs>
        {/* 바늘 몸통 */}
        <path
          d="M32 7 L12 29 C11.5 29.5 10.5 30.5 8 32 C9.5 29.5 10.5 28.5 11 28 L30 5 C30.8 4 32.5 4.5 33 5.5 C33.3 6 32.8 6.5 32 7 Z"
          fill="url(#crystalNeedleGrad)"
          stroke="#581C87"
          strokeWidth="1"
        />
        {/* 바늘귀 */}
        <ellipse cx="29" cy="8" rx="1.4" ry="2.6" transform="rotate(45 29 8)" fill="#3B0764" />
        {/* 크리스탈 프리즘 프리뷰 하이라이트 */}
        <path d="M26 14 L27 16 L29 17 L27 18 L26 20 L25 18 L23 17 L25 16 Z" fill="#FFFFFF" opacity="0.95" />
      </svg>
    );
  }

  if (skinId === "basic") {
    // 🪡 기본: 전통 무쇠(스틸) 바늘
    return (
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none" className="shrink-0 drop-shadow-sm">
        <defs>
          <linearGradient id="basicNeedleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="40%" stopColor="#64748B" />
            <stop offset="70%" stopColor="#475569" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
        </defs>
        <path
          d="M32 7 L12 29 C11.5 29.5 10.5 30.5 8 32 C9.5 29.5 10.5 28.5 11 28 L30 5 C30.8 4 32.5 4.5 33 5.5 C33.3 6 32.8 6.5 32 7 Z"
          fill="url(#basicNeedleGrad)"
          stroke="#1E293B"
          strokeWidth="1.2"
        />
        <ellipse cx="29" cy="8" rx="1.4" ry="2.6" transform="rotate(45 29 8)" fill="#0F172A" />
      </svg>
    );
  }

  // ✨ 신비한 은빛 바늘 (화사한 백은빛 + 반짝임)
  return (
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none" className="shrink-0 drop-shadow-sm">
      <defs>
        <linearGradient id="silverNeedleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#E2E8F0" />
          <stop offset="70%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
      </defs>
      {/* 바늘 몸통 */}
      <path
        d="M32 7 L12 29 C11.5 29.5 10.5 30.5 8 32 C9.5 29.5 10.5 28.5 11 28 L30 5 C30.8 4 32.5 4.5 33 5.5 C33.3 6 32.8 6.5 32 7 Z"
        fill="url(#silverNeedleGrad)"
        stroke="#475569"
        strokeWidth="1"
      />
      {/* 바늘귀 */}
      <ellipse cx="29" cy="8" rx="1.4" ry="2.6" transform="rotate(45 29 8)" fill="#1E293B" />
      {/* 은빛 반짝이 스파클 */}
      <path d="M20 12 L21 14 L23 15 L21 16 L20 18 L19 16 L17 15 L19 14 Z" fill="#38BDF8" opacity="0.9" />
    </svg>
  );
}

// 🎨 3. 실제 원단 질감을 보여주는 패브릭 스와치 (10종 원단 전수 완벽 지원)
export function FabricSwatchIcon({ patternType, frontBg, frontLine }: { patternType: string; frontBg: string; frontLine: string }) {
  // 10. 👑 빈티지 패치워크 퀼트: 실제 고화질 퀼트 텍스처 썸네일 직접 렌더링!
  if (patternType === "quilt") {
    return (
      <div
        className="w-9 h-9 rounded-xl border-2 border-[#6E4720] shrink-0 overflow-hidden shadow-xs relative"
        style={{
          backgroundImage: "url('/images/fabrics/quilt_patchwork_front.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        title="빈티지 패치워크 퀼트"
      >
        <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-xl pointer-events-none" />
      </div>
    );
  }

  return (
    <div
      className="w-9 h-9 rounded-xl border-2 border-[#6E4720] shrink-0 overflow-hidden shadow-xs relative"
      style={{ backgroundColor: frontBg }}
    >
      <svg width="100%" height="100%" viewBox="0 0 32 32">
        {/* 1. 🧵 내추럴 펠트 코튼 (순면 평직) */}
        {patternType === "cotton" && (
          <g stroke={frontLine} strokeWidth="1.8" strokeDasharray="3 3" opacity="0.65">
            <line x1="0" y1="6" x2="32" y2="6" />
            <line x1="0" y1="12" x2="32" y2="12" />
            <line x1="0" y1="18" x2="32" y2="18" />
            <line x1="0" y1="24" x2="32" y2="24" />
            <line x1="6" y1="0" x2="6" y2="32" />
            <line x1="12" y1="0" x2="12" y2="32" />
            <line x1="18" y1="0" x2="18" y2="32" />
            <line x1="24" y1="0" x2="24" y2="32" />
          </g>
        )}

        {/* 2. 📐 웜베이지 모눈 격자 */}
        {patternType === "grid" && (
          <g stroke={frontLine} strokeWidth="1">
            <line x1="0" y1="8" x2="32" y2="8" />
            <line x1="0" y1="16" x2="32" y2="16" />
            <line x1="0" y1="24" x2="32" y2="24" />
            <line x1="8" y1="0" x2="8" y2="32" />
            <line x1="16" y1="0" x2="16" y2="32" />
            <line x1="24" y1="0" x2="24" y2="32" />
          </g>
        )}

        {/* 3. 🏁 옐로우 깅엄 체크 */}
        {patternType === "gingham" && (
          <g>
            <rect x="0" y="0" width="16" height="16" fill={frontLine} opacity="0.45" />
            <rect x="16" y="16" width="16" height="16" fill={frontLine} opacity="0.45" />
            <rect x="16" y="0" width="16" height="16" fill={frontLine} opacity="0.2" />
            <rect x="0" y="16" width="16" height="16" fill={frontLine} opacity="0.2" />
          </g>
        )}

        {/* 4. 👖 인디고 데님 (능직 트윌 스티치) */}
        {patternType === "denim" && (
          <g stroke={frontLine} strokeWidth="1.6" strokeDasharray="3 2" opacity="0.85">
            <line x1="-10" y1="10" x2="20" y2="-20" />
            <line x1="-5" y1="20" x2="25" y2="-10" />
            <line x1="0" y1="30" x2="30" y2="0" />
            <line x1="5" y1="40" x2="35" y2="10" />
            <line x1="10" y1="50" x2="40" y2="20" />
          </g>
        )}

        {/* 5. 🌸 벚꽃 핑크 도트 */}
        {patternType === "dots" && (
          <g fill={frontLine}>
            <circle cx="8" cy="8" r="3" />
            <circle cx="24" cy="8" r="3" />
            <circle cx="16" cy="16" r="3.2" />
            <circle cx="8" cy="24" r="3" />
            <circle cx="24" cy="24" r="3" />
          </g>
        )}

        {/* 6. 🪻 라벤더 코튼 스트라이프 */}
        {patternType === "stripe" && (
          <g stroke={frontLine} strokeWidth="3" opacity="0.65">
            <line x1="6" y1="0" x2="6" y2="32" />
            <line x1="14" y1="0" x2="14" y2="32" />
            <line x1="22" y1="0" x2="22" y2="32" />
            <line x1="30" y1="0" x2="30" y2="32" />
          </g>
        )}

        {/* 7. 🌲 올리브 클래식 헤링본 */}
        {patternType === "herringbone" && (
          <g stroke={frontLine} strokeWidth="1.8" fill="none" opacity="0.75">
            <path d="M4 4 L16 12 L28 4" />
            <path d="M4 14 L16 22 L28 14" />
            <path d="M4 24 L16 32 L28 24" />
          </g>
        )}

        {/* 8. 🌷 빈티지 레트로 플라워 */}
        {patternType === "flower" && (
          <g>
            {/* 1번 꽃 */}
            <circle cx="10" cy="10" r="2.2" fill="#F59E0B" />
            <circle cx="8" cy="10" r="1.8" fill={frontLine} opacity="0.85" />
            <circle cx="12" cy="10" r="1.8" fill={frontLine} opacity="0.85" />
            <circle cx="10" cy="8" r="1.8" fill={frontLine} opacity="0.85" />
            <circle cx="10" cy="12" r="1.8" fill={frontLine} opacity="0.85" />
            <ellipse cx="14" cy="13" rx="2" ry="1.2" transform="rotate(30 14 13)" fill="#16A34A" />

            {/* 2번 꽃 */}
            <circle cx="22" cy="22" r="2.2" fill="#F59E0B" />
            <circle cx="20" cy="22" r="1.8" fill={frontLine} opacity="0.85" />
            <circle cx="24" cy="22" r="1.8" fill={frontLine} opacity="0.85" />
            <circle cx="22" cy="20" r="1.8" fill={frontLine} opacity="0.85" />
            <circle cx="22" cy="24" r="1.8" fill={frontLine} opacity="0.85" />
            <ellipse cx="26" cy="25" rx="2" ry="1.2" transform="rotate(30 26 25)" fill="#16A34A" />
          </g>
        )}

        {/* 9. 🌌 모던 차콜 카본 격자 */}
        {patternType === "carbon" && (
          <g stroke={frontLine} strokeWidth="1.2">
            <rect x="4" y="4" width="10" height="10" fill={frontLine} opacity="0.35" />
            <rect x="18" y="18" width="10" height="10" fill={frontLine} opacity="0.35" />
            <line x1="0" y1="16" x2="32" y2="16" strokeDasharray="2 2" />
            <line x1="16" y1="0" x2="16" y2="32" strokeDasharray="2 2" />
          </g>
        )}
      </svg>
    </div>
  );
}
