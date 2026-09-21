"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import TaskSubmissionForm from "@/app/components/tasks/TaskSubmissionForm";

export default function TaskDetailsPage() {
  const params = useParams();

  const taskId = params.taskId as string;

  const task = useQuery(
    api.tasks.getById,
    {
      taskId,
    }
  );

  if (task === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading task...
        </p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Task not found
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          This task may no longer be available.
        </p>

        <Link
          href="/dashboard/tasks"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
        >
          <ArrowLeft size={18} />
          Back to tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/dashboard/tasks"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={17} />
        Back to tasks
      </Link>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold uppercase text-green-700">
              Day {task.day}
            </span>

            <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">
              {task.title}
            </h1>

            <p className="mt-2 text-gray-500">
              {task.description}
            </p>
          </div>

          <div className="shrink-0 rounded-2xl bg-green-50 px-4 py-3 text-center">
            <p className="text-xs font-medium text-green-700">
              Reward
            </p>

            <p className="text-xl font-bold text-green-700">
              ₦{task.reward.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="py-6">
          <h2 className="text-lg font-semibold text-gray-900">
            How to complete this task
          </h2>

          <div className="mt-4 rounded-2xl bg-gray-50 p-5">
            <p className="whitespace-pre-line text-sm leading-7 text-gray-600">
              {task.instructions}
            </p>
          </div>
        </div>

        {task.targetUrl && (
          <div className="border-t border-gray-100 pt-6">
            <a
              href={task.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 sm:w-auto"
            >
              Open Task
              <ExternalLink size={17} />
            </a>
          </div>
        )}

        {task.requiresProof && (
          <div className="mt-6 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <div>
              <p className="text-sm font-semibold text-blue-900">
                Proof required
              </p>

              <p className="mt-1 text-sm leading-6 text-blue-700">
                After completing this task, you will need
                to submit proof for verification.
              </p>
            </div>
          </div>
        )}
      </div>

 <TaskSubmissionForm
        taskId={task._id}
        requiresProof={task.requiresProof}
      />

    </div>
  );
}