---
description: Extracts comprehensive profile information from an active LinkedIn profile in the integrated browser and outputs structured JSON.
---

# Extract LinkedIn Profile

Use this skill when the user asks to extract a LinkedIn profile from the active browser tab.

## Workflow

1.  **Verify Browser State**: Ensure you have an active LinkedIn profile page open in the shared browser.
2.  **Execute Extraction Script**: Use the `run_playwright_code` tool to run the following snippet. This uses Playwright's locator API (`:has-text()`, `xpath=ancestor::`) which is more reliable than class-based selectors since LinkedIn obfuscates its CSS class names.

```javascript
// --- DOM anchor: find Contact Info link and navigate up to parent containers ---
const contactInfoEl = page.locator('a:has-text("Contact info")').first();
const contactParentEl = contactInfoEl.locator("xpath=ancestor::div[1]");
const summaryEl = contactParentEl.locator("xpath=ancestor::div[1]");
const profileImageEl = page.locator('[aria-label="Profile photo"] img').first();
const aboutEl = page.locator('section:has(h2:has-text("About"))');

// --- Basic info ---
const name = await summaryEl
  .locator("> div h2")
  .first()
  .innerText()
  .catch(() => null);
const headline = await summaryEl
  .locator("> p:nth-child(2)")
  .first()
  .innerText()
  .catch(() => null);
const thirdLine = await summaryEl
  .locator("> p:nth-child(3)")
  .first()
  .innerText()
  .catch(() => null);
const [company, college] = (thirdLine ?? "").split(" · ").map((s) => s.trim());
const location = await contactParentEl
  .locator("> p")
  .first()
  .innerText()
  .catch(() => null);

// --- Profile image: pick the largest (last) entry from srcset ---
const srcset = await profileImageEl.getAttribute("srcset").catch(() => null);
const profileImage =
  srcset
    ?.split(",")
    .map((s) => s.trim().split(" ")[0])
    .pop() ?? null;

// --- About section ---
const about = await aboutEl
  .locator('span[data-testid="expandable-text-box"]')
  .first()
  .innerText()
  .catch(() => null);

// --- Contact info dialog ---
await contactInfoEl.click();
const dialogEl = page.locator("dialog[open]").first();
await dialogEl.waitFor({ timeout: 10000 });

const getDialogField = (label) =>
  dialogEl
    .locator(`p:has-text("${label}") + p`)
    .first()
    .innerText()
    .catch(() => null);

const linkedinUrl = await getDialogField("profile");
const website = await getDialogField("Website");
const email = await getDialogField("Email");
const rawPhone = await getDialogField("Phone");
const phone = rawPhone?.replace(/\D/g, "");
const birthday = await getDialogField("Birthday");
const connectedSince = await getDialogField("Connected since");

// Dismiss dialog
await page
  .locator('dialog[open] button[aria-label="Dismiss"]')
  .first()
  .click()
  .catch(() => {});

// --- Assemble result ---
const profileData = {
  name,
  headline,
  location,
  profileImage,
  company,
  college,
  about,
  email,
  phone: phone?.length === 10 ? "+1 " + phone : (phone ?? null),
  website,
  linkedinUrl,
  birthday,
  connectedSince,
};

return JSON.stringify(profileData, null, 2);
```

3.  **Process with LLM**: The script returns a structured JSON object. Pass it directly to the next step without re-interpreting it.

4.  **Database Integration**: After receiving the clean JSON from the script, proceed with the import:
    1.  Save the generated JSON to a temporary file named `.linkedin-temp.json`.
    2.  Run the import script: `node scripts/import-linkedin.mjs .linkedin-temp.json`.
    3.  Delete the temporary file.
