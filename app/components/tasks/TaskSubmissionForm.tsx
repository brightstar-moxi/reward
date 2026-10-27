// "use client";

// import { useEffect, useState } from "react";

// type TaskSubmissionFormProps = {
//   taskId: string;
//   requiresProof: boolean;
// };

// export default function TaskSubmissionForm({
//   taskId,
//   requiresProof,
// }: TaskSubmissionFormProps) {
//   const [file, setFile] = useState<File | null>(null);
//   const [preview, setPreview] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // const [retryAvailableAt, setRetryAvailableAt] =
//   // useState<number | null>(null);

// const [remainingSeconds, setRemainingSeconds] =
//   useState(0);

//   const [retryAvailableAt, setRetryAvailableAt] =
//   useState<number | null>(null);

// const [secondsLeft, setSecondsLeft] = useState(0);

//   const [submissionStatus, setSubmissionStatus] =
//     useState<
//       "pending" | "approved" | "rejected" | null
//     >(null);

//   const [checkingSubmission, setCheckingSubmission] =
//     useState(true);

//   /*
//    * Check whether the current user has already
//    * submitted this task.
//    */
//   useEffect(() => {
//     const checkSubmission = async () => {
//       try {
//         const response = await fetch(
//           `/api/tasks/submission?taskId=${taskId}`
//         );

//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(
//             data.error ||
//               "Unable to check submission."
//           );
//         }

//         // if (data.submission) {
//         //   setSubmissionStatus(
//         //     data.submission.status
//         //   );
//         // } else {
//         //   setSubmissionStatus(null);
//         // }


//         if (data.submission) {
//   setSubmissionStatus(data.submission.status);

// const retryAt =
//   data.submission.retryAvailableAt ?? null;

// setRetryAvailableAt(retryAt);

// setSecondsLeft(
//   retryAt
//     ? Math.max(
//         0,
//         Math.ceil((retryAt - Date.now()) / 1000)
//       )
//     : 0
// );
// setRetryAvailableAt(
//     data.submission.retryAvailableAt ?? null
//   );
// } else {
//   setSubmissionStatus(null);
//   setRetryAvailableAt(null);
//   setSecondsLeft(0);
// }
//       } catch (error) {
//         console.error(
//           "Submission status error:",
//           error
//         );

//         setError(
//           error instanceof Error
//             ? error.message
//             : "Unable to check task status."
//         );
//       } finally {
//         setCheckingSubmission(false);
//       }
//     };

//     checkSubmission();
//   }, [taskId]);


//   useEffect(() => {
//   if (!retryAvailableAt) {
//     setSecondsLeft(0);
//     return;
//   }

//   const updateCountdown = () => {
//     setSecondsLeft(
//       Math.max(
//         0,
//         Math.ceil((retryAvailableAt - Date.now()) / 1000)
//       )
//     );
//   };

//   updateCountdown();

//   const timer = window.setInterval(
//     updateCountdown,
//     1000
//   );

//   return () => window.clearInterval(timer);
// }, [retryAvailableAt]);

//   /*
//    * Handle screenshot selection.
//    */
//   const handleFileChange = (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const selectedFile =
//       event.target.files?.[0];

//     if (!selectedFile) {
//       return;
//     }

//     setError("");

//     if (!selectedFile.type.startsWith("image/")) {
//       setError("Please select an image file.");
//       return;
//     }

//     if (selectedFile.size > 5 * 1024 * 1024) {
//       setError(
//         "Image must be smaller than 5MB."
//       );
//       return;
//     }

//     setFile(selectedFile);

//     const objectUrl =
//       URL.createObjectURL(selectedFile);

//     setPreview(objectUrl);
//   };

//   /*
//    * Submit task and screenshot.
//    */
//   const handleSubmit = async () => {
//     setError("");

//     if (requiresProof && !file) {
//       setError(
//         "Please upload a screenshot before submitting."
//       );
//       return;
//     }

//     setLoading(true);

//     try {
//       /*
//        * 1. Get authenticated upload URL.
//        */
//       const uploadUrlResponse = await fetch(
//         "/api/tasks/upload",
//         {
//           method: "POST",
//         }
//       );

//       const uploadUrlData =
//         await uploadUrlResponse.json();

