
import React, { useState, useEffect, useCallback } from 'react';
import { Goal } from '../../types';
import { usePlanner } from '../../hooks/usePlanner';
import DraggableSlider from '../shared/DraggableSlider';
import Icon from '../shared/Icon';

interface GoalItemProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  isDraggable?: boolean;
}

const GoalItem: React.FC<GoalItemProps> = ({ goal, onEdit, isDraggable = false }) => {
  const { deleteGoal, updateGoal, state } = usePlanner();
  const [localProgress, setLocalProgress] = useState(goal.progress);

  // Update local progress if goal from props changes (e.g., parent recalculation)
  useEffect(() => {
    setLocalProgress(goal.progress);
  }, [goal.progress]);

  // Debounced update to the global state
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateGoal = useCallback(
    (progressValue: number) => {
      const timeoutId = setTimeout(() => {
        updateGoal({ ...goal, progress: progressValue });
      }, 300);
      return () => clearTimeout(timeoutId);
    },
    [goal, updateGoal]
  );

  useEffect(() => {
    if (localProgress !== goal.progress) {
      const cleanup = debouncedUpdateGoal(localProgress);
      return cleanup;
    }
  }, [localProgress, goal.progress, debouncedUpdateGoal]);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete goal: "${goal.title}"?`)) {
      deleteGoal(goal.id);
    }
  };

  const getChapterTitle = () => {
    if (!goal.classChapterId) return null;
    for (const cls of state.classes) {
      for (const sub of cls.subjects) {
        const chapter = sub.chapters.find(ch => ch.id === goal.classChapterId);
        if (chapter) {
          return `${cls.title} > ${sub.title} > ${chapter.title}`;
        }
      }
    }
    return null;
  };
  
  const chapterTitle = getChapterTitle();

  return (
    <div 
      className="bg-white dark:bg-gray-800/50 p-4 rounded-lg shadow-sm border border-transparent hover:border-blue-500 transition-all"
      draggable={isDraggable}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-bold text-lg">{goal.title}</h3>
          {goal.description && <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{goal.description}</p>}
          {chapterTitle && <p className="text-xs mt-2 text-purple-500 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-2 py-1 rounded-full inline-block">{chapterTitle}</p>}
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
          {goal.resourceUrl && (
            <a 
              href={goal.resourceUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
            >
              <Icon name="play-circle" className="h-4 w-4" />
              <span>Start</span>
            </a>
          )}
          <button onClick={() => onEdit(goal)} className="p-1.5 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <Icon name="edit" className="h-4 w-4" />
          </button>
          <button onClick={handleDelete} className="p-1.5 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <Icon name="delete" className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-4">
        <DraggableSlider value={localProgress} onChange={setLocalProgress} />
      </div>
    </div>
  );
};

export default GoalItem;
