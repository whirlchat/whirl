// @ts-expect-error Bun provides this module to its test runner; the Next app
// intentionally does not include Bun's ambient types in its client tsconfig.
import { describe, expect, test } from "bun:test";

import {
  beginClientTrust,
  clientTrustFactor,
  sendClientTrustCode,
  verifyClientTrustCode,
  type ClientTrustSignIn,
} from "./client-trust";

/* A mocked Clerk sign-in object for the Device Trust flow: a correct
   password on a new device leaves the status at `needs_client_trust`
   until the emailed code is verified, then Clerk flips it to `complete`.
   No live Clerk instance is involved. */
function mockSignIn(
  overrides: Partial<{
    status: string | null;
    factors: Array<{ strategy: string }>;
    sendError: { message: string } | null;
    verifyError: { message: string } | null;
  }> = {},
) {
  const calls: string[] = [];
  /* Mutable inside the mock (a successful verify flips the status, like
     Clerk does); the helper only ever reads it through ClientTrustSignIn. */
  const mock = {
    status: overrides.status ?? ("needs_client_trust" as string | null),
    supportedSecondFactors: overrides.factors ?? [
      { strategy: "email_code" },
    ],
    calls,
    mfa: {
      sendEmailCode: async () => {
        calls.push("sendEmailCode");
        return { error: overrides.sendError ?? null };
      },
      sendPhoneCode: async () => {
        calls.push("sendPhoneCode");
        return { error: overrides.sendError ?? null };
      },
      verifyEmailCode: async ({ code }: { code: string }) => {
        calls.push(`verifyEmailCode:${code}`);
        const error = overrides.verifyError ?? null;
        if (!error) mock.status = "complete";
        return { error };
      },
      verifyPhoneCode: async ({ code }: { code: string }) => {
        calls.push(`verifyPhoneCode:${code}`);
        const error = overrides.verifyError ?? null;
        if (!error) mock.status = "complete";
        return { error };
      },
    },
  };
  return mock as ClientTrustSignIn & { calls: string[] };
}

describe("clientTrustFactor", () => {
  test("prefers the email code Clerk offers for a new device", () => {
    const signIn = mockSignIn({
      factors: [{ strategy: "phone_code" }, { strategy: "email_code" }],
    });
    expect(clientTrustFactor(signIn)).toBe("email_code");
  });

  test("falls back to a phone code when that is all Clerk offers", () => {
    const signIn = mockSignIn({ factors: [{ strategy: "phone_code" }] });
    expect(clientTrustFactor(signIn)).toBe("phone_code");
  });

  test("returns null when Clerk offers no code factor", () => {
    const signIn = mockSignIn({ factors: [{ strategy: "email_link" }] });
    expect(clientTrustFactor(signIn)).toBeNull();
    expect(clientTrustFactor(mockSignIn({ factors: [] }))).toBeNull();
  });
});

describe("beginClientTrust", () => {
  test("sends an email code when the password step needs client trust", async () => {
    const signIn = mockSignIn();
    const { factor, error } = await beginClientTrust(signIn);
    expect(error).toBeNull();
    expect(factor).toBe("email_code");
    expect(signIn.calls).toEqual(["sendEmailCode"]);
  });

  test("sends a phone code when email code is not offered", async () => {
    const signIn = mockSignIn({ factors: [{ strategy: "phone_code" }] });
    const { factor, error } = await beginClientTrust(signIn);
    expect(error).toBeNull();
    expect(factor).toBe("phone_code");
    expect(signIn.calls).toEqual(["sendPhoneCode"]);
  });

  test("does nothing for a sign-in that is not awaiting client trust", async () => {
    const signIn = mockSignIn({ status: "complete" });
    const { factor, error } = await beginClientTrust(signIn);
    expect(factor).toBeNull();
    expect(error).toBeNull();
    expect(signIn.calls).toEqual([]);
  });

  test("sends nothing when Clerk offers no completable code factor", async () => {
    const signIn = mockSignIn({ factors: [{ strategy: "email_link" }] });
    const { factor, error } = await beginClientTrust(signIn);
    expect(factor).toBeNull();
    expect(error).toBeNull();
    expect(signIn.calls).toEqual([]);
  });

  test("surfaces a send failure instead of pretending a code is on its way", async () => {
    const signIn = mockSignIn({ sendError: { message: "Too many attempts" } });
    const { factor, error } = await beginClientTrust(signIn);
    expect(factor).toBe("email_code");
    expect(error?.message).toBe("Too many attempts");
  });
});

describe("verifyClientTrustCode", () => {
  test("verifying the emailed code completes the sign-in", async () => {
    const signIn = mockSignIn();
    await beginClientTrust(signIn);
    const { error } = await verifyClientTrustCode(
      signIn,
      "email_code",
      "123456",
    );
    expect(error).toBeNull();
    expect(signIn.calls).toEqual(["sendEmailCode", "verifyEmailCode:123456"]);
    expect(signIn.status).toBe("complete");
  });

  test("a wrong code leaves the sign-in awaiting client trust", async () => {
    const signIn = mockSignIn({
      verifyError: { message: "Incorrect code" },
    });
    const { error } = await verifyClientTrustCode(
      signIn,
      "email_code",
      "000000",
    );
    expect(error?.message).toBe("Incorrect code");
    expect(signIn.status).toBe("needs_client_trust");
  });

  test("verifies a phone code through the phone path", async () => {
    const signIn = mockSignIn({ factors: [{ strategy: "phone_code" }] });
    const { error } = await verifyClientTrustCode(
      signIn,
      "phone_code",
      "654321",
    );
    expect(error).toBeNull();
    expect(signIn.calls).toEqual(["verifyPhoneCode:654321"]);
    expect(signIn.status).toBe("complete");
  });
});

describe("sendClientTrustCode", () => {
  test("resends through the same factor that began the flow", async () => {
    const signIn = mockSignIn();
    const { error } = await sendClientTrustCode(signIn, "email_code");
    expect(error).toBeNull();
    expect(signIn.calls).toEqual(["sendEmailCode"]);
  });
});
