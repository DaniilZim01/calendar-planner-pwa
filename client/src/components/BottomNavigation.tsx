import { useLocation } from 'wouter';

// Abstract minimalistic pastel icons as React components
const GoalsIcon = ({ className }: { className?: string }) => (
  <div className="relative">
    <div 
      className={`${className} bg-current opacity-60`}
      style={{
        borderRadius: '20% 60% 40% 80%',
        transform: 'rotate(10deg)',
      }}
    />
    <div 
      className={`${className} bg-current opacity-40 absolute top-0.5 left-0.5`}
      style={{
        borderRadius: '60% 20% 80% 40%',
        transform: 'rotate(-15deg) scale(0.7)',
      }}
    />
  </div>
);

const WellbeingIcon = ({ className }: { className?: string }) => (
  <div className="relative">
    <div 
      className={`${className} bg-current opacity-50`}
      style={{
        borderRadius: '50% 50% 20% 80%',
        transform: 'rotate(25deg)',
      }}
    />
    <div 
      className={`${className} bg-current opacity-30 absolute top-1 left-1`}
      style={{
        borderRadius: '80% 20% 50% 50%',
        transform: 'rotate(-30deg) scale(0.6)',
      }}
    />
  </div>
);

const PlannerIcon = ({ className }: { className?: string }) => (
  <div className="relative">
    <div 
      className={`${className} bg-current opacity-60`}
      style={{
        borderRadius: '30% 70% 30% 70%',
        transform: 'rotate(45deg)',
      }}
    />
  </div>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <div className="relative">
    <div 
      className={`${className} bg-current opacity-50`}
      style={{
        borderRadius: '40% 60% 60% 40%',
        transform: 'rotate(-20deg)',
      }}
    />
    <div 
      className={`${className} bg-current opacity-30 absolute top-0.5 left-0.5`}
      style={{
        borderRadius: '60% 40% 40% 60%',
        transform: 'rotate(20deg) scale(0.8)',
      }}
    />
  </div>
);

const ProfileIcon = ({ className }: { className?: string }) => (
  <div className="relative">
    <div 
      className={`${className} bg-current opacity-50`}
      style={{
        borderRadius: '50% 50% 50% 20%',
        transform: 'rotate(15deg)',
      }}
    />
  </div>
);

const navigationItems = [
  { id: 'goals', label: 'Цели', path: '/', icon: GoalsIcon },
  { id: 'wellbeing', label: 'Reflect', path: '/wellbeing', icon: WellbeingIcon },
  { id: 'planner', label: 'Today', path: '/planner', icon: PlannerIcon },
  { id: 'calendar', label: 'Календарь', path: '/calendar', icon: CalendarIcon },
  { id: 'profile', label: 'Профиль', path: '/profile', icon: ProfileIcon },
];

export default function BottomNavigation() {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm backdrop-blur-md border-t border-border" 
         style={{ background: 'rgba(217, 209, 196, 0.8)' }}>
      <div className="flex justify-around py-3">
        {navigationItems.map((item) => {
          const isActive = location === item.path;
          const IconComponent = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-2 px-3 touch-target transition-colors ${
                isActive ? 'text-accent' : 'text-muted-foreground hover:text-accent'
              }`}
            >
              <IconComponent className={`nav-icon ${isActive ? 'active' : ''}`} />
              <span className="text-xs font-light">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
