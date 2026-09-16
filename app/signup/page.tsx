
// "use client";

// import Link from "next/link";
// import { ArrowRight, Eye, EyeOff } from "lucide-react";
// import { FormEvent, useState } from "react";

// import AuthLayout from "@/app/components/auth/AuthLayout";
// import AuthInput from "@/app/components/auth/AuthInput";

// import { useAuthActions } from "@convex-dev/auth/react";

// export default function SignupPage() {
//   const [showPassword, setShowPassword] = useState(false);

// const { signIn } = useAuthActions();

//   const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();

//     // Authentication will be connected to Convex next.
//   };

//   return (
//     <AuthLayout
//       title="Create your account"
//       description="Join the platform and start participating in available activities."
//       footerText="Already have an account?"
//       footerLinkText="Sign in"
//       footerLink="/login"
//     >
//       <form onSubmit={handleSubmit} className="space-y-5">
//         <AuthInput
//           label="Full name"
//           id="fullName"
//           name="fullName"
//           type="text"
//           placeholder="Enter your full name"
//           autoComplete="name"
//           required
//         />

//         <AuthInput
//           label="Email address"
//           id="email"
//           name="email"
//           type="email"
//           placeholder="you@example.com"
//           autoComplete="email"
//           required
//         />

//         <div className="relative">
//           <AuthInput
//             label="Password"
//             id="password"
//             name="password"
//             type={showPassword ? "text" : "password"}
//             placeholder="Create a password"
//             autoComplete="new-password"
//             required
//             minLength={8}
//           />

//           <button
//             type="button"
//             onClick={() => setShowPassword((value) => !value)}
//             className="absolute right-3 top-9 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
//             aria-label={
//               showPassword ? "Hide password" : "Show password"
//             }
//           >
//             {showPassword ? (
//               <EyeOff size={18} />
//             ) : (
//               <Eye size={18} />
//             )}
//           </button>
//         </div>

//         <label className="flex items-start gap-3">
//           <input
//             type="checkbox"
//             required
//             className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
//           />

//           <span className="text-xs leading-5 text-gray-500">
//             I agree to the{" "}
//             <Link
//               href="/terms"
//               className="font-medium text-gray-700 hover:text-green-600"
//             >
//               Terms of Service
//             </Link>{" "}
//             and{" "}
//             <Link
//               href="/privacy"
//               className="font-medium text-gray-700 hover:text-green-600"
//             >
//               Privacy Policy
//             </Link>
//             .
//           </span>
//         </label>

//         <button
//           type="submit"
//           className="
//             flex
//             h-12
//             w-full
//             items-center
//             justify-center
//             gap-2
//             rounded-xl
//             bg-green-600
//             font-semibold
//             text-white
//             transition
//             hover:bg-green-700
//             focus:outline-none
//             focus:ring-4
//             focus:ring-green-500/20
//           "
//         >
//           Create account
//           <ArrowRight size={18} />
//         </button>
//       </form>
//     </AuthLayout>
//   );
// }



"use client";

import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import AuthLayout from "@/app/components/auth/AuthLayout";
import AuthInput from "@/app/components/auth/AuthInput";

// import { useAction } from "convex/react";
// import { api } from "@/convex/_generated/api";

export default function SignupPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const fullName = String(
      formData.get("fullName") ?? ""
    ).trim();

    const email = String(
      formData.get("email") ?? ""
    )
      .trim()
      .toLowerCase();

    const password = String(
      formData.get("password") ?? ""
    );

    if (!fullName || !email || !password) {
      setError("Please complete all required fields.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to create your account."
        );
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      description="Join the platform and start participating in available activities."
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLink="/login"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <AuthInput
          label="Full name"
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Enter your full name"
          autoComplete="name"
          required
        />

        <AuthInput
          label="Email address"
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <div className="relative">
          <AuthInput
            label="Password"
            id="password"
            name="password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            placeholder="Create a password"
            autoComplete="new-password"
            minLength={8}
            required
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (value) => !value
              )
            }
            className="absolute right-3 top-9 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />

          <span className="text-xs leading-5 text-gray-500">
            I agree to the{" "}
            <Link
              href="/terms"
              className="font-medium text-gray-700 hover:text-green-600"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-medium text-gray-700 hover:text-green-600"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="
            flex
            h-12
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-green-600
            font-semibold
            text-white
            transition
            hover:bg-green-700
            disabled:cursor-not-allowed
            disabled:opacity-60
            focus:outline-none
            focus:ring-4
            focus:ring-green-500/20
          "
        >
          {loading ? (
            "Creating account..."
          ) : (
            <>
              Create account
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}








