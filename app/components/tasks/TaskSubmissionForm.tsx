"use client";

import { useState } from "react";

type TaskSubmissionFormProps = {
  taskId: string;
  requiresProof: boolean;
};

export default function TaskSubmissionForm({
  taskId,
  requiresProof,
}: TaskSubmissionFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setError("");
    setSuccess(false);

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setFile(selectedFile);

    const objectUrl =
      URL.createObjectURL(selectedFile);

    setPreview(objectUrl);
  };

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
//        * Upload functionality will be connected
//        * to Convex Storage next.
//        */

//       console.log("Task ID:", taskId);
//       console.log("Selected file:", file);

//       await new Promise((resolve) =>
//         setTimeout(resolve, 1000)
//       );

//       setSuccess(true);
//     } catch (error) {
//       console.error(
//         "Submission error:",
//         error
//       );

//       setError(
//         "Unable to submit the task. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

const handleSubmit = async () => {
  setError("");

  if (requiresProof && !file) {
    setError(
      "Please upload a screenshot before submitting."
    );
    return;
  }

  setLoading(true);

  try {
    /*
     * 1. Ask our API for an upload URL.
     */

    const uploadUrlResponse = await fetch(
      "/api/tasks/upload",
      {
        method: "POST",
      }
    );

    const uploadUrlData =
      await uploadUrlResponse.json();

    if (!uploadUrlResponse.ok) {
      throw new Error(
        uploadUrlData.error ||
          "Unable to prepare image upload."
      );
    }

    /*
     * 2. Upload screenshot to Convex Storage.
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
        throw new Error(
          "Unable to upload screenshot."
        );
      }

      const uploadResult =
        await uploadResponse.json();

      proofStorageId = uploadResult.storageId;
    }

    /*
     * 3. Create the task submission.
     */

    const submissionResponse = await fetch(
      "/api/tasks/submit",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
          proofStorageId,
        }),
      }
    );

    const submissionData =
      await submissionResponse.json();

    if (!submissionResponse.ok) {
      throw new Error(
        submissionData.error ||
          "Unable to submit task."
      );
    }

    setSuccess(true);
  } catch (error) {
    console.error(
      "Submission error:",
      error
    );

    setError(
      error instanceof Error
        ? error.message
        : "Unable to submit the task."
    );
  } finally {
    setLoading(false);
  }
};


  if (success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
        <div className="mb-2 text-lg font-semibold text-green-800">
          Task submitted
        </div>

        <p className="text-sm text-green-700">
          Your submission has been sent for
          verification. Your reward will be added
          after the task is approved.
        </p>

        <div className="mt-4 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          Pending review
        </div>
      </div>
    );
  }

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
            className="
              block
              w-full
              cursor-pointer
              rounded-xl
              border
              border-gray-300
              bg-gray-50
              p-3
              text-sm
              text-gray-600
              file:mr-4
              file:rounded-lg
              file:border-0
              file:bg-green-600
              file:px-4
              file:py-2
              file:font-medium
              file:text-white
              hover:file:bg-green-700
            "
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
        disabled={loading}
        className="
          flex
          h-12
          w-full
          items-center
          justify-center
          rounded-xl
          bg-green-600
          font-semibold
          text-white
          transition
          hover:bg-green-700
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {loading
          ? "Submitting..."
          : "Submit for verification"}
      </button>
    </div>
  );
}