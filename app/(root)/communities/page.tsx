import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Searchbar } from "@/components/shared";
import { Pagination } from "@/components/shared";
import { CommunityCard } from "@/components/cards";

import { fetUser } from "@/lib/actions/user.action";
import { fetchCommunities } from "@/lib/actions/community.actions";
const CommunitiesPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const result = await fetchCommunities({
    searchString: searchParams.q,
    pageNumber: searchParams?.page ? +searchParams.page : 1,
    pageSize: 25,
  });

  return (
    <section>
      <h1 className="head-text mb-10">Communities</h1>

      <div className="mt-5">
        <Searchbar routeType="communities" />
      </div>

      <section className="mt-9 flex flex-wrap gap-4">
        {result.communities.length === 0 ? (
          <p className="no-result">No Result</p>
        ) : (
          <>
            {result.communities.map((community) => (
              <CommunityCard
                key={community.id}
                id={community.id}
                name={community.name}
                username={community.username}
                imgUrl={community.image}
                bio={community.bio}
                members={community.members}
              />
            ))}
          </>
        )}
      </section>

      <Pagination
        path="communities"
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={result.isNext}
      />
    </section>
  );
};

export default CommunitiesPage;
