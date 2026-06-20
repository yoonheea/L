import React, { useState } from 'react';
import { RefreshCw, ArrowLeft, Download, CheckCircle, Award, Sparkles, Layout, Send, BookMarked, Copy, HelpCircle } from 'lucide-react';
import { StateData } from '../types';

interface S4ResumeProps {
  state: StateData;
  onPrev: () => void;
  onReset: () => void;
}

export default function S4Resume({ state, onPrev, onReset }: S4ResumeProps) {
  const { detectedTraits = [], answers = {}, suggestedJobs = [], riasecScores = [] } = state;
  const [copied, setCopied] = useState(false);

  // Find high RIASEC traits to customize guide examples
  const sortedScores = [...riasecScores].sort((a, b) => b.score - a.score);
  const primaryType = sortedScores[0]?.type?.split(' ')[0] || '예술형';

  // Extract custom desired job from answers
  const desiredJobText = answers['desired_job'] || '해석 보고서 추천 관련 직무군';

  // Dynamic coaching feedback rules based on length and numeric content
  const getActionCoachingFeedback = (traitTitle: string, answerText: string) => {
    const cleanAnswer = answerText?.trim() || '';
    if (cleanAnswer.length <= 40 || cleanAnswer.includes('공백') || cleanAnswer.includes('부재') || cleanAnswer.includes('일시 생략')) {
      return `💡 코치 보완 조언: 답변 내용이 다소 압축적입니다. 성과나 과정을 소박하게나마 덧붙여 보세요. 예컨대 평소 조별 과제, 주변 친구들을 챙겨주었거나 규칙을 지키기 주도하려 노력하며 '참 고맙다'고 피드백 받은 구체적인 말 한마디를 추가하시면 입체적 매력이 훌쩍 올라갑니다!`;
    }

    const hasNumber = /\d+/.test(cleanAnswer);
    if (!hasNumber) {
      return `💡 코치 보완 조언: 매우 훌륭한 강점 행동 특성이 드러난 에피소드입니다! 이 내용에 '결과 수치나 규모(예: 매출 발생 15% 상승, 준비 기한 2일 단축, 동료 5명 전원 협의)' 등을 슬쩍 끼워 넣으면 설득력이 눈속임 없이 극적으로 올라갑니다.`;
    }

    return `💡 코치 보완 조언: 완벽에 가까운 강점 경험입니다! 당신의 [${primaryType}] 지향인 조율형 조력 태도와 사료 속 실제적인 성과가 매끄럽게 어우르고 있습니다. 자소서 도입부 1번에 이 경험을 강조 키워드로 장식하시는 것을 권장합니다.`;
  };

  // Construct dynamic item records for the Story Bank
  const dynamicStoryBank = detectedTraits.map((trait, index) => {
    const userAnswer = answers[trait.id] || '아직 주도적인 경험을 작성하지 않고 기본 잠재력 확인 상태로 일시 등록되었습니다.';
    
    // Generate intelligent relevant keywords based on trait types
    const sampleKeywords = trait.type === 'strength' 
      ? [`#${trait.title.substring(0, 5)}`, '#성과_완수_행동', '#협업_조력자_임무', '#직무_맞춤_해결']
      : [`#${trait.title.substring(0, 5)}`, '#사후_완성도_제고', '#상시_캘린더_위젯', '#마감_시간_사전_예약'];

    // Generate dynamic starting sentence hook
    const hook = trait.type === 'strength'
      ? `"[ ${trait.title} ]을 중심 무기 삼아, ${desiredJobText} 실무 과정에서 최적의 성과를 이끌 준비가 완료되었습니다."`
      : `"[ ${trait.title} ] 지향을 철저히 모니터링하여, 마일스톤 데드라인을 준수하며 완벽한 정합성을 보장합니다."`;

    const coachAdvice = getActionCoachingFeedback(trait.title, userAnswer);

    return {
      id: trait.id,
      index: index + 1,
      title: trait.title,
      basis: `${trait.type === 'strength' ? 'L형 검사 결과 기반 - 우수 강점 요인' : 'L형 검사 결과 기반 - 유의 및 보완 장치'}`,
      userAnswer: userAnswer,
      keywords: sampleKeywords,
      startingPhrase: hook,
      advice: coachAdvice
    };
  });

  // Export full bank helper to copy to clipboard in markdown
  const handleExportText = () => {
    let text = `======================================================\n`;
    text += `       직업심리검사 L형 기반 커리어 스토리 전용 뱅크 \n`;
    text += `======================================================\n\n`;
    text += `■ 목표 희망 직무: ${desiredJobText}\n\n`;
    
    dynamicStoryBank.forEach((item) => {
      text += `------------------------------------------------------\n`;
      text += `● 강점 원천: ${item.title} (${item.basis})\n`;
      text += `● 경험(사용자 기술): "${item.userAnswer}"\n`;
      text += `● 직무 연결 방향: ${desiredJobText} 분야와 맞물리는 특화 행동\n`;
      text += `● 자소서 추천 키워드: ${item.keywords.join(' ')}\n`;
      text += `● 에피소드 스타트 훅: ${item.startingPhrase}\n`;
      text += `● 코치 보완 조언: ${item.advice}\n`;
      text += `------------------------------------------------------\n\n`;
    });

    text += `더 깊고 완성도 높은 자소서 문단 작성이 필요하다면, 관련 서류 작성 전용 도구(포트폴리오 워드 프로세서 등)에서 이어서 진행해 주시기 바랍니다. 본 앱은 완결된 자기소개서 에세이를 직접 집필하지 않는 통계 기반 기획 커리어 가이드라인입니다.\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in font-sans py-2 pb-16">
      
      {/* Header Area (No screen numbers!) */}
      <div className="text-center space-y-2 max-w-2xl mx-auto break-keep">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8D9E6]/60 border border-[#567C8D]/20 text-[#2F4156] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#567C8D]" />
          <span>자소서 무기 전개 (Story Porting Specialist)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2F4156] tracking-tight">
          인재 가치 증명 및 스토리 가공 가이드
        </h2>
        <p className="text-xs sm:text-sm text-[#2F4156]/80 leading-relaxed">
          귀하의 강점 질문 대답에 입체적 심리 수치를 결합한, 최종 맞춤형 커리어 지원서 무기화 보고서입니다.
        </p>
      </div>

      {/* Grid Layout: Desktop Left (Main Feedback Frameworks) and Right (Story Bank Tracker Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
        
        {/* Left Column (Coaching Feedbacks & resume frameworks) */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="bg-white border border-[#C8D9E6] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-[#F5EFEB] pb-4">
              <Award className="w-5 h-5 text-[#567C8D]" />
              <h3 className="text-base sm:text-lg font-bold text-[#2F4156]">
                자기소개서 작성 및 전달 전략 프레임워크
              </h3>
            </div>

            {/* Target Job Title confirmation */}
            <div className="bg-[#F5EFEB]/35 p-4 rounded-xl border border-[#C8D9E6]/40 flex items-center justify-between gap-3 break-keep">
              <div>
                <span className="text-[10px] font-bold text-[#567C8D] uppercase tracking-wider">희망 타깃 직무</span>
                <p className="text-sm sm:text-base font-extrabold text-[#2F4156] mt-0.5">"{desiredJobText}"</p>
              </div>
              <span className="text-[10px] sm:text-xs font-semibold bg-[#2F4156] text-white px-2.5 py-1 rounded-lg">
                직무 매치 분석 진행 필터
              </span>
            </div>

            {/* Structured Formula explanation */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Layout className="w-4.5 h-4.5 text-[#567C8D]" />
                <h4 className="text-sm font-bold text-[#203142]">구조화 공식: STAR + L형 매치</h4>
              </div>

              <div className="space-y-3 pt-1">
                <div className="bg-[#F5EFEB]/15 border border-[#C8D9E6] rounded-xl p-4 space-y-1.5 break-keep">
                  <span className="text-[11px] font-bold text-[#567C8D]">1단계: 결과 및 두각 먼저 (Result)</span>
                  <p className="text-xs sm:text-sm font-bold text-[#2F4156]">성과 중심의 임팩트 전술</p>
                  <p className="text-xs text-[#2F4156]/75 leading-relaxed">
                    조개 문단처럼 찢어 설명하지 마시고, "모 경험을 통해 어떠한 구체적 수치 수혜를 도왔던 이력이 있습니다." 형태로 독자를 사로잡는 문구를 먼저 두세요.
                  </p>
                </div>

                <div className="bg-[#F5EFEB]/15 border border-[#C8D9E6] rounded-xl p-4 space-y-1.5 break-keep">
                  <span className="text-[11px] font-bold text-[#567C8D]">2단계: 우수 심리 인자와 행동의 연관 (Behavior-Link)</span>
                  <p className="text-xs sm:text-sm font-bold text-[#2F4156]">L형 우수 인자 행동 발현</p>
                  <p className="text-xs text-[#2F4156]/75 leading-relaxed">
                    본인의 점수 중심 특성인 [{primaryType}]을 실현하기 위해, 당시 어떠한 주도적인 체크 수립, 분석, 우호적 상담을 직접 발휘했는지 행동을 조밀하게 쓰세요.
                  </p>
                </div>

                <div className="bg-[#F5EFEB]/15 border border-[#C8D9E6] rounded-xl p-4 space-y-1.5 break-keep">
                  <span className="text-[11px] font-bold text-[#567C8D]">3단계: 면접 및 입사 후 활용 팁 (Integration)</span>
                  <p className="text-xs sm:text-sm font-bold text-[#2F4156]">면접 및 어필 한 줄 전략</p>
                  <p className="text-xs text-[#2F4156]/75 leading-relaxed">
                    "해당 부문 기조를 바탕으로, 지치기 쉬운 과부하 마감 상황에서도 시스템 캘린더나 사전 예약 체크리스트 기법을 사용해 끝까지 완성도를 정조준하겠습니다."라는 고유 의지를 밝히세요.
                  </p>
                </div>
              </div>
            </div>

            {/* Essential Notice for self-writing as requested */}
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 text-amber-950 rounded-xl text-xs leading-relaxed break-keep">
              <span className="font-extrabold text-amber-900 block mb-1">⚠️ 꼭 알아두실 사항</span>
              <p className="text-[#2F4156]/90">
                본 서비스는 검사 결과를 바탕으로 가이드라인과 면접 팁을 설계해 드리며, 자소서 내용을 인위적으로 대리 작성하지 않습니다. 개성 있는 실제 에세이 작성은 별도의 서류 도구에서 직접 마무리해 주세요!
              </p>
            </div>
          </div>

          {/* Action reset bottom card to return safe */}
          <div className="bg-white border border-[#C8D9E6] p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm text-center sm:text-left">
            <div className="space-y-1 text-left">
              <p className="text-xs sm:text-sm font-bold text-[#2F4156]">분석 기록을 완전히 초기화하고 싶으신가요?</p>
              <p className="text-[10px] text-[#2F4156]/60 font-medium">로컬 저장소에 일시 보관된 내역이 모두 소멸되고 처음 소개로 귀환합니다.</p>
            </div>
            <button
              onClick={onReset}
              className="py-2.5 px-4 rounded-xl bg-rose-50 text-rose-600 hover:bg-[#2F4156] hover:text-white border border-rose-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              분석 자료 전체 리셋
            </button>
          </div>

        </div>

        {/* Right Column (Dynamic Story Bank Panel with Bo-wan feedback) */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="bg-[#2F4156] border border-[#2F4156] rounded-3xl p-6 sm:p-7 shadow-lg text-white space-y-5">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-[#C8D9E6]" />
                  <h3 className="text-base sm:text-lg font-bold tracking-tight">나의 맞춤형 스토리 뱅크</h3>
                </div>
                <p className="text-[10px] text-[#C8D9E6]/85 font-mono">L형 수치 및 에피소드 정밀 결집 가동</p>
              </div>
              <button
                onClick={handleExportText}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-2 px-3.5 bg-[#567C8D] hover:bg-white hover:text-[#2F4156] text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-xs whitespace-nowrap hover:scale-[1.01]"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                {copied ? '복사 완료!' : '전체 뱅크 추출'}
              </button>
            </div>

            <p className="text-xs text-white/80 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10 break-keep">
              💡 아래 쌓인 스토리 뱅크 항목은 질문 면접 피치 준비나 자소서 서류 문단 기획 시 언제라도 활용할 수 있습니다. <b>'내보내기'</b> 혹은 <b>'전체 뱅크 추출'</b> 버튼을 눌러 메모장에 안전히 보관해 보세요.
            </p>

            {/* Story Bank Item Rows */}
            <div className="space-y-5">
              {dynamicStoryBank.map((item) => (
                <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 hover:bg-white/10 transition-all font-sans">
                  
                  {/* Badge Row */}
                  <div className="flex items-center justify-between text-[9px] text-[#C8D9E6] uppercase font-bold tracking-wide border-b border-white/5 pb-2">
                    <span>({item.index}) {item.basis}</span>
                    <span className="text-white/40 uppercase">정밀 추출 필터</span>
                  </div>
                  
                  {/* Trait Title */}
                  <h4 className="text-sm font-extrabold text-white leading-snug">
                    강점(원천): {item.title}
                  </h4>

                  <div className="text-xs text-white/90 space-y-3.5 pt-0.5 break-keep">
                    
                    {/* 1. Experience (using exact user expression) */}
                    <div>
                      <span className="block text-white/50 text-[10px] font-bold">● 경험 (사용자 표현 그대로):</span>
                      <p className="italic text-white/90 bg-white/5 p-3 rounded-lg text-xs mt-1 leading-relaxed border border-white/10 bg-[#F5EFEB]/5">
                        "{item.userAnswer}"
                      </p>
                    </div>

                    {/* 2. Job alignment */}
                    <div>
                      <span className="block text-white/50 text-[10px] font-bold">● 직무 연결:</span>
                      <p className="text-[#C8D9E6] text-xs font-medium leading-relaxed mt-0.5">
                        목표로 삼으신 <b>"{desiredJobText}"</b> 직무의 실무 상황에 당신의 [{item.title}] 고유 능력을 단단히 접합하여 고유 가치를 연출해 냅니다.
                      </p>
                    </div>

                    {/* 3. Starting Hook Phrase */}
                    <div>
                      <span className="block text-white/50 text-[10px] font-semibold">● 한 줄 시작문 예시:</span>
                      <p className="text-emerald-200 font-sans text-xs sm:text-sm bg-emerald-950/60 p-3 rounded-lg border border-emerald-500/30 mt-1 leading-relaxed">
                        {item.startingPhrase}
                      </p>
                    </div>

                    {/* 4. Active coaching feedback (Crucial requested point) */}
                    <div className="bg-[#567C8D]/40 p-3.5 rounded-xl border border-[#C8D9E6]/30 text-white leading-relaxed">
                      <p className="text-xs font-bold text-[#C8D9E6] flex items-center gap-1 mb-1 bg-[#2F4156]/40 p-1 px-2 rounded-md max-w-fit">
                        ⭐ 입체적 업그레이드 보완 피드백
                      </p>
                      <p className="text-[11px] text-white/95 leading-relaxed font-sans font-medium">
                        {item.advice}
                      </p>
                    </div>

                  </div>

                  {/* Keywords badging */}
                  <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-white/10">
                    {item.keywords.map((kw, idx) => (
                      <span key={idx} className="text-xs font-semibold text-[#C8D9E6] bg-white/10 px-2.5 py-1 rounded-lg border border-white/15 font-sans">
                        {kw}
                      </span>
                    ))}
                  </div>

                </div>
              ))}
            </div>

          </div>



        </div>

      </div>

      {/* Footer navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-[#C8D9E6]/60">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-1.5 py-2.5 px-5 border border-[#C8D9E6] bg-white hover:bg-[#F5EFEB]/50 text-[#2F4156]/80 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 font-bold" />
          이전 단계로 (질문 구체화로 가기)
        </button>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 py-2.5 px-5 bg-[#567C8D] hover:bg-[#2F4156] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          처음 소개 화면으로 이동
        </button>
      </div>

    </div>
  );
}
