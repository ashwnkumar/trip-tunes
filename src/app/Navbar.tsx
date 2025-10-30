import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import React from "react";

function Navbar() {
  return (
    <div className="w-full flex items-center justify-between p-2">
      <Link href={"/"}>
        <h1 className="text-3xl font-bold">Trip Tunes</h1>
      </Link>
      {/* <Button size={"icon"} variant={"outline"} className="rounded-none">
        <Menu />
      </Button> */}
    </div>
  );
}

export default Navbar;
