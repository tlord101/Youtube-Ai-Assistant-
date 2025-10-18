import React from 'react';
import { useProjects } from '../contexts/ProjectsContext';
import { useNavigate } from 'react-router-dom';
import Card from './common/Card';
import * as LucideReact from 'lucide-react';

const ProjectCard: React.FC<{ project: any }> = ({ project }) => {
    const { deleteProject, setActiveProject } = useProjects();
    const navigate = useNavigate();

    const completedTasks = project.tasks.filter((t: any) => t.isCompleted).length;
    const totalTasks = project.tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const creationDate = new Date(project.createdAt).toLocaleDateString();

    const handleView = () => {
        setActiveProject(project.id);
        navigate('/dashboard');
    }

    return (
        <Card className="p-5 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-white">{project.channelName}</h3>
                    {project.isActive && (
                        <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full">Active</span>
                    )}
                </div>
                <p className="text-sm text-slate-400 mt-1">{project.niche}</p>
                <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center text-slate-300">
                        <LucideReact.Calendar className="w-4 h-4 mr-2 text-slate-500" />
                        Created on: {creationDate}
                    </div>
                    <div className="flex items-center text-slate-300">
                        <LucideReact.Target className="w-4 h-4 mr-2 text-slate-500" />
                        Completion: {completionRate}% ({completedTasks}/{totalTasks})
                    </div>
                </div>
            </div>
            <div className="mt-6 flex gap-3">
                <button onClick={handleView} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 rounded-lg text-sm transition-colors">
                    {project.isActive ? 'View Dashboard' : 'Re-activate'}
                </button>
                <button onClick={() => deleteProject(project.id)} className="bg-red-600/20 hover:bg-red-600/40 text-red-400 font-semibold p-2 rounded-lg transition-colors">
                    <LucideReact.Trash2 className="w-5 h-5" />
                </button>
            </div>
        </Card>
    );
}

const History: React.FC = () => {
  const { projects } = useProjects();
  const navigate = useNavigate();

  const sortedProjects = [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-6">Project History</h1>
      {projects.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-700 rounded-lg">
          <LucideReact.Archive className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h2 className="text-xl font-semibold">No Projects Found</h2>
          <p className="text-slate-400 mt-2">Your created growth plans will appear here.</p>
          <button onClick={() => navigate('/new')} className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Create Your First Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default History;