import { fetchUserPosts } from "@/lib/actions/user.action";
import { redirect } from "next/navigation";
import React from "react";
import { ThrendCard } from "../cards";

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}
const ThrendsTab = async ({ accountId, currentUserId, accountType }: Props) => {
  const result = await fetchUserPosts(accountId);

  if (!result) redirect("/");

  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.thrends.map((post: any) => (
        <ThrendCard
          key={post._id}
          id={post._id}
          currentUserId={currentUserId}
          parentId={post.parentId}
          content={post.text}
          author={
            accountType === "User"
              ? {
                  name: result.name,
                  image: result.image,
                  id: result.id,
                }
              : {
                  name: post.author.name,
                  image: post.author.image,
                  id: post.author.id,
                }
          }
          community={post.community} //TODO:
          createdAt={post.createdAt}
          comments={post.children}
        />
      ))}
    </section>
  );
};

export default ThrendsTab;
