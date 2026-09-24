"use client";

import { useEffect, useState } from "react";

type Submission = {
  id: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: number;

  user: {
    id: string;
    name: string;
    email: string;
  } | null;

  task: {
    id: string;
    title: string;
    reward: number;
    day: number;
  } | null;

  proofStorageId?: string;
};

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<
    Submission[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setError("");

        const response = await fetch(
          "/api/admin/submissions"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load submissions."
          );
        }

        setSubmissions(data.submissions || []);
      } catch (error) {
        console.error(
          "Submissions error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load submissions."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">
          Loading submissions...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      </div>
    );
  }
const reviewSubmission = async (
  submissionId: string,
  decision: "approved" | "rejected"
) => {
  try {
    const response = await fetch(
      "/api/admin/submissions/review",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          submissionId,
          decision,
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to review submission."
      );
    }

    setSubmissions((current) =>
      current.filter(
        (submission) =>
          submission.id !==
          submissionId
      )
    );
  } catch (error) {
    console.error(
      "Review error:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "Unable to review submission."
    );
  }
};
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Task Submissions
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Review user task submissions and
          approve or reject them.
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            No pending submissions.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                    User
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                    Task
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                    Day
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                    Reward
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                    Submitted
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>

            <tbody className="divide-y divide-gray-100">
  {submissions.map((submission) => (
    <tr
      key={submission.id}
      className="hover:bg-gray-50"
    >
      <td className="px-5 py-4">
        <p className="font-medium text-gray-900">
          {submission.user?.name ||
            "Unknown user"}
        </p>

        <p className="text-xs text-gray-500">
          {submission.user?.email ||
            "No email"}
        </p>
      </td>

      <td className="px-5 py-4">
        <p className="font-medium text-gray-900">
          {submission.task?.title ||
            "Unknown task"}
        </p>
      </td>

      <td className="px-5 py-4 text-sm text-gray-600">
        Day{" "}
        {submission.task?.day ?? "-"}
      </td>

      <td className="px-5 py-4 text-sm font-semibold text-green-700">
        ₦
        {(
          submission.task?.reward ?? 0
        ).toLocaleString()}
      </td>

      <td className="px-5 py-4 text-sm text-gray-600">
        {new Date(
          submission.submittedAt
        ).toLocaleString()}
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
          Pending
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex flex-wrap gap-2">
          {/* View Screenshot */}
          {submission.proofStorageId && (
            <button
              type="button"
              onClick={async () => {
                try {
                  const response =
                    await fetch(
                      `/api/admin/submissions/proof?storageId=${encodeURIComponent(
                        submission.proofStorageId!
                      )}`
                    );

                  const data =
                    await response.json();

                  if (!response.ok) {
                    throw new Error(
                      data.error ||
                        "Unable to load screenshot."
                    );
                  }

                  if (!data.url) {
                    throw new Error(
                      "Screenshot URL is unavailable."
                    );
                  }

                  window.open(
                    data.url,
                    "_blank",
                    "noopener,noreferrer"
                  );
                } catch (error) {
                  console.error(
                    "Proof loading error:",
                    error
                  );

                  alert(
                    error instanceof Error
                      ? error.message
                      : "Unable to load screenshot."
                  );
                }
              }}
              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              View Screenshot
            </button>
          )}

          {/* Approve */}
          <button
            type="button"
            onClick={() =>
              reviewSubmission(
                submission.id,
                "approved"
              )
            }
            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
          >
            Approve
          </button>

          {/* Reject */}
          <button
            type="button"
            onClick={() =>
              reviewSubmission(
                submission.id,
                "rejected"
              )
            }
            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}