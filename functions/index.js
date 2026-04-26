import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import fetch from "node-fetch";

initializeApp();

export const onJobCreated = onDocumentCreated("jobs/{jobId}", async (event) => {
  const data = event.data?.data();
  if (!data) return;

  const db = getFirestore();
  const jobId = event.params.jobId;
  const jobRef = db.collection("jobs").doc(jobId);

  try {
    await jobRef.update({
      status: "processing",
      updatedAt: FieldValue.serverTimestamp()
    });

    const response = await fetch("http://127.0.0.1:8010/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        dataset_url: data.payload.datasetUrl
      })
    });

    const result = await response.json();

    await jobRef.update({
      status: "completed",
      result,
      updatedAt: FieldValue.serverTimestamp()
    });

  } catch (err) {
    await jobRef.update({
      status: "failed",
      error: err.message,
      updatedAt: FieldValue.serverTimestamp()
    });
  }
});