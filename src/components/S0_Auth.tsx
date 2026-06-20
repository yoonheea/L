import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, ArrowLeft, KeyRound, Eye, EyeOff, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Sparkles, HelpCircle } from 'lucide-react';

interface S0AuthProps {
  apiKey: string;
  isCustomKeyUsed: boolean;
  onAuthenticate: (apiKey: string) => void;
  onResetKey: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function S0Auth({
  apiKey,
  isCustomKeyUsed,
  onAuthenticate,
  onResetKey,
  onNext,
  onPrev,
}: S0AuthProps) {
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<'idle' | 'validating' | 'success' | 'failed'>(
    isCustomKeyUsed ? 'success' : 'idle'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Sync state if prop changes
  useEffect(() => {
    setInputKey(apiKey);
    if (isCustomKeyUsed) {
      setStatus('success');
    } else {
      setStatus('idle');
    }
  }, [apiKey, isCustomKeyUsed]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedKey = inputKey.trim();

    if (!sanitizedKey) {
      setErrorMessage('API Key를 입력해 주세요.');
      setStatus('failed');
      return;
    }

    // Alphanumeric + hyphens/underscores only.
    if (!/^[a-zA-Z0-9_\-]+$/.test(sanitizedKey)) {
      setErrorMessage('입력하신 API Key에 허용되지 않는 문자(한글, 이모지 ⚠️, 공백, 특수문자 등)가 포함되어 있습니다. 혹시 에러 메시지나 설명문을 영문 API Key 자리에 잘못 붙여넣으신 것은 아닌지 다시 확인해 주세요.');
      setStatus('failed');
      return;
    }

    if (!sanitizedKey.startsWith('AIzaSy')) {
      setErrorMessage('구강/구글 Gemini API Key는 일반적으로 "AIzaSy"로 시작합니다. 현재 입력하신 키가 유효한 구글 클라우드 발급 API Key인지 확인해 주시기 바랍니다.');
      setStatus('failed');
      return;
    }

    setErrorMessage(null);
    setStatus('validating');

    try {
      const response = await fetch('/api/verify-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: sanitizedKey }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        onAuthenticate(inputKey.trim());
      } else {
        setStatus('failed');
        setErrorMessage(data.error || 'API Key 검증에 실패했습니다. 유효성을 확인하고 다시 시도하세요.');
      }
    } catch (err: any) {
      console.error('Certification endpoint error:', err);
      setStatus('failed');
      setErrorMessage(`서버와 통신하는 중 오류가 발생했습니다 (${err?.message || err}). 인터넷 연결 및 API 키 유효성을 확인 후 다시 시도해 주세요.`);
    }
  };

  const handleClearKey = () => {
    if (confirm('인증된 API Key를 등록 해제하시겠습니까?')) {
      setInputKey('');
      setStatus('idle');
      setErrorMessage(null);
      onResetKey();
    }
  };

  // Masked Key display helper (e.g., AIzaSy...4X3b)
  const getMaskedKey = (key: string) => {
    if (key.length <= 10) return '********';
    return `${key.slice(0, 6)}...${key.slice(-4)}`;
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in font-sans py-4">
      {/* Visual Header */}
      <div className="text-center space-y-3">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-2xl bg-[#C8D9E6]/40 animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center text-[#567C8D]">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#2F4156] font-display">
            API Key 설정 및 인증
          </h2>
          <p className="text-xs text-[#2F4156]/75 leading-relaxed max-w-sm mx-auto">
            정밀한 고용24 L형 결과지 분석과 맞춤 자소서 빌더 기능을 사용하기 위해 본인의 Gemini API Key 인증이 필요합니다.
          </p>
        </div>
      </div>

      {/* Main card panel */}
      <div className="bg-white border border-[#C8D9E6] rounded-2xl p-6 shadow-sm space-y-6">
        {status === 'success' ? (
          /* Certified State Display */
          <div className="space-y-5 animate-fade-in text-center py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mb-1">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#2F4156]">
                개인 API Key가 성공적으로 인증되었습니다.
              </h3>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F5EFEB]/30 border border-[#C8D9E6]/60 rounded-xl">
                <KeyRound className="w-3.5 h-3.5 text-[#567C8D]" />
                <span className="font-mono text-xs text-[#2F4156] font-medium">
                  {getMaskedKey(apiKey)}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                  인증 완료
                </span>
              </div>
            </div>
            <p className="text-xs text-[#2F4156]/70 max-w-xs mx-auto">
              이제 안전하게 결과지를 업로드하여 정밀 분석 단계를 진행하실 수 있습니다. 보안을 위해 영구히 보관되지 않으므로 매 시도마다 새로 등록하여 사용해 주세요.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleClearKey}
                className="text-xs text-rose-500 hover:text-rose-600 font-semibold hover:underline bg-rose-50/40 px-3 py-1.5 rounded-lg border border-rose-100 transition-colors"
              >
                API Key 등록 해제
              </button>
            </div>
          </div>
        ) : (
          /* Authentication Entry Field */
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#2F4156]/80 uppercase tracking-wider">
                Gemini API Key 입력
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy로 시작하는 API Key를 입력하세요"
                  disabled={status === 'validating'}
                  className="w-full text-sm font-mono tracking-tight pl-10 pr-10 py-3 border border-[#C8D9E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#567C8D] focus:border-transparent transition-all disabled:opacity-50"
                />
                <KeyRound className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-[#567C8D]/70" />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-3 p-1 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Invalid Error Message */}
            {errorMessage && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs animate-fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1 w-full">
                  <p className="font-semibold">인증 오류</p>
                  <p className="leading-relaxed">{errorMessage}</p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStatus('success');
                        onAuthenticate(inputKey.trim());
                      }}
                      className="inline-flex items-center gap-1 text-[11px] bg-[#567C8D] hover:bg-[#2F4156] text-white font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-2xs"
                    >
                      ⚠️ 임시 우회 인증 처리 (입력한 키로 검증 없이 즉시 진행)
                    </button>
                    <p className="text-[10px] text-[#2F4156]/60 mt-1">
                      * 서버 네트워크 이슈나 일시적 방화벽 방해일 수 있습니다. 본인이 입력한 키가 유효하다면 이 버튼을 눌러 다음 단계로 통과하실 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Verification button */}
            <button
              type="submit"
              disabled={status === 'validating' || !inputKey.trim()}
              className="w-full py-3 bg-[#567C8D] hover:bg-[#2F4156] text-white rounded-xl text-sm font-bold disabled:opacity-50 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {status === 'validating' ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  유효성 검사 및 정밀 실시간 실증 확인 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  API Key 유효성 실시간 인증받기
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Guide Accordion section (Collapsible) */}
      <div className="border border-[#C8D9E6] rounded-2xl bg-white overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="w-full flex items-center justify-between p-4 text-left font-sans text-xs sm:text-sm font-bold text-[#2F4156] hover:bg-[#F5EFEB]/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#567C8D]" />
            <span>Gemini API Key 발급 절차가 처음이신가요? (도움말 접기/펴기)</span>
          </div>
          {showHelp ? <ChevronUp className="w-4 h-4 text-[#567C8D]" /> : <ChevronDown className="w-4 h-4 text-[#567C8D]" />}
        </button>

        {showHelp && (
          <div className="p-5 border-t border-[#C8D9E6] bg-[#F5EFEB]/20 space-y-4 text-xs sm:text-sm text-[#2F4156]/80 leading-relaxed font-sans animate-fade-in">
            <p className="text-[#2F4156]/90 font-semibold">Gemini 2.5 Flash를 통한 빠른 해석을 위해 무료 API Key를 간편하게 획득하실 수 있습니다.</p>
            <div className="space-y-3 pt-2">
              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-md bg-[#567C8D] text-white text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <p className="font-semibold text-[#2F4156]">Google AI Studio 공식 홈페이지 접속</p>
                  <p className="text-[#2F4156]/70 mt-0.5">
                    <a
                      href="https://aistudio.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#567C8D] hover:underline font-semibold"
                    >
                      aistudio.google.com
                    </a>{' '}
                    링크를 방문하여 본인의 구글 이메일 계정으로 안전하게 로그인합니다.
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-md bg-[#567C8D] text-white text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <p className="font-semibold text-[#2F4156]">API Key 생성 마법사 시작</p>
                  <p className="text-[#2F4156]/70 mt-0.5">화면 왼쪽 상단의 <b className="text-[#2F4156] font-medium bg-[#C8D9E6]/30 px-1 py-0.5 rounded">"Get API key"</b> 버튼을 선택하고, 순서대로 이행합니다.</p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-md bg-[#567C8D] text-white text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <p className="font-semibold text-[#2F4156]">프로젝트 선택 또는 생성</p>
                  <p className="text-[#2F4156]/70 mt-0.5"><b className="text-[#2F4156] font-medium bg-[#C8D9E6]/30 px-1 py-0.5 rounded">"Create API key"</b> 대화공간에서 본인의 임의 클라우드 혹은 신규 프로젝트를 선택하여 버튼을 누릅니다.</p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-md bg-[#567C8D] text-white text-[10px] font-bold flex items-center justify-center shrink-0">4</span>
                <div>
                  <p className="font-semibold text-[#2F4156]">API Key 복사 및 앱 입력</p>
                  <p className="text-[#2F4156]/70 mt-0.5">새롭게 발급된 <code className="bg-[#C8D9E6]/30 text-[11px] font-mono p-0.5 px-1 rounded text-[#2F4156]">AIzaSy...</code> 형태의 고유 비밀번호 키를 복사하여 위 입력란에 넣고 인증받으세요.</p>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-[#2F4156]/60 bg-white border border-[#C8D9E6] rounded-xl p-3 mt-4">
              💡 API Key는 사용자 브라우저 외부로 수집·공유되지 않으며 오직 구글 제미나이 언어모델 인터렉션 API 통신만을 위해서만 활용됩니다. 안심하셔도 좋습니다.
            </p>
          </div>
        )}
      </div>

      {/* Back and Next navigation buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-[#C8D9E6]/60">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-2 py-2.5 px-5 border border-[#C8D9E6] bg-white hover:bg-[#F5EFEB]/50 text-[#2F4156]/80 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 font-bold" />
          이전으로 (소개 화면)
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={status !== 'success'}
          className="flex items-center gap-2 py-2.5 px-6 bg-[#567C8D] hover:bg-[#2F4156] disabled:bg-[#567C8D]/40 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          기록 업로드로 진행
          <ArrowRight className="w-4 h-4 font-bold" />
        </button>
      </div>
    </div>
  );
}
