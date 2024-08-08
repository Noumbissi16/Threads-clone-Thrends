import React from "react";
import { fetUser } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ProfileHeader, ThrendsTab } from "@/components/shared";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { profileTabs } from "@/constants";
import Image from "next/image";

const ProfilePage = async ({ params }: { params: { id: string } }) => {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetUser(user.id);

  if (!userInfo.onboarded) redirect("/onboarding");

  const userProfileInfo = await fetUser(params.id);

  return (
    <section>
      <ProfileHeader
        accountId={userProfileInfo.id}
        authUserId={userInfo.id}
        name={userProfileInfo.name}
        username={userProfileInfo.username}
        image={userProfileInfo.image}
        bio={userProfileInfo.bio}
      />

      <div className="mt-9">
        <Tabs defaultValue="thrends" className="w-full">
          <TabsList className="tab">
            {profileTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className="tab">
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className="object-contain"
                />
                <p className="max-sm:hidden">{tab.label}</p>

                {tab.value === "thrends" && (
                  <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                    {userProfileInfo.thrends?.length}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {profileTabs.map((tab) => (
            <TabsContent
              key={`content-${tab.label}`}
              value={tab.value}
              className="w-full text-light-1"
            >
              <ThrendsTab
                currentUserId={userInfo.id}
                accountId={userProfileInfo.id}
                accountType="User"
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default ProfilePage;
