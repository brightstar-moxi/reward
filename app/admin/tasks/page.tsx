
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type TaskType =
  | "daily_login"
  | "watch_video"
  | "visit_website"
  | "youtube_subscribe"
  | "social_like"
  | "social_comment"
  | "follow"
  | "custom";

type Task = {
  _id: string;
  day: number;
  title: string;
  description: string;
  type: TaskType;
  reward: number;
  targetUrl?: string;
  requiresProof: boolean;
  instructions: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
};

type TaskForm = {
  day: string;
  title: string;
  description: string;
  type: TaskType;
  reward: string;
  targetUrl: string;
  requiresProof: boolean;
  instructions: string;
};

type TasksResponse = {
  success: boolean;
  tasks: Task[];
  totalJourneyDays: number;
  message?: string;
};

const initialForm: TaskForm = {
  day: "1",
  title: "",
  description: "",
  type: "custom",
  reward: "100",
  targetUrl: "",
  requiresProof: false,
  instructions: "",
};

const taskTypes: { value: TaskType; label: string }[] = [
  { value: "daily_login", label: "Daily Login" },
  { value: "watch_video", label: "Watch Video" },
  { value: "visit_website", label: "Visit Website" },
  { value: "youtube_subscribe", label: "YouTube Subscribe" },
  { value: "social_like", label: "Social Media Like" },
  { value: "social_comment", label: "Social Media Comment" },
  { value: "follow", label: "Follow Account" },
  { value: "custom", label: "Custom Task" },
];

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalJourneyDays, setTotalJourneyDays] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dayFilter, setDayFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/admin/tasks", {
        cache: "no-store",
      });

      const data: TasksResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load tasks.");
      }

      setTasks(data.tasks || []);
      setTotalJourneyDays(data.totalJourneyDays);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to load tasks."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const dayOptions = useMemo(
    () =>
      Array.from(
        { length: totalJourneyDays },
        (_, index) => index + 1
      ),
    [totalJourneyDays]
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchTerm = search.toLowerCase();

      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm) ||
        task.type.toLowerCase().includes(searchTerm);

      const matchesDay =
        dayFilter === "all" || task.day === Number(dayFilter);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && task.isActive) ||
        (statusFilter === "inactive" && !task.isActive);

      return matchesSearch && matchesDay && matchesStatus;
    });
  }, [tasks, search, dayFilter, statusFilter]);

  const activeTasks = tasks.filter((task) => task.isActive).length;
  const inactiveTasks = tasks.filter((task) => !task.isActive).length;

  const totalRewards = tasks
    .filter((task) => task.isActive)
    .reduce((total, task) => total + task.reward, 0);

  const openCreateForm = () => {
    setEditingTask(null);
    setForm({
      ...initialForm,
      day: "1",
    });
    setShowForm(true);
  };

  const openEditForm = (task: Task) => {
    setEditingTask(task);

    setForm({
      day: String(task.day),
      title: task.title,
      description: task.description,
      type: task.type,
      reward: String(task.reward),
      targetUrl: task.targetUrl || "",
      requiresProof: task.requiresProof,
      instructions: task.instructions,
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingTask(null);
    setForm(initialForm);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const selectedDay = Number(form.day);

    if (
      !Number.isInteger(selectedDay) ||
      selectedDay < 1 ||
      selectedDay > totalJourneyDays
    ) {
      alert(`Task day must be between 1 and ${totalJourneyDays}.`);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        day: selectedDay,
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        reward: Number(form.reward),
        targetUrl: form.targetUrl.trim(),
        requiresProof: form.requiresProof,
        instructions: form.instructions.trim(),
      };

      const response = await fetch("/api/admin/tasks", {
        method: editingTask ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingTask
            ? { ...payload, taskId: editingTask._id }
            : payload
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save task.");
      }

      alert(
        data.message ||
          (editingTask
            ? "Task updated successfully."
            : "Task created successfully.")
      );

      closeForm();
      await loadTasks();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Unable to save task."
      );
    } finally {
      setSaving(false);
    }
  };

  const updateTaskStatus = async (task: Task) => {
    const nextStatus = !task.isActive;

    const confirmed = window.confirm(
      nextStatus
        ? "Are you sure you want to activate this task?"
        : "Are you sure you want to deactivate this task?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(task._id);

      const response = await fetch("/api/admin/tasks", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId: task._id,
          isActive: nextStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update task.");
      }

      await loadTasks();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Unable to update task."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const deleteTask = async (task: Task) => {
    const confirmed = window.confirm(
      `Delete "${task.title}"? This task cannot be recovered.`
    );

    if (!confirmed) return;

    try {
      setProcessingId(task._id);

      const response = await fetch("/api/admin/tasks", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskId: task._id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete task.");
      }

      alert(data.message || "Task deleted successfully.");
      await loadTasks();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Unable to delete task."
      );
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
          <button
            onClick={loadTasks}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Task Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage tasks across all {totalJourneyDays} participation days.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Create New Task
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Tasks" value={tasks.length} />
        <SummaryCard label="Active Tasks" value={activeTasks} />
        <SummaryCard label="Inactive Tasks" value={inactiveTasks} />
        <SummaryCard
          label="Active Task Rewards"
          value={`₦${totalRewards.toLocaleString()}`}
        />
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 lg:flex-row">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search task title, description or type..."
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 lg:flex-1"
        />

        <select
          value={dayFilter}
          onChange={(event) => setDayFilter(event.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
        >
          <option value="all">All Days</option>
          {dayOptions.map((day) => (
            <option key={day} value={day}>
              Day {day}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Tasks table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Platform Tasks</h2>
          <span className="text-xs text-gray-500">
            {filteredTasks.length} tasks found
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No tasks found. Create your first task to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {[
                    "Task",
                    "Day",
                    "Type",
                    "Reward",
                    "Proof",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase text-gray-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-gray-50">
                    <td className="min-w-56 px-5 py-4">
                      <p className="font-medium text-gray-900">
                        {task.title}
                      </p>
                      <p className="mt-1 max-w-xs text-xs text-gray-500">
                        {task.description}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                      Day {task.day}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                      {taskTypes.find((item) => item.value === task.type)?.label ||
                        task.type}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-gray-900">
                      ₦{task.reward.toLocaleString()}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {task.requiresProof ? "Required" : "Not required"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          task.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {task.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditForm(task)}
                          className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          disabled={processingId === task._id}
                          onClick={() => updateTaskStatus(task)}
                          className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50 ${
                            task.isActive
                              ? "bg-orange-50 text-orange-700 hover:bg-orange-100"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                        >
                          {processingId === task._id
                            ? "Processing..."
                            : task.isActive
                              ? "Deactivate"
                              : "Activate"}
                        </button>

                        <button
                          disabled={processingId === task._id}
                          onClick={() => deleteTask(task)}
                          className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit task form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingTask ? "Edit Task" : "Create New Task"}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Configure the task and its individual reward.
                </p>
              </div>

              <button
                onClick={closeForm}
                disabled={saving}
                className="text-2xl text-gray-400 hover:text-gray-700"
                aria-label="Close form"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Participation Day
                  </label>
                  <select
                    required
                    value={form.day}
                    onChange={(event) =>
                      setForm({ ...form, day: event.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    {dayOptions.map((day) => (
                      <option key={day} value={day}>
                        Day {day}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Available days: 1–{totalJourneyDays}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Task Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        type: event.target.value as TaskType,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    {taskTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Task Title
                </label>
                <input
                  required
                  maxLength={100}
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="e.g. Subscribe to our YouTube channel"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Task Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Explain what the user needs to do."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Reward (₦)
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={form.reward}
                    onChange={(event) =>
                      setForm({ ...form, reward: event.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Target URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={form.targetUrl}
                    onChange={(event) =>
                      setForm({ ...form, targetUrl: event.target.value })
                    }
                    placeholder="https://example.com"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Task Instructions
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.instructions}
                  onChange={(event) =>
                    setForm({ ...form, instructions: event.target.value })
                  }
                  placeholder="Give users clear instructions for completing this task."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4">
                <input
                  type="checkbox"
                  checked={form.requiresProof}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      requiresProof: event.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-blue-600"
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-800">
                    Require task proof
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    Users must submit evidence, such as a screenshot, for review.
                  </span>
                </span>
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingTask
                      ? "Save Changes"
                      : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}
