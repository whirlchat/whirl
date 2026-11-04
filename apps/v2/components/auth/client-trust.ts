/* Clerk Device Trust ("client trust") handling for the custom sign-in form.

   When Device Trust is on, signing in with a correct password from a
   browser Clerk has not seen before does not finish right away: Clerk
   returns the sign-in status `needs_client_trust` and expects the app to
   send a one-time code (email or phone, per `supportedSecondFactors`) and
   verify the code the user enters. Only then does the status become
   `complete`. See https://clerk.com/docs/guides/secure/device-trust

   This module is the state handling for that branch, split out of the
   sign-in panel so it can be unit-tested with a mocked Clerk sign-in
   object — no live Clerk instance needed. */

export type ClientTrustFactor = "email_code" | "phone_code";

export type ClerkCallError = {
  longMessage?: string;
  message?: string;
} | null;

/* The slice of Clerk's sign-in object this flow uses. Clerk's own methods
   resolve with `{ error }` rather than throwing, matching the rest of the
   auth panels; the results are typed as unknown here so a mocked sign-in
   in tests only has to provide the same shape. */
export interface ClientTrustSignIn {
  readonly status: string | null;
  readonly supportedSecondFactors?: ReadonlyArray<{
    readonly strategy: string;
  }> | null;
  readonly mfa: {
    sendEmailCode: () => Promise<unknown>;
    sendPhoneCode: () => Promise<unknown>;
    verifyEmailCode: (args: { code: string }) => Promise<unknown>;
    verifyPhoneCode: (args: { code: string }) => Promise<unknown>;
  };
}

function callError(result: unknown): ClerkCallError {
  if (result && typeof result === "object" && "error" in result) {
    return (result as { error: ClerkCallError }).error ?? null;
  }
  return null;
}

/* Which code Clerk wants for this sign-in, if any. Email wins: that is
   the factor Device Trust sets up for password sign-ins, and the one the
   issue reports. Phone is the other code factor Clerk can offer here. */
export function clientTrustFactor(
  signIn: Pick<ClientTrustSignIn, "supportedSecondFactors">,
): ClientTrustFactor | null {
  const factors = signIn.supportedSecondFactors ?? [];
  if (factors.some((f) => f.strategy === "email_code")) return "email_code";
  if (factors.some((f) => f.strategy === "phone_code")) return "phone_code";
  return null;
}

/* Send (or resend) the client-trust code for the chosen factor. */
export async function sendClientTrustCode(
  signIn: ClientTrustSignIn,
  factor: ClientTrustFactor,
): Promise<{ error: ClerkCallError }> {
  const result =
    factor === "email_code"
      ? await signIn.mfa.sendEmailCode()
      : await signIn.mfa.sendPhoneCode();
  return { error: callError(result) };
}

/* A password sign-in just returned `needs_client_trust`: pick the factor
   Clerk offered and send its code. `factor: null` means Clerk offered no
   code factor we can complete (for example only an email link), so the
   caller should show its generic could-not-finish error instead of a code
   form with nothing behind it. */
export async function beginClientTrust(
  signIn: ClientTrustSignIn,
): Promise<{ factor: ClientTrustFactor | null; error: ClerkCallError }> {
  if (signIn.status !== "needs_client_trust") {
    return { factor: null, error: null };
  }
  const factor = clientTrustFactor(signIn);
  if (!factor) return { factor: null, error: null };
  const { error } = await sendClientTrustCode(signIn, factor);
  return { factor, error };
}

/* Verify the code the user entered. On success Clerk moves the sign-in
   status (read it off the sign-in object afterwards); a wrong code
   resolves with an error and leaves the status at `needs_client_trust`. */
export async function verifyClientTrustCode(
  signIn: ClientTrustSignIn,
  factor: ClientTrustFactor,
  code: string,
): Promise<{ error: ClerkCallError }> {
  const result =
    factor === "email_code"
      ? await signIn.mfa.verifyEmailCode({ code })
      : await signIn.mfa.verifyPhoneCode({ code });
  return { error: callError(result) };
}
