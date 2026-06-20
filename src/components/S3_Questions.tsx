import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, HelpCircle, CheckCircle, Sparkles, BookOpen, Key, AlertCircle, RefreshCw } from 'lucide-react';
import { StateData } from '../types';

interface S3QuestionsProps {
  state: StateData;
  onUpdateAnswers: (answers: Record<string, string>) => void;
  onUpdateStoryBank: (storyBank: { id: string; title: string; content: string; createdAt: string }[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function S3Questions({
  state,
  onUpdateAnswers,
  onUpdateStoryBank,
  onNext,
  onPrev,
}: S3QuestionsProps) {
  const { detectedTraits = [], answers = {}, suggestedJobs = [], riasecScores = [] } = state;

  // Find high RIASEC traits to customize guide examples
  const sortedScores = [...riasecScores].sort((a, b) => b.score - a.score);
  const primaryType = sortedScores[0]?.type?.split(' ')[0] || '예술형';
  const secondaryType = sortedScores[1]?.type?.split(' ')[0] || '탐구형';

  // Build the list of active themes/questions
  const questionsList = [
    {
      id: 'desired_job',
      title: '💼 희망 직무 탐색 및 결과 매칭 조율',
      badge: '커리어 방향성',
      questionText: '검사 결과 보고서에 따르면 이런 흥미와 역량 방향을 보여주고 있습니다. 혹시 본인이 실제로 마음 한구석에 품고 있거나 꼭 한 번 일해보고 싶은 "희망 직무"가 있나요? 가볍거나 막연한 관심도 대환영입니다!',
      placeholder: '예: 마케팅 커뮤니케이션 기획, 프론트엔드 UI 개발, 세무 회계, 매장 교육 연수 관리, 카페 공간 콘텐츠 디렉터 등 나만의 타깃 직무를 적어주세요.',
      isJobQuestion: true,
      traitRef: undefined,
      guide: `💡 작성 조력: 거창해야 한다는 부담감을 내려놓으세요! 당신의 탁월한 [${primaryType}] 성향의 창의적 감수성과 [${secondaryType}] 성향의 체계적 해석 기술이 만나 활발하게 시너지를 낼 수 있는 희망 역할 종류를 떠올려 적어 보세요.`
    },
    ...detectedTraits.map((trait, index) => {
      const isStrength = trait.type === 'strength';
      const promptTitle = isStrength 
        ? `🔥 나의 핵심 무기: ${trait.title}`
        : `🛡️ 실수 예방 안전관리: ${trait.title}`;
      
      const badgeText = isStrength ? '강점 에피소드' : '보완 실행 전략';

      // Design approaches tailored to their profile
      const dynamicGuide = isStrength
        ? `💡 강점 도출 가이드: 학창시절 조별 프로젝트, 아르바이트 도중 사소하게 아이디어를 냈던 일, 친구들을 몰래 관찰하여 도왔던 따뜻한 경험 등 무엇이든 아주 좋습니다! [${primaryType}] 성향이 은연중에 발휘되었던 편안한 일상 스토리를 들려주세요.`
        : `💡 기한 보완 예시: 중요한 임무나 자잘한 일들을 깜빡하지 않기 위해서 나만의 방법으로 달력 앱에 컬러 태그를 지정해 두거나, 책상 앞 포스트잇 부착, 메모장 알람 세팅 등을 요긴하게 사용했던 아기자기하고 사소한 극복 비결들을 들려주세요.`;

      return {
        id: trait.id,
        title: promptTitle,
        badge: badgeText,
        questionText: trait.questionText,
        placeholder: isStrength
          ? '자유로운 양식으로 작성해 보세요. (예: 아르바이트 당시 한 번 방문한 단골 손님의 성함을 세심하게 수첩에 구석구석 기록해 두어 다음 방문 시 친근하게 응대하여 지점을 활성화한 일화처럼 소소한 경험)'
          : '기한 엄수나 실수를 방지하기 위해 마감 시간을 사전에 모바일 위젯에 조밀하게 박아두거나 기록했던 습관을 가볍게 적어주세요.',
        isJobQuestion: false,
        traitRef: trait,
        guide: dynamicGuide
      };
    })
  ];

  // Current active step index (0 to M-1)
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Local state for all answers synchronized
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    questionsList.forEach((q) => {
      initial[q.id] = answers[q.id] || '';
    });
    return initial;
  });

  // Sync back to localAnswers if state answers changes externally
  useEffect(() => {
    setLocalAnswers((prev) => {
      const next = { ...prev };
      questionsList.forEach((q) => {
        if (answers[q.id] !== undefined) {
          next[q.id] = answers[q.id];
        }
      });
      return next;
    });
  }, [answers]);

  const handleUpdateAnswerText = (id: string, text: string) => {
    setLocalAnswers((prev) => ({
      ...prev,
      [id]: text,
    }));
  };

  const handleBypassSingleInput = (id: string) => {
    let bypassText = '';
    if (id === 'desired_job') {
      bypassText = suggestedJobs[0]?.title || '종합 브랜드 전략 기조 기획 및 홍보 매니저';
    } else {
      const q = questionsList.find(item => item.id === id);
      const titleText = q?.traitRef?.title || '성향';
      bypassText = `아직 [${titleText}]을 상징하는 거대한 상업 프로젝트 성공 경험이나 커리어 이력은 정식으로 부재하지만, 내면의 우수한 잠재적 흥미 요소인 [${primaryType}]와 [${secondaryType}] 가치관을 바탕으로 향후 실무 현장에서 주어진 역할을 주도적으로 훌륭히 키워나가겠습니다.`;
    }
    handleUpdateAnswerText(id, bypassText);
  };

  // Live matching feedback evaluator for Step 1
  const renderLiveCoachingMatch = (userText: string) => {
    if (!userText || userText.trim().length <= 1) {
      return (
        <div className="p-4 bg-[#F5EFEB]/50 border border-[#C8D9E6]/60 rounded-xl text-xs text-[#2F4156]/70 leading-relaxed break-keep">
          💡 윗 공간에 희망하시는 직무나 업무 성격만 아주 가볍게 단어 혹은 한 줄로라도 적어 주시면, 당신이 도출한 흥미 유형과의 실시간 상생 궁합 코칭 피드백이 바로 생성됩니다! (작성이 막막하시다면 아래 '추천 직무 제안 선택'의 기성 예시를 눌러보세요)
        </div>
      );
    }

    const cleanJob = userText.trim().toLowerCase();
    
    // Check if user answer matches any of the suggested jobs or keywords representing high scores
    const isExactMatch = suggestedJobs.some(j => cleanJob.includes(j.title.toLowerCase()) || j.title.toLowerCase().includes(cleanJob));
    const isCreative = cleanJob.includes('디자인') || cleanJob.includes('기획') || cleanJob.includes('콘텐츠') || cleanJob.includes('예술') || cleanJob.includes('마케팅') || cleanJob.includes('브랜드');
    const isAnalytical = cleanJob.includes('분석') || cleanJob.includes('개발') || cleanJob.includes('연구') || cleanJob.includes('데이터') || cleanJob.includes('엔지니어');

    const primaryTypeLower = primaryType.toLowerCase();

    if (isExactMatch) {
      return (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 leading-relaxed break-keep space-y-1 animate-fade-in shadow-2xs">
          <p className="font-bold flex items-center gap-1.5 text-emerald-900">
            <span>✨ [추천 매칭 일치]</span>
            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">최상 연계</span>
          </p>
          <p>
            선택하신 "<b>{userText}</b>" 직무는 우리의 L형 검출 수치 프로파일과 완벽한 정합성을 이루고 있습니다! {primaryType}와 {secondaryType}의 지적 호기심과 실감 나는 기획력이 조화를 일궈 성과와 기쁨을 함께 성취해 내기에 최고의 무대가 되어줄 것입니다.
          </p>
        </div>
      );
    } else if (isCreative || isAnalytical) {
      return (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-850 leading-relaxed break-keep space-y-1 animate-fade-in shadow-2xs">
          <p className="font-bold flex items-center gap-1.5 text-indigo-950">
            <span>💡 [부분 / 직무 하위 세분화 조율 가이드]</span>
            <span className="bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded text-[10px]">직무 세분화</span>
          </p>
          <p>
            희망하시는 '<b>{userText}</b>' 직군은 광범위한 임무를 안고 있습니다. 이 타이틀 전체를 부담스럽게 판단하지 마시고, 강점인 {primaryType}형 역량을 접목할 수 있도록 <b>'{isCreative ? "기획 및 콘텐츠 기획 전략" : "프로세스 설계 및 데이터 정모화"}'</b> 같은 하위 실무 업무로 지향을 지혜롭게 쪼개어 무기화하는 전략을 매우 권해 드립니다.
          </p>
        </div>
      );
    } else {
      return (
        <div className="p-4 bg-[#C8D9E6]/30 border border-[#C8D9E6] rounded-xl text-xs text-[#2F4156] leading-relaxed break-keep space-y-1 animate-fade-in">
          <p className="font-bold text-[#567C8D]">💡 [코칭 동행 응원 및 이력 제언]</p>
          <p>
            '<b>{userText}</b>' 분야는 당신이 가진 [{primaryType}] 고유의 세심하고 기획력 지지형 태도가 침전될 때, 해당 업계에서 매우 독보적이며 유연한 신뢰감을 공급해 주게 됩니다. 동일한 특성도 얼마든지 다른 주도적 직무에서 위용 있게 빛날 수 있음을 명심하세요!
          </p>
        </div>
      );
    }
  };

  const activeQuestion = questionsList[currentStepIndex];
  const activeAnswer = localAnswers[activeQuestion.id] || '';
  const charactersCount = activeAnswer.trim().length;

  // Navigation Logic 
  const handleNextStep = () => {
    // Propagate text changes instantly to state parent
    onUpdateAnswers(localAnswers);

    if (currentStepIndex < questionsList.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Finalized everything
      const finalStories = questionsList.map((q) => {
        const content = localAnswers[q.id]?.trim() || '아직 구체화 답변이 없는 상태입니다.';
        return {
          id: q.id,
          title: q.title,
          content: content,
          createdAt: new Date().toLocaleDateString('ko-KR')
        };
      });

      onUpdateStoryBank(finalStories);
      onNext();
    }
  };

  const handlePrevStep = () => {
    onUpdateAnswers(localAnswers);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else {
      onPrev();
    }
  };

  // Progress percentage calculation
  const progressPercent = Math.round(((currentStepIndex + 1) / questionsList.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in font-sans py-4 pb-16">
      
      {/* Intro Header (No screen numbers!) */}
      <div className="text-center space-y-2 max-w-2xl mx-auto break-keep">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8D9E6]/60 text-[#2F4156] text-xs font-bold">
          <BookOpen className="w-3.5 h-3.5 text-[#567C8D]" />
          <span>경험 구체화 워크북 (Coaching Workbook)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2F4156] tracking-tight">
          나만의 자소서 무기, 스토리 뱅크 빌더
        </h2>
        <p className="text-xs sm:text-sm text-[#2F4156]/80 leading-relaxed">
          검사 결과를 바탕으로 나만의 경험과 에피소드를 끌어냅니다. 한 단계씩 읽으시고 편안하고 직관적이게 나의 실제 기억들을 채워보세요.
        </p>
      </div>

      {/* Structured Progress Section */}
      <div className="bg-white border border-[#C8D9E6] rounded-2xl p-5 shadow-xs space-y-3.5 text-left">
        <div className="flex items-center justify-between text-xs font-bold text-[#2F4156]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#567C8D]"></span>
            경험 탐색 진행률
          </span>
          <span className="font-mono bg-[#F5EFEB] px-2.5 py-1 rounded-lg border border-[#C8D9E6]/60 text-[#2F4156]">
            질문 {currentStepIndex + 1} / {questionsList.length}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-[#F5EFEB] h-3 rounded-full overflow-hidden border border-[#C8D9E6]/45">
          <div 
            className="h-full bg-gradient-to-r from-[#C8D9E6] to-[#567C8D] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Main Single Question Active Card Panel */}
      <div className="bg-white border border-[#C8D9E6] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 text-left animate-fade-in" key={activeQuestion.id}>
        
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-[#F5EFEB] pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#567C8D] uppercase tracking-wider bg-[#F5EFEB] border border-[#C8D9E6]/30 px-2.5 py-0.5 rounded-md">
              {activeQuestion.badge}
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-[#2F4156] tracking-tight mt-1">
              {activeQuestion.title}
            </h3>
          </div>

          <div className="shrink-0">
            {activeAnswer.trim() ? (
              <span className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                ✓ 입력 완료
              </span>
            ) : (
              <span className="text-[10px] sm:text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                입력 대기중
              </span>
            )}
          </div>
        </div>

        {/* Approachable, direct questions prompt */}
        <div className="space-y-3">
          <p className="text-sm sm:text-base font-extrabold text-[#2F4156] break-keep leading-relaxed bg-[#F5EFEB]/35 p-4 rounded-xl border border-[#C8D9E6]/25">
            {activeQuestion.questionText}
          </p>

          <p className="text-xs text-[#2F4156]/80 leading-relaxed bg-neutral-50 p-4 rounded-xl border border-neutral-200/50 break-keep">
            {activeQuestion.guide}
          </p>
        </div>

        {/* Quick presets buttons if we are at Step 1 (희망직무) */}
        {activeQuestion.isJobQuestion && suggestedJobs.length > 0 && (
          <div className="space-y-2">
            <span className="block text-[10px] font-bold text-[#567C8D] uppercase tracking-wider pl-1 font-sans">
              💡 나의 흥미유형 추천 직무에서 간편 클릭 선택하기:
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestedJobs.map((job) => (
                <button
                  key={job.title}
                  type="button"
                  onClick={() => handleUpdateAnswerText('desired_job', job.title)}
                  className="text-xs font-bold text-[#2F4156]/90 bg-[#F5EFEB]/50 hover:bg-[#C8D9E6]/40 border border-[#C8D9E6] hover:border-[#567C8D]/60 py-2 px-3 rounded-xl transition-all cursor-pointer text-left"
                >
                  {job.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Interaction Textarea */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-[#2F4156]/60 px-1">
            <span>자유로운 나의 실제 목소리 적기</span>
            <span className="font-mono text-[11px]">{charactersCount}자</span>
          </div>
          <textarea
            value={activeAnswer}
            onChange={(e) => handleUpdateAnswerText(activeQuestion.id, e.target.value)}
            placeholder={activeQuestion.placeholder}
            rows={5}
            className="w-full p-4 border border-[#C8D9E6] rounded-xl text-xs sm:text-sm leading-relaxed focus:ring-2 focus:ring-[#567C8D] focus:outline-none transition-all placeholder:text-[#2F4156]/35"
          />
        </div>

        {/* Real-time coaching block for Step 1 (희망직무) */}
        {activeQuestion.isJobQuestion && (
          <div className="pt-1">
            {renderLiveCoachingMatch(activeAnswer)}
          </div>
        )}

        {/* Individual Card Control Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#F5EFEB] text-xs text-[#2F4156]/50">
          <span>고용24 L형 인자 접합 프로세스</span>
          <button
            type="button"
            onClick={() => handleBypassSingleInput(activeQuestion.id)}
            className="text-[10px] sm:text-xs font-bold text-[#567C8D] hover:text-white bg-[#F5EFEB] hover:bg-[#567C8D] border border-[#C8D9E6]/60 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            {activeQuestion.isJobQuestion ? '추천 직업으로 자동 완성' : '아직 마땅한 경험이 생각나지 않아 일시 생략'}
          </button>
        </div>

      </div>

      {/* Global Bottom Wizard navigation bar */}
      <div className="flex items-center justify-between pt-4 border-t border-[#C8D9E6]/60">
        <button
          type="button"
          onClick={handlePrevStep}
          className="flex items-center gap-1.5 py-2.5 px-5 border border-[#C8D9E6] bg-white hover:bg-[#F5EFEB]/50 text-[#2F4156]/80 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 font-bold" />
          {currentStepIndex === 0 ? '이전 단계 (성향 진단 리포트)' : '이전 질문 구체화'}
        </button>

        <button
          type="button"
          onClick={handleNextStep}
          className="flex items-center gap-2 py-2.5 px-6 bg-[#567C8D] hover:bg-[#2F4156] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer"
        >
          {currentStepIndex === questionsList.length - 1 
            ? '에피소드 피드백 및 스토리 뱅크 진입' 
            : '다음 질문 및 검토'
          }
          <ArrowRight className="w-4 h-4 font-bold" />
        </button>
      </div>

    </div>
  );
}
