import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectsContext';
import { generateAdditionalTasks } from '../services/geminiService';
import Card from './common/Card';
import * as LucideReact from 'lucide-react';

const InfoPill: React.FC<{ icon: string, label: string, value: string }> = ({ icon, label, value }) => {
    const Icon = (LucideReact as any)[icon];
    return (
        <div className="flex items-center bg-slate-700/50 rounded-full px-4 py-2 text-sm">
            <Icon className="w-4 h-4 mr-2 text-indigo-400" />
            <span className="text-slate-400 mr-1">{label}:</span>
            <span className="text-white font-medium">{value}</span>
        </div>
    )
};

const TaskItem: React.FC<{ task: any, projectId: string, onToggle: (day: number, completed: boolean) => void }> = ({ task, projectId, onToggle }) => {
    return (
        <div className={`p-4 rounded-lg transition-all duration-300 ${task.isCompleted ? 'bg-slate-900' : 'bg-slate-800'}`}>
            <div className="flex items-start justify-between">
                <div>
                    <h3 className={`text-lg font-bold ${task.isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>Day {task.day}: {task.title}</h3>
                    <p className={`mt-1 text-sm ${task.isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>{task.description}</p>
                </div>
                <button
                    onClick={() => onToggle(task.day, !task.isCompleted)}
                    className={`ml-4 flex-shrink-0 w-24 text-sm font-semibold py-2 rounded-md transition-colors ${task.isCompleted ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                >
                    {task.isCompleted ? 'Completed' : 'Mark Done'}
                </button>
            </div>
            <div className="mt-4 border-t border-slate-700 pt-4 space-y-3">
                <p className="text-sm"><strong className="text-indigo-400">Hook:</strong> <span className="text-slate-300">{task.hook}</span></p>
                <p className="text-sm"><strong className="text-indigo-400">Keywords:</strong> <span className="text-slate-300">{task.keywords}</span></p>
                <p className="text-sm flex items-start"><LucideReact.Lightbulb className="w-4 h-4 mr-2 mt-0.5 text-yellow-400 flex-shrink-0"/><strong className="text-yellow-400">Growth Tip:</strong> <span className="ml-1 text-slate-300">{task.growthTip}</span></p>
            </div>
        </div>
    );
}

const Dashboard: React.FC = () => {
  const { activeProject, updateTaskStatus, setActiveProject, addTasksToProject } = useProjects();
  const navigate = useNavigate();
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completedTasks = useMemo(() => activeProject?.tasks.filter(t => t.isCompleted).length || 0, [activeProject]);
  const totalTasks = activeProject?.tasks.length || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const isTaskLimitReached = totalTasks >= 9;

  if (!activeProject) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-center">
        <LucideReact.ClipboardX className="w-16 h-16 text-slate-600 mb-4"/>
        <h2 className="text-2xl font-bold">No Active Project</h2>
        <p className="text-slate-400 mt-2">Create a new plan to get started on your YouTube journey.</p>
        <button onClick={() => navigate('/new')} className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          Create New Plan
        </button>
      </div>
    );
  }

  const handleToggleTask = (day: number, isCompleted: boolean) => {
    updateTaskStatus(activeProject.id, day, isCompleted);
  };
  
  const handleCompleteProject = () => {
      setActiveProject(null);
      navigate('/history');
  }

  const handleGenerateMore = async () => {
    if (!activeProject || isTaskLimitReached) return;

    setIsGeneratingMore(true);
    setError(null);
    try {
        const lastDay = activeProject.tasks.length > 0
            ? Math.max(...activeProject.tasks.map(t => t.day))
            : 0;
        const newTasks = await generateAdditionalTasks(activeProject, lastDay + 1);
        addTasksToProject(activeProject.id, newTasks);
    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred while generating more tasks.');
    } finally {
        setIsGeneratingMore(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">{activeProject.channelName}</h1>
            <p className="text-slate-400 mt-1">Your {totalTasks}-Day Growth Plan</p>
        </div>
        <button onClick={handleCompleteProject} className="bg-slate-700 hover:bg-slate-600 text-sm font-semibold py-2 px-4 rounded-lg transition-colors">
           Mark Project as Done & Archive
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <InfoPill icon="Youtube" label="Niche" value={activeProject.niche} />
        <InfoPill icon="Users" label="Audience" value={activeProject.targetAudience} />
        <InfoPill icon="Clapperboard" label="Content" value={activeProject.contentType} />
      </div>

      <Card className="p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Progress</h2>
            <span className="font-bold text-lg">{completedTasks} / {totalTasks} Completed</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-4">
          <div className="bg-green-500 h-4 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Daily Tasks</h2>
        {activeProject.tasks.sort((a,b) => a.day - b.day).map(task => (
            <TaskItem key={task.day} task={task} projectId={activeProject.id} onToggle={handleToggleTask} />
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <button
            onClick={handleGenerateMore}
            disabled={isGeneratingMore || isTaskLimitReached}
            className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:bg-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
        >
            {isGeneratingMore ? (
                <>
                    <LucideReact.LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <LucideReact.PlusCircle className="w-5 h-5 mr-2" />
                    Generate Next 3 Days
                </>
            )}
        </button>
        {isTaskLimitReached && (
            <p className="text-yellow-500 text-sm mt-2">Task limit of 9 reached for this project.</p>
        )}
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

    </div>
  );
};

export default Dashboard;