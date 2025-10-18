import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateGrowthPlan } from '../services/geminiService';
import { useProjects } from '../contexts/ProjectsContext';
import Loader from './common/Loader';
import Card from './common/Card';
import * as LucideReact from 'lucide-react';

const Onboarding: React.FC = () => {
  const [channelName, setChannelName] = useState('');
  const [niche, setNiche] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [contentType, setContentType] = useState('Tutorials');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { addProject } = useProjects();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName || !niche || !targetAudience) {
      setError('Please fill out all fields.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const tasks = await generateGrowthPlan(channelName, niche, targetAudience, contentType);
      const projectData = { channelName, niche, targetAudience, contentType };
      addProject(projectData, tasks);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
  const labelClasses = "block text-sm font-medium text-slate-300 mb-1";

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-white">Create Your YouTube Growth Plan</h1>
        <p className="mt-3 text-lg text-slate-400">Tell us about your channel, and our AI will craft a personalized 3-day growth strategy for you.</p>
      </div>
      
      {isLoading ? (
        <Loader text="Generating your personalized growth plan... This might take a moment."/>
      ) : (
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="channelName" className={labelClasses}>Channel Name</label>
                <input id="channelName" type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="e.g., CodeCraft" className={inputClasses} />
              </div>
              <div>
                <label htmlFor="niche" className={labelClasses}>Channel Niche</label>
                <input id="niche" type="text" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g., Web Development Tutorials" className={inputClasses} />
              </div>
            </div>

            <div>
              <label htmlFor="targetAudience" className={labelClasses}>Target Audience</label>
              <input id="targetAudience" type="text" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g., Beginner developers and students" className={inputClasses} />
            </div>

            <div>
              <label htmlFor="contentType" className={labelClasses}>Primary Content Type</label>
              <select id="contentType" value={contentType} onChange={(e) => setContentType(e.target.value)} className={inputClasses}>
                <option>Tutorials</option>
                <option>Vlogs</option>
                <option>Shorts</option>
                <option>Reviews</option>
                <option>Gaming</option>
              </select>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            
            <div className="pt-4">
              <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-indigo-400">
                <LucideReact.Sparkles className="w-5 h-5 mr-2" />
                Generate My Plan
              </button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default Onboarding;