import { useState } from 'react';
import { Severity } from '../types';
import { MOCK_TASKS } from '../data/mockTasks';
import Header from '../components/Header';
import { useAuth } from '../auth/AuthContext';
import TaskListPanel from '../components/TaskListPanel';
import CalendarSidebar from '../components/CalendarSidebar';
import ActionCenterPanel from '../components/ActionCenterPanel';

export default function DashboardPage() {
  const { signOut } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isActionCenterOpen, setIsActionCenterOpen] = useState(false);
  const [activeSeverityFilter, setActiveSeverityFilter] = useState<Severity | null>(null);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date === '' || date === selectedDate ? null : date);
  };

  const handleMonthChange = () => {
    setSelectedDate(null);
  };

  const criticalTasks = MOCK_TASKS.filter(t => t.severity === 'Critical');

  return (
    <div className="flex flex-col h-full">
      <Header
        onActionCenterClick={() => setIsActionCenterOpen(true)}
        onLogout={signOut}
      />

      <div className="flex flex-1 overflow-hidden">
        <TaskListPanel
          tasks={MOCK_TASKS}
          activeSeverityFilter={activeSeverityFilter}
          onFilterChange={setActiveSeverityFilter}
        />
        <div className="pt-4 pr-4 flex-shrink-0">
          <CalendarSidebar
            tasks={MOCK_TASKS}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onMonthChange={handleMonthChange}
          />
        </div>
      </div>

      <ActionCenterPanel
        isOpen={isActionCenterOpen}
        criticalTasks={criticalTasks}
        onClose={() => setIsActionCenterOpen(false)}
      />
    </div>
  );
}
