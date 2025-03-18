export interface PaymentResponseDto {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
}
