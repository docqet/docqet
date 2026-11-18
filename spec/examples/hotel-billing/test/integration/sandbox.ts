import type { PaymentProvider } from "../../src/payments/provider";

type Sandboxed = PaymentProvider & { requests: unknown[] };

// The payment provider's test mode, with its API key from the local stack's
// environment, recording each request the app sent it.
export function sandboxProvider(): Sandboxed {
  const requests: unknown[] = [];
  return {
    requests,
    async createPayment(payment) {
      requests.push(payment);
      const response = await fetch(`${process.env.PAYMENTS_SANDBOX_URL}/payments`, {
        method: "POST",
        headers: { authorization: `Bearer ${process.env.PAYMENTS_SANDBOX_KEY}`, "content-type": "application/json" },
        body: JSON.stringify(payment),
      });
      return (await response.json()) as { reference: string };
    },
  };
}

export const sandboxRequests = (provider: PaymentProvider) => (provider as Sandboxed).requests;
