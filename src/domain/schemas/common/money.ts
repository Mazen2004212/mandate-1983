import { z } from "zod";

export const MIN_MONEY_MINOR = -(2n ** 63n);
export const MAX_MONEY_MINOR = 2n ** 63n - 1n;

export const moneyMinorSchema = z
  .bigint()
  .min(MIN_MONEY_MINOR)
  .max(MAX_MONEY_MINOR)
  .brand<"MoneyMinor">();
export const serializedMoneyMinorSchema = z
  .string()
  .regex(/^(?:0|-?[1-9][0-9]*)$/, {
    message: "Serialized money must be a canonical base-10 integer string.",
  })
  .brand<"SerializedMoneyMinor">();

export type MoneyMinor = z.infer<typeof moneyMinorSchema>;
export type SerializedMoneyMinor = z.infer<typeof serializedMoneyMinorSchema>;

export function parseMoneyMinor(value: string): MoneyMinor {
  const serialized = serializedMoneyMinorSchema.parse(value);
  return moneyMinorSchema.parse(BigInt(serialized));
}

export function serializeMoneyMinor(value: bigint): SerializedMoneyMinor {
  const money = moneyMinorSchema.parse(value);
  return serializedMoneyMinorSchema.parse(money.toString(10));
}
