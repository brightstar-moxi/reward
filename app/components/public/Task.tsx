import {
  BookOpen,
  ExternalLink,
  PlayCircle,
  Share2,
} from "lucide-react";

const tasks = [
  {
    icon: BookOpen,
    title: "Read content",
    description:
      "Read useful articles and information published on the platform.",
  },
  {
    icon: PlayCircle,
    title: "Watch content",
    description:
      "Complete eligible promotional or informational video activities.",
  },
  {
    icon: ExternalLink,
    title: "Visit websites",
    description:
      "Visit approved promotional websites and complete the required activity.",
  },
  {
    icon: Share2,
    title: "Social activities",
    description:
      "Complete eligible social-media activities when they are available.",
  },
];

export default function Tasks() {
  return (
    <section id="tasks" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-semibold text-green-600">ACTIVITIES</p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            Different ways to participate
          </h2>

          <p className="mt-4 leading-7 text-gray-600">
            Available activities can change over time. Your dashboard will
            always show the current requirements before you start a task.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tasks.map((task) => {
            const Icon = task.icon;

            return (
              <div
                key={task.title}
                className="rounded-2xl border border-gray-100 p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <Icon size={22} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-gray-900">
                  {task.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {task.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}