"use client";

import { EosahwaIcon } from "./EosahwaIcon";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoCourseSelect: () => void;
  courseName: string;
  studentName: string;
  onStudentNameChange: (name: string) => void;
  totalStars: number;
  isGyoji?: boolean; // 📜 스토리 5화 과거시험 장원급제 교지 모드
}

/** 📜 꼬매팡 마스터 공인 인증서 & 조선시대 장원급제 교지 모달 */
export default function CertificateModal({
  isOpen,
  onClose,
  onGoCourseSelect,
  courseName,
  studentName,
  onStudentNameChange,
  totalStars,
  isGyoji = false,
}: CertificateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      {isGyoji ? (
        /* 📜 [조선시대 관아 동헌 장원급제 교지(敎旨)] 전통 서식 */
        <div className="bg-[#FAF5ED] border-4 sm:border-6 border-[#8B2500] rounded-[2rem] p-4 sm:p-6 w-full max-w-md sm:max-w-lg shadow-[8px_8px_0_0_#5A1800] relative text-center max-h-[90vh] overflow-y-auto">
          {/* 어사화 장원급제 상단 뱃지 */}
          <div className="mb-1 animate-bounce flex justify-center">
            <EosahwaIcon size={52} />
          </div>
          <div className="inline-block bg-[#8B2500] text-[#FFF9E6] px-3.5 py-0.5 rounded-full font-black text-xs sm:text-sm tracking-widest mb-1 shadow-xs">
            관아 침선 과거시험 으뜸 장원
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#5A1800] tracking-widest mb-1 font-serif">
            敎 旨
          </h2>
          <div className="text-xs font-bold text-[#8B2500] tracking-wider mb-2">[ 교 지 ]</div>
          <div className="w-32 h-1 bg-[#8B2500] mx-auto mb-3 rounded-full"></div>

          {/* 교지 본문 */}
          <div className="bg-[#FFFDF7] border-2 border-[#D4A373] rounded-2xl p-3.5 sm:p-4 mb-3.5 text-left shadow-inner">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#E8D5C4]">
              <span className="text-xs sm:text-sm font-black text-[#5A1800]">及第者 (급제자) :</span>
              <input
                type="text"
                value={studentName || "콩쥐"}
                onChange={(e) => onStudentNameChange(e.target.value)}
                className="border-b-2 border-[#8B2500] bg-transparent font-black text-base sm:text-lg text-[#5A1800] px-1 focus:outline-none flex-1 font-serif"
                placeholder="콩쥐"
              />
            </div>
            <p className="text-xs sm:text-sm text-[#4A2810] font-bold leading-relaxed mb-3 font-serif">
              위 사람은 지극한 정성과 뛰어난 손바느질 기량으로 관아 침선 과거시험의 모든 실기와 이론을 완벽히 통달하여 <strong>장원급제(壯元及第)</strong> 하였으므로, 본 교지를 내리고 고을 최고의 침선 명장으로 천거하노라.
            </p>
            <div className="flex justify-between items-center text-[11px] sm:text-xs font-black text-[#8B2500] pt-1">
              <span>시험 과목: 관아 손바느질 10대 핵심개념</span>
              <span>성적: 으뜸 (10/10 만점)</span>
            </div>
          </div>

          {/* 사또 관아 수령지인(守令之印) 붉은 방인 */}
          <div className="flex justify-between items-end mb-4 px-2">
            <div className="text-left text-xs font-black text-[#5A1800]">
              <p>조선국 관아 동헌</p>
              <p className="text-sm">사또 나으리 배상 📜</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-[#8B2500]">관아 공식 인출</span>
              <div className="w-14 h-14 sm:w-16 sm:h-16 border-3 border-[#B22222] bg-[#FFF0F0] text-[#B22222] font-black text-[11px] sm:text-xs flex flex-col items-center justify-center rotate-[-6deg] shadow-sm animate-pulse rounded-md font-serif">
                <span>守令</span>
                <span>之印</span>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                onClose();
                onGoCourseSelect();
              }}
              className="bg-white hover:bg-[#FFF9E6] text-[#5A1800] font-black py-2.5 sm:py-3 rounded-xl border-3 border-[#8B2500] shadow-[3px_3px_0_0_#5A1800] active:translate-x-0.5 active:translate-y-0.5 transition-all text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>🗺️</span>
              <span>이야기 목록으로 나가기</span>
            </button>

            <button
              onClick={onClose}
              className="bg-[#8B2500] hover:bg-[#6D1D00] text-white font-black py-2.5 sm:py-3 rounded-xl border-3 border-[#5A1800] shadow-[3px_3px_0_0_#5A1800] active:translate-x-0.5 active:translate-y-0.5 transition-all text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>📜</span>
              <span>교지 간직하기</span>
            </button>
          </div>
        </div>
      ) : (
        /* 🏅 [일반 코스 공인 인증서] */
        <div className="bg-[#FFFDF7] border-4 sm:border-6 border-[#6E4720] rounded-[2rem] p-4 sm:p-6 w-full max-w-md sm:max-w-lg shadow-[8px_8px_0_0_#6E4720] relative text-center max-h-[90vh] overflow-y-auto">
          {/* 자격증 장식 리본 */}
          <div className="text-4xl sm:text-5xl mb-1.5 animate-bounce">🏅</div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#5C3A16] mb-1">
            꼬매팡 {courseName} 인증서
          </h2>
          <div className="w-24 h-1.5 bg-[#E76F51] mx-auto mb-3 rounded-full"></div>

          <p className="text-xs text-[#8C6239] font-bold mb-3 leading-relaxed">
            위 플레이어는 <strong>꼬매팡 [{courseName}]</strong>의 모든 바느질 과정을 정교하고 뛰어난 실력으로 마스터하였으므로 이 인증서를 수여합니다.
          </p>

          <div className="bg-[#FFF9E6] border-2 border-[#D4C2A8] rounded-xl p-3 sm:p-3.5 mb-3.5 text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-[#8C6239]">달인 이름 :</span>
              <input
                type="text"
                value={studentName}
                onChange={(e) => onStudentNameChange(e.target.value)}
                className="border-b-2 border-[#6E4720] bg-transparent font-black text-sm sm:text-base text-[#5C3A16] px-1 focus:outline-none flex-1"
              />
            </div>
            <div className="flex justify-between text-xs font-bold text-[#6E4720]">
              <span>총 획득 별: ⭐ {totalStars}개</span>
              <span>공인 등급: {courseName} 마스터</span>
            </div>
          </div>

          {/* 협회 공인 직인 */}
          <div className="flex justify-end items-center gap-2.5 mb-4 pr-3">
            <span className="text-[11px] sm:text-xs font-black text-[#8C6239]">꼬매팡 협회 공인</span>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-3 border-[#E76F51] text-[#E76F51] font-black text-[11px] sm:text-xs flex items-center justify-center rotate-[-12deg] shadow-sm animate-pulse bg-red-50">
              꼬매팡<br />명인
            </div>
          </div>

          {/* 인증서 액션 버튼 2종 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                onClose();
                onGoCourseSelect();
              }}
              className="bg-white hover:bg-[#FFF9E6] text-[#5C3A16] font-black py-2.5 sm:py-3 rounded-xl border-3 border-[#6E4720] shadow-[3px_3px_0_0_#6E4720] active:translate-x-0.5 active:translate-y-0.5 transition-all text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>🗺️</span>
              <span>코스 메뉴로 나가기</span>
            </button>

            <button
              onClick={onClose}
              className="bg-[#E76F51] hover:bg-[#D65D3F] text-white font-black py-2.5 sm:py-3 rounded-xl border-3 border-[#6E4720] shadow-[3px_3px_0_0_#6E4720] active:translate-x-0.5 active:translate-y-0.5 transition-all text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>🪡</span>
              <span>확인 및 계속 연습하기</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
