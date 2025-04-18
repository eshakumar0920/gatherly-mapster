
import { Button } from "@/components/ui/button";
import { categories } from "@/services/eventService";

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

const CategoryFilter = ({ selectedCategory, onCategorySelect }: CategoryFilterProps) => {
  return (
    <div className="pb-4">
      <h2 className="text-lg font-semibold mb-2">Categories</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          className="rounded-full text-xs"
          onClick={() => onCategorySelect(null)}
        >
          All
        </Button>
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            className="rounded-full text-xs whitespace-nowrap"
            onClick={() => onCategorySelect(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
