"use client";

import { useState } from "react";
import MediaCard from "./MediaCard";
import Carousel from "./Carousel";

// Pick a goal, then see the tools that help with it
export default function GoalTabs({ goals }) {
  const [active, setActive] = useState(goals[0].id);
  const current = goals.find((goal) => goal.id === active);

  return (
    <div>
      <div role="tablist" aria-label="What do you want to make?" className="flex flex-wrap gap-2">
        {goals.map((goal) => (
          <button
            key={goal.id}
            type="button"
            role="tab"
            id={`goal-${goal.id}`}
            aria-selected={active === goal.id}
            aria-controls="goal-panel"
            onClick={() => setActive(goal.id)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              active === goal.id ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
            }`}
          >
            {goal.label}
          </button>
        ))}
      </div>

      <div id="goal-panel" role="tabpanel" aria-labelledby={`goal-${active}`} className="mt-6">
        <Carousel key={active} label={current.label}>
          {current.cards.map((card) => (
            <MediaCard key={card.title} {...card} size="w-[250px] aspect-[4/5] sm:w-[300px]" />
          ))}
        </Carousel>
      </div>
    </div>
  );
}