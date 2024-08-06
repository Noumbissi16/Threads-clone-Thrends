import { ThrendCard } from "@/components/cards";
import { fetchPosts } from "@/lib/actions/thrend.action";
import { currentUser } from "@clerk/nextjs/server";
import { useRouter } from "next/navigation";

export default async function Home() {
  // const router = useRouter();

  const results = await fetchPosts(1, 30);
  const user = await currentUser();
  if (!user) {
    // router.push("/login");
    return null;
  }

  return (
    <>
      <h1 className="head-text text-left">Home</h1>

      <section className="mt-9 flex flex-col gap-10">
        {results.posts.length === 0 ? (
          <p className="no-result">No result found.</p>
        ) : (
          <>
            {results.posts.map((post) => (
              <ThrendCard
                key={post._id}
                id={post._id}
                currentUserId={user?.id}
                parentId={post.parentId}
                content={post.text}
                author={post.author}
                community={post.community}
                createdAt={post.createdAt}
                comments={post.children}
              />
            ))}
          </>
        )}
      </section>
    </>
  );
}
