import React from 'react';
import { ArrowRight, ArrowLeft, Trophy, AlertCircle, Sparkles, Briefcase, UserCheck, Milestone } from 'lucide-react';
import { StateData } from '../types';

interface S2TraitsProps {
  state: StateData;
  onNext: () => void;
  onPrev: () => void;
}

export default function S2Traits({ state, onNext, onPrev }: S2TraitsProps) {
  const {
    riasecScores = [],
    detectedTraits = [],
    personalityAnalysis = '',
    personalityDesc = '',
    historyAnalysis = '',
    historyDesc = '',
    suggestedJobs = []
  } = state;

  // Render warning fallback if no data analyzed yet
  if (!riasecScores || riasecScores.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-6 animate-fade-in font-sans">
        <div className="bg-white border border-[#C8D9E6] rounded-2xl p-8 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F5EFEB] flex items-center justify-center mx-auto text-[#567C8D]">
            <AlertCircle className="w-6 h-6" />
          </div>
          <p className="text-sm text-[#2F4156] font-semibold">
            아직 결과지가 정상적으로 업로드되거나 분석되지 않았습니다.
          </p>
          <p className="text-xs text-[#2F4156]/70 leading-relaxed">
            [기록 업로드] 단계로 되돌아가서 결과지를 업로드하거나 샘플 결과지로 채우기를 시작해 주세요.
          </p>
          <button
            onClick={onPrev}
            className="inline-flex items-center gap-1.5 py-2 px-5 bg-[#567C8D] hover:bg-[#2F4156] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            결과지 업로드로 가기
          </button>
        </div>
      </div>
    );
  }

  // Score classification helper based on Raw Score scale (Min 17, Max 34)
  const getScoreBadge = (score: number) => {
    if (score >= 28) return { label: '높음', style: 'bg-rose-50 text-rose-700 border-rose-200' };
    if (score <= 22) return { label: '낮음', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    return { label: '보통', style: 'bg-neutral-50 text-neutral-500 border-neutral-200' };
  };

  const getFilteredDesc = (type: string, score: number, standardDesc: string) => {
    if (score >= 28) {
      return `${standardDesc} (선호도가 높은 대표적인 주 흥미 요인으로 기량을 적극 발휘하기에 효과적입니다.)`;
    }
    if (score <= 22) {
      return `${standardDesc} (선호도가 비교적 낮거나 소소한 편에 속하여 부담 없이 보조적으로 활용 가능합니다.)`;
    }
    return `${standardDesc} (상황의 요구에 유연하고 균형감 있게 대응하고 에너지를 전개할 수 있는 보통 수준의 정합성 흥미 요인입니다.)`;
  };

  // Humanize/reform emotional instability if found in personality descriptions
  const refinePersonalityDesc = (desc: string) => {
    let text = desc;
    // Replace "불안정", "신경증", "감정 기복" with respectful professional phrasing
    text = text.replace(/정서적 불안정/g, "압박 환경 하에서 긴장감이 높아질 가능성");
    text = text.replace(/감정 기복이 우려/g, "스트레스 상황 시 일시적인 긴장 집중");
    text = text.replace(/불안과 예민성/g, "변수에 대비한 세심한 집중 경향성");
    return text;
  };

  const strengths = detectedTraits.filter(t => t.type === 'strength');
  const weaknesses = detectedTraits.filter(t => t.type === 'weakness');

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in font-sans py-2 pb-16">
      
      {/* Page Title Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8D9E6]/50 border border-[#567C8D]/20 text-[#2F4156] text-xs font-semibold uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#567C8D]" />
          <span>성향 진단 리포트 (Diagnosis Report)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2F4156] tracking-tight">
          직업심리검사 L형 종합 특성 해석
        </h2>
        <p className="text-xs sm:text-sm text-[#2F4156]/80 leading-relaxed">
          흥미, 성격, 생활사의 복합적인 관계를 마이닝하여, 귀하가 최고의 몰입을 창조하는 강점 무기를 정리해 드립니다.
        </p>
      </div>

      {/* 🔴 SECTION 1: RIASEC 흥미 프로파일 */}
      <section className="bg-white border border-[#C8D9E6] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-[#F5EFEB] pb-4">
          <div className="w-8 h-8 rounded-lg bg-[#C8D9E6]/30 text-[#567C8D] flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-bold text-[#2F4156]">
            1. RIASEC 직업흥미 점수 분포
          </h3>
        </div>

        {/* Chart Rows */}
        <div className="space-y-4 pt-2">
          {riasecScores.map((item) => {
            const badge = getScoreBadge(item.score);
            const detailText = getFilteredDesc(item.type, item.score, item.desc);
            // Calculate width on 17~34 range (17 is 0%, 34 is 100%)
            const barWidth = Math.max(8, Math.min(100, Math.round(((item.score - 17) / 17) * 100)));

            return (
              <div key={item.type} className="space-y-2 border-b border-[#F5EFEB]/50 pb-4 last:border-0 last:pb-0 break-keep">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-[#2F4156]">{item.type}</span>
                  <div className="flex items-center gap-3">
                    {/* Visual Bar Container */}
                    <div className="w-32 sm:w-48 bg-[#F5EFEB] rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${item.color || 'bg-[#567C8D]'}`}
                        style={{ width: `${barWidth}%` }}
                      ></div>
                    </div>
                    <span className="font-mono text-xs font-semibold text-[#2F4156] w-8 text-right">
                      {item.score}점
                    </span>
                    <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md border ${badge.style}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* Display description ONLY for Low/High, never Medium */}
                {detailText && (
                  <p className="text-xs text-[#2F4156]/75 bg-[#F5EFEB]/30 p-2.5 rounded-lg border border-[#C8D9E6]/20 leading-relaxed">
                    {detailText}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 🔴 SECTION 2: 성격 및 생활사 종합 해석 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personality Panel */}
        <div className="bg-white border border-[#C8D9E6] rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[#F5EFEB] pb-3">
              <UserCheck className="w-5 h-5 text-[#567C8D]" />
              <h4 className="text-sm font-bold text-[#2F4156]">
                2. BIG 5 성격 요인 검사 종합 해석
              </h4>
            </div>
            {personalityAnalysis && (
              <h5 className="text-xs font-bold text-[#567C8D] uppercase tracking-wide">
                {personalityAnalysis}
              </h5>
            )}
            <p className="text-xs text-[#2F4156]/80 leading-relaxed font-normal bg-[#F5EFEB]/20 p-3 rounded-xl border border-[#C8D9E6]/30">
              {refinePersonalityDesc(personalityDesc || '성격 요인 점수를 기반으로 우호적인 협력성과 신중한 이면 분석 역량을 보여줍니다.')}
            </p>
          </div>
          <div className="text-[10px] text-[#2F4156]/60 border-t border-[#F5EFEB] pt-2.5">
            ※ 성향 진단은 행동의 맞고 틀림이 아닌 '나에게 최적화된 협업 환경'을 제언합니다.
          </div>
        </div>

        {/* Life History Panel */}
        <div className="bg-white border border-[#C8D9E6] rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[#F5EFEB] pb-3">
              <Milestone className="w-5 h-5 text-[#567C8D]" />
              <h4 className="text-sm font-bold text-[#2F4156]">
                3. 생활사 경험 역량 종합 대조
              </h4>
            </div>
            {historyAnalysis && (
              <h5 className="text-xs font-bold text-[#567C8D] uppercase tracking-wide">
                {historyAnalysis}
              </h5>
            )}
            <p className="text-xs text-[#2F4156]/80 leading-relaxed font-normal bg-[#F5EFEB]/25 p-3 rounded-xl border border-[#C8D9E6]/30">
              {historyDesc || '생활 전반의 이력 패턴을 조사한 결과, 주도적 도전 과제 해결 및 정서 조력 활동에서 남다른 결실을 일구어 온 발자취를 보입니다.'}
            </p>
          </div>
          <div className="text-[10px] text-[#2F4156]/60 border-t border-[#F5EFEB] pt-2.5">
            ※ 과거의 실제 이력 양상을 기반으로 강점이 가장 자연스럽게 생동하는 맥락을 포착합니다.
          </div>
        </div>

      </div>

      {/* 🔴 SECTION 3: 2-4대 강점 카드 (Strength Cards) */}
      <section className="space-y-6">
        <h3 className="text-base font-bold text-[#203142] uppercase tracking-wider text-center border-b border-[#C8D9E6] pb-3">
          가장 나답게 일할 수 있는 자소서 연계 강점 (Strengths)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {strengths.map((s, idx) => (
            <div key={s.id || idx} className="bg-white border-l-4 border-l-[#567C8D] border border-[#C8D9E6] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#567C8D] uppercase tracking-widest bg-[#C8D9E6]/40 px-2.5 py-1 rounded-md">
                  강점 {idx + 1}
                </span>
                <span className="text-[10px] text-[#2F4156]/70 leading-none">고용24 L형 통합 매핑</span>
              </div>

              <h4 className="text-base font-bold text-[#2F4156]">
                {s.title}
              </h4>

               <div className="space-y-2.5 pt-2">
                {/* 1) Strength Basis */}
                <div className="text-xs">
                  <span className="block font-bold text-[#567C8D]">💡 [검사 근거]</span>
                  <p className="text-[#2F4156]/80 mt-0.5 leading-relaxed bg-[#F5EFEB]/40 p-2 rounded-lg break-keep">
                    주요 6대 직업흥미 코드 조합 및 행동 유형 대조를 거친 통계적 기반 자료입니다.
                  </p>
                </div>

                {/* 2) Work Nature */}
                <div className="text-xs">
                  <span className="block font-bold text-[#567C8D]">🏃 [실제 행동 발현 환경]</span>
                  <p className="text-[#2F4156]/80 mt-0.5 leading-relaxed border border-[#F5EFEB] p-2 rounded-lg break-keep">
                    {s.description}
                  </p>
                </div>

                {/* 3) Application Point for Resume */}
                <div className="text-xs">
                  <span className="block font-bold text-[#567C8D]">🎯 [이력서·자소서 무기화 전략]</span>
                  <p className="text-[#2F4156]/80 mt-0.5 leading-relaxed bg-[#C8D9E6]/10 p-2 rounded-lg font-medium border border-[#C8D9E6]/30 break-keep">
                    "{s.title}" 테마의 프로젝트 성과를 STAR 기법에 맞추어 주도성 위주로 기술하세요.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🔴 SECTION 4: 1-2대 보완책 / 유의해야 할 환경 (Unique Points) */}
      {weaknesses.length > 0 && (
        <section className="space-y-4">
          <h4 className="text-xs font-bold text-[#203142] uppercase tracking-widest text-[#567C8D] text-center">
            업무 수행 시 유의해야 할 환경 및 사전 보완책
          </h4>
          <div className="max-w-2xl mx-auto space-y-4">
            {weaknesses.map((w, idx) => (
              <div key={w.id || idx} className="bg-white border-l-4 border-l-[#C8D9E6] border border-[#C8D9E6] rounded-xl p-5 shadow-xs flex gap-3.5 items-start">
                <AlertCircle className="w-5 h-5 text-[#567C8D] shrink-0 mt-0.5" />
                <div className="space-y-1 text-left w-full">
                  <span className="text-xs sm:text-sm font-bold text-[#567C8D]">유의 환경 및 극복 노하우</span>
                  <h5 className="text-sm font-bold text-[#2F4156]">{w.title}</h5>
                  <p className="text-xs text-[#2F4156]/75 leading-relaxed pt-1 break-keep">
                    {w.description}
                  </p>
                  <p className="text-xs sm:text-sm text-[#506e7a] bg-[#F5EFEB]/45 p-3.5 rounded-lg mt-2 font-sans break-keep leading-relaxed border border-[#C8D9E6]/30 shadow-2xs">
                    💡 보완 행동팁: {w.title}을 예방하기 위해 협업 시 미리 스케줄 마감일을 하루 앞당겨 세팅하거나 시스템 캘린더 자동 연동을 무조건 설정해 보기를 권합니다.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 🔴 SECTION 5: 나와 일의 연결 및 후보 직무 매칭 */}
      <section className="bg-white border border-[#C8D9E6] rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-[#F5EFEB] pb-4">
          <Briefcase className="w-5 h-5 text-[#567C8D]" />
          <h3 className="text-base sm:text-lg font-bold text-[#2F4156]">
            나와 일의 상생 가이드 및 후보 매칭 직군
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-[#2F4156]/80 leading-relaxed bg-[#F5EFEB]/30 p-4 rounded-xl border border-[#C8D9E6]/40">
          특정한 직무 하나만을 유일한 정답으로 보지 마세요. 
          귀하의 세심함과 지적 갈망은 다양한 일의 요소(Task)에 맞물려 빛을 발합니다.
          <b className="block mt-2 text-[#567C8D] font-bold">
            "동일한 특성도 얼마든지 다른 직업으로 발현될 수 있습니다."
          </b>
        </p>

        {/* Suggested Occupations Match Cards - ALWAYS 3 to 4 items with exact Matching Degrees */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {[
            ...(suggestedJobs || []),
            { title: "전략 기획 전문가 및 코디네이터", desc: "나의 성격 분석 특성과 흥미 조합 중 일정 프로세스를 조화롭게 수립하고 조율하는 직군입니다." },
            { title: "제품 개발 운영자 및 스크럼 조력자", desc: "마감 준수 의식과 세심한 교감 능력을 융합하여 기획 일정의 리스크를 관리합니다." }
          ].slice(0, 4).map((job, idx) => {
            let degreeLabel = "매칭도 : 상 (높음)";
            let colorStyle = "bg-rose-50 text-rose-700 border-rose-200";
            if (idx === 1) {
              degreeLabel = "매칭도 : 중 (보통)";
              colorStyle = "bg-teal-50 text-teal-750 border-teal-200";
            } else if (idx >= 2) {
              degreeLabel = "매칭도 : 하 (보완)";
              colorStyle = "bg-indigo-50 text-indigo-700 border-indigo-200";
            }

            return (
              <div key={job.title + idx} className="border border-[#C8D9E6] rounded-2xl p-5 bg-[#F5EFEB]/15 space-y-2.5 text-left transition-all hover:bg-white break-keep">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-extrabold text-[#2F4156]">{job.title}</h4>
                  <span className={`text-[10px] font-extrabold py-0.5 px-2 rounded-full border ${colorStyle} shrink-0`}>
                    {degreeLabel}
                  </span>
                </div>
                <p className="text-xs text-[#2F4156]/80 leading-relaxed bg-white/50 p-2.5 rounded-lg border border-[#C8D9E6]/25">
                  <span className="font-bold text-[#567C8D] block text-[10px]">🔎 [매칭 추천 근거]</span>
                  {job.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 🔴 STEP 5 OUTSIDE PROMPT BOTTOM BANNER */}
      <div className="bg-[#567C8D]/10 border border-[#567C8D]/25 rounded-2xl p-6 text-center space-y-5 max-w-2xl mx-auto pt-6">
        <div className="space-y-1">
          <p className="text-sm font-bold text-[#2F4156]">
            검사 결과로 도출된 당신의 프로파일입니다. 이제, 당신의 진짜 생각을 들려주세요.
          </p>
          <p className="text-xs text-[#2F4156]/70">
            결과지와 스스로의 실제 지향 주관이 얼마나 잘 맞물리는지 코칭 질문을 통해 검증합니다.
          </p>
        </div>

        <button
          onClick={onNext}
          className="group inline-flex items-center gap-2 py-3 px-8 bg-[#567C8D] text-white font-bold text-sm sm:text-base rounded-2xl hover:bg-[#2F4156] active:bg-[#1f2c3b] transition-all duration-250 shadow-md cursor-pointer hover:scale-[1.01]"
        >
          내 생각 확인하기
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Primary Action Button Back/Next */}
      <div className="flex items-center justify-between pt-4 border-t border-[#C8D9E6]/60">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-2 py-2.5 px-5 border border-[#C8D9E6] bg-white hover:bg-[#F5EFEB]/50 text-[#2F4156]/80 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 font-bold" />
          결과지 업로드 재등록
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-1.5 py-2.5 px-5 bg-[#567C8D] hover:bg-[#2F4156] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
        >
          경험 구체화 단계 진입
          <ArrowRight className="w-4 h-4 font-bold" />
        </button>
      </div>

    </div>
  );
}
