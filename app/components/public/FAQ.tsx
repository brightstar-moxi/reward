"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "What is this platform?",
    answer:
      "It is a Nigerian giveaway and reward platform where registered users can participate in available daily activities and eligible tasks.",
  },
  {
    question: "Is registration free?",
    answer:
      "Yes. Creating an account is free. You should always review the platform rules and requirements before participating.",
  },
  {
    question: "How do I earn rewards?",
    answer:
      "Rewards can come from eligible daily activities, available tasks and qualifying referral activities. The reward attached to each activity is displayed before you begin.",
  },
  {
    question: "How does the referral system work?",
    answer:
      "Each registered user receives a unique referral link. Referral rewards are associated with qualifying activity rather than simply creating multiple accounts.",
  },
  {
    question: "What is the minimum withdrawal amount?",
    answer:
      "The planned minimum withdrawal threshold is ₦10,000. ",
  },
//   Additional requirements must also be satisfied before a withdrawal request becomes available.
  {
    question: "When can I withdraw?",
    answer:
      "Once your account meets the withdrawal threshold and all applicable requirements have been satisfied, the withdrawal option will become available in your dashboard.",
  },
  {
    question: "Can I create multiple accounts?",
    answer:
      "No. Users are expected to maintain one legitimate account. The platform will use account and activity checks to help detect duplicate or abusive accounts.",
  },
  {
    question: "How are withdrawal activities displayed?",
    answer:
      "Recent withdrawal notifications are intended to display genuine processed transactions. The production system will retrieve these records from the platform database.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-white py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="font-semibold text-green-600">FAQ</p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            Frequently asked questions
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-600">
            Find answers to some of the most common questions about
            participation, rewards, referrals and withdrawals.
          </p>
        </div>

        <div className="mt-10 divide-y divide-gray-200 rounded-2xl border border-gray-200">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left sm:px-6"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-gray-900">
                    {faq.question}
                  </span>

                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-gray-500 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6">
                    <p className="max-w-3xl leading-7 text-gray-600">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}