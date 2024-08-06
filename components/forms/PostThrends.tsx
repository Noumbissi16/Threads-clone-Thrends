"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "../ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";

import { ThrendValidation } from "@/lib/validations/thrend";
import { createThrend } from "@/lib/actions/thrend.action";
interface Props {
  userId: string;
}
const PostThrends = ({ userId }: Props) => {
  const router = useRouter();

  const pathname = usePathname();

  // 1. Define your form.
  const form = useForm<z.infer<typeof ThrendValidation>>({
    resolver: zodResolver(ThrendValidation),
    defaultValues: {
      thrend: "",
      accountId: userId,
    },
  });

  async function onSubmit(values: z.infer<typeof ThrendValidation>) {
    await createThrend({
      author: values.accountId,
      text: values.thrend,
      path: pathname,
    });

    router.push("/");
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-10 flex flex-col justify-start gap-10"
      >
        <FormField
          control={form.control}
          name="thrend"
          render={({ field }) => (
            <FormItem className="flex gap-3 w-full flex-col ">
              <FormLabel className="text-base-semibold">
                Content of the thrend
              </FormLabel>
              <FormControl className="no-focus border border-dark-4 bg-background">
                <Textarea rows={15} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="bg-primary-500 hover:bg-primary-500/[75%] text-foreground"
        >
          Post Thrend
        </Button>
      </form>
    </Form>
  );
};

export default PostThrends;
