import { z } from 'zod'

export const TransactionInput = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  symbol: z.string().min(1, 'Symbol required').max(20),
  type: z.enum(['buy', 'sell', 'dividend']),
  shares: z.number().positive('Shares must be positive'),
  price: z.number().nonnegative().optional(),
  fee: z.number().nonnegative().optional(),
  note: z.string().max(200).optional(),
})

export type TransactionInput = z.infer<typeof TransactionInput>
