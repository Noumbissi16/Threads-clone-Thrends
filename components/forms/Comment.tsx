"use client";
import React from "react";
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
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import { CommentValidation } from "@/lib/validations/thrend";
import Image from "next/image";
import { addCommentToThrend } from "@/lib/actions/thrend.action";
interface Props {
  threndId: string;
  currentUserImage: string;
  currentUserId: string;
}

const Comment = ({ threndId, currentUserImage, currentUserId }: Props) => {
  const router = useRouter();

  const pathname = usePathname();

  // 1. Define your form.
  const form = useForm<z.infer<typeof CommentValidation>>({
    resolver: zodResolver(CommentValidation),
    defaultValues: {
      thrend: "",
    },
  });

  async function onSubmit(values: z.infer<typeof CommentValidation>) {
    await addCommentToThrend({
      threndId,
      commentText: values.thrend,
      userId: currentUserId,
      path: pathname,
    });

    form.reset();
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="comment-form">
        <FormField
          control={form.control}
          name="thrend"
          render={({ field }) => (
            <FormItem className="flex gap-3 w-full items-center ">
              <FormLabel>
                <div className="w-12 h-12 rounded-full flex items-center   overflow-hidden">
                  <Image
                    src={currentUserImage}
                    alt="Profile image"
                    width={48}
                    height={48}
                    className="rounded-full object-contain"
                  />
                </div>
              </FormLabel>
              <FormControl className="border-none bg-transparent">
                <Input
                  type="text"
                  {...field}
                  placeholder="Comment..."
                  className="no-focus outline-none"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="bg-primary-500 hover:bg-primary-500/[75%] text-foreground comment-form_btn"
        >
          Reply
        </Button>
      </form>
    </Form>
  );
};

export default Comment;
