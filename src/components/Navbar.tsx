"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "./ui/button";
import { Container } from "./Container";

export function Navbar() {
  //   const isMobile = useIsMobile();

  return (
    <Container>
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 mt-6 z-20 fixed top-0 left-0 w-full px-4  sm:px-8 lg:px-16">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.svg"
              alt="Campus Connect Logo"
              width={64}
              height={64}
              className="h-16"
            />
            <span className="hidden font-bold sm:inline-block tracking-tight text-xl ">
              Campus Connect
            </span>
          </Link>
          <NavigationMenu /* viewport={isMobile} */>
            <NavigationMenuList className="flex-wrap">
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/">Home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/about">About</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="btn-section">
            <Button variant="ghost" className="mr-2 cursor-pointer">
              <Link href="/login">Login</Link>
            </Button>
            <Button className="cursor-pointer">
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>
    </Container>
  );
}
