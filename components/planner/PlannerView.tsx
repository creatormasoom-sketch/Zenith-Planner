
import React, { useState, useMemo } from 'react';
import { usePlanner } from '../../hooks/usePlanner';
import { getPeriodId } from '../../utils/dateUtils';
import { GoalType, Goal } from '../../types';
import CalendarControls from './CalendarControls';
import GoalList from './GoalList';
import GoalForm from './GoalForm';
import Icon from '../shared/Icon';

const PlannerView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<GoalType>('daily');
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const { state } = usePlanner();

  const periodId = useMemo(() => getPeriodId(currentDate, viewType), [currentDate, viewType]);

  const filteredGoals = useMemo(() => {
    return state.goals
      .filter(goal => goal.type === viewType && goal.periodId === periodId)
      .sort((a, b) => a.order - b.order);
  }, [state.goals, viewType, periodId]);

  const handleAddGoal = () => {
    setEditingGoal(null);
    setIsGoalFormOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsGoalFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsGoalFormOpen(false);
    setEditingGoal(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <CalendarControls 
        currentDate={currentDate} 
        setCurrentDate={setCurrentDate} 
        viewType={viewType} 
        setViewType={setViewType} 
      />
      <div className="mt-6">
        <GoalList goals={filteredGoals} onEditGoal={handleEditGoal} />
      </div>
      <button
        onClick={handleAddGoal}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
        aria-label="Add new goal"
      >
        <Icon name="plus" className="h-6 w-6" />
      </button>
      <GoalForm
        isOpen={isGoalFormOpen}
        onClose={handleCloseForm}
        existingGoal={editingGoal}
        goalType={viewType}
        periodId={periodId}
      />
    </div>
  );
};

export default PlannerView;
