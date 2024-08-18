import { AccountProfile } from "@/components/forms";
import { fetUser } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

const Page = async () => {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetUser(user.id);
  if (userInfo.onboarded) redirect("/");

  const userData = {
    id: user?.id,
    objectId: userInfo?._id,
    username: user?.username || userInfo?.username,
    name: user?.firstName || userInfo?.name || "",
    bio: userInfo?.bio || "",
    image: user?.imageUrl || userInfo?.image,
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-20">
      <h1 className="head-text">Onboarding</h1>
      <p className="mt-3 text-base-regular">
        Complete your profile now to use Thrends
      </p>

      <section className="mt-9 p-10 bg-dark-2">
        <AccountProfile user={userData} btnTitle="Continue" />
      </section>
    </main>
  );
};

export default Page;