//       if (!uploadUrlResponse.ok) {
//         throw new Error(
//           uploadUrlData.error ||
//             "Unable to prepare image upload."
//         );
//       }

//       /*
//        * 2. Upload screenshot to Convex Storage.
//        */
//       let proofStorageId:
//         | string
//         | undefined;

//       if (file) {
//         const uploadResponse = await fetch(
//           uploadUrlData.uploadUrl,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": file.type,
//             },
//             body: file,
//           }
//         );

//         if (!uploadResponse.ok) {
//           throw new Error(
//             "Unable to upload screenshot."
//           );
//         }

//         const uploadResult =
//           await uploadResponse.json();

//         proofStorageId =
//           uploadResult.storageId;
//       }

//       /*
//        * 3. Create task submission.
//        */
//       const submissionResponse =
//         await fetch("/api/tasks/submit", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             taskId,
//             proofStorageId,
//           }),
//         });

//       const submissionData =
//         await submissionResponse.json();

//       if (!submissionResponse.ok) {
//         throw new Error(
//           submissionData.error ||
//             "Unable to submit task."
//         );
//       }

//       /*
//        * 4. Update frontend state to match
//        *    the submission created in Convex.
//        */
//       setSubmissionStatus("pending");

//       setFile(null);
//       setPreview("");
//     } catch (error) {
//       console.error(
//         "Submission error:",
//         error
//       );

//       setError(
//         error instanceof Error
//           ? error.message
//           : "Unable to submit the task."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   /*
//    * Loading submission status.
//    */
//   if (checkingSubmission) {
//     return (
//       <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
//         <p className="text-sm text-gray-500">
//           Checking task status...
//         </p>
//       </div>
//     );
//   }

//   /*
//    * Submission is pending.
//    */
//   if (submissionStatus === "pending") {
//     return (
//       <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6">
//         <h2 className="text-lg font-semibold text-yellow-900">
//           Submission under review
//         </h2>

//         <p className="mt-2 text-sm leading-6 text-yellow-800">
//           Your screenshot has been submitted
//           successfully. Please wait while it is
//           reviewed.
//         </p>

//         <div className="mt-4 inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
//           Pending review
//         </div>
//       </div>
//     );
//   }

//   /*
//    * Submission has been approved.
//    */
//   if (submissionStatus === "approved") {
//     return (
//       <div className="rounded-3xl border border-green-200 bg-green-50 p-6">
//         <h2 className="text-lg font-semibold text-green-900">
//           Task completed
//         </h2>

//         <p className="mt-2 text-sm leading-6 text-green-800">
//           Your task has been approved successfully.
//           Your reward has been processed.
//         </p>

//         <div className="mt-4 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
//           Approved
//         </div>
//       </div>
//     );
//   }

//   /*
//    * Submission was rejected.
//    *
//    * For now we allow the user to see the
//    * submission form again.
//    */
//   // if (submissionStatus === "rejected") {
//   //   return (
//   //     <div className="space-y-5">
//   //       <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
//   //         <h2 className="text-lg font-semibold text-red-900">
//   //           Submission rejected
//   //         </h2>

//   //         <p className="mt-2 text-sm leading-6 text-red-800">
//   //           Your previous submission was not
//   //           approved. You can submit new proof.
//   //         </p>

//   //         <div className="mt-4 inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
//   //           Rejected
//   //         </div>
//   //       </div>

//   //       {/* Submission form continues below */}
//   //     </div>
//   //   );
//   // }


// if (submissionStatus === "rejected") {
//   return (
//     <div className="space-y-5">
//       <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
//         <h2 className="text-lg font-semibold text-red-900">
//           Submission rejected
//         </h2>

//         <p className="mt-2 text-sm leading-6 text-red-800">
//           Your previous submission was not approved.
//           Please review your proof before trying again.
//         </p>

//         <div className="mt-4 inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
//           Rejected
//         </div>

//         {secondsLeft > 0 ? (
//           <p className="mt-4 text-sm font-medium text-red-800">
//             You can resubmit in {secondsLeft} seconds.
//           </p>
//         ) : (
//           <p className="mt-4 text-sm font-medium text-green-700">
//             You can upload new proof and resubmit.
//           </p>
//         )}
//       </div>

