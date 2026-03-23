import { describe, it, expect } from "vitest";
import { safeParseTipTap, formatPhone } from "../lib/utils";

describe("safeParseTipTap", () => {
  it("returns null for null input", () => {
    expect(safeParseTipTap(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(safeParseTipTap(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(safeParseTipTap("")).toBeNull();
  });

  it("returns null for whitespace-only string", () => {
    expect(safeParseTipTap("   ")).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    expect(safeParseTipTap("{not json}")).toBeNull();
  });

  it("returns null when JSON is not an object (number)", () => {
    expect(safeParseTipTap("42")).toBeNull();
  });

  it("returns null when JSON is not an object (string)", () => {
    expect(safeParseTipTap('"hello"')).toBeNull();
  });

  it("returns null for JSON null", () => {
    expect(safeParseTipTap("null")).toBeNull();
  });

  it("returns parsed object for valid TipTap JSON", () => {
    const doc = { type: "doc", content: [{ type: "paragraph" }] };
    const result = safeParseTipTap(JSON.stringify(doc));
    expect(result).toEqual(doc);
  });

  it("returns parsed object for a plain object JSON string", () => {
    const obj = { foo: "bar", count: 1 };
    expect(safeParseTipTap(JSON.stringify(obj))).toEqual(obj);
  });
});

describe("formatPhone", () => {
  it("formats 11-digit Korean mobile number", () => {
    expect(formatPhone("01012345678")).toBe("010-1234-5678");
  });

  it("formats 10-digit number", () => {
    expect(formatPhone("0212345678")).toBe("021-234-5678");
  });

  it("strips dashes before formatting", () => {
    expect(formatPhone("010-1234-5678")).toBe("010-1234-5678");
  });

  it("strips spaces before formatting", () => {
    expect(formatPhone("010 1234 5678")).toBe("010-1234-5678");
  });

  it("returns original string for unrecognised length", () => {
    expect(formatPhone("12345")).toBe("12345");
  });

  it("returns original string when digits do not match 10 or 11", () => {
    expect(formatPhone("abc")).toBe("abc");
  });
});
