import { onDocumentCreated } from "firebase-functions/v2/firestore";

export const onAuditCreated = onDocumentCreated("audits/{auditId}", async (event) => {
  console.log("Audit created", event.params.auditId);
});
