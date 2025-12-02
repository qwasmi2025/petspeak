import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { languages, type LanguageCode } from "@shared/schema";

interface LanguageSelectorProps {
  value: LanguageCode;
  onChange: (language: LanguageCode) => void;
  disabled?: boolean;
}

export function LanguageSelector({ value, onChange, disabled }: LanguageSelectorProps) {
  return (
    <div className="w-full" data-testid="language-selector">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onChange(lang.code)}
              disabled={disabled}
              data-testid={`language-tab-${lang.code}`}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors",
                "hover-elevate active-elevate-2",
                "border border-transparent",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                value === lang.code
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/10 text-gray-300 hover:text-white border-white/10"
              )}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.nativeName}</span>
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </div>
  );
}
