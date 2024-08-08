import { ThrendCard } from "@/components/cards";
import { Comment } from "@/components/forms";
import { fetchThrendById } from "@/lib/actions/thrend.action";
import { fetUser } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

const ThrendDetail = async ({ params }: { params: { id: string } }) => {
  if (!params.id) return null;
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetUser(user.id);
  if (!userInfo.onboarded) redirect("/onboarding");
  const thrend = await fetchThrendById(params.id);

  return (
    <section className="relative">
      <div>
        <ThrendCard
          id={thrend._id}
          currentUserId={user?.id}
          parentId={thrend.parentId}
          content={thrend.text}
          author={thrend.author}
          community={thrend.community}
          createdAt={thrend.createdAt}
          comments={thrend.children}
        />
      </div>

      <div className="mt-7">
        <Comment
          threndId={JSON.parse(JSON.stringify(thrend._id))}
          currentUserImage={JSON.parse(JSON.stringify(userInfo.image))}
          currentUserId={JSON.parse(JSON.stringify(userInfo._id))}
        />
      </div>

      <div className="mt-10">
        {thrend.children.map((child: any) => (
          <ThrendCard
            key={child.id}
            id={child._id}
            currentUserId={user?.id}
            parentId={child.parentId}
            content={child.text}
            author={child.author}
            community={child.community}
            createdAt={child.createdAt}
            comments={child.children}
            isComment
          />
        ))}
      </div>
    </section>
  );
};

export default ThrendDetail;
