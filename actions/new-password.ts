"use server";

import { getUserByEmail } from "@/data/getUserByEmail";
import { db } from "@/lib/db";
import bcryptjs from "bcryptjs";
import { z } from "zod";
import { NewPasswordSchema } from "@/schemas/index";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { sendPasswordUpdatedEmail } from "@/lib/mail";

export const newPassword = async (
  values: z.infer<typeof NewPasswordSchema>,
  token?: string | null
) => {
  if (!token) {
    return { error: "Missing token!" };
  }
  const validatedFields = NewPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { password } = validatedFields.data;

  const existingToken = await getPasswordResetTokenByToken(token);
  if (!existingToken) {
    return { error: "Invalid token!" };
  }
  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }
  const existingUser = await getUserByEmail(existingToken.email);
  if (!existingUser) {
    return { error: "Email does not exist!" };
  }
  const hashedPassword = await bcryptjs.hash(password, 10);
  await db.user.update({
    where: { id: existingUser.id },
    data: {
      password: hashedPassword,
    },
  });
  await db.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  await sendPasswordUpdatedEmail(existingUser.email);

  return { success: "Password updated!" };
};
