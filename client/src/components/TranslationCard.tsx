import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MessageCircle, Volume2, AlertTriangle, ShoppingBag } from "lucide-react";
import { getTranslation } from "@/lib/translations";
import type { AnalyzeResponse, ProductRecommendation, LanguageCode } from "@shared/schema";

interface TranslationCardProps {
  result: AnalyzeResponse;
  language: LanguageCode;
}

const categoryIcons: Record<string, string> = {
  food: "🍖",
  toys: "🎾",
  comfort: "🛏️",
  health: "💊",
};

const urgentText: Record<LanguageCode, string> = {
  en: "Urgent",
  ar: "عاجل",
  zh: "紧急",
  es: "Urgente",
  fr: "Urgent",
  de: "Dringend",
  ja: "緊急",
  ko: "긴급",
  pt: "Urgente",
  ru: "Срочно",
};

const recommendedProductsText: Record<LanguageCode, string> = {
  en: "Recommended Products",
  ar: "المنتجات الموصى بها",
  zh: "推荐产品",
  es: "Productos recomendados",
  fr: "Produits recommandés",
  de: "Empfohlene Produkte",
  ja: "おすすめ商品",
  ko: "추천 제품",
  pt: "Produtos recomendados",
  ru: "Рекомендуемые товары",
};

export function TranslationCard({ result, language }: TranslationCardProps) {
  const t = getTranslation(language);

  return (
    <div className="space-y-4" data-testid="translation-card">
      <div className="relative">
        <div className="absolute -top-2 left-4 w-6 h-6 bg-primary rotate-45 rounded-sm" />
        <Card className="relative bg-primary text-primary-foreground overflow-visible">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-start gap-3">
              <div className="text-3xl" data-testid="animal-emoji">{result.animalEmoji}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground capitalize" data-testid="animal-type">
                    {result.animalType}
                  </Badge>
                </div>
                <p className="text-lg font-medium leading-relaxed" data-testid="translation-text">
                  "{result.translation}"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400" data-testid="original-sound">
            {result.transcription}
          </span>
        </div>
        <Badge variant="secondary" className="gap-1 bg-white/10 text-white border-white/20" data-testid="mood-badge">
          <span>{result.moodEmoji}</span>
          <span className="capitalize">{result.mood}</span>
        </Badge>
      </div>

      <Card className={`glass-card ${result.action.urgent ? "border-red-500/30" : ""}`}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">{result.action.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white" data-testid="action-title">{result.action.title}</h3>
                {result.action.urgent && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {urgentText[language] || urgentText.en}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-400" data-testid="action-description">
                {result.action.description}
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">{t.confidence}</span>
              <span className="font-medium text-white" data-testid="confidence-value">{result.confidence}%</span>
            </div>
            <Progress value={result.confidence} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {result.tips.length > 0 && (
        <Card className="glass-card">
          <CardContent className="pt-4 pb-4">
            <h4 className="font-medium mb-2 flex items-center gap-2 text-white">
              <MessageCircle className="w-4 h-4" />
              {t.tips}
            </h4>
            <ul className="space-y-1">
              {result.tips.map((tip, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span data-testid={`tip-${index}`}>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {result.products && result.products.length > 0 && (
        <Card className="glass-card border-primary/20">
          <CardContent className="pt-4 pb-4">
            <h4 className="font-medium mb-3 flex items-center gap-2 text-white">
              <ShoppingBag className="w-4 h-4" />
              {recommendedProductsText[language] || recommendedProductsText.en}
            </h4>
            <div className="space-y-2">
              {result.products.map((product: ProductRecommendation, index: number) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover-elevate cursor-pointer"
                  data-testid={`product-${index}`}
                >
                  <div className="text-xl">
                    {categoryIcons[product.category] || "🛒"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate text-white">{product.name}</p>
                    <p className="text-xs text-gray-400 truncate">{product.description}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs bg-white/10 border-white/20 text-white">
                    {product.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
