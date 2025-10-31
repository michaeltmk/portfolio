"use client";

import Image from 'next/image';
import { ChevronRight, Link } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useProjects } from '@/lib/portfolio-context';
import { useMemo, memo } from 'react';

// --- COMPONENT & INTERFACE DEFINITIONS ---
// Define interface for project prop
interface ProjectProps {
  title: string;
}

// This component dynamically renders the project details
const ProjectContent = memo(({ project }: { project: ProjectProps }) => {
  // Get projects from context
  const projects = useProjects();
  // Find the matching project data from the database
  const projectData = projects.find((p: any) => p.title === project.title);

  if (!projectData) {
    return <div>Project details not available</div>;
  }

  return (
    <div className="space-y-10">
      {/* Header section with description */}
      <div className="rounded-3xl bg-[#F5F5F7] p-8 dark:bg-[#1D1D1F]">
        <div className="space-y-6">
          <div className="text-secondary-foreground font-sans text-base leading-relaxed md:text-lg">
            {Array.isArray(projectData.description) ? (
              <div className="space-y-2">
                {projectData.description.map((desc: string, index: number) => (
                  <p key={index}>{desc}</p>
                ))}
              </div>
            ) : (
              <p>{projectData.description}</p>
            )}
          </div>

          {/* Tech stack */}
          <div className="pt-4">
            <h3 className="mb-3 text-sm tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {projectData.tech_stack?.map((tech: any, index: any) => (
                <span
                  key={index}
                  className="rounded-full bg-neutral-200 px-3 py-1 text-sm text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Links section */}
      {(projectData.demo_url || projectData.repo_url) && (
        <div className="mb-24">
          <div className="px-6 mb-4 flex items-center gap-2">
            <h3 className="text-sm tracking-wide text-neutral-500 dark:text-neutral-400">
              Links
            </h3>
            <Link className="text-muted-foreground w-4" />
          </div>
          <Separator className="my-4" />
          <div className="space-y-3">
            {projectData.demo_url && (
              <a
                href={projectData.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[#F5F5F7] flex items-center justify-between rounded-xl p-4 transition-colors hover:bg-[#E5E5E7] dark:bg-neutral-800 dark:hover:bg-neutral-700"
              >
                <span className="font-light capitalize">Live Demo</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            )}
            {projectData.repo_url && (
              <a
                href={projectData.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[#F5F5F7] flex items-center justify-between rounded-xl p-4 transition-colors hover:bg-[#E5E5E7] dark:bg-neutral-800 dark:hover:bg-neutral-700"
              >
                <span className="font-light capitalize">GitHub Repository</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Screenshots section */}
      {projectData.images && projectData.images.length > 0 && (
        <div className="space-y-8">
          <div className="px-6">
            <h3 className="text-sm tracking-wide text-neutral-500 dark:text-neutral-400">
              Screenshots
            </h3>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6">
            {projectData.images.map((image: any, index: any) => (
              <div key={index} className="space-y-2">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-lg shadow-sm"
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {image.alt}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

ProjectContent.displayName = 'ProjectContent';

// --- MAIN DATA EXPORT ---
// This component generates the data used by your main portfolio page.
const useProjectsData = () => {
  const projects = useProjects();
  
  return useMemo(() => {
    return projects.map((project: any) => ({
      category: 'Development',
      title: project.title,
      src: project.images?.[0]?.src || '/projects/default-preview.png',
      content: <ProjectContent project={{ title: project.title }} />
    }));
  }, [projects]);
};

export { useProjectsData, ProjectContent };
