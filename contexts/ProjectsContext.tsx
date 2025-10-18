
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Project, Task } from '../types';

interface ProjectsContextType {
  projects: Project[];
  activeProject: Project | null;
  // FIX: Updated the type of the first argument to exclude `tasks`, as it's provided separately.
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'isActive' | 'tasks'>, tasks: Omit<Task, 'isCompleted'>[]) => Project;
  setActiveProject: (projectId: string | null) => void;
  updateTaskStatus: (projectId: string, day: number, isCompleted: boolean) => void;
  deleteProject: (projectId: string) => void;
  addTasksToProject: (projectId: string, tasks: Omit<Task, 'isCompleted'>[]) => void;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useLocalStorage<Project[]>('yt-growth-projects', []);
  const [activeProject, setActiveProjectState] = useState<Project | null>(null);

  useEffect(() => {
    const currentActive = projects.find(p => p.isActive);
    setActiveProjectState(currentActive || null);
  }, [projects]);

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'isActive' | 'tasks'>, tasksData: Omit<Task, 'isCompleted'>[]): Project => {
    const newProject: Project = {
      ...projectData,
      id: `proj_${new Date().getTime()}`,
      createdAt: new Date().toISOString(),
      tasks: tasksData.map(t => ({ ...t, isCompleted: false })),
      isActive: true,
    };

    setProjects(prev => [
      ...prev.map(p => ({ ...p, isActive: false })),
      newProject
    ]);
    return newProject;
  };

  const setActiveProject = (projectId: string | null) => {
    setProjects(prev =>
      prev.map(p => ({
        ...p,
        isActive: p.id === projectId,
      }))
    );
  };
  
  const updateTaskStatus = (projectId: string, day: number, isCompleted: boolean) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            tasks: p.tasks.map(t =>
              t.day === day ? { ...t, isCompleted } : t
            ),
          };
        }
        return p;
      })
    );
  };

  const addTasksToProject = (projectId: string, newTasksData: Omit<Task, 'isCompleted'>[]) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId) {
          const newTasks = newTasksData.map(t => ({ ...t, isCompleted: false }));
          return {
            ...p,
            tasks: [...p.tasks, ...newTasks],
          };
        }
        return p;
      })
    );
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };


  return (
    <ProjectsContext.Provider value={{ projects, activeProject, addProject, setActiveProject, updateTaskStatus, deleteProject, addTasksToProject }}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = (): ProjectsContextType => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};