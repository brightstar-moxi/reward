
"use client";

import { CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";

type Withdrawal = {
  id: number;
  name: string;
  amount: string;
  location: string;
  time: string;
};

const demoWithdrawals: Withdrawal[] = [
  {
    id: 1,
    name: "John",
    amount: "₦10,000",
    location: "Lagos",
    time: "2 minutes ago",
  },
  {
    id: 2,
    name: "Mary",
    amount: "₦12,500",
    location: "Ibadan",
    time: "5 minutes ago",
  },
  {
    id: 3,
    name: "David",
    amount: "₦10,000",
    location: "Abuja",
    time: "8 minutes ago",
  },
  {
    id: 4,
    name: "Sarah",
    amount: "₦15,000",
    location: "Port Harcourt",
    time: "11 minutes ago",
  },
];

export default function WithdrawalNotification() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let hideTimer: NodeJS.Timeout;
    let showTimer: NodeJS.Timeout;

    const showNotification = () => {
      setVisible(true);

      hideTimer = setTimeout(() => {
        setVisible(false);

        showTimer = setTimeout(() => {
          setCurrentIndex((previous) => {
            return (previous + 1) % demoWithdrawals.length;
          });

          showNotification();
        }, 4000);
      }, 6000);
    };

    showTimer = setTimeout(showNotification, 3000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(showTimer);
    };
  }, []);

  const withdrawal = demoWithdrawals[currentIndex];

  const closeNotification = () => {
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      className="
        fixed
        bottom-5
        right-5
        z-[100]
        w-[calc(100%-2.5rem)]
        max-w-sm
        pointer-events-none
      "
    >
      <div
        className="
          pointer-events-auto
          relative
          overflow-hidden
          rounded-2xl
          border
          border-gray-200
          bg-white
          p-4
          shadow-2xl
          animate-in
          slide-in-from-bottom-5
          duration-500
        "
      >
        {/* Demo indicator */}
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Demo notification
        </div>

        <button
          type="button"
          onClick={closeNotification}
          aria-label="Close notification"
          className="
            absolute
            right-3
            top-3
            rounded-full
            p-1
            text-gray-400
            transition
            hover:bg-gray-100
            hover:text-gray-700
          "
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3 pr-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2
              size={21}
              className="text-green-600"
            />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              Withdrawal processed
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {withdrawal.name} from {withdrawal.location}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="text-base font-bold text-green-600">
                {withdrawal.amount}
              </span>

              <span className="text-xs text-gray-400">
                • {withdrawal.time}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 h-1 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full w-full animate-[shrink_6s_linear] bg-green-500" />
        </div>
      </div>
    </div>
  );
}

