import { Dog, Cat, Bird, Rabbit } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AnimalType } from "@shared/schema";

interface AnimalSelectorProps {
  value: AnimalType;
  onChange: (value: AnimalType) => void;
  disabled?: boolean;
}

const animalIcons: Record<AnimalType, typeof Dog> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  rabbit: Rabbit,
  hamster: Rabbit,
  other: Dog,
};

const animalLabels: Record<AnimalType, string> = {
  dog: "Dog",
  cat: "Cat",
  bird: "Bird",
  rabbit: "Rabbit",
  hamster: "Hamster",
  other: "Other Animal",
};

export function AnimalSelector({ value, onChange, disabled }: AnimalSelectorProps) {
  const Icon = animalIcons[value];
  
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger 
        className="w-full max-w-xs h-12 text-base" 
        data-testid="select-animal-type"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5" />
          <SelectValue placeholder="Select your pet type" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(animalLabels) as AnimalType[]).map((animal) => {
          const AnimalIcon = animalIcons[animal];
          return (
            <SelectItem 
              key={animal} 
              value={animal}
              data-testid={`option-animal-${animal}`}
            >
              <div className="flex items-center gap-3">
                <AnimalIcon className="w-4 h-4" />
                <span>{animalLabels[animal]}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
