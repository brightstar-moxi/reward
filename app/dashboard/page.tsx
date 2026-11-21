"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wallet,
  CheckCircle2,
  Users,
  CalendarDays,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

type WalletData = {
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
};

type Transaction = {
  _id: string;
  type: "reward" | "refund" | "withdrawal" | "penalty" | "referral";
  amount: number;
  description: string;
  createdAt: number;
};

// type DashboardData = {
//   wallet: WalletData;
//   todaysEarnings: number;
//   transactions: Transaction[];
// };
type DashboardData = {
  wallet: WalletData;
  todaysEarnings: number;
  transactions: Transaction[];
  settings: {
    minimumWithdrawal: number;
  };
};
// const MINIMUM_WITHDRAWAL = 10_000;

const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);


type DailyTask = {
  _id: string;
  title: string;
  description: string;
  reward: number;
  targetUrl?: string;
  requiresProof: boolean;
  instructions: string;
  submissionStatus:
    | "not_started"
    | "pending"
    | "approved"
    | "rejected";
  submittedAt: number | null;
  retryAvailableAt: number | null;
  adminNote: string | null;
};
type ReferralData = {
  referralCode: string;
  totalReferrals: number;
};


type DailyLoginData = {
  claim: {
    status: "pending" | "approved" | "rejected";
    reward: number;
    claimDate: string;
    submittedAt: number;
    adminNote?: string;
  } | null;
  claimDate: string;
  reward: number;
};


type DailyTasksData = {
  currentDay: number;
  totalDays: number;
  totalTasks: number;
  completedTasks: number;
  tasks: DailyTask[];
};


  type ParticipationData = {
  currentDay: number;
  totalDays: number;
  registrationDate: string;
  todayDate: string;
  completedCalendarDays: number;
  isDay100: boolean;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [participation, setParticipation] =
  useState<ParticipationData | null>(null);

  const router = useRouter();
  
const [dailyTasks, setDailyTasks] =
  useState<DailyTasksData | null>(null);

const [tasksLoading, setTasksLoading] = useState(true);
const [tasksError, setTasksError] = useState("");


const [referralData, setReferralData] =
  useState<ReferralData | null>(null);

const [referralLoading, setReferralLoading] = useState(true);

const [referralError, setReferralError] = useState("");

const [copiedReferral, setCopiedReferral] = useState<
  "code" | "link" | null
>(null);



const [dailyLogin, setDailyLogin] =
  useState<DailyLoginData | null>(null);

const [dailyLoginLoading, setDailyLoginLoading] = useState(true);
const [dailyLoginError, setDailyLoginError] = useState("");
const [claimingDailyLogin, setClaimingDailyLogin] = useState(false);


useEffect(() => {
  let cancelled = false;

  async function loadReferrals() {
    try {
      const response = await fetch("/api/referrals", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to load referrals."
        );
      }

      if (!cancelled) {
        setReferralData(result);
        setReferralError("");
      }
    } catch (err) {
      if (!cancelled) {
        setReferralError(
          err instanceof Error
            ? err.message
            : "Unable to load referrals."
        );
      }
    } finally {
      if (!cancelled) {
        setReferralLoading(false);
      }
    }
  }

  loadReferrals();

  return () => {
    cancelled = true;
  };
}, []);

async function copyReferral(value: string, type: "code" | "link") {
  try {
    await navigator.clipboard.writeText(value);
    setCopiedReferral(type);
  } catch {
    setReferralError("Unable to copy. Please copy the text manually.");
  }
}



useEffect(() => {
  let cancelled = false;

  async function loadDailyLogin() {
    try {
      const response = await fetch("/api/daily-login/status", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to load Daily Login status."
        );
      }

      if (!cancelled) {
        setDailyLogin(result);
        setDailyLoginError("");
      }
    } catch (error) {
      if (!cancelled) {
        setDailyLoginError(
          error instanceof Error
            ? error.message
            : "Unable to load Daily Login status."
        );
      }
    } finally {
      if (!cancelled) {
        setDailyLoginLoading(false);
      }
    }
  }

  loadDailyLogin();

  return () => {
    cancelled = true;
  };
}, []);


async function handleDailyLoginClaim() {
  try {
    setClaimingDailyLogin(true);
    setDailyLoginError("");

    const response = await fetch("/api/daily-login/claim", {
      method: "POST",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || "Unable to submit Daily Login claim."
      );
    }

    // Refresh the claim status after successful submission.
    const statusResponse = await fetch("/api/daily-login/status", {
      cache: "no-store",
    });

    const statusResult = await statusResponse.json();

    if (!statusResponse.ok) {
      throw new Error(
        statusResult.error || "Unable to refresh Daily Login status."
      );
    }

    setDailyLogin(statusResult);
  } catch (error) {
    setDailyLoginError(
      error instanceof Error
        ? error.message
        : "Unable to submit Daily Login claim."
    );
  } finally {
    setClaimingDailyLogin(false);
  }
}


