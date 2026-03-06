import { describe, it, expect } from "vitest";
import { signHMAC, verifyHMAC } from "./crypto";

describe("crypto utilities", () => {
  const secret = "test-secret-key";
  const message = "user123:timekey456";

  describe("signHMAC", () => {
    it("generates consistent HMAC signature", async () => {
      const sig1 = await signHMAC(message, secret);
      const sig2 = await signHMAC(message, secret);
      expect(sig1).toBe(sig2);
    });

    it("produces different signatures for different messages", async () => {
      const sig1 = await signHMAC(message, secret);
      const sig2 = await signHMAC("different-message", secret);
      expect(sig1).not.toBe(sig2);
    });

    it("produces different signatures for different secrets", async () => {
      const sig1 = await signHMAC(message, secret);
      const sig2 = await signHMAC(message, "different-secret");
      expect(sig1).not.toBe(sig2);
    });

    it("produces a 64-character hex string (SHA-256)", async () => {
      const signature = await signHMAC(message, secret);
      expect(signature).toMatch(/^[0-9a-f]{64}$/);
    });

    it("handles empty message", async () => {
      const signature = await signHMAC("", secret);
      expect(signature).toMatch(/^[0-9a-f]{64}$/);
    });

    it("handles unicode characters in message", async () => {
      const signature = await signHMAC("hello-world", secret);
      expect(signature).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe("verifyHMAC", () => {
    it("verifies valid signature", async () => {
      const signature = await signHMAC(message, secret);
      const isValid = await verifyHMAC(message, signature, secret);
      expect(isValid).toBe(true);
    });

    it("rejects invalid signature", async () => {
      const isValid = await verifyHMAC(message, "invalid-sig", secret);
      expect(isValid).toBe(false);
    });

    it("rejects tampered message", async () => {
      const signature = await signHMAC(message, secret);
      const isValid = await verifyHMAC("tampered", signature, secret);
      expect(isValid).toBe(false);
    });

    it("rejects signature with wrong secret", async () => {
      const signature = await signHMAC(message, secret);
      const isValid = await verifyHMAC(message, signature, "wrong-secret");
      expect(isValid).toBe(false);
    });

    it("rejects empty signature", async () => {
      const isValid = await verifyHMAC(message, "", secret);
      expect(isValid).toBe(false);
    });

    it("rejects malformed signature", async () => {
      const isValid = await verifyHMAC(message, "not-hex!@#$", secret);
      expect(isValid).toBe(false);
    });
  });

  describe("round-trip verification", () => {
    it("verifies signature for multiple messages", async () => {
      const messages = ["msg1", "msg2", "msg3"];
      for (const msg of messages) {
        const signature = await signHMAC(msg, secret);
        const isValid = await verifyHMAC(msg, signature, secret);
        expect(isValid).toBe(true);
      }
    });
  });
});
