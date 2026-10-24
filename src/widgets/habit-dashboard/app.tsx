import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Button from '@jetbrains/ring-ui-built/components/button/button';
import { Input, Size } from '@jetbrains/ring-ui-built/components/input/input';
import Dialog from '@jetbrains/ring-ui-built/components/dialog/dialog';
import LoaderInline from '@jetbrains/ring-ui-built/components/loader-inline/loader-inline';
import Select from '@jetbrains/ring-ui-built/components/select/select';
import { createApi } from '@/api';
import { createComponentLogger } from '@/common/utils/logger';
import { Habit, CheckIn, HabitStats } from '@/backend/storage/types';
import type { ApiRouter } from '@/api/api';

const logger = createComponentLogger('HabitDashboard');

type Props = {
  host: string;
};

const categoryOptions = [
  { key: 'health', label: 'Health' },
  { key: 'productivity', label: 'Productivity' },
  { key: 'learning', label: 'Learning' },
  { key: 'other', label: 'Other' },
];

const frequencyOptions = [
  { key: 'daily', label: 'Daily' },
  { key: '3x-week', label: '3x per week' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'custom', label: 'Custom' },
];

export const App: React.FC<Props> = ({ host }) => {
  const api = React.useMemo(() => createApi<ApiRouter>(host), [host]);

  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<Record<string, HabitStats>>({});
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'health' as const,
    frequency: 'daily' as const,
  });

  const loadHabits = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.global.habits.GET({});
      setHabits(res.habits || []);

      for (const habit of res.habits || []) {
        try {
          const statsRes = await api.global.checkins.habitId.stats.GET({
            habitId: habit.id,
          });
          setStats(prev => ({ ...prev, [habit.id]: statsRes.stats }));
        } catch (e) {
          logger.error(`Failed to load stats for ${habit.id}`, {}, e);
        }
      }
    } catch (e) {
      logger.error('Failed to load habits', {}, e);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const handleSaveHabit = useCallback(async () => {
    try {
      if (editingHabit) {
        await api.global.habits.id.PUT({
          id: editingHabit.id,
          ...formData,
        });
      } else {
        await api.global.habits.POST(formData);
      }
      setShowDialog(false);
      setEditingHabit(null);
      console.log("set form dialog")
      setFormData({
        name: '',
        description: '',
        category: 'health',
        frequency: 'daily',
      });
      await loadHabits();
    } catch (e) {
      logger.error('Failed to save habit', {}, e);
    }
  }, [api, editingHabit, formData, loadHabits]);

  const handleDeleteHabit = useCallback(async (habitId: string) => {
    if (!confirm('Delete this habit? This will remove all check-in history.')) {
      return;
    }
    try {
      await api.global.habits.id.DELETE({ id: habitId });
      await loadHabits();
    } catch (e) {
      logger.error('Failed to delete habit', {}, e);
    }
  }, [api, loadHabits]);

  const handleToggleCheckIn = useCallback(async (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0];
    const currentStat = stats[habit.id];
    const wasCompleted = currentStat?.completionRate > 0;

    try {
      await api.global.checkins.POST({
        habitId: habit.id,
        date: today,
        completed: !wasCompleted,
      });
      await loadHabits();
    } catch (e) {
      logger.error('Failed to log check-in', {}, e);
    }
  }, [api, stats, loadHabits]);

  const handleOpenDialog = useCallback((habit?: Habit) => {
    if (habit) {
      setEditingHabit(habit);
      setFormData({
        name: habit.name,
        description: habit.description,
        category: habit.category,
        frequency: habit.frequency,
      });
    } else {
      setEditingHabit(null);
      setFormData({
        name: '',
        description: '',
        category: 'health',
        frequency: 'daily',
      });
    }
    setShowDialog(true);
  }, []);

  return (
    <div className="habit-dashboard">
      <div className="dashboard-header">
        <h2>Habit Tracker</h2>
        <Button primary onClick={() => handleOpenDialog()}>
          + Add Habit
        </Button>
      </div>

      {loading && (
        <div className="loading">
          <LoaderInline />
        </div>
      )}

      {!loading && habits.length === 0 && (
        <div className="empty-state">
          <p>No habits yet. Create one to get started!</p>
        </div>
      )}

      {!loading && habits.length > 0 && (
        <div className="habits-grid">
          {habits.map(habit => {
            const habitStats = stats[habit.id] || {
              currentStreak: 0,
              longestStreak: 0,
              completionRate: 0,
            };
            const today = new Date().toISOString().split('T')[0];

            return (
              <div key={habit.id} className="habit-card">
                <div className="habit-header">
                  <div>
                    <h3>{habit.name}</h3>
                    <p className="habit-description">{habit.description}</p>
                    <div className="habit-meta">
                      <span className="badge">{habit.category}</span>
                      <span className="badge">{habit.frequency}</span>
                    </div>
                  </div>
                  <div className="habit-actions">
                    <Button onClick={() => handleOpenDialog(habit)}>Edit</Button>
                    <Button danger onClick={() => handleDeleteHabit(habit.id)}>Delete</Button>
                  </div>
                </div>

                <div className="habit-stats">
                  <div className="stat">
                    <span className="label">Current Streak</span>
                    <span className="value">{habitStats.currentStreak} days</span>
                  </div>
                  <div className="stat">
                    <span className="label">Best Streak</span>
                    <span className="value">{habitStats.longestStreak} days</span>
                  </div>
                  <div className="stat">
                    <span className="label">Completion (30d)</span>
                    <span className="value">{habitStats.completionRate}%</span>
                  </div>
                </div>

                <div className="habit-checkin">
                  <Button
                    primary
                    onClick={() => handleToggleCheckIn(habit)}
                    className="checkin-button"
                  >
                    ✓ Complete Today
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showDialog && createPortal(
        <Dialog
          isOpen={true}
          onClose={() => setShowDialog(false)}
          showCloseButton
          title={editingHabit ? 'Edit Habit' : 'New Habit'}
        >
          <div className="dialog-content">
            <Input
              label="Habit Name"
              value={formData.name}
              onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Morning meditation"
              size={Size.FULL}
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., 10 minutes of meditation"
              size={Size.FULL}
              multiline
            />
            <Select
              label="Category"
              selectedKey={formData.category}
              onSelect={(option: any) => setFormData({ ...formData, category: option.key })}
              options={categoryOptions}
            />
            <Select
              label="Frequency"
              selectedKey={formData.frequency}
              onSelect={(option: any) => setFormData({ ...formData, frequency: option.key })}
              options={frequencyOptions}
            />
            <div className="dialog-actions">
              <Button onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button primary onClick={handleSaveHabit}>
                {editingHabit ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </Dialog>,
        document.body
      )}
    </div>
  );
};
