import { useLocation } from 'wouter';

// Functional minimalistic pastel icons as React components
const GoalsIcon = ({ className }: { className?: string }) => (
  <div className="relative w-6 h-6 flex items-center justify-center">
    {/* Target/bullseye icon for goals */}
    <div className={`${className} w-4 h-4 rounded-full border-2 border-current opacity-60`}>
      <div className="w-2 h-2 rounded-full bg-current opacity-80 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
    </div>
  </div>
);

const WellbeingIcon = ({ className }: { className?: string }) => (
  <div className="relative w-6 h-6 flex items-center justify-center">
    {/* Heart icon for wellbeing */}
    <div className={`${className} w-4 h-4 bg-current opacity-60`}
         style={{
           clipPath: 'polygon(50% 85%, 15% 50%, 15% 35%, 25% 25%, 40% 25%, 50% 40%, 60% 25%, 75% 25%, 85% 35%, 85% 50%)'
         }} />
  </div>
);

const PlannerIcon = ({ className }: { className?: string }) => (
  <div className="relative w-6 h-6 flex items-center justify-center">
    {/* Sun icon for "Today" planner */}
    <div className={`${className} w-3 h-3 rounded-full bg-current opacity-60 relative`}>
      <div className="absolute -top-2 left-1/2 w-0.5 h-1.5 bg-current opacity-40 transform -translate-x-1/2" />
      <div className="absolute -bottom-2 left-1/2 w-0.5 h-1.5 bg-current opacity-40 transform -translate-x-1/2" />
      <div className="absolute -left-2 top-1/2 w-1.5 h-0.5 bg-current opacity-40 transform -translate-y-1/2" />
      <div className="absolute -right-2 top-1/2 w-1.5 h-0.5 bg-current opacity-40 transform -translate-y-1/2" />
    </div>
  </div>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <div className="relative w-6 h-6 flex items-center justify-center">
    {/* Calendar grid icon */}
    <div className={`${className} w-4 h-4 border border-current opacity-60 rounded-sm`}>
      <div className="w-full h-0.5 bg-current opacity-40 mt-1" />
      <div className="flex justify-between px-0.5 mt-0.5">
        <div className="w-0.5 h-0.5 bg-current opacity-40 rounded-full" />
        <div className="w-0.5 h-0.5 bg-current opacity-40 rounded-full" />
        <div className="w-0.5 h-0.5 bg-current opacity-40 rounded-full" />
      </div>
      <div className="flex justify-between px-0.5 mt-0.5">
        <div className="w-0.5 h-0.5 bg-current opacity-40 rounded-full" />
        <div className="w-0.5 h-0.5 bg-current opacity-60 rounded-full" />
        <div className="w-0.5 h-0.5 bg-current opacity-40 rounded-full" />
      </div>
    </div>
  </div>
);

const ProfileIcon = ({ className }: { className?: string }) => (
  <div className="relative w-6 h-6 flex items-center justify-center">
    {/* Person icon for profile */}
    <div className={`${className} w-4 h-4 relative`}>
      <div className="w-2 h-2 rounded-full bg-current opacity-60 mx-auto" />
      <div className="w-3 h-2 bg-current opacity-50 rounded-t-full mt-0.5 mx-auto" />
    </div>
  </div>
);

const navigationItems = [
  { id: 'goals', label: 'Цели', path: '/goals', icon: GoalsIcon },
  { id: 'wellbeing', label: 'Reflect', path: '/wellbeing', icon: WellbeingIcon },
  { id: 'planner', label: 'Today', path: '/planner', icon: PlannerIcon },
  { id: 'calendar', label: 'Календарь', path: '/calendar', icon: CalendarIcon },
  { id: 'profile', label: 'Профиль', path: '/profile', icon: ProfileIcon },
];

export default function BottomNavigation() {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm border-t border-border bg-background" >
      <div className="grid grid-cols-5 h-20 px-1">
        {navigationItems.map((item, idx) => {
          const isActive = location === item.path || (item.path === '/planner' && location === '/');
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`relative w-full h-full flex flex-col items-center justify-center transition-colors ${
                isActive ? 'text-accent' : 'text-muted-foreground hover:text-accent'
              }`}
            >
              <IconComponent className={`nav-icon ${isActive ? 'active' : ''}`} />
              <span className="text-xs font-light leading-tight">{item.label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-10 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
