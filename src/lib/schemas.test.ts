import { describe, it, expect } from "vitest";
import { loginSchema, signupSchema, ProfileSchema } from "./schemas";

describe("loginSchema", () => {
  // Guards the lockout bug: accounts made under the old, weaker password
  // rule must still pass login validation.
  it("accepts a password that today's signup policy would reject", () => {
    const result = loginSchema.safeParse({
      email: "legacy@example.com",
      password: "oldpass",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("signupSchema", () => {
  const valid = {
    email: "new@example.com",
    password: "Passw0rd",
    confirmPassword: "Passw0rd",
  };

  it("accepts a strong, matching password", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a password with no uppercase letter", () => {
    const result = signupSchema.safeParse({
      ...valid,
      password: "passw0rd",
      confirmPassword: "passw0rd",
    });
    expect(result.success).toBe(false);
  });

  it("puts the mismatch error on confirmPassword, not the form root", () => {
    const result = signupSchema.safeParse({
      ...valid,
      confirmPassword: "Different1",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["confirmPassword"]);
  });
});

describe("ProfileSchema", () => {
  it("allows an empty display name", () => {
    const result = ProfileSchema.safeParse({ name: "", bio: "", avatar: "🦊" });
    expect(result.success).toBe(true);
  });

  it("rejects a one-character name", () => {
    const result = ProfileSchema.safeParse({
      name: "A",
      bio: "",
      avatar: "🦊",
    });
    expect(result.success).toBe(false);
  });
});
