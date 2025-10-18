
import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectsContext';
import * as LucideReact from 'lucide-react';

// NavItem is a local component, so it's fine to keep it here.
const NavItem: React.FC<{ to: string; icon: string; label: string; disabled?: boolean; isExpanded: boolean }> = ({ to, icon, label, disabled = false, isExpanded }) => {
  const Icon = (LucideReact as any)[icon];
  // Base classes for nav items
  const baseClasses = 'flex items-center p-3 text-sm font-medium rounded-lg transition-colors group relative h-12';
  // Conditional classes based on state
  const layoutClasses = isExpanded ? 'justify-start' : 'justify-center';
  const disabledClasses = 'text-slate-600 cursor-not-allowed';
  const activeClasses = 'bg-slate-700 text-white';
  const inactiveClasses = 'text-slate-400 hover:bg-slate-800 hover:text-white';

  // The content of the nav item (icon and label)
  const content = (
    <>
      <Icon className={`w-5 h-5 transition-all ${isExpanded ? 'mr-3' : 'mr-0'}`} />
      {isExpanded && <span className="flex-1 whitespace-nowrap">{label}</span>}
      {!isExpanded && (
        <span className="absolute left-full ml-4 -translate-x-2 rounded-md bg-slate-800 border border-slate-700 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 whitespace-nowrap z-10">
          {label}
        </span>
      )}
    </>
  );

  // Render a div for disabled items
  if (disabled) {
    return (
      <div className={`${baseClasses} ${layoutClasses} ${disabledClasses}`} title={label}>
        {content}
      </div>
    );
  }

  // Render a NavLink for active items
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${baseClasses} ${layoutClasses} ${isActive ? activeClasses : inactiveClasses}`}
      title={label}
    >
      {content}
    </NavLink>
  );
};


const Layout: React.FC = () => {
    const { activeProject } = useProjects();
    const location = useLocation();
    // State to manage sidebar expansion
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    
    // Logic for disabling dashboard link
    const isDashboardDisabled = !activeProject;
    const isNewPlanActive = location.pathname === '/new';

    return (
        <div className="flex h-screen bg-slate-900 text-slate-100">
            {/* Sidebar */}
            <aside 
                className={`relative bg-slate-950 flex flex-col border-r border-slate-800 transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'w-64' : 'w-20'} ${!isSidebarExpanded ? 'cursor-pointer' : ''}`}
                onClick={() => !isSidebarExpanded && setIsSidebarExpanded(true)}
            >
                {/* Sidebar Header */}
                <div className={`flex items-center p-4 h-[65px] border-b border-slate-800 ${isSidebarExpanded ? '' : 'justify-center'}`}>
                    <div className="flex items-center overflow-hidden">
                        <LucideReact.Youtube className="w-8 h-8 text-red-500 flex-shrink-0" />
                        <h1 className={`text-xl font-bold tracking-tight whitespace-nowrap ml-3 transition-all duration-300 ${isSidebarExpanded ? 'max-w-full opacity-100' : 'max-w-0 opacity-0'}`}>Growth Companion</h1>
                    </div>
                </div>
                
                {/* Navigation Menu */}
                <nav className="flex-1 p-2 flex flex-col space-y-2 mt-2">
                    <NavItem to="/new" icon="PlusSquare" label="New Plan" isExpanded={isSidebarExpanded} />
                    <NavItem to="/dashboard" icon="LayoutDashboard" label="Dashboard" disabled={isDashboardDisabled && !isNewPlanActive} isExpanded={isSidebarExpanded} />
                    <NavItem to="/history" icon="History" label="Project History" isExpanded={isSidebarExpanded} />
                    <NavItem to="/assistant" icon="Bot" label="AI Assistant" isExpanded={isSidebarExpanded} />
                </nav>

                {/* Sidebar Footer with Collapse Button */}
                <div className="p-2 border-t border-slate-800">
                     <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsSidebarExpanded(p => !p)
                        }}
                        className="w-full flex items-center p-3 text-sm font-medium rounded-lg transition-colors text-slate-400 hover:bg-slate-800 hover:text-white h-12"
                        aria-label={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                     >
                        <div className={`flex items-center w-full ${isSidebarExpanded ? '' : 'justify-center'}`}>
                            <LucideReact.ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${isSidebarExpanded ? '' : 'rotate-180'}`} />
                            {isSidebarExpanded && <span className="flex-1 whitespace-nowrap ml-3">Collapse</span>}
                        </div>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main 
                className="flex-1 overflow-y-auto"
                onClick={() => isSidebarExpanded && setIsSidebarExpanded(false)}
            >
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
