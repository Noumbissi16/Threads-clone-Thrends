import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  return (
    <div className="grid min-h-screen place-items-center">
      <h3>Threads clone - Thrends</h3>

      <UserButton />
    </div>
  );
}
