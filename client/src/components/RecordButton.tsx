import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTranslation } from "@/lib/translations";
import type { LanguageCode } from "@shared/schema";

interface RecordButtonProps {
  isRecording: boolean;
  isAnalyzing: boolean;
  onToggle: () => void;
  language: LanguageCode;
}

export function RecordButton({ isRecording, isAnalyzing, onToggle, language }: RecordButtonProps) {
  const t = getTranslation(language);
  
  const recordingText: Record<LanguageCode, { start: string; stop: string; processing: string }> = {
    en: { start: "Tap to start recording", stop: "Tap to stop recording", processing: "Processing your pet's sound..." },
    ar: { start: "انقر لبدء التسجيل", stop: "انقر لإيقاف التسجيل", processing: "جاري معالجة صوت حيوانك..." },
    zh: { start: "点击开始录音", stop: "点击停止录音", processing: "正在处理你宠物的声音..." },
    es: { start: "Toca para empezar a grabar", stop: "Toca para dejar de grabar", processing: "Procesando el sonido de tu mascota..." },
    fr: { start: "Appuyez pour commencer l'enregistrement", stop: "Appuyez pour arrêter l'enregistrement", processing: "Traitement du son de votre animal..." },
    de: { start: "Tippen zum Aufnehmen", stop: "Tippen zum Stoppen", processing: "Verarbeite den Klang deines Haustieres..." },
    ja: { start: "タップして録音開始", stop: "タップして録音停止", processing: "ペットの音を処理中..." },
    ko: { start: "탭하여 녹음 시작", stop: "탭하여 녹음 중지", processing: "반려동물 소리 처리 중..." },
    pt: { start: "Toque para começar a gravar", stop: "Toque para parar de gravar", processing: "Processando o som do seu pet..." },
    ru: { start: "Нажмите для начала записи", stop: "Нажмите для остановки записи", processing: "Обработка звука вашего питомца..." },
  };

  const texts = recordingText[language] || recordingText.en;

  return (
    <div className="relative flex items-center justify-center">
      {isRecording && (
        <>
          <div className="absolute w-52 h-52 md:w-72 md:h-72 rounded-full bg-primary/20 animate-pulse-ring" />
          <div className="absolute w-60 h-60 md:w-80 md:h-80 rounded-full bg-primary/10 animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
        </>
      )}
      
      <button
        onClick={onToggle}
        disabled={isAnalyzing}
        data-testid="button-record"
        className={cn(
          "relative z-10 w-44 h-44 md:w-56 md:h-56 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/30",
          isRecording 
            ? "bg-destructive shadow-lg shadow-destructive/30 scale-95" 
            : isAnalyzing 
              ? "bg-muted cursor-not-allowed"
              : "bg-primary shadow-lg shadow-primary/30 hover:scale-105 active:scale-95"
        )}
      >
        {isAnalyzing ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            <span className="text-sm font-medium text-muted-foreground">{t.analyzing}</span>
          </div>
        ) : isRecording ? (
          <Square className="w-16 h-16 md:w-20 md:h-20 text-white fill-white" />
        ) : (
          <Mic className="w-16 h-16 md:w-20 md:h-20 text-white" />
        )}
      </button>
      
      <div className="absolute -bottom-16 text-center">
        <span className={cn(
          "text-base font-medium transition-colors",
          isRecording ? "text-destructive" : "text-muted-foreground"
        )}>
          {isAnalyzing ? texts.processing : isRecording ? texts.stop : texts.start}
        </span>
      </div>
    </div>
  );
}
