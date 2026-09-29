'use client';

import React from 'react';
import { GitBranch, GitCommit, ExternalLink, Plus } from 'lucide-react';
import { Project } from '@/types/database';

interface ProjectCardProps {
  projects: Project[];
  onAddProject: () => void;
}

export function ProjectCard({ projects, onAddProject }: ProjectCardProps) {
  return (
    <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-4 flex flex-col justify-between h-full shadow-sm hover:border-[#3f3f46] transition-all">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-white" />
            <h3 className="font-semibold text-sm text-white tracking-wide">Dev Projects & Repos</h3>
          </div>

          <button
            onClick={onAddProject}
            className="rounded-lg border border-[#27272a] bg-[#18181b] p-1.5 text-[#a1a1aa] hover:border-white hover:text-white transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Repos List */}
        <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="flex flex-col gap-2 rounded-lg border border-[#27272a] bg-[#000000] p-2.5 hover:border-[#3f3f46] transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate">{proj.title}</h4>
                  {proj.repo_url && (
                    <a
                      href={proj.repo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#71717a] hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
                  <GitCommit className="h-3 w-3 text-emerald-400" />
                  <span>{proj.commit_count} commits</span>
                </div>
              </div>

              {/* Milestone & Stack */}
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="text-[#a1a1aa] truncate text-[10px]">
                  📌 {proj.active_milestone || 'In active sprint'}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  {proj.tech_stack.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="rounded bg-[#18181b] border border-[#27272a] px-1.5 py-0.2 text-[9px] font-mono text-zinc-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-[#27272a] text-[11px] text-[#71717a] flex items-center justify-between">
        <span>Active Workspaces</span>
        <span className="font-mono text-[10px]">{projects.length} Repositories</span>
      </div>
    </div>
  );
}
