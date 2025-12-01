import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MessageCircle, Volume2, AlertTriangle, ShoppingBag } from "lucide-react";
import type { AnalyzeResponse, ProductRecommendation } from "@shared/schema";

interface TranslationCardProps {
  result: AnalyzeResponse;
}

const categoryIcons: Record<string, string> = {
  food: "🍖",
  toys: "🎾",
  comfort: "🛏️",
  health: "💊",
};

export function TranslationCard({ result }: TranslationCardProps) {

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
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground" data-testid="original-sound">
            {result.transcription}
          </span>
        </div>
        <Badge variant="secondary" className="gap-1" data-testid="mood-badge">
          <span>{result.moodEmoji}</span>
          <span className="capitalize">{result.mood}</span>
        </Badge>
      </div>

      <Card className={result.action.urgent ? "border-destructive bg-destructive/5" : ""}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">{result.action.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold" data-testid="action-title">{result.action.title}</h3>
                {result.action.urgent && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Urgent
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground" data-testid="action-description">
                {result.action.description}
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Confidence</span>
              <span className="font-medium" data-testid="confidence-value">{result.confidence}%</span>
            </div>
            <Progress value={result.confidence} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {result.tips.length > 0 && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Tips for you
            </h4>
            <ul className="space-y-1">
              {result.tips.map((tip, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span data-testid={`tip-${index}`}>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {result.products && result.products.length > 0 && (
        <Card className="bg-accent/30 border-accent">
          <CardContent className="pt-4 pb-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Recommended Products
            </h4>
            <div className="space-y-2">
              {result.products.map((product: ProductRecommendation, index: number) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-2 rounded-lg bg-background/50 hover-elevate cursor-pointer"
                  data-testid={`product-${index}`}
                >
                  <div className="text-xl">
                    {categoryIcons[product.category] || "🛒"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{product.description}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">
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
