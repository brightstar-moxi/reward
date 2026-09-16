
import { CalendarDays, Gift, Users, Wallet } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "Daily",
    label: "Participation",
  },
  {
    icon: CalendarDays,
    value: "100",
    label: "Days of Progress",
  },
  {
    icon: Gift,
    value: "Multiple",
    label: "Reward Activities",
  },
  {
    icon: Wallet,
    value: "₦10,000",
    label: "Planned Minimum Withdrawal",
  },
];

export default function Stats() {
  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-gray-100 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center px-4 py-8 text-center sm:py-10"
            >
              <Icon size={21} className="text-green-600" />

              <p className="mt-3 text-xl font-bold text-gray-900 sm:text-2xl">
                {stat.value}
              </p>

              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}


// Notice that we're not claiming something like:

// ```text
// 500,000 Users
// ₦50M Paid
// 10,000 Withdrawals
// ```

// until those numbers actually exist.

// ---

// # 3. Add Stats to the homepage

// Update:

// ```text
// app/page.tsx
// ```

// Add:

// ```tsx
// import Stats from "@/components/public/Stats";
// ```

// Then:

// ```tsx
// <Hero />
// <Stats />
// <HowItWorks />
// ```

// So the beginning becomes:

// ```text
// Navbar
//    ↓
// Hero
//    ↓
// Stats
//    ↓
// How It Works
// ```

// ---

// # 4. Improve the Hero

// The current hero dashboard preview is good for development, but let's make it feel more like a real application.

// Replace the right-hand preview inside `Hero.tsx` with this:

// ```tsx
// <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
//   <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-green-200/50 blur-3xl" />
//   <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-blue-200/40 blur-3xl" />

//   <div className="relative rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl sm:p-7">
//     <div className="flex items-center justify-between">
//       <div>
//         <p className="text-xs font-medium text-gray-500">
//           MY PROGRESS
//         </p>

//         <h3 className="mt-1 text-xl font-bold text-gray-900">
//           Day 17 of 100
//         </h3>
//       </div>

//       <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
//         ✓
//       </div>
//     </div>

//     <div className="mt-6">
//       <div className="flex justify-between text-xs text-gray-500">
//         <span>Progress</span>
//         <span>17%</span>
//       </div>

//       <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100">
//         <div className="h-full w-[17%] rounded-full bg-green-600" />
//       </div>
//     </div>

//     <div className="mt-6 grid grid-cols-2 gap-3">
//       <div className="rounded-2xl bg-gray-50 p-4">
//         <p className="text-xs text-gray-500">
//           Available balance
//         </p>

//         <p className="mt-2 text-xl font-bold text-gray-900">
//           ₦4,300
//         </p>
//       </div>

//       <div className="rounded-2xl bg-gray-50 p-4">
//         <p className="text-xs text-gray-500">
//           Today's activities
//         </p>

//         <p className="mt-2 text-xl font-bold text-gray-900">
//           4
//         </p>
//       </div>
//     </div>

//     <div className="mt-5 rounded-2xl border border-gray-100 p-4">
//       <div className="flex items-center justify-between">
//         <p className="text-sm font-semibold text-gray-900">
//           Today's activities
//         </p>

//         <span className="text-xs font-medium text-green-600">
//           View all
//         </span>
//       </div>

//       <div className="mt-4 space-y-3">
//         {[
//           ["Daily participation", "₦100"],
//           ["Read content", "₦100"],
//           ["Promotional activity", "₦200"],
//         ].map(([name, reward]) => (
//           <div
//             key={name}
//             className="flex items-center justify-between"
//           >
//             <span className="text-xs text-gray-600">
//               {name}
//             </span>

//             <span className="text-xs font-semibold text-green-600">
//               +{reward}
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   </div>
// </div>

