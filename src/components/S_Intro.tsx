import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface SIntroProps {
  onStart: () => void;
}

export default function SIntro({ onStart }: SIntroProps) {
  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 space-y-10 text-center animate-fade-in font-sans">
      {/* Hero Header Area */}
      <div className="space-y-4 animate-fade-in">
        {/* Subtle decorative badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#C8D9E6]/45 border border-[#567C8D]/30 text-[#2F4156] text-xs font-semibold tracking-wide uppercase">
          <span>고용24 직업심리검사 L형 분석 기반</span>
        </div>

        {/* Big display title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#2F4156] font-display leading-tight md:leading-tight break-keep">
          직업심리검사 L형
          <br />
          해석을 통한 커리어코치
        </h1>

        {/* Dynamic description / Subtitle */}
        <p className="text-base sm:text-lg text-[#2F4156]/80 max-w-2xl mx-auto font-normal leading-relaxed">
          검사 결과로 나를 이해하고, 나와 일이 어떻게 연결되는지 풀어드립니다.
        </p>
      </div>

      {/* Main Feature Cards Section: "This is what you can do" */}
      <div className="space-y-4 text-left">
        <h2 className="text-xs font-bold text-[#567C8D] uppercase tracking-widest text-center mb-6">
          이 앱으로 할 수 있는 것
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 내 특성 이해 */}
          <div className="bg-white border border-[#C8D9E6] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#C8D9E6]/30 text-[#567C8D] flex items-center justify-center font-bold">
                01
              </div>
              <h3 className="text-base font-bold text-[#2F4156]">내 특성 이해</h3>
              <p className="text-xs text-[#2F4156]/70 leading-relaxed">
                흥미·성격·생활사 결과를 통합해 내가 어떤 환경에서 강점이 사는지 입체적으로 파악합니다.
              </p>
            </div>
          </div>

          {/* Card 2: 나와 일의 연결 해석 */}
          <div className="bg-white border border-[#C8D9E6] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#C8D9E6]/30 text-[#567C8D] flex items-center justify-center font-bold">
                02
              </div>
              <h3 className="text-base font-bold text-[#2F4156]">나와 일의 연결 해석</h3>
              <p className="text-xs text-[#2F4156]/70 leading-relaxed">
                검사 결과에서 내 강점을 도출하고, 그 강점이 어떤 일과 어떻게 맞닿는지 풀어줍니다. (특정 직업을 정답으로 강요하지 않고, 가능성으로 제시)
              </p>
            </div>
          </div>

          {/* Card 3: 지원서에 쓸 무기 만들기 */}
          <div className="bg-white border border-[#C8D9E6] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#C8D9E6]/30 text-[#567C8D] flex items-center justify-center font-bold">
                03
              </div>
              <h3 className="text-base font-bold text-[#2F4156]">지원서에 쓸 무기 만들기</h3>
              <p className="text-xs text-[#2F4156]/70 leading-relaxed">
                강점을 자기소개서·면접에 바로 쓸 수 있는 포인트로 정리해 드립니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-4 flex flex-col items-center justify-center space-y-3">
        <button
          onClick={onStart}
          className="group inline-flex items-center gap-2 py-3.5 px-8 bg-[#567C8D] text-white font-bold text-sm sm:text-base rounded-2xl hover:bg-[#2F4156] active:bg-[#1f2c3b] transition-all duration-200 shadow-md hover:scale-[1.01]"
        >
          시작하기
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="text-[11px] text-[#2F4156]/60 font-sans">
          * 고용24 직업심리검사 L형 결과 파일(PDF or 이미지)이 필요합니다.
        </p>
      </div>
    </div>
  );
}
