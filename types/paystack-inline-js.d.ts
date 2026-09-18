declare module "@paystack/inline-js" {
  interface ResumeTransactionCallbacks {
    onSuccess?: (transaction: { reference: string }) => void;
    onLoad?: () => void;
    onCancel?: () => void;
    onError?: (error: { message?: string }) => void;
  }

  export default class PaystackPop {
    resumeTransaction(accessCode: string, callbacks?: ResumeTransactionCallbacks): void;
  }
}
