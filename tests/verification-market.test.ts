import { describe, it, expect, beforeEach, vi } from "vitest";

type Principal = string;

interface VerifierInfo {
  price: number;
  name: string;
}

const ERR = {
  NOT_AUTHORIZED: 100,
  VERIFIER_NOT_FOUND: 101,
  ALREADY_VERIFIED: 102,
  INSUFFICIENT_FUNDS: 103,
};

let verifiers: Record<Principal, VerifierInfo>;
let verifications: Record<string, boolean>;
let balances: Record<Principal, number>;

beforeEach(() => {
  verifiers = {};
  verifications = {};
  balances = {};
});


function registerVerifier(sender: Principal, price: number, name: string) {
  verifiers[sender] = { price, name };
  return { ok: true };
}

function updateVerifierPrice(sender: Principal, newPrice: number) {
  if (!verifiers[sender]) return { err: ERR.VERIFIER_NOT_FOUND };
  verifiers[sender].price = newPrice;
  return { ok: true };
}

function getVerifierInfo(verifier: Principal) {
  const info = verifiers[verifier];
  return info ? { ok: info } : { err: ERR.VERIFIER_NOT_FOUND };
}

function getVerification(user: Principal, verifier: Principal) {
  const key = `${user}::${verifier}`;
  return { ok: verifications[key] ?? false };
}

function buyVerification(sender: Principal, verifier: Principal) {
  if (sender === verifier) return { err: ERR.NOT_AUTHORIZED };
  if (!verifiers[verifier]) return { err: ERR.VERIFIER_NOT_FOUND };

  const key = `${sender}::${verifier}`;
  if (verifications[key]) return { err: ERR.ALREADY_VERIFIED };

  const price = verifiers[verifier].price;
  const balance = balances[sender] ?? 0;
  if (balance < price) return { err: ERR.INSUFFICIENT_FUNDS };

  // Transfer mock
  balances[sender] -= price;
  balances[verifier] = (balances[verifier] ?? 0) + price;

  verifications[key] = true;
  return { ok: true };
}


describe("Verification Market (mocked)", () => {
  const verifier = "wallet_1";
  const user = "wallet_2";

  beforeEach(() => {
    balances[verifier] = 0;
    balances[user] = 150_000_000;
  });

  it("allows verifier registration", () => {
    const result = registerVerifier(verifier, 100_000_000, "Verifier A");
    expect(result).toEqual({ ok: true });
    expect(verifiers[verifier]).toEqual({ price: 100_000_000, name: "Verifier A" });
  });

  it("updates verifier price", () => {
    registerVerifier(verifier, 100_000_000, "Verifier A");
    const result = updateVerifierPrice(verifier, 120_000_000);
    expect(result).toEqual({ ok: true });
    expect(verifiers[verifier].price).toBe(120_000_000);
  });

  it("returns error if verifier not found during price update", () => {
    const result = updateVerifierPrice("unknown", 100_000_000);
    expect(result).toEqual({ err: ERR.VERIFIER_NOT_FOUND });
  });

  it("handles successful verification purchase", () => {
    registerVerifier(verifier, 100_000_000, "Verifier A");

    const result = buyVerification(user, verifier);
    expect(result).toEqual({ ok: true });

    const key = `${user}::${verifier}`;
    expect(verifications[key]).toBe(true);
    expect(balances[user]).toBe(50_000_000);
    expect(balances[verifier]).toBe(100_000_000);
  });

  it("prevents duplicate verification purchase", () => {
    registerVerifier(verifier, 100_000_000, "Verifier A");
    buyVerification(user, verifier);
    const result = buyVerification(user, verifier);
    expect(result).toEqual({ err: ERR.ALREADY_VERIFIED });
  });

  it("returns error if balance is insufficient", () => {
    registerVerifier(verifier, 200_000_000, "Verifier A");
    const result = buyVerification(user, verifier);
    expect(result).toEqual({ err: ERR.INSUFFICIENT_FUNDS });
  });

  it("prevents users from verifying themselves", () => {
    registerVerifier(user, 100_000_000, "Self");
    const result = buyVerification(user, user);
    expect(result).toEqual({ err: ERR.NOT_AUTHORIZED });
  });
});
