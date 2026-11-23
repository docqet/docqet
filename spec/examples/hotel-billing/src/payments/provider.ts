export type PaymentProvider = {
  createPayment(payment: { cardToken: string; amount: number; billId: string }): Promise<{ reference: string }>;
};

// The guest types their card into the provider's form, and the app only ever
// gets a token for it.
// docket:implements capability:deposits capability:pay-by-link component:payments
// docket:gap component:payments#no-timeout-on-provider-calls
// docket:implements rule:card-numbers-are-never-kept@billing
export async function takePayment(provider: PaymentProvider, cardToken: string, amount: number, billId: string): Promise<string> {
  const { reference } = await provider.createPayment({ cardToken, amount, billId });
  return reference;
}
