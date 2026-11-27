export type PaymentProvider = {
  createPayment(payment: { cardToken: string; amount: number; billId: string }): Promise<{ reference: string }>;
};

// The guest types their card into the provider's form, and the app only ever
// gets a token for it.
// docqet:implements capability:deposits capability:pay-by-link component:payments
// docqet:gap component:payments#no-timeout-on-provider-calls
// docqet:implements rule:card-numbers-are-never-kept
export async function takePayment(provider: PaymentProvider, cardToken: string, amount: number, billId: string): Promise<string> {
  const { reference } = await provider.createPayment({ cardToken, amount, billId });
  return reference;
}
