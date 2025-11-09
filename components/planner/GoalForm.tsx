import React, { useState, useEffect } from 'react';
import { Goal, GoalType } from '../../types';
import { usePlanner } from '../../hooks/usePlanner';
import Modal from '../shared/Modal';

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  existingGoal?: Goal | null;
  goalType: GoalType;
  periodId: string;
}

const GoalForm: React.FC<GoalFormProps> = ({ isOpen, onClose, existingGoal, goalType, periodId }) => {
  const { addGoal, updateGoal, state, getLinkableParentGoals, linkGoals, unlinkGoals } = usePlanner();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [classChapterId, setClassChapterId] = useState<string | undefined>(undefined);
  
  const linkableParents = existingGoal ? getLinkableParentGoals(existingGoal) : [];

  useEffect(() => {
    if (existingGoal) {
      setTitle(existingGoal.title);
      setDescription(existingGoal.description);
      setResourceUrl(existingGoal.resourceUrl || '');
      setClassChapterId(existingGoal.classChapterId);
    } else {
      setTitle('');
      setDescription('');
      setResourceUrl('');
      setClassChapterId(undefined);
    }
  }, [existingGoal, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Title is required.');
      return;
    }
    
    const goalData = {
      title,
      description,
      resourceUrl,
      classChapterId,
      type: goalType,
      periodId,
    };

    if (existingGoal) {
      updateGoal({ ...existingGoal, ...goalData });
    } else {
      addGoal(goalData);
    }
    onClose();
  };

  const handleParentLinkChange = (parentId: string, isLinked: boolean) => {
    if (!existingGoal) return;
    if (isLinked) {
      linkGoals(existingGoal.id, parentId);
    } else {
      unlinkGoals(existingGoal.id, parentId);
    }
  };

  const inputClasses = "mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingGoal ? 'Edit Goal' : 'Add New Goal'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
          <textarea
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            rows={2}
            className={inputClasses}
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="resourceUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Resource URL</label>
          <input
            type="url"
            id="resourceUrl"
            value={resourceUrl}
            onChange={(e) => setResourceUrl(e.target.value)}
            className={inputClasses}
            placeholder="https://example.com"
          />
        </div>
        <div>
          <label htmlFor="classChapterId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Link to Academic Chapter</label>
          <select
            id="classChapterId"
            value={classChapterId || ''}
            onChange={(e) => setClassChapterId(e.target.value || undefined)}
            className={inputClasses}
          >
            <option value="">None</option>
            {state.classes.map(cls => (
              <optgroup label={cls.title} key={cls.id}>
                {cls.subjects.map(sub => (
                  <optgroup label={`-- ${sub.title}`} key={sub.id}>
                    {sub.chapters.map(chap => (
                      <option value={chap.id} key={chap.id}>
                        {chap.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        {existingGoal && linkableParents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Link to Parent Goal</h4>
            <div className="mt-2 space-y-2">
              {linkableParents.map(parent => (
                <div key={parent.id} className="flex items-center">
                  <input
                    id={`link-${parent.id}`}
                    type="checkbox"
                    checked={existingGoal.linkedGoalIds.includes(parent.id)}
                    onChange={(e) => handleParentLinkChange(parent.id, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor={`link-${parent.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
                    {parent.title}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-end space-x-2 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Save</button>
        </div>
      </form>
    </Modal>
  );
};

export default GoalForm;