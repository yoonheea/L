import React, { useState, useEffect } from 'react';
import { AppStep, StateData } from './types';
import SIntro from './components/S_Intro';
import S0Auth from './components/S0_Auth';
import S1Upload from './components/S1_Upload';
import S2Traits from './components/S2_Traits';
import S3Questions from './components/S3_Questions';
import S4Resume from './components/S4_Resume';
import { Home, ShieldCheck, Upload, Compass, HelpCircle, ClipboardEdit } from 'lucide-react';

const INITIAL_STATE: StateData = {
  apiKey: '',
  isCustomKeyUsed: false,
  uploadedFile: null,
  riasecScores: [],
  detectedTraits: [],
  answers: {},
  storyBank: [],
};

const STEP_METADATA = [
  { id: 'S_INTRO', index: 0, label: '소개', description: '커리어 코치 소개', icon: Home },
  { id: 'S0', index: 1, label: '인증 완료', description: 'API Key 등록', icon: ShieldCheck },
  { id: 'S1', index: 2, label: '기록 업로드', description: 'L형 결과지 업로드', icon: Upload },
  { id: 'S2', index: 3, label: '특성 해석', description: '종합 진단 피드백', icon: Compass },
  { id: 'S3', index: 4, label: '경험 구체화', description: '에피소드 가이드', icon: HelpCircle },
  { id: 'S4', index: 5, label: '지원서 피드백', description: '스토리 뱅크 가공', icon: ClipboardEdit },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('S_INTRO');
  const [state, setState] = useState<StateData>(INITIAL_STATE);

  // No auto-sync of API Key state on app load (memory-only according to requirements)
  useEffect(() => {
    // API key must be entered for each attempt
  }, []);

  const handleAuthenticate = (key: string) => {
    setState(prev => ({
      ...prev,
      apiKey: key,
      isCustomKeyUsed: true
    }));
  };

  const handleResetKey = () => {
    setState(prev => ({
      ...prev,
      apiKey: '',
      isCustomKeyUsed: false
    }));
  };

  const handleUpload = (file: {
    name: string;
    size: number;
    fileBase64?: string;
    mimeType?: string;
    isSample?: boolean;
  } | null) => {
    setState(prev => ({
      ...prev,
      uploadedFile: file,
      riasecScores: [],
      detectedTraits: [],
      answers: {},
      personalityAnalysis: undefined,
      personalityDesc: undefined,
      historyAnalysis: undefined,
      historyDesc: undefined,
      suggestedJobs: undefined,
      storyBank: []
    }));
  };

  const handleAnalysisComplete = (data: Partial<StateData>) => {
    setState(prev => ({
      ...prev,
      ...data
    }));
    setCurrentStep('S2');
  };

  // Simple sequential step navigation controls for skeleton
  const handleToS0 = () => {
    setCurrentStep('S0');
  };

  const handleToS_Intro = () => {
    setCurrentStep('S_INTRO');
  };

  const handleToS1 = () => {
    if (!state.isCustomKeyUsed) {
      alert('API Key 인증을 성공적으로 완료해야 결과지 업로드 단계로 이동할 수 있습니다.');
      return;
    }
    setCurrentStep('S1');
  };

  const handleToS2 = () => {
    setCurrentStep('S2');
  };

  const handleToS3 = () => {
    setCurrentStep('S3');
  };

  const handleToS4 = () => {
    setCurrentStep('S4');
  };

  const handleReset = () => {
    if (confirm('모든 기록을 리셋하고 소개 화면으로 돌아가시겠습니까?')) {
      setState(INITIAL_STATE);
      setCurrentStep('S_INTRO');
    }
  };

  // Allow direct jump dynamically but guard S1+ steps if not authenticated
  const handleDirectJump = (stepId: AppStep) => {
    if (stepId !== 'S_INTRO' && stepId !== 'S0' && !state.isCustomKeyUsed) {
      alert('API Key 인증을 먼저 완료해야 다음 단계로 이동할 수 있습니다.');
      setCurrentStep('S0');
      return;
    }
    setCurrentStep(stepId);
  };

  return (
    <div className="min-h-screen bg-[#F5EFEB] flex flex-col justify-between font-sans">
      {/* Upper Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-[#C8D9E6] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#567C8D] text-white flex items-center justify-center font-display font-bold text-sm">
              L
            </div>
            <span className="font-display font-bold text-[#2F4156] text-sm sm:text-base tracking-tight">
              직업심리검사 L형 해석을 통한 커리어코치
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] bg-[#C8D9E6]/30 text-[#2F4156] tracking-wide font-mono uppercase font-semibold px-2.5 py-1 rounded-full border border-[#C8D9E6]/60">
              <span className="w-1.5 h-1.5 rounded-full bg-[#567C8D] animate-pulse"></span>
              L형 정밀 분석기 활성
            </span>
          </div>
        </div>
      </header>

      {/* Main Flow Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Step Progression Ribbon tracker */}
        {currentStep !== 'S_INTRO' && (
          <div className="bg-white border border-[#C8D9E6] rounded-2xl p-4 shadow-sm animate-fade-in">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
              {STEP_METADATA.map((meta) => {
                const IconComponent = meta.icon;
                const isActive = currentStep === meta.id;
                const currIndex = STEP_METADATA.findIndex(m => m.id === currentStep);
                const isPassed = currIndex > meta.index;

                return (
                  <button
                    key={meta.id}
                    onClick={() => handleDirectJump(meta.id as AppStep)}
                    className={`flex flex-col md:flex-row items-center gap-2 p-2.5 rounded-xl transition-all text-center md:text-left focus:outline-none cursor-pointer ${
                      isActive
                        ? 'bg-[#C8D9E6]/30 border border-[#C8D9E6] text-[#2F4156] font-medium scale-[1.01]'
                        : 'hover:bg-[#F5EFEB]/30 text-[#2F4156]/50'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#567C8D] text-white shadow-sm'
                          : isPassed
                          ? 'bg-[#C8D9E6] text-[#2F4156]'
                          : 'bg-[#F5EFEB] text-[#2F4156]/60'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="hidden md:block overflow-hidden">
                      <p className={`text-[11px] font-bold truncate tracking-tight ${isActive ? 'text-[#2F4156] font-semibold' : 'text-[#2F4156]/80 font-normal'}`}>
                        {meta.label}
                      </p>
                      <p className="text-[9px] text-[#2F4156]/60 truncate mt-0.5 font-sans">
                        {meta.description}
                      </p>
                    </div>
                    {/* Small ID Badge for mobile */}
                    <span className="md:hidden text-[9px] font-medium leading-none">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Render Step Screen */}
        <div className="py-2">
          {currentStep === 'S_INTRO' && (
            <SIntro onStart={handleToS0} />
          )}

          {currentStep === 'S0' && (
            <S0Auth
              apiKey={state.apiKey}
              isCustomKeyUsed={state.isCustomKeyUsed}
              onAuthenticate={handleAuthenticate}
              onResetKey={handleResetKey}
              onNext={handleToS1}
              onPrev={handleToS_Intro}
            />
          )}

          {currentStep === 'S1' && (
            <S1Upload
              apiKey={state.apiKey}
              uploadedFile={state.uploadedFile}
              onUpload={handleUpload}
              onAnalysisComplete={handleAnalysisComplete}
              onPrev={handleToS0}
            />
          )}

          {currentStep === 'S2' && (
            <S2Traits
              state={state}
              onNext={handleToS3}
              onPrev={handleToS1}
            />
          )}

          {currentStep === 'S3' && (
            <S3Questions
              state={state}
              onUpdateAnswers={(answers) => {
                setState(prev => ({ ...prev, answers }));
              }}
              onUpdateStoryBank={(storyBank) => {
                setState(prev => ({ ...prev, storyBank }));
              }}
              onNext={handleToS4}
              onPrev={handleToS2}
            />
          )}

          {currentStep === 'S4' && (
            <S4Resume
              state={state}
              onPrev={handleToS3}
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      {/* Footer bar */}
      <footer className="w-full bg-white border-t border-[#C8D9E6] py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#2F4156]/60">
          <p>© 2026 직업심리검사 L형 해석을 통한 커리어코치. All rights reserved.</p>
          <div className="flex items-center gap-4 font-sans">
            <span>고용24 L형 정밀 분석</span>
            <span>·</span>
            <span>커리어 가능성 발견</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
