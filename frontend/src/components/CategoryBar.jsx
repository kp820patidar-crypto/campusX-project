import React from 'react';
import {
  BookOpen,
  Laptop,
  Calculator,
  Bike,
  Home,
  Armchair,
  Shirt,
  Trophy,
  Grid
} from 'lucide-react';

const CATEGORY_ITEMS = [
  { name: 'All', label: 'All Items', icon: Grid },
  { name: 'Books & Study Materials', label: 'Books & Notes', icon: BookOpen },
  { name: 'Electronics', label: 'Electronics', icon: Laptop },
  { name: 'Calculators & Lab Equipment', label: 'Lab & Calculators', icon: Calculator },
  { name: 'Cycles & Transport', label: 'Cycles', icon: Bike },
  { name: 'Hostel Essentials', label: 'Hostel Gear', icon: Home },
  { name: 'Furniture', label: 'Furniture', icon: Armchair },
  { name: 'Clothing & Accessories', label: 'Clothing', icon: Shirt },
  { name: 'Sports & Fitness', label: 'Sports', icon: Trophy },
];

export const CategoryBar = ({ selectedCategory = 'All', onSelectCategory }) => {
  return (
    <div className="w-full bg-white border-y border-slate-200/80 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_ITEMS.map((item) => {
            const IconComponent = item.icon;
            const isSelected = selectedCategory === item.name || (selectedCategory === '' && item.name === 'All');

            return (
              <button
                key={item.name}
                onClick={() => onSelectCategory(item.name === 'All' ? '' : item.name)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

