import { fetUser, getActivity } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const ActivityPage = async () => {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetUser(user.id);

  if (!userInfo.onboarded) redirect("/onboarding");

  // Get users thrends comments
  const activities = await getActivity(userInfo._id);

  return (
    <section>
      <h1 className="head-text mb-10">Activity</h1>

      <section className="mt-10 flex flex-col gap-5">
        {activities.length === 0 ? (
          <p className="no-result !text-base-regular text-light-3">
            No activity yet.
          </p>
        ) : (
          <>
            {activities.map((activity) => (
              <Link key={activity._id} href={`/thrend/${activity.parentId}`}>
                <article className="activity-card">
                  <Image
                    src={activity.author.image}
                    alt="profile picture"
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />

                  <p className="!text-small-regular text-light-1">
                    <span className="mr-1 text-primary-500">
                      {activity.author.name}
                    </span>{" "}
                    replied to your thrend
                  </p>
                </article>
              </Link>
            ))}
          </>
        )}
      </section>
    </section>
  );
};

export default ActivityPage;
