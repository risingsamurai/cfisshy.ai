import { onCall } from "firebase-functions/v2/https";

export const analyze = onCall(async (request) => {
  const response = await fetch(`${process.env.CLOUD_RUN_ANALYZER_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request.data)
  });

  if (!response.ok) {
    throw new Error("Bias analysis failed");
  }

  return response.json();
});
