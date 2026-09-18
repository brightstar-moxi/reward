// "use client";

// import { useEffect, useState } from "react";
// import { useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import {
//   CalendarDays,
//   CheckCircle2,
//   Clock,
//   ArrowRight,
// } from "lucide-react";

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: "user" | "admin";
//   status: "active" | "suspended";
//   referralCode: string;
// }

// export default function TasksPage() {
//   const [user, setUser] = useState<User | null>(null);
//   const [loadingUser, setLoadingUser] = useState(true);

//   // For now, every new user starts at Day 1.
//   // We will make this dynamic after we build progress tracking.
//   const currentDay = 1;

//   const activity = useQuery(
//     api.dailyActivities.getByDay,
//     {
//       day: currentDay,
//     }
//   );
// console.log("Day 1 activity:", activity);



// const allActivities = useQuery(
//   api.dailyActivities.getAll
// );

// console.log(
//   "ALL ACTIVITIES:",
//   allActivities
// );

//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         const response = await fetch("/api/auth/me", {
//           credentials: "include",
//           cache: "no-store",
//         });

//         if (!response.ok) {
//           return;
//         }

//         const data = await response.json();

//         setUser(data.user);
//       } catch (error) {
//         console.error(
//           "Failed to load user:",
//           error
//         );
//       } finally {
//         setLoadingUser(false);
//       }
//     };

//     loadUser();
//   }, []);

//   if (loadingUser || activity === undefined) {
//     return (
//       <div className="flex min-h-[60vh] items-center justify-center">
//         <p className="text-sm text-gray-500">
//           Loading today's activity...
//         </p>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
//         <p className="text-sm text-gray-500">
//           Unable to load your account.
//         </p>
//       </div>
//     );
//   }

//   if (!activity) {
//     return (
//       <div className="mx-auto max-w-3xl">
//         <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
//           <CalendarDays
//             size={40}
//             className="mx-auto text-gray-300"
//           />

//           <h1 className="mt-4 text-lg font-semibold text-gray-900">
//             Day {currentDay} is not available yet
//           </h1>

//           <p className="mt-2 text-sm text-gray-500">
//             Please check again later.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="mx-auto max-w-4xl space-y-6">
//       {/* Header */}
//       <div>
//         <p className="text-sm font-medium text-green-600">
//           100-Day Participation
//         </p>

//         <h1 className="mt-1 text-2xl font-bold text-gray-900">
//           Today's Activity
//         </h1>

//         <p className="mt-2 text-sm text-gray-500">
//           Complete today's activity to continue your
//           participation.
//         </p>
//       </div>

//       {/* Progress */}
//       <section className="rounded-2xl border border-gray-200 bg-white p-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-sm text-gray-500">
//               Current day
//             </p>

//             <p className="mt-1 text-3xl font-bold text-gray-900">
//               Day {currentDay}
//             </p>
//           </div>

//           <div className="rounded-xl bg-green-50 p-3 text-green-600">
//             <CalendarDays size={24} />
//           </div>
//         </div>

//         <div className="mt-6">
//           <div className="mb-2 flex justify-between text-xs">
//             <span className="text-gray-500">
//               Progress
//             </span>

//             <span className="font-medium text-gray-700">
//               {currentDay}/100
//             </span>
//           </div>

//           <div className="h-2 overflow-hidden rounded-full bg-gray-100">
//             <div
//               className="h-full rounded-full bg-green-600"
//               style={{
//                 width: `${currentDay}%`,
//               }}
//             />
//           </div>
//         </div>
//       </section>

//       {/* Activity */}
//       <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
//         <div className="flex items-start gap-4">
//           <div className="rounded-xl bg-green-50 p-3 text-green-600">
//             <CheckCircle2 size={24} />
//           </div>

//           <div className="flex-1">
//             <span className="text-xs font-semibold uppercase tracking-wide text-green-600">
//               Day {activity.day}
//             </span>

//             <h2 className="mt-2 text-xl font-bold text-gray-900">
//               {activity.title}
//             </h2>

//             <p className="mt-3 text-sm leading-6 text-gray-600">
//               {activity.description}
//             </p>
//           </div>
//         </div>

//         <div className="mt-8 flex items-center gap-3 rounded-xl bg-gray-50 p-4">
//           <Clock
//             size={18}
//             className="text-gray-400"
//           />

//           <p className="text-sm text-gray-500">
//             Complete today's activity before the daily
//             participation period ends.
//           </p>
//         </div>

//         <button
//           type="button"
//           className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-600 font-semibold text-white transition hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/20"
//         >
//           Start Activity
//           <ArrowRight size={18} />
//         </button>
//       </section>
//     </div>
//   );
// }



"use client";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function TasksPage() {
  const currentDay = 1;

  const activity = useQuery(
    api.dailyActivities.getByDay,
    {
      day: currentDay,
    }
  );

  const tasks = useQuery(
    api.tasks.getByDay,
    {
      day: currentDay,
    }
  );

  if (activity === undefined || tasks === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading today's activities...
        </p>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Day {currentDay} is not available yet
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Please check again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-green-600">
          Day {currentDay} of 100
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          {activity.title}
        </h1>

        <p className="mt-2 max-w-2xl text-gray-500">
          {activity.description}
        </p>
      </div>

      {/* Progress */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Today's tasks
          </span>

          <span className="text-sm text-gray-500">
            0 / {tasks.length} completed
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-green-600 transition-all"
            style={{ width: "0%" }}
          />
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Available Tasks
        </h2>

        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">
              No tasks are available for Day {currentDay} yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-green-200 hover:shadow-sm"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {task.title}
                      </h3>

                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        ₦{task.reward.toLocaleString()}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      {task.description}
                    </p>

                    <p className="mt-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                      {task.type.replaceAll("_", " ")}
                    </p>
                  </div>

                  <Link
  href={`/dashboard/tasks/${task._id}`}
  className="shrink-0 rounded-xl bg-green-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-green-700"
>
  Start Task
</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}