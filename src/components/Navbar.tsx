"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  MessageSquare,
  Calendar,
  BookOpen,
  TrendingUp,
  Bell,
} from "lucide-react";

// import { useIsMobile } from "@/hooks/use-mobile";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "./ui/button";

const postsFeatures: { title: string; href: string; description: string }[] = [
  {
    title: "Campus Feed",
    href: "/posts/feed",
    description: "View all posts from students across campus.",
  },
  {
    title: "My Posts",
    href: "/posts/my-posts",
    description: "Manage your own posts and updates.",
  },
  {
    title: "Trending",
    href: "/posts/trending",
    description: "See what's popular on campus right now.",
  },
  {
    title: "Create Post",
    href: "/posts/create",
    description: "Share your thoughts with the community.",
  },
];

const eventsFeatures: { title: string; href: string; description: string }[] = [
  {
    title: "All Events",
    href: "/events/all",
    description: "Browse all upcoming campus events.",
  },
  {
    title: "My Events",
    href: "/events/my-events",
    description: "Events you're attending or organizing.",
  },
  {
    title: "Create Event",
    href: "/events/create",
    description: "Organize a new campus event.",
  },
  {
    title: "Calendar",
    href: "/events/calendar",
    description: "View events in calendar format.",
  },
];

export function Navbar() {
  //   const isMobile = useIsMobile();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 mt-6 relative z-20">
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
              <NavigationMenuTrigger>Home</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/"
                      >
                        <Users className="h-6 w-6" />
                        <div className="mb-2 mt-4 text-lg font-medium">
                          Campus Connect
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Connect with students, share updates, and stay engaged
                          with campus life.
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/feed" title="Campus Feed">
                    Latest updates from the campus community.
                  </ListItem>
                  <ListItem href="/groups" title="Student Groups">
                    Find and join student organizations.
                  </ListItem>
                  <ListItem href="/about" title="About">
                    Learn more about Campus Connect.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Posts</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {postsFeatures.map((feature) => (
                    <ListItem
                      key={feature.title}
                      title={feature.title}
                      href={feature.href}
                    >
                      {feature.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Events</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {eventsFeatures.map((feature) => (
                    <ListItem
                      key={feature.title}
                      title={feature.title}
                      href={feature.href}
                    >
                      {feature.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link href="/docs">Docs</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="btn-section">
          <Button variant="ghost" className="mr-2 cursor-pointer">
            Signin
          </Button>
          <Button className="cursor-pointer">Get Started</Button>
        </div>
      </div>
    </header>
  );
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
