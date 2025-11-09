import React, { useState } from 'react';
import { Goal } from '../../types';
import GoalItem from './GoalItem';
import { usePlanner } from '../../hooks/usePlanner';

interface GoalListProps {
  goals: Goal[];
  onEditGoal: (goal: Goal) => void;
}

const GoalList: React.FC<GoalListProps> = ({ goals, onEditGoal }) => {
  const { updateGoalOrder } = usePlanner();
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, goalId: string) => {
    setDraggedItemId(goalId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetGoalId: string) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetGoalId) {
      setDraggedItemId(null);
      return;
    }

    const draggedIndex = goals.findIndex(g => g.id === draggedItemId);
    const targetIndex = goals.findIndex(g => g.id === targetGoalId);

    const newGoals = [...goals];
    const [draggedItem] = newGoals.splice(draggedIndex, 1);

    // FIX: This check ensures that a valid goal is being moved,
    // which resolves a TypeScript error where `goal` could be inferred as undefined.
    if (!draggedItem) {
        setDraggedItemId(null);
        return;
    }
    
    newGoals.splice(targetIndex, 0, draggedItem);
    
    // FIX: The `newGoals` array, created using a spread operator, correctly maintains
    // the `Goal[]` type. Passing it directly to `updateGoalOrder` resolves the
    // type error. The redundant spread `[...newGoals]` has been removed.
    updateGoalOrder(newGoals);
    setDraggedItemId(null);
  };
  
  if (goals.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">No goals for this period.</h3>
        <p className="text-sm text-gray-400 dark:text-gray-500">Ready to plan your success? Add a new goal to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {goals.map(goal => (
        <div 
          key={goal.id} 
          onDragStart={(e) => handleDragStart(e, goal.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, goal.id)}
        >
          <GoalItem goal={goal} onEdit={onEditGoal} isDraggable={true} />
        </div>
      ))}
    </div>
  );
};

export default GoalList;