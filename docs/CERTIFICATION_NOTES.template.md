# Partner Center Certification Notes Template

This repository file is an intentionally secret-free template. Create the real
certification note only in Partner Center's private **Notes for certification**
field. Never paste a credential into this file, a commit, an issue, a workflow
log, a screenshot, or a public release.

Product: **Retail Decision Studio by LAI ZEYU**
Designed and authored by **LAI ZEYU（来泽宇）**.

## Reviewer test access

- Dedicated reviewer OpenAI API key: `{{PASTE_IN_PARTNER_CENTER_ONLY}}`
- Key scope/limit: `{{DESCRIBE_THE_REVIEW_ONLY_SPEND_OR_USAGE_LIMIT}}`
- Key expiration (UTC): `{{YYYY-MM-DD}}`
- Revocation: `{{CONFIRM_THE_KEY_CAN_BE_REVOKED_IMMEDIATELY_AFTER_CERTIFICATION}}`
- Exact model to select: `{{EXACT_MODEL_SHOWN_IN_THE_APP}}`
- Connection-test endpoint: `https://api.openai.com/v1/models/{{URL_ENCODED_EXACT_MODEL}}`
- Interpretation endpoint: `https://api.openai.com/v1/responses`

The key must be newly created for Microsoft certification, limited to the
minimum review usage, time-limited, and independently revocable. Do not reuse a
personal, production, organization-wide, or unrestricted credential. Revoke it
as soon as certification finishes or the stated expiration is reached.

Before the Store candidate is built, the same exact protected model variable
and dedicated review key must pass both a live `/v1/models/{model}` lookup and a
real non-stored strict JSON-schema `/v1/responses` round trip. The current app
offers only official public API IDs `gpt-5`, `gpt-5-mini`, and `gpt-5-nano`.
Do not claim review access from the model name alone.

## Connection-test steps

1. Launch **Retail Decision Studio by LAI ZEYU**.
2. Select **API settings** in the header.
3. Paste the dedicated reviewer key from this private Partner Center note.
4. Select the exact model stated above.
5. Select **Test connection**.
6. Expected result: the dialog reports a successful connection for that exact
   model. Applying settings alone does not contact OpenAI.

## Interpretation-test steps

1. Select **Load demo** and complete **Generate assessment**.
2. Open the generated report and select **Generate interpretation**.
3. Expected result: an interpretation is returned in the selected app language.
4. Confirm that the locked deterministic score remains `74.3 / 100` and that
   the optional AI text does not replace or modify the locked score or theory
   assessment.

## Reviewer and cleanup notes

- The deterministic assessment works without an account or API key.
- The OpenAI API is a separate third-party service. Retail Decision Studio does
  not include an API key, API credits, or a ChatGPT subscription.
- The reviewer key is held only in renderer memory for the open page and is not
  persisted by the application.
- After testing, use **About & privacy → Clear local data**, close the app, and
  remove any locally copied credential.
- Maintainer: revoke the dedicated reviewer key immediately after the
  certification result, and record the revocation outside the public repo.
