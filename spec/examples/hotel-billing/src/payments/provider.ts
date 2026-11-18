export type PaymentProvider = {
  createPayment(payment: { cardToken: string; amount: number; billId: string }): Promise<{ reference: string }>;
};

// The guest types their card into the provider's form, and the app only ever
// gets a token for it.
// docket:implements rule:payments/card-numbers-are-never-kept
export async function takePayment(provider: PaymentProvider, cardToken: string, amount: number, billId: string): Promise<string> {
  const { reference } = await provider.createPayment({ cardToken, amount, billId });
  return reference;
}