useEffect(() => {
  let cancelled = false;

  async function loadDailyTasks() {
    try {
      const response = await fetch("/api/dashboard/tasks", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to load today's tasks."
        );
      }

      if (!cancelled) {
        setDailyTasks(result);
        setTasksError("");
      }
    } catch (error) {
      if (!cancelled) {
        setTasksError(
          error instanceof Error
            ? error.message
            : "Unable to load today's tasks."
        );
      }
    } finally {
      if (!cancelled) setTasksLoading(false);
    }
  }

  loadDailyTasks();

  return () => {
    cancelled = true;
  };
}, []);


 
useEffect(() => {
  let cancelled = false;

  async function loadWallet() {
    try {
      const [walletResponse, participationResponse] =
        await Promise.all([
          fetch("/api/wallet", { cache: "no-store" }),
          fetch("/api/participation", { cache: "no-store" }),
        ]);

      const walletResult = await walletResponse.json();
      const participationResult =
        await participationResponse.json();

      if (!walletResponse.ok) {
        throw new Error(
          walletResult.error || "Unable to load your wallet."
        );
      }

      if (!participationResponse.ok) {
        throw new Error(
          participationResult.error ||
            "Unable to load participation data."
        );
      }

      if (!cancelled) {
        setData(walletResult);
        setParticipation(participationResult.participation);
        setError("");
      }
    } catch (err) {
      if (!cancelled) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard data."
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  loadWallet();

  return () => {
    cancelled = true;
  };
}, []);


  const wallet = data?.wallet;
  const balance = wallet?.balance ?? 0;
  const todaysEarnings = data?.todaysEarnings ?? 0;
  const progress = Math.min(
    (balance /(data?.settings.minimumWithdrawal ?? 10_000)) * 100,
    100
  );
  const remaining = Math.max(
   (data?.settings.minimumWithdrawal ?? 10_000) - balance,
    0
  );

  const stats = [
    {
      title: "Available Balance",
      value: loading ? "Loading..." : formatNaira(balance),
      description: "Available for withdrawal",
      icon: Wallet,
    },
    {
      title: "Today's Earnings",
      value: loading
        ? "Loading..."
        : formatNaira(todaysEarnings),
      description: "Earned today",
      icon: CheckCircle2,
    },
   {
  title: "Referrals",
  value: referralLoading
    ? "Loading..."
    : referralData
      ? String(referralData.totalReferrals)
      : "Unavailable",
  description: "Registered referrals",
  icon: Users,
},
    {
  title: "Current Day",
  value: loading
    ? "Loading..."
    : participation
      ? `Day ${participation.currentDay}`
      : "Unavailable",
  description: participation
    ? `Day ${participation.currentDay} of ${participation.totalDays}`
    : "Your participation progress",
  icon: CalendarDays,
},
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Welcome */}
      <section>
        <p className="text-sm font-medium text-green-600">
          Welcome back
        </p>

        <h2 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
          Your reward dashboard
        </h2>

        <p className="mt-2 max-w-2xl text-sm text-gray-500 sm:text-base">
          Complete today's activities, earn rewards,
          and keep progressing toward your withdrawal.
        </p>
        <Link
  href="/dashboard/earnings"
  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
>
  View earnings history
  <ArrowRight size={16} />
</Link>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {stat.title}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>

                <div className="rounded-xl bg-green-50 p-3 text-green-600">
                  <Icon size={20} />
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-400">
                {stat.description}
              </p>
            </div>
          );
        })}
      </section>


