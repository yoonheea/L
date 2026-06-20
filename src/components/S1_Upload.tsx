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
      setErrorMsg('서버와 실시간 연결 중 요류가 발생했습니다. 잠시 후 임의 검증 또는 샘플을 수행해 주세요.');
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
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs text-left animate-fade-in font-medium leading-relaxed font-sans">
            ⚠️ {errorMsg}
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