//       {secondsLeft === 0 && (
//         <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900">
//               Submit new proof
//             </h3>

//             <p className="mt-1 text-sm text-gray-500">
//               Upload a new screenshot for review.
//             </p>
//           </div>

//           {requiresProof && (
//             <div className="space-y-3">
//               <label
//                 htmlFor="task-proof"
//                 className="block text-sm font-medium text-gray-700"
//               >
//                 Screenshot proof
//               </label>

//               <input
//                 id="task-proof"
//                 type="file"
//                 accept="image/*"
//                 onChange={handleFileChange}
//                 disabled={loading}
//                 className="block w-full rounded-xl border border-gray-300 bg-gray-50 p-3 text-sm"
//               />

//               <p className="text-xs text-gray-400">
//                 JPG, PNG or WebP. Maximum size: 5MB.
//               </p>
//             </div>
//           )}

//           {preview && (
//             <img
//               src={preview}
//               alt="New task proof preview"
//               className="max-h-80 w-full rounded-xl border border-gray-200 object-contain"
//             />
//           )}

//           {error && (
//             <div
//               role="alert"
//               className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
//             >
//               {error}
//             </div>
//           )}

//           <button
//             type="button"
//             onClick={handleSubmit}
//             disabled={loading || (requiresProof && !file)}
//             className="flex h-12 w-full items-center justify-center rounded-xl bg-green-600 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             {loading ? "Submitting..." : "Resubmit for verification"}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }


//   /*
//    * No submission yet.
//    */
//   return (
//     <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
//       <div>
//         <h3 className="text-lg font-semibold text-gray-900">
//           Submit your task
//         </h3>

//         <p className="mt-1 text-sm text-gray-500">
//           {requiresProof
//             ? "Complete the task and upload a screenshot as proof."
//             : "Complete the task and submit it for verification."}
//         </p>
//       </div>

//       {requiresProof && (
//         <div className="space-y-3">
//           <label
//             htmlFor="task-proof"
//             className="block text-sm font-medium text-gray-700"
//           >
//             Screenshot proof
//           </label>

//           <input
//             id="task-proof"
//             type="file"
//             accept="image/*"
//             onChange={handleFileChange}
//             disabled={loading}
//             className="
//               block
//               w-full
//               cursor-pointer
//               rounded-xl
//               border
//               border-gray-300
//               bg-gray-50
//               p-3
//               text-sm
//               text-gray-600
//               file:mr-4
//               file:rounded-lg
//               file:border-0
//               file:bg-green-600
//               file:px-4
//               file:py-2
//               file:font-medium
//               file:text-white
//               hover:file:bg-green-700
//             "
//           />

//           <p className="text-xs text-gray-400">
//             JPG, PNG or WebP. Maximum size: 5MB.
//           </p>
//         </div>
//       )}

//       {preview && (
//         <div>
//           <p className="mb-2 text-sm font-medium text-gray-700">
//             Screenshot preview
//           </p>

//           <div className="overflow-hidden rounded-xl border border-gray-200">
//             <img
//               src={preview}
//               alt="Task proof preview"
//               className="max-h-80 w-full object-contain"
//             />
//           </div>
//         </div>
//       )}

//       {error && (
//         <div
//           role="alert"
//           className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
//         >
//           {error}
//         </div>
//       )}

//       <button
//         type="button"
//         onClick={handleSubmit}
//         disabled={loading}
//         className="
//           flex
//           h-12
//           w-full
//           items-center
//           justify-center
//           rounded-xl
//           bg-green-600
//           font-semibold
//           text-white
//           transition
//           hover:bg-green-700
//           disabled:cursor-not-allowed
//           disabled:opacity-60
//         "
//       >
//         {loading
//           ? "Submitting..."
//           : "Submit for verification"}
//       </button>
//     </div>
//   );
// }















"use client";

import { useEffect, useState } from "react";

type TaskSubmissionFormProps = {
  taskId: string;
  requiresProof: boolean;
};

type SubmissionStatus = "pending" | "approved" | "rejected" | null;

