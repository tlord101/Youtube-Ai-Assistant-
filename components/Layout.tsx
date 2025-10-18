import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectsContext';
import * as LucideReact from 'lucide-react';

const NavItem: React.FC<{ to: string; icon: string; label: string; disabled?: boolean }> = ({ to, icon, label, disabled = false }) => {
  const Icon = (LucideReact as any)[icon];
  const baseClasses = 'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors';
  const disabledClasses = 'text-slate-600 cursor-not-allowed';
  const activeClasses = 'bg-slate-700 text-white';
  const inactiveClasses = 'text-slate-400 hover:bg-slate-800 hover:text-white';

  if (disabled) {
    return (
      <div className={`${baseClasses} ${disabledClasses}`}>
        <Icon className="w-5 h-5 mr-3" />
        <span>{label}</span>
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{label}</span>
    </NavLink>
  );
};


const Layout: React.FC = () => {
    const { activeProject } = useProjects();
    const location = useLocation();
    
    const isDashboardDisabled = !activeProject;
    const isNewPlanActive = location.pathname === '/new';

    return (
        <div className="flex h-screen bg-slate-900 text-slate-100">
            <aside className="w-64 bg-slate-950 p-4 flex flex-col border-r border-slate-800">
                <div className="flex items-center mb-8">
                    <LucideReact.Youtube className="w-8 h-8 mr-3 text-red-500" />
                    <h1 className="text-xl font-bold tracking-tight">Growth Companion</h1>
                </div>
                <nav className="flex flex-col space-y-2">
                    <NavItem to="/new" icon="PlusSquare" label="New Plan" />
                    <NavItem to="/dashboard" icon="LayoutDashboard" label="Dashboard" disabled={isDashboardDisabled && !isNewPlanActive}/>
                    <NavItem to="/history" icon="History" label="Project History" />
                    <NavItem to="/assistant" icon="Bot" label="AI Assistant" />
                </nav>
            </aside>
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;