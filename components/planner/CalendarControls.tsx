
import React from 'react';
import { GoalType } from '../../types';
import Icon from '../shared/Icon';
import { getWeekNumber } from '../../utils/dateUtils';

interface CalendarControlsProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  viewType: GoalType;
  setViewType: (viewType: GoalType) => void;
}

const CalendarControls: React.FC<CalendarControlsProps> = ({ currentDate, setCurrentDate, viewType, setViewType }) => {

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'daily') newDate.setDate(newDate.getDate() - 1);
    else if (viewType === 'weekly') newDate.setDate(newDate.getDate() - 7);
    else if (viewType === 'monthly') newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'daily') newDate.setDate(newDate.getDate() + 1);
    else if (viewType === 'weekly') newDate.setDate(newDate.getDate() + 7);
    else if (viewType === 'monthly') newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDisplayString = () => {
    if (viewType === 'daily') {
      return currentDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    }
    if (viewType === 'weekly') {
      const weekNum = getWeekNumber(currentDate);
      return `Week ${weekNum}, ${currentDate.getFullYear()}`;
    }
    if (viewType === 'monthly') {
      return currentDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
    }
    return '';
  };
  
  const viewTypes: GoalType[] = ['daily', 'weekly', 'monthly'];

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <button onClick={handlePrev} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <Icon name="chevron-left" />
        </button>
        <button onClick={handleToday} className="px-4 py-2 text-sm font-semibold rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
          Today
        </button>
        <button onClick={handleNext} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <Icon name="chevron-right" />
        </button>
      </div>
      <div className="text-lg font-semibold text-center">
        {getDisplayString()}
      </div>
      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full p-1">
        {viewTypes.map(type => (
          <button
            key={type}
            onClick={() => setViewType(type)}
            className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${viewType === type ? 'bg-white dark:bg-gray-800 shadow text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalendarControls;
