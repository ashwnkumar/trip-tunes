"use client";
import Placeholder from "@/components/Placeholder";
import { Button } from "@/components/ui/button";
import { useGlobal } from "@/contexts/GlobalContext";
import { Menu, UserCircle } from "lucide-react";
import Link from "next/link";
import React, { useCallback } from "react";

function Navbar() {

  return (
    <div className="w-full flex items-center justify-between p-2">
      <Link href={"/"}>
        <h1 className="text-3xl font-bold">Trip Tunes</h1>
      </Link>

    </div>
  );
}

export default Navbar;
