"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { IconMailFilled } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";

import {
  BackButton,
  CaptchaSlot,
  describeError,
  Divider,
  ErrorNote,
  GoogleButton,
  StepTitle,
  stepMotion,
  SubmitButton,
  SubtleAction,
  SwitchHint,
} from "./bits";
import {
  beginClientTrust,
  sendClientTrustCode,
  verifyClientTrustCode,
  type ClientTrustFactor,
} from "./client-trust";
import { CodeField, IconField, PasswordField } from "./fields";

type Step =
  | "start"
  | "verify-2fa"
  | "verify-client-trust"
  | "forgot-email"
  | "forgot-reset";
type SecondFactor = "totp" | "phone_code" | "backup_code";

export function SignInPanel({
  onSwitch,
  onDone,
}: {
  onSwitch: () => void;
  onDone: () => void;
}) {
  const { signIn } = useSignIn();
  const [step, setStep] = useState<Step>("start");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [factor, setFactor] = useState<SecondFactor>("totp");
  const [code, setCode] = useState("");
  const [trustFactor, setTrustFactor] =
    useState<ClientTrustFactor>("email_code");
  const [trustCode, setTrustCode] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goTo = (next: Step) => {
    setError(null);
    setStep(next);
  };

  /* A completed sign-in becomes the active session; the modal's owner
     unmounts us once Clerk reports a user, so just report success. */
  const finalize = async () => {
    const { error } = await signIn.finalize();
    if (error) {
      setError(describeError(error));
      return;
    }
    onDone();
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn || busy) return;
    setError(null);
    setBusy(true);

    const { error } = await signIn.password({ identifier: email, password });
    if (error) {
      setError(describeError(error));
      setBusy(false);
      return;
    }

    if (signIn.status === "complete") {
      await finalize();
    } else if (signIn.status === "needs_second_factor") {
      const factors = signIn.supportedSecondFactors ?? [];
      if (factors.some((f) => f.strategy === "totp")) {
        setFactor("totp");
      } else if (factors.some((f) => f.strategy === "phone_code")) {
        setFactor("phone_code");
        await signIn.mfa.sendPhoneCode();
      } else {
        setFactor("backup_code");
      }
      setStep("verify-2fa");
    } else if (signIn.status === "needs_client_trust") {
      /* Device Trust: Clerk has not seen this browser before, so the
         password alone is not enough — it wants a code it sends us.
         Send it and ask for it instead of dead-ending here. */
      const { factor, error } = await beginClientTrust(signIn);
      if (error) {
        setError(describeError(error));
      } else if (factor) {
        setTrustFactor(factor);
        setTrustCode("");
        setStep("verify-client-trust");
      } else {
        setError("Couldn't finish signing in. Try again.");
      }
    } else {
      setError("Couldn't finish signing in. Try again.");
    }
    setBusy(false);
  };

  const handleClientTrust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn || busy) return;
    setError(null);
    setBusy(true);

    const { error } = await verifyClientTrustCode(
      signIn,
      trustFactor,
      trustCode,
    );

    if (error) {
      setError(describeError(error));
    } else if (signIn.status === "complete") {
      await finalize();
    } else {
      setError("Couldn't verify the code. Try again.");
    }
    setBusy(false);
  };

  const handleClientTrustResend = async () => {
    if (!signIn || busy) return;
    setError(null);
    const { error } = await sendClientTrustCode(signIn, trustFactor);
    if (error) setError(describeError(error));
  };

  const handleSecondFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn || busy) return;
    setError(null);
    setBusy(true);

    const { error } =
      factor === "totp"
        ? await signIn.mfa.verifyTOTP({ code })
        : factor === "phone_code"
          ? await signIn.mfa.verifyPhoneCode({ code })
          : await signIn.mfa.verifyBackupCode({ code });

    if (error) {
      setError(describeError(error));
    } else if (signIn.status === "complete") {
      await finalize();
    } else {
      setError("Couldn't verify the code. Try again.");
    }
    setBusy(false);
  };

  const handleForgotEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn || busy) return;
    setError(null);
    setBusy(true);

    const created = await signIn.create({ identifier: email });
    const { error } = created.error
      ? created
      : await signIn.resetPasswordEmailCode.sendCode();
    if (error) {
      setError(describeError(error));
    } else {
      setStep("forgot-reset");
    }
    setBusy(false);
  };

  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn || busy) return;
    setError(null);
    setBusy(true);

    const verified = await signIn.resetPasswordEmailCode.verifyCode({
      code: resetCode,
    });
    const { error } = verified.error
      ? verified
      : await signIn.resetPasswordEmailCode.submitPassword({
          password: newPassword,
        });

    if (error) {
      setError(describeError(error));
    } else if (signIn.status === "complete") {
      await finalize();
    } else if (signIn.status === "needs_second_factor") {
      setFactor("totp");
      setStep("verify-2fa");
    } else {
      setError("Couldn't reset the password. Try again.");
    }
    setBusy(false);
  };

  const handleGoogle = async () => {
    if (!signIn || busy) return;
    setError(null);
    setBusy(true);
    setRedirecting(true);
    const { error } = await signIn.sso({
      strategy: "oauth_google",
      redirectUrl: "/",
      redirectCallbackUrl: "/sso-callback",
    });
    if (error) {
      setError(describeError(error));
      setBusy(false);
      setRedirecting(false);
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {step === "start" && (
        <motion.div key="start" {...stepMotion}>
          <StepTitle
            title="Welcome back"
            subtitle="Sign in to your Whirl account."
          />
          <GoogleButton
            onClick={handleGoogle}
            disabled={busy}
            redirecting={redirecting}
          />
          <Divider />
          <form onSubmit={handlePassword} className="flex flex-col gap-2.5">
            <IconField
              icon={IconMailFilled}
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={setEmail}
              required
              autoFocus
            />
            <PasswordField
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={setPassword}
              required
            />
            <SubtleAction
              onClick={() => goTo("forgot-email")}
              className="-mt-0.5 self-end"
            >
              Forgot password?
            </SubtleAction>
            <ErrorNote message={error} />
            <CaptchaSlot />
            <SubmitButton busy={busy && !redirecting} held={redirecting}>
              Continue
            </SubmitButton>
          </form>
          <SwitchHint
            prompt="Don't have an account?"
            actionLabel="Sign up"
            onClick={onSwitch}
          />
        </motion.div>
      )}

      {step === "verify-2fa" && (
        <motion.div key="verify-2fa" {...stepMotion}>
          <BackButton onClick={() => goTo("start")} />
          <StepTitle
            title="Two-factor authentication"
            subtitle={
              factor === "totp"
                ? "Enter the 6-digit code from your authenticator app."
                : factor === "phone_code"
                  ? "Enter the code we just sent to your phone."
                  : "Enter one of your backup codes."
            }
          />
          <form onSubmit={handleSecondFactor} className="flex flex-col gap-2.5">
            <CodeField
              value={code}
              onChange={setCode}
              placeholder={factor === "backup_code" ? "Backup code" : "123456"}
              autoFocus
              required
            />
            {factor !== "backup_code" && (
              <SubtleAction
                onClick={() => {
                  setFactor("backup_code");
                  setCode("");
                }}
                className="-mt-0.5 self-start"
              >
                Use a backup code instead
              </SubtleAction>
            )}
            <ErrorNote message={error} />
            <SubmitButton busy={busy}>Verify</SubmitButton>
          </form>
        </motion.div>
      )}

      {step === "verify-client-trust" && (
        <motion.div key="verify-client-trust" {...stepMotion}>
          <BackButton onClick={() => goTo("start")} />
          <StepTitle
            title="Verify it's you"
            subtitle={
              trustFactor === "email_code"
                ? `This device is new to us, so Clerk sent a 6-digit code to ${email}. Enter it to finish signing in.`
                : "This device is new to us, so Clerk sent a 6-digit code to your phone. Enter it to finish signing in."
            }
          />
          <form onSubmit={handleClientTrust} className="flex flex-col gap-2.5">
            <CodeField
              value={trustCode}
              onChange={setTrustCode}
              placeholder="123456"
              autoFocus
              required
            />
            <SubtleAction
              onClick={handleClientTrustResend}
              className="-mt-0.5 self-start"
            >
              Resend code
            </SubtleAction>
            <ErrorNote message={error} />
            <SubmitButton busy={busy}>Verify</SubmitButton>
          </form>
        </motion.div>
      )}

      {step === "forgot-email" && (
        <motion.div key="forgot-email" {...stepMotion}>
          <BackButton onClick={() => goTo("start")} />
          <StepTitle
            title="Reset your password"
            subtitle="Enter the email tied to your account and we'll send a code."
          />
          <form onSubmit={handleForgotEmail} className="flex flex-col gap-2.5">
            <IconField
              icon={IconMailFilled}
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={setEmail}
              required
              autoFocus
            />
            <ErrorNote message={error} />
            <SubmitButton busy={busy}>Send code</SubmitButton>
          </form>
        </motion.div>
      )}

      {step === "forgot-reset" && (
        <motion.div key="forgot-reset" {...stepMotion}>
          <BackButton onClick={() => goTo("forgot-email")} />
          <StepTitle
            title="Set a new password"
            subtitle={`Enter the code we sent to ${email} and pick a new password.`}
          />
          <form onSubmit={handleForgotReset} className="flex flex-col gap-2.5">
            <CodeField
              value={resetCode}
              onChange={setResetCode}
              placeholder="123456"
              autoFocus
              required
            />
            <PasswordField
              autoComplete="new-password"
              placeholder="New password"
              value={newPassword}
              onChange={setNewPassword}
              required
            />
            <ErrorNote message={error} />
            <SubmitButton busy={busy}>Reset password</SubmitButton>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
