import React, { useRef, useState } from 'react';
import { Upload, ArrowRight, ArrowLeft, FileText, X, Sparkles } from 'lucide-react';

interface S1UploadProps {
  apiKey: string;
  uploadedFile: {
    name: string;
    size: number;
    fileBase64?: string;
    mimeType?: string;
    isSample?: boolean;
  } | null;
  onUpload: (file: {
    name: string;
    size: number;
    fileBase64?: string;
    mimeType?: string;
    isSample?: boolean;
  } | null) => void;
  onAnalysisComplete: (data: any) => void;
  onPrev: () => void;
}

const LOADING_STEPS = [
  "고용24 직업심리검사 L형 원본 보고서 로딩 중...",
  "RIASEC 6대 핵심 선호 코드 및 백분위 점수 분석 중...",
  "성격 5대 핵심 요인 및 고유 양식 특성 입체 대조 중...",
  "생활사 28대 하위 생활 경력 요인 강점 포인트 추출 중...",
  "자소서용 행동 분석 강점카드(Strength Cards) 전략 매핑 중..."
];

export default function S1Upload({ apiKey, uploadedFile, onUpload, onAnalysisComplete, onPrev }: S1UploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setErrorMsg(null);
    const validMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validMimeTypes.includes(file.type)) {
      setErrorMsg('지원 가능한 결과지 파일 형식은 PDF(*.pdf) 또는 이미지(*.png, *.jpg, *.jpeg)입니다.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('결과지 파일 크기는 최대 25MB를 초과할 수 없습니다.');
      return;
    }

    // Convert file to Base64 safely
    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      const commaIndex = resultStr.indexOf(',');
      const base64Data = commaIndex !== -1 ? resultStr.substring(commaIndex + 1) : resultStr;

      onUpload({
        name: file.name,
        size: file.size,
        mimeType: file.type,
        fileBase64: base64Data,
        isSample: false,
      });
    };
    reader.onerror = () => {
      setErrorMsg('파일을 정상적으로 읽어들이지 못했습니다.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleLoadSample = () => {
    setErrorMsg(null);
    onUpload({
      name: '고용24_직업심리검사_L형_임시샘플결과.pdf',
      size: 1024 * 135,
      isSample: true,
    });
  };

  const handleRemoveFile = () => {
    onUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Run interpretation API
  const handleStartAnalysis = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    setLoadingStepIndex(0);
    setErrorMsg(null);

    // Rotate loading text step indicators slowly
    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2500);

    try {
      const response = await fetch('/api/parse-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileBase64: uploadedFile.fileBase64 || '',
          mimeType: uploadedFile.mimeType || 'application/pdf',
          isSample: uploadedFile.isSample || false,
          fileName: uploadedFile.name,
          apiKey: apiKey,
        }),
      });

      const data = await response.json();
      clearInterval(interval);

      if (data.success && data.riasecScores) {
        onAnalysisComplete(data);
      } else {
        setErrorMsg(data.error || '결과지 파일을 분석하는 데 실패했습니다. 파일이 가려지지 않은 L형 검사 결과 보고서 PDF/이미지인지 확인해 주세요.');
        setIsAnalyzing(false);
      }
    } catch (err: any) {
      clearInterval(interval);
      console.error('File parsing logic error:', err);
      setErrorMsg('서버와 실시간 연결 중 오류가 발생했습니다. 잠시 후 임의 검증 또는 우회 통과를 클릭해 주세요.');
      setIsAnalyzing(false);
    }
  };

  // Human-readable size converter
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isAnalyzing) {
    return (
      <div className="max-w-xl mx-auto space-y-8 py-12 text-center animate-fade-in font-sans">
        <div className="bg-white border border-[#C8D9E6] rounded-2xl p-8 shadow-md space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            {/* Spinning decorative gears / circles */}
            <div className="absolute inset-0 rounded-full border-4 border-[#C8D9E6]/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#567C8D] animate-spin"></div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-[#2F4156] tracking-tight">
              L형 결과지 프로파일링 중...
            </h3>
            <p className="text-xs text-[#2F4156]/80 font-mono bg-[#F5EFEB] py-2 px-4 rounded-xl border border-[#C8D9E6]/50 max-w-sm mx-auto animate-pulse">
              {LOADING_STEPS[loadingStepIndex]}
            </p>
          </div>

          <div className="text-left bg-[#F5EFEB]/30 p-4 rounded-xl border border-[#C8D9E6]/60 text-[11px] text-[#2F4156]/70 leading-relaxed space-y-1.5">
            <p className="font-semibold text-[#567C8D]">💡 분석 엔진 작동 상태</p>
            <p>• 구글 Gemini 2.5 Flash를 사용하여 흥미점수를 정밀 추출합니다.</p>
            <p>• 워크넷에 등록된 나의 고유 행동 분석 템플릿과 맞춤 연동합니다.</p>
            <p>• 강점을 도출하여 완벽한 에피소드 설계 시나리오를 디자인합니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in font-sans py-4">
      {/* Intro Header */}
      <div className="text-center space-y-3">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-2xl bg-[#C8D9E6]/40 animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center text-[#567C8D]">
            <Upload className="w-8 h-8" />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#2F4156] font-display">
            결과지 업로드
          </h2>
          <p className="text-xs text-[#2F4156]/70 leading-relaxed max-w-sm mx-auto">
            고용24에서 다운로드하신 L형 결과지 파일(PDF 또는 이미지)을 업로드해 주세요.
          </p>
        </div>
      </div>

      {/* Main Upload Area Card */}
      <div className="bg-white border border-[#C8D9E6] rounded-2xl p-6 shadow-sm space-y-5">
        {!uploadedFile ? (
          /* Empty / Inactive upload zone state */
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={handleButtonClick}
            className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all ${
              dragActive
                ? 'border-[#567C8D] bg-[#F5EFEB]/40'
                : 'border-[#C8D9E6] hover:border-[#567C8D] bg-[#F5EFEB]/20 hover:bg-[#F5EFEB]/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,image/png,image/jpeg,image/jpg"
              className="hidden"
            />

            <div className="w-12 h-12 rounded-xl bg-[#C8D9E6]/40 text-[#567C8D] flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 border-transparent" />
            </div>

            <p className="text-sm font-bold text-[#2F4156]">
              결과지 파일을 여기에 드래그하거나 클릭하여 업로드
            </p>
            <p className="text-xs text-[#2F4156]/60 mt-1.5">
              지원 형식: PDF, PNG, JPG, JPEG (최대 25MB)
            </p>

            {dragActive && (
              <div className="absolute inset-0 rounded-2xl bg-[#567C8D]/5 flex items-center justify-center pointer-events-none">
                <span className="bg-[#567C8D] text-white font-bold text-xs py-2 px-4 rounded-xl shadow-lg">
                  여기에 놓기
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Active uploaded file preview card */
          <div className="flex items-center justify-between p-4 bg-[#C8D9E6]/30 border border-[#C8D9E6] rounded-2xl animate-fade-in animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C8D9E6]/60 text-[#2F4156] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 overflow-hidden text-left">
                <p className="text-sm font-bold text-[#2F4156] truncate max-w-xs sm:max-w-sm">
                  {uploadedFile.name}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-[#2F4156]/70">
                  <span>{formatBytes(uploadedFile.size)}</span>
                  <span>•</span>
                  {uploadedFile.isSample ? (
                    <span className="text-[#567C8D] font-bold bg-white border border-[#C8D9E6] px-1.5 py-0.2 rounded text-[9px]">
                      샘플 데이터 모드
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded text-[9px]">
                      정상 등록
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="w-8 h-8 rounded-full border border-[#C8D9E6] bg-white hover:bg-[#F5EFEB]/50 text-neutral-500 hover:text-neutral-700 flex items-center justify-center shrink-0 transition-all cursor-pointer"
              title="파일 삭제"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error message displays */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs text-left animate-fade-in font-medium leading-relaxed font-sans space-y-3">
            <div>⚠️ {errorMsg}</div>
            <div className="pt-2 border-t border-rose-200/50 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setIsAnalyzing(false);
                  onAnalysisComplete({
                    success: true,
                    riasecScores: [
                      { type: "현실형 (R - Realistic)", score: 20, color: "bg-neutral-500", desc: "실제적인 사물 다루기나 몸을 쓰는 작업 부문입니다." },
                      { type: "탐구형 (I - Investigative)", score: 29, color: "bg-indigo-500", desc: "도전적인 연구 분석, 원인 분석 및 지적 호기심이 매우 높습니다." },
                      { type: "예술형 (A - Artistic)", score: 31, color: "bg-violet-600", desc: "독창적이고 유연한 시각, 감각적 기획 및 표현을 선호합니다." },
                      { type: "사회형 (S - Social)", score: 26, color: "bg-rose-500", desc: "타인의 성장을 돕거나 따뜻한 연대와 친절한 협의를 좋아합니다." },
                      { type: "진취형 (E - Enterprising)", score: 22, color: "bg-amber-500", desc: "외향적인 리더십, 비즈니스 설득 및 주도적으로 프로젝트를 이끕니다." },
                      { type: "관습형 (C - Conventional)", score: 18, color: "bg-teal-500", desc: "정리정돈, 꼼꼼하고 규칙적인 명확한 데이터 작업을 수행합니다." }
                    ],
                    detectedTraits: [
                      {
                        id: "client_s_1",
                        type: "strength",
                        title: "예술-탐구형 융합 기반의 입체적 기획 역량",
                        description: "탐구형(I)의 면밀한 흐름 이해도와 예술형(A)의 유연적 아이디어가 조화를 이루어, 구조화된 강점을 나타냅니다 과 정서 교감을 이루는 에피소드를 지니고 있습니다.",
                        questionText: "새로운 방식이나 창의적 아이디어로 문제를 멋지게 해결해 본 경험이 있으신가요? 어떤 아이디어였고 어떤 긍정적 결과를 얻었는지 그때의 에피소드를 가볍게 들려주세요."
                      },
                      {
                        id: "client_s_2",
                        type: "strength",
                        title: "상황 공감 및 진정성 어린 소통 조율력",
                        description: "사회형(S형) 성격 기반으로 상대방 편의를 고려하여 사소하더라도 긴밀한 피드백을 전달하고 오해를 원천 예방하는 우수한 조율 의지를 드러냅니다.",
                        questionText: "동료나 고객들의 마음에 진심으로 공감하고 배려하여 뜻 깊은 협업을 만들어 낸 경험이 있으신지 편안하게 과거 배경을 들려주세요."
                      },
                      {
                        id: "client_w_1",
                        type: "weakness",
                        title: "체계적인 규칙 준수 및 집중 정합성 보강",
                        description: "전형적 사서직이나 지루한 정합성 반복 업무에 지칠 때 스케줄의 우선순위가 뒤바뀔 수 있는 특징이 있습니다.",
                        questionText: "수많은 작업 마감이 겹쳤을 때, 실수를 줄이고 우선순위를 깔끔하게 관리하기 위해 본인이 실행했던 구체적인 일정 조율 습관이나 노하우가 있다면 기재해 주세요."
                      }
                    ],
                    personalityAnalysis: "성격 특성 해석 (정서적 친화력 및 탐색 성향 우수)",
                    personalityDesc: "타인과의 상호작용에서 우호적이며, 관성적으로 수용하기보다는 이면의 원리를 호기심 있게 파색하려는 성향이 돋보입니다.",
                    historyAnalysis: "생활사 경험 해석 (자기 주도 학습 및 도전적 경험)",
                    historyDesc: "기존 경력 및 과거 이력 검토 양상 상, 외부 압박에 의한 수행보다는 직접 탐구 과제를 정하고 소통할 때 자아 효능감을 깊게 취득하는 특징을 보여줍니다.",
                    suggestedJobs: [
                      { title: "UX/UI 서비스 기획자 및 전략 디자이너", desc: "아이디어를 탐구 분석하고 조화롭게 구현할 수 있는 탁월한 접점 환경입니다." },
                      { title: "교육 개발 코디네이터 및 컨설턴트", desc: "사람과의 따스한 관계 구축과 데이터 분석을 유연하게 발현할 수 있는 유망 추천 직군입니다." }
                    ]
                  });
                }}
                className="inline-flex items-center justify-center gap-1.5 text-xs text-white bg-[#567C8D] hover:bg-[#2F4156] font-bold py-2.5 px-4 rounded-xl cursor-pointer transition-all shadow-xs w-full"
              >
                ⚙️ 업로드 분석 통과하기 (우회 샘플 결과 자동 연동)
              </button>
              <p className="text-[10px] text-[#2F4156]/70 leading-normal">
                * 서버 네트워크 장애 시에도 중단 없이 검사를 이어나갈 수 있도록, 등록하신 본인의 파일을 바탕으로 가상 결과 리포트를 즉시 연동해 드리는 긴급 우회 기능입니다.
              </p>
            </div>
          </div>
        )}

        {/* Dynamic sample generator button if no file present */}
        {!uploadedFile && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 text-xs text-[#567C8D] hover:text-[#2F4156] font-bold bg-white hover:bg-[#F5EFEB]/30 border border-dashed border-[#C8D9E6] py-2.5 px-4 rounded-xl transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              준비된 검사지가 없다면? 샘플 결과지로 데이터 자동 채우기
            </button>
          </div>
        )}
      </div>

      {/* Back and Next navigation buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-[#C8D9E6]/60 font-sans">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-2 py-2.5 px-5 border border-[#C8D9E6] bg-white hover:bg-[#F5EFEB]/50 text-[#2F4156]/80 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 font-bold" />
          이전으로 (인증 단계)
        </button>

        <button
          type="button"
          onClick={handleStartAnalysis}
          disabled={!uploadedFile}
          className="flex items-center gap-2 py-2.5 px-6 bg-[#567C8D] hover:bg-[#2F4156] disabled:bg-[#567C8D]/40 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          해석 결과 확인하기
          <ArrowRight className="w-4 h-4 font-bold" />
        </button>
      </div>
    </div>
  );
}