export default function TaskSubmissionForm({
  taskId,
  requiresProof,
}: TaskSubmissionFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [retryAvailableAt, setRetryAvailableAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>(null);

  const [checkingSubmission, setCheckingSubmission] = useState(true);

  /*
   * Check the current user's submission.
   */
  useEffect(() => {
    let cancelled = false;

    const checkSubmission = async () => {
      try {
        setCheckingSubmission(true);

        const response = await fetch(
          `/api/tasks/submission?taskId=${encodeURIComponent(taskId)}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to check submission."
          );
        }

        if (cancelled) return;

        if (data.submission) {
          setSubmissionStatus(data.submission.status);

          const submission = data.submission;

          // Support older rejected submissions that have reviewedAt
          // or rejectedAt but do not yet have retryAvailableAt.
          const rejectionTime =
            submission.rejectedAt ?? submission.reviewedAt;

          const retryAt =
            submission.retryAvailableAt ??
            (rejectionTime != null
              ? rejectionTime + 60_000
              : null);

          setRetryAvailableAt(retryAt);
        } else {
          setSubmissionStatus(null);
          setRetryAvailableAt(null);
          setSecondsLeft(0);
        }
      } catch (err) {
        if (cancelled) return;

        console.error("Submission status error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to check task status."
        );
      } finally {
        if (!cancelled) {
          setCheckingSubmission(false);
        }
      }
    };

    void checkSubmission();

    return () => {
      cancelled = true;
    };
  }, [taskId]);

  /*
   * Update the rejection countdown every second.
   */
  useEffect(() => {
    if (
      submissionStatus !== "rejected" ||
      retryAvailableAt === null
    ) {
      setSecondsLeft(0);
      return;
    }

    const updateCountdown = () => {
      setSecondsLeft(
        Math.max(
          0,
          Math.ceil((retryAvailableAt - Date.now()) / 1000)
        )
      );
    };

    updateCountdown();

    const timer = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(timer);
  }, [submissionStatus, retryAvailableAt]);

  /*
   * Release the screenshot preview URL when it changes
   * or when the component unmounts.
   */
  useEffect(() => {
    if (!preview) return;

    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  /*
   * Handle screenshot selection.
   */
  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setError("");

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  /*
   * Submit the task and screenshot.
   */
  const handleSubmit = async () => {
    setError("");

    if (loading) return;

    if (requiresProof && !file) {
      setError("Please upload a screenshot before submitting.");
      return;
    }

    // Do not allow resubmission while the cooldown is active.
    if (
      submissionStatus === "rejected" &&
      (retryAvailableAt === null || Date.now() < retryAvailableAt)
    ) {
      setError(
        retryAvailableAt === null
          ? "The retry time could not be verified. Please refresh or contact support."
          : `Please wait ${Math.ceil(
              (retryAvailableAt - Date.now()) / 1000
            )} seconds before resubmitting.`
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * 1. Request an authenticated upload URL.
       */
      const uploadUrlResponse = await fetch("/api/tasks/upload", {
        method: "POST",
      });

      const uploadUrlData = await uploadUrlResponse.json();

      if (!uploadUrlResponse.ok) {
        throw new Error(
          uploadUrlData.error || "Unable to prepare image upload."
        );
      }

      /*
       * 2. Upload the screenshot to Convex Storage.
       */
      let proofStorageId: string | undefined;

      if (file) {
        const uploadResponse = await fetch(
          uploadUrlData.uploadUrl,
          {
            method: "POST",
            headers: {
              "Content-Type": file.type,
            },
            body: file,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error("Unable to upload screenshot.");
        }

        const uploadResult = await uploadResponse.json();

        proofStorageId = uploadResult.storageId;

        if (!proofStorageId) {
          throw new Error("Image upload did not return a storage ID.");
        }
      }

      /*
       * 3. Create the task submission.
       */
      const submissionResponse = await fetch("/api/tasks/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
          proofStorageId,
        }),
      });

      const submissionData = await submissionResponse.json();

      if (!submissionResponse.ok) {
        throw new Error(
          submissionData.error || "Unable to submit task."
        );
      }

      /*
       * 4. Update the interface.
       */
      setSubmissionStatus("pending");
      setRetryAvailableAt(null);
      setSecondsLeft(0);
      setFile(null);
      setPreview("");
    } catch (err) {
      console.error("Submission error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit the task."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Loading state.
   */
  if (checkingSubmission) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">
          Checking task status...
        </p>
      </div>
    );
  }

  /*
   * Submission is pending.
   */
  if (submissionStatus === "pending") {
    return (
      <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6">
        <h2 className="text-lg font-semibold text-yellow-900">
          Submission under review
        </h2>

        <p className="mt-2 text-sm leading-6 text-yellow-800">
          Your screenshot has been submitted successfully.
          Please wait while it is reviewed.
        </p>

        <div className="mt-4 inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
          Pending review
        </div>
      </div>
    );
  }

  /*
   * Submission has been approved.
   */
  if (submissionStatus === "approved") {
    return (
      <div className="rounded-3xl border border-green-200 bg-green-50 p-6">
        <h2 className="text-lg font-semibold text-green-900">
          Task completed
        </h2>

        <p className="mt-2 text-sm leading-6 text-green-800">
          Your task has been approved successfully. Your reward
          has been processed.
        </p>

        <div className="mt-4 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          Approved
        </div>
      </div>
    );
  }

  /*
   * Rejected submission: show the countdown first.
   */
  if (submissionStatus === "rejected") {
    const retryTimeUnknown = retryAvailableAt === null;

    return (
      <div className="space-y-5">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-900">
            Submission rejected
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-800">
            Your previous submission was not approved.
            Review your proof before trying again.
          </p>

          <div className="mt-4 inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
            Rejected
          </div>

          {retryTimeUnknown ? (
            <p className="mt-4 text-sm font-medium text-red-800">
              Your retry time could not be verified. Refresh the
              page or contact support before submitting again.
            </p>
          ) : secondsLeft > 0 ? (
            <p className="mt-4 text-sm font-medium text-red-800">
              You can resubmit in{" "}
              <span className="tabular-nums">
                {Math.floor(secondsLeft / 60)
                  .toString()
                  .padStart(2, "0")}
                :
                {(secondsLeft % 60).toString().padStart(2, "0")}
              </span>
              .
            </p>
          ) : (
            <p className="mt-4 text-sm font-medium text-green-700">
              You can now upload new proof and resubmit.
            </p>
          )}
        </div>

        {retryAvailableAt !== null && secondsLeft === 0 && (
          <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Submit new proof
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Upload a new screenshot for review.
              </p>
            </div>

            {requiresProof && (
              <div className="space-y-3">
                <label
                  htmlFor="task-proof"
                  className="block text-sm font-medium text-gray-700"
                >
                  Screenshot proof
                </label>

                <input
                  id="task-proof"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="block w-full rounded-xl border border-gray-300 bg-gray-50 p-3 text-sm"
                />

                <p className="text-xs text-gray-400">
                  JPG, PNG or WebP. Maximum size: 5MB.
                </p>
              </div>
            )}

            {preview && (
              <img
                src={preview}
                alt="New task proof preview"
                className="max-h-80 w-full rounded-xl border border-gray-200 object-contain"
              />
            )}

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || (requiresProof && !file)}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-green-600 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Resubmit for verification"}
            </button>
          </div>
        )}
      </div>
    );
  }

  /*
   * No submission yet.
   */
  return (
    <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Submit your task
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          {requiresProof
            ? "Complete the task and upload a screenshot as proof."
            : "Complete the task and submit it for verification."}
        </p>
      </div>

      {requiresProof && (
        <div className="space-y-3">
          <label
            htmlFor="task-proof"
            className="block text-sm font-medium text-gray-700"
          >
            Screenshot proof
          </label>

          <input
            id="task-proof"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
            className="block w-full cursor-pointer rounded-xl border border-gray-300 bg-gray-50 p-3 text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-green-600 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-green-700"
          />

          <p className="text-xs text-gray-400">
            JPG, PNG or WebP. Maximum size: 5MB.
          </p>
        </div>
      )}

      {preview && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">
            Screenshot preview
          </p>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <img
              src={preview}
              alt="Task proof preview"
              className="max-h-80 w-full object-contain"
            />
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || (requiresProof && !file)}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-green-600 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Submit for verification"}
      </button>
    </div>
  );
}
