Track 7 Submission Steps (n8n + NYAN.AI)

1) Import workflow
- Open n8n
- Workflows -> Import from File
- Select hackathon/track7-n8n/nyan-ai-track7-workflow.json

2) Configure auth
- In n8n, set environment variable NYAN_SESSION_TOKEN to a valid logged-in NextAuth session token from your NYAN.AI localhost browser session.
- Keep NYAN.AI running at http://localhost:3000

3) Test with sample input
- Open Webhook - Intake node
- Use sample payload from hackathon/track7-n8n/demo-input-output.json
- Execute workflow once

4) Screenshot required for form
- Zoom out until the full node graph is visible.
- Ensure these are visible in one frame:
  - Webhook - Intake
  - Normalize + Validate
  - NYAN API - Intake
  - NYAN API - Analyse
  - Low Success Probability?
  - Respond Final node
- Keep one successful execution badge visible.

5) Files to upload in Google Form
- JSON: hackathon/track7-n8n/nyan-ai-track7-workflow.json
- Screenshot: capture from n8n canvas and save as PNG
- Explanation: hackathon/track7-n8n/submission-explanation-150w.txt
