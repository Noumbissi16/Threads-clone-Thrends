import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="grid min-h-screen place-items-center">
      <h3>Threads clone - Thrends</h3>

      <Button
        // variant={"default"}
        className="bg-primary text-primary-foreground"
      >
        button
      </Button>
    </div>
  );
}
