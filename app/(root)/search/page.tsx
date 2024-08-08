import { UserCard } from "@/components/cards";
import { fetUser, fetUsers } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

const SearchPage = async () => {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetUser(user.id);

  if (!userInfo.onboarded) redirect("/onboarding");

  const result = await fetUsers({
    userId: user.id,
    searchString: "",
    pageNumber: 1,
    pageSize: 10,
    sortBy: "desc",
  });

  return (
    <section>
      <h1 className="head-text mb-10">Search</h1>
      {/* Render search bar */}

      <div className="mt-14 flex flex-col gap-9">
        {result.users.length === 0 ? (
          <p className="no-result">No users.</p>
        ) : (
          <>
            {result.users.map((user: any) => (
              <UserCard
                key={user._id}
                id={user.id}
                name={user.name}
                username={user.username}
                image={user.image}
                personType="User"
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
};

export default SearchPage;
