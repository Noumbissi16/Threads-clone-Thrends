import { PostThrends } from "@/components/forms";
import { fetUser } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

const CreateThrends = async () => {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetUser(user.id);

  if (!userInfo.onboarded) redirect("/onboarding");

  return (
    <>
      <h1 className="head-text">CreateThrends</h1>
      <PostThrends userId={userInfo._id} />
    </>
  );
};

export default CreateThrends;
