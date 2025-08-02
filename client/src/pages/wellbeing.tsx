import { useState } from 'react';
import { ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import WaterChart from '../components/WaterChart';
import SleepChart from '../components/SleepChart';
import { useAppData } from '../hooks/useLocalStorage';
import { WellbeingData, ChartDataPoint } from '../types';
import { getCurrentDateString, getWeekDays } from '../utils/dateUtils';

export default function WellbeingPage() {
  const { wellbeingData, setWellbeingData } = useAppData();
  const [selectedDate, setSelectedDate] = useState(getCurrentDateString());
  const [mood, setMood] = useState('');
  const [activity, setActivity] = useState('');

  const getCurrentData = () => {
    return wellbeingData.find((data: WellbeingData) => data.date === selectedDate) || {
      waterIntake: 0,
      sleepHours: 0,
      mood: '',
      activity: '',
    };
  };

  const currentData = getCurrentData();

  const generateWeekData = (type: 'water' | 'sleep'): ChartDataPoint[] => {
    const weekDays = getWeekDays();
    return weekDays.map((day, index) => ({
      day,
      value: type === 'water' 
        ? Math.random() * 3 + 0.5 // Демо данные для воды
        : Math.random() * 3 + 6.5, // Демо данные для сна
    }));
  };

  const waterChartData = generateWeekData('water');
  const sleepChartData = generateWeekData('sleep');

  const updateWellbeingData = (updates: Partial<WellbeingData>) => {
    setWellbeingData((prevData: WellbeingData[]) => {
      const existingIndex = prevData.findIndex((data: WellbeingData) => data.date === selectedDate);
      const updatedData = {
        id: Math.random().toString(36),
        date: selectedDate,
        waterIntake: currentData.waterIntake,
        sleepHours: currentData.sleepHours,
        mood: currentData.mood,
        activity: currentData.activity,
        createdAt: new Date().toISOString(),
        ...updates,
      };

      if (existingIndex >= 0) {
        const newData = [...prevData];
        newData[existingIndex] = { ...newData[existingIndex], ...updatedData };
        return newData;
      } else {
        return [...prevData, updatedData];
      }
    });
  };

  // Календарь для выбора дня
  const renderMiniCalendar = () => {
    const today = new Date();
    const currentWeek = [];
    
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      currentWeek.push(date);
    }

    return (
      <div className="card-soft mb-6">
        <div className="flex justify-center gap-4 mb-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium text-foreground">Январь 2025</span>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-center gap-2">
          {currentWeek.map((date, index) => {
            const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
            const isToday = index === 3;
            
            return (
              <div key={index} className="text-center p-2">
                <div className="text-xs text-muted-foreground mb-1">
                  {dayNames[date.getDay()]}
                </div>
                <div className={`w-8 h-8 flex items-center justify-center text-sm rounded-full ${
                  isToday ? 'bg-accent text-white' : ''
                }`}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="app-container animate-fade-in">
      <div className="screen-container">
        <div className="mb-6">
          <h1 className="text-2xl font-thin text-foreground mb-2">Reflect</h1>
          <p className="text-sm text-muted-foreground font-light">
            Отслеживайте свое самочувствие
          </p>
        </div>

        {renderMiniCalendar()}

        {/* Трекер воды */}
        <div className="card-element p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-light text-foreground tracking-wide">ВОДА</h3>
            <Button variant="ghost" size="sm" className="text-accent p-1">
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {currentData.waterIntake.toFixed(1)} литра
          </div>
          <div className="text-xs text-muted-foreground mb-4">
            Сколько воды вы выпили на этой неделе?
          </div>
          
          <WaterChart data={waterChartData} />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            {getWeekDays().map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </div>

        {/* Трекер сна */}
        <div className="card-element p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-light text-foreground tracking-wide">СОН</h3>
            <Button variant="ghost" size="sm" className="text-accent p-1">
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {currentData.sleepHours.toFixed(1)} часов
          </div>
          <div className="text-xs text-muted-foreground mb-4">
            Сколько часов вы спали на этой неделе?
          </div>
          
          <SleepChart data={sleepChartData} />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            {getWeekDays().map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </div>

        {/* Настроение и активность */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card-element p-4">
            <h3 className="font-medium text-foreground mb-2">Настроение</h3>
            <Input
              type="text"
              placeholder="Как дела?"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              onBlur={() => updateWellbeingData({ mood })}
              className="w-full bg-white rounded-lg text-sm border-0"
            />
          </div>
          <div className="card-element p-4">
            <h3 className="font-medium text-foreground mb-2">Активность</h3>
            <Input
              type="text"
              placeholder="Что делали?"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              onBlur={() => updateWellbeingData({ activity })}
              className="w-full bg-white rounded-lg text-sm border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