{/* Referral section */}
<section className="rounded-2xl border border-gray-200 bg-white p-6">
  <div className="flex items-center gap-3">
    <div className="rounded-xl bg-green-50 p-3 text-green-600">
      <Users size={22} />
    </div>

    <div>
      <h3 className="font-semibold text-gray-900">
        Your referral program
      </h3>
      <p className="text-sm text-gray-500">
        Invite friends using your personal referral link.
      </p>
    </div>
  </div>

  {referralLoading ? (
    <p className="mt-5 text-sm text-gray-500">
      Loading referral information...
    </p>
  ) : referralError || !referralData ? (
    <p role="alert" className="mt-5 text-sm text-red-600">
      {referralError || "Referral information is unavailable."}
    </p>
  ) : (
    <>
      <div className="mt-5 rounded-xl bg-gray-50 p-4">
        <p className="text-sm text-gray-500">
          Total registered referrals
        </p>
        <p className="mt-1 text-2xl font-bold text-gray-900">
          {referralData.totalReferrals}
        </p>
      </div>

      <div className="mt-5">
        <label className="text-sm font-medium text-gray-700">
          Your referral code
        </label>

        <div className="mt-2 flex gap-2">
          <input
            readOnly
            value={referralData.referralCode}
            className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm"
          />

          <button
            type="button"
            onClick={() =>
              copyReferral(referralData.referralCode, "code")
            }
            className="rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700"
          >
            {copiedReferral === "code" ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="mt-5">
        <label className="text-sm font-medium text-gray-700">
          Your referral link
        </label>

        <div className="mt-2 flex gap-2">
          <input
            readOnly
            value={`${window.location.origin}/register?ref=${encodeURIComponent(referralData.referralCode)}`}
            className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm"
          />

          <button
            type="button"
            onClick={() =>
              copyReferral(
                `${window.location.origin}/signup?ref=${encodeURIComponent(referralData.referralCode)}`,
                "link"
              )
            }
            className="rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700"
          >
            {copiedReferral === "link" ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </>
  )}
</section>


{/* Daily Login */}
<section className="rounded-2xl border border-gray-200 bg-white p-6">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-green-50 p-3 text-green-600">
          <CalendarDays size={22} />
        </div>

        <div>
          <h3 className="font-semibold text-gray-900">
            Daily Login Reward
          </h3>
          <p className="text-sm text-gray-500">
            Claim your daily reward and keep your journey active.
          </p>
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold text-green-600">
        {dailyLoginLoading
          ? "Loading..."
          : formatNaira(dailyLogin?.reward ?? 100)}
      </p>
      <p className="text-xs text-gray-400">
        Daily login reward
      </p>
    </div>

    <div className="sm:min-w-48 sm:text-right">
      {dailyLoginLoading ? (
        <p className="text-sm text-gray-500">
          Checking claim status...
        </p>
      ) : dailyLoginError ? (
        <p className="text-sm text-red-600">
          {dailyLoginError}
        </p>
      ) : !dailyLogin?.claim ? (
        <button
          type="button"
          onClick={handleDailyLoginClaim}
          disabled={claimingDailyLogin}
          className="w-full rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {claimingDailyLogin ? "Submitting..." : "Claim Daily Login"}
        </button>
      ) : dailyLogin.claim.status === "pending" ? (
        <span className="inline-flex items-center rounded-full bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700">
          Pending Approval
        </span>
      ) : dailyLogin.claim.status === "approved" ? (
        <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
          <CheckCircle2 size={16} />
          Reward Approved
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
          Claim Rejected
        </span>
      )}
    </div>
  </div>

  {dailyLogin?.claim?.status === "pending" && (
    <p className="mt-4 text-sm text-gray-500">
      Your Daily Login claim has been submitted and is waiting for admin approval.
    </p>
  )}

  {dailyLogin?.claim?.status === "approved" && (
    <p className="mt-4 text-sm text-green-700">
      Your daily reward has been approved and credited to your wallet.
    </p>
  )}

  {dailyLogin?.claim?.status === "rejected" && (
    <p className="mt-4 text-sm text-red-600">
      Your claim was rejected. You cannot submit another claim today.
      {dailyLogin.claim.adminNote
        ? ` Admin note: ${dailyLogin.claim.adminNote}`
        : ""}
    </p>
  )}
</section>


      {/* Main grid */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Daily activity */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:col-span-2">
          {/* <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                Today's activities
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Complete your available tasks.
              </p>
            </div>

            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
              2 / 5 completed
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {[
              "Daily login",
              "Read today's article",
              "Watch promotional video",
              "Complete social activity",
              "Referral activity",
            ].map((task, index) => (
              <div
                key={task}
                className="flex items-center justify-between rounded-xl border border-gray-100 p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      index < 2
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {index < 2 ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <span className="text-xs font-semibold">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {task}
                    </p>

                    <p className="text-xs text-gray-400">
                      +₦100 reward
                    </p>
                  </div>
                </div>

                {index >= 2 && (
                  <button className="flex items-center gap-1 text-xs font-semibold text-green-600">
                    Start
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            ))}
          </div> */}





<div className="flex items-center justify-between gap-3">
  <div>
    <h3 className="font-semibold text-gray-900">
      Today's activities
    </h3>

    <p className="mt-1 text-sm text-gray-500">
      {dailyTasks
        ? `Day ${dailyTasks.currentDay} of ${dailyTasks.totalDays}`
        : "Your daily tasks"}
    </p>
  </div>

  <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
    {tasksLoading
      ? "Loading..."
      : `${dailyTasks?.completedTasks ?? 0} / ${
          dailyTasks?.totalTasks ?? 0
        } completed`}
  </span>
</div>

{tasksError && (
  <p role="alert" className="mt-4 text-sm text-red-600">
    {tasksError}
  </p>
)}

{tasksLoading ? (
  <p className="mt-6 text-sm text-gray-500">
    Loading today's tasks...
  </p>
) : dailyTasks?.tasks.length ? (
  <div className="mt-6 space-y-3">
    {dailyTasks.tasks.map((task, index) => {
      const approved = task.submissionStatus === "approved";
      const pending = task.submissionStatus === "pending";
      const rejected = task.submissionStatus === "rejected";

      return (
        <div
          key={task._id}
          className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-4"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                approved
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {approved ? (
                <CheckCircle2 size={18} />
              ) : (
                <span className="text-xs font-semibold">
                  {index + 1}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800">
                {task.title}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {approved
                  ? "Reward approved"
                  : pending
                    ? "Awaiting review"
                    : rejected
                      ? "Submission rejected"
                      : "Not completed"}
                {" · "}
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  maximumFractionDigits: 2,
                }).format(task.reward)}
              </p>
            </div>
          </div>

          {!approved && (
            <Link
              href={`/dashboard/tasks/${task._id}`}
              className="shrink-0 text-xs font-semibold text-green-600 hover:text-green-700"
            >
              {pending ? "View status" : rejected ? "Retry" : "Start"}
              <ArrowRight
                size={14}
                className="ml-1 inline"
              />
            </Link>
          )}
        </div>
      );
    })}
  </div>
) : (
  <p className="mt-6 rounded-xl bg-gray-50 p-5 text-sm text-gray-500">
    No active tasks are available for this participation day.
  </p>
)}


        </div>

        {/* Withdrawal */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">
            Withdrawal progress
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Minimum withdrawal: {formatNaira(data?.settings.minimumWithdrawal ?? 10_000)}
          </p>

          <div className="mt-6">
            <div className="flex justify-between gap-2 text-sm">
              <span className="font-medium text-gray-700">
                {loading ? "Loading..." : formatNaira(balance)}
              </span>

              <span className="text-gray-400">
                {formatNaira(data?.settings.minimumWithdrawal ?? 10_000)}
              </span>
            </div>

            <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="mt-3 text-xs text-gray-400">
              {loading
                ? "Calculating your progress..."
                : remaining > 0
                  ? `${formatNaira(remaining)} remaining before withdrawal.`
                  : "You have reached the minimum withdrawal balance."}
            </p>
          </div>

          {/* <button
            disabled={loading || balance < MINIMUM_WITHDRAWAL}
            className="mt-6 w-full rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-400 disabled:cursor-not-allowed"
          >
            {loading
              ? "Loading wallet..."
              : balance >= MINIMUM_WITHDRAWAL
                ? "Eligible for withdrawal"
                : "Withdrawal locked"}
          </button> */}


          <button
  onClick={() => router.push("/dashboard/withdraw")}
  disabled={loading || balance < (data?.settings.minimumWithdrawal ?? 10_000)}
  className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
    loading || balance < (data?.settings.minimumWithdrawal ?? 10_000)
      ? "cursor-not-allowed bg-gray-100 text-gray-400"
      : "bg-green-600 text-white hover:bg-green-700"
  }`}
>
  {loading
    ? "Loading wallet..."
    : balance >= (data?.settings.minimumWithdrawal ?? 10_000)
      ? "Withdraw Funds"
      : "Withdrawal Locked"}
</button>
        </div>
      </section>

      {/* Recent transactions */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div>
          <h3 className="font-semibold text-gray-900">
            Recent transactions
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Your latest wallet rewards and withdrawals.
          </p>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-gray-500">
            Loading transactions...
          </p>
        ) : data?.transactions.length ? (
          <div className="mt-5 divide-y divide-gray-100">
            {data.transactions.map((transaction) => {
              // const isReward = transaction.type === "reward";
              const isCredit =
 
  transaction.type === "reward" ||
  transaction.type === "refund" ||
  transaction.type === "referral";

              return (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`rounded-xl p-3 ${
                       isCredit
                          ? "bg-green-50 text-green-600"
                          : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {isCredit? (
                        <ArrowDownLeft size={20} />
                      ) : (
                        <ArrowUpRight size={20} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {transaction.description}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(
                          transaction.createdAt
                        ).toLocaleString("en-NG", {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone: "Africa/Lagos",
                        })}
                      </p>
                    </div>
                  </div>

                  <p
                    className={`shrink-0 text-sm font-semibold ${
                      isCredit
                        ? "text-green-600"
                        : "text-gray-800"
                    }`}
                  >
                    {isCredit ? "+" : "-"}
{formatNaira(Math.abs(transaction.amount))}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-xl bg-gray-50 p-6 text-center">
            <Wallet
              size={28}
              className="mx-auto text-gray-400"
            />

            <p className="mt-3 text-sm font-medium text-gray-700">
              No transactions yet
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Approved task rewards will appear here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}