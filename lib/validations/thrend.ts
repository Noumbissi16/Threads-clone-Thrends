import * as z from "zod";

export const ThrendValidation = z.object({
  thrend: z
    .string()
    .min(1)
    .min(3, { message: "Thrend must be at least 3 characters." }),
  accountId: z.string(),
});

export const CommentValidation = z.object({
  thrend: z
    .string()
    .min(1)
    .min(3, { message: "Thrend must be at least 3 characters." })
    .max(50),
});
