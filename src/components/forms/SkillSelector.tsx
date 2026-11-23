"use client";

import { useState, useMemo } from "react";
import { Skill } from "@/types";
import { Search, Check, Plus, X } from "lucide-react";

interface SkillSelectorProps {
  availableSkills: Skill[];
  selectedSkillIds: number[];
  onChange: (ids: number[]) => void;
  maxSelection?: number;
}

export function SkillSelector({
  availableSkills,
  selectedSkillIds,
  onChange,
  maxSelection,
}: SkillSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of availableSkills) {
      if (s.category) set.add(s.category);
    }
    return ["All", ...Array.from(set)];
  }, [availableSkills]);

  const filteredSkills = useMemo(() => {
    return availableSkills.filter((skill) => {
      const matchesSearch = skill.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());
      const matchesCategory =
        selectedCategory === "All" || skill.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [availableSkills, searchTerm, selectedCategory]);

  const toggleSkill = (id: number) => {
    if (selectedSkillIds.includes(id)) {
      onChange(selectedSkillIds.filter((item) => item !== id));
    } else {
      if (maxSelection && selectedSkillIds.length >= maxSelection) {
        return;
      }
      onChange([...selectedSkillIds, id]);
    }
  };

  const removeSkill = (id: number) => {
    onChange(selectedSkillIds.filter((item) => item !== id));
  };

  const selectedSkills = useMemo(() => {
    const idSet = new Set(selectedSkillIds);
    return availableSkills.filter((s) => idSet.has(s.id));
  }, [availableSkills, selectedSkillIds]);

  return (
    <div className="space-y-4">
      {/* Selected Skills Chips */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-slate-800">
            Selected Skills ({selectedSkillIds.length}
            {maxSelection ? ` / ${maxSelection}` : ""})
          </label>
          {selectedSkillIds.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {selectedSkills.length === 0 ? (
          <div className="p-3 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-400">
            No skills selected yet. Click from the list below to add skills.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-[48px]">
            {selectedSkills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-sm animate-in fade-in zoom-in-95 duration-150"
              >
                {skill.name}
                <button
                  type="button"
                  onClick={() => removeSkill(skill.id)}
                  className="hover:bg-blue-700 p-0.5 rounded transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search skills (e.g. React, Node.js, PostgreSQL)..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Available Skills Grid */}
      <div className="max-h-56 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {filteredSkills.map((skill) => {
            const isSelected = selectedSkillIds.includes(skill.id);
            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => toggleSkill(skill.id)}
                className={`p-2 rounded-xl text-left border text-xs font-medium transition-all flex items-center justify-between gap-1.5 ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                }`}
              >
                <div className="truncate">
                  <div>{skill.name}</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    {skill.category}
                  </div>
                </div>
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
        {filteredSkills.length === 0 && (
          <p className="text-center text-xs text-slate-400 py-4">
            No matching skills found for &quot;{searchTerm}&quot;.
          </p>
        )}
      </div>
    </div>
  );
}
