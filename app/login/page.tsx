
// "use client";

// import Link from "next/link";
// import { ArrowRight, Eye, EyeOff } from "lucide-react";
// import { FormEvent, useState } from "react";

// import AuthLayout from "@/app/components/auth/AuthLayout";
// import AuthInput from "@/app/components/auth/AuthInput";

// export default function LoginPage() {
//   const [showPassword, setShowPassword] = useState(false);

//   const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();

//     // Authentication will be connected to Convex next.
//   };

//   return (
//     <AuthLayout
//       title="Welcome back"
//       description="Sign in to continue to your account and view your progress."
//       footerText="Don't have an account?"
//       footerLinkText="Create an account"
//       footerLink="/signup"
//     >
//       <form onSubmit={handleSubmit} className="space-y-5">
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
//             placeholder="Enter your password"
//             autoComplete="current-password"
//             required
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

//         <div className="flex justify-end">
//           <Link
//             href="/forgot-password"
//             className="text-sm font-medium text-green-600 hover:text-green-700"
//           >
//             Forgot password?
//           </Link>
//         </div>

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
//           Sign in
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

export default function LoginPage() {
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

    const email = String(
      formData.get("email") ?? ""
    )
      .trim()
      .toLowerCase();

    const password = String(
      formData.get("password") ?? ""
    );

    if (!email || !password) {
      setError(
        "Please enter your email and password."
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to sign in."
        );
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue to your account and view your progress."
      footerText="Don't have an account?"
      footerLinkText="Create an account"
      footerLink="/signup"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
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
            placeholder="Enter your password"
            autoComplete="current-password"
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

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-green-600 hover:text-green-700"
          >
            Forgot password?
          </Link>
        </div>

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
            "Signing in..."
          ) : (
            <>
              Sign in
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}

