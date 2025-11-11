import React from 'react';

const Logo = () => (
  <div className="flex flex-col px-4">
    <div className="flex items-center space-x-3">
      <div className="bg-brand-green p-2 rounded-lg">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V14.75C10.41 14.58 10 14.05 10 13.5V11.5C10 10.67 10.67 10 11.5 10H12.5C13.33 10 14 10.67 14 11.5V13.5C14 14.05 13.59 14.58 13 14.75V17ZM12 9C11.45 9 11 8.55 11 8V7C11 6.45 11.45 6 12 6C12.55 6 13 6.45 13 7V8C13 8.55 12.55 9 12 9Z" fill="#FEFBF6"/>
        </svg>
      </div>
      <span className="text-2xl font-bold text-brand-green-dark dark:text-brand-cream tracking-tight">HealWise</span>
    </div>
    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 ml-1 tracking-wider font-medium uppercase">a Foster Wealth Ventures creation</span>
  </div>
);

const NavItem: React.FC<{ icon: React.ReactElement; label: string; isActive: boolean; onClick: () => void; isAction?: boolean; count?: number }> = ({ icon, label, isActive, onClick, isAction = false, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 rounded-lg relative ${
      isActive
        ? 'bg-brand-green/10 text-brand-green-dark dark:bg-brand-green/20 font-semibold'
        : isAction 
        ? 'bg-brand-green-dark text-white hover:bg-brand-green-dark/90'
        : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-brand-charcoal-light/60 dark:hover:text-brand-cream'
    }`}
  >
    {isActive && !isAction && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-brand-green rounded-r-full"></div>}
    {React.cloneElement(icon, { className: 'h-6 w-6' })}
    <span className="ml-4">{label}</span>
    {count && count > 0 && (
        <span className="ml-auto bg-brand-gold text-white text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
    )}
  </button>
);

const Sidebar: React.FC<{ activeView: string; setActiveView: (view: string) => void; plannerItemCount: number; }> = ({ activeView, setActiveView, plannerItemCount }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'planner', label: 'My Planner', icon: <PlannerIcon />, count: plannerItemCount },
    { id: 'shop', label: 'HealWise Market', icon: <ShopIcon /> },
  ];

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200/80 dark:bg-brand-charcoal-light/50 dark:border-gray-700/60 flex-shrink-0 flex-col hidden lg:flex">
      <div className="h-24 flex items-center justify-start pl-4 border-b border-gray-200/80 dark:border-gray-700/60">
         <Logo />
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeView === item.id}
            onClick={() => setActiveView(item.id)}
            count={item.count}
          />
        ))}
      </nav>
      <div className="p-4">
        <NavItem
            icon={<UpgradeIcon />}
            label="Upgrade to Pro"
            isActive={activeView === 'pricing'}
            onClick={() => setActiveView('pricing')}
            isAction={true}
          />
      </div>
      <div className="p-6 border-t border-gray-200/80 dark:border-gray-700/60">
          <h4 className="font-semibold text-brand-green-dark dark:text-brand-cream">Food-First, Faith-Friendly</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your journey to holistic wellness starts here.</p>
      </div>
    </aside>
  );
};

// Icon components
const DashboardIcon = ({className = "h-6 w-6"}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const PlannerIcon = ({className = "h-6 w-6"}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const ShopIcon = ({className = "h-6 w-6"}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const UpgradeIcon = ({className = "h-6 w-6"}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" /></svg>;

export default Sidebar;