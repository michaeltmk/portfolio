"use client";
import { Card, Carousel } from "@/components/projects/apple-cards-carousel";
import { useProjectsData } from "@/components/projects/Data";
import { useMemo, memo } from "react";


const AllProjects = memo(() => {
  const data = useProjectsData();
  const cards = useMemo(() => 
    data.map((card, index) => (
      <Card key={`${card.title}-${index}`} card={card} index={index} layout={true} />
    )), [data]
  );

  return (
    <div className="w-full h-full pt-8">
      <h2 className="max-w-7xl mx-auto text-xl md:text-3xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
        My Projects
      </h2>
      <Carousel items={cards} />
    </div>
  );
});

AllProjects.displayName = 'AllProjects';

export default AllProjects;
