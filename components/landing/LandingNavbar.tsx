"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Moon, Sun, Menu, X } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ClientOnly } from "@/components/ClientOnly"
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
} from "@/components/ui/menubar"
import {LoginModal} from "@/components/auth/LoginModal";
import {SignupSheet} from "@/components/auth/SignupSheet";

export function LandingNavbar() {
  const { setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/eloravisa.PNG" alt="Elora Visa Logo" width={60} height={60} className="" />
            <span className="hidden md:block text-lg font-bold tracking-tight">Elora Visa</span>
          </Link>
        </div>

        {/* Desktop nav - visible from md and up */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <a href="#how-it-works" className="transition-colors hover:text-foreground/80 text-foreground/60">
            How It Works
          </a>
          <a href="#features" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Features
          </a>
          <a href="#pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Pricing
          </a>
          <Link href="/affiliate" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Affiliate
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ClientOnly>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ClientOnly>

          <div className="flex items-center gap-2">
              <div className={"hidden sm:flex"}>

              <LoginModal/>
              </div>
              <SignupSheet desscription={"Sign Up"} className={"font-semibold shadow-lg hover:shadow-xl transition-all"}/>
          </div>

          {/* Mobile Menubar - visible below md */}
          <div className="md:hidden">
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger aria-label="Open navigation" className="p-2 rounded-md group">
                  <Menu className="w-5 h-5 block group-[data-state=open]:hidden" />
                  <X className="w-5 h-5 hidden group-[data-state=open]:block" />
                </MenubarTrigger>

                <MenubarContent
                  align="end"
                  className={`mt-2 w-56 bg-popover text-popover-foreground rounded-md shadow-md
                    transition ease-out duration-150 transform origin-top-right
                    data-state-closed:opacity-0 data-state-closed:scale-95 data-state-open:opacity-100 data-state-open:scale-100`}
                >
                  <MenubarItem asChild>
                    <a href="#how-it-works">How It Works</a>
                  </MenubarItem>
                  <MenubarItem asChild>
                    <a href="#features">Features</a>
                  </MenubarItem>
                  <MenubarItem asChild>
                    <a href="#pricing">Pricing</a>
                  </MenubarItem>
                    <MenubarItem asChild>
                        <a href="/affiliate">Affiliate</a>
                    </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem asChild>
                       <LoginModal/>
                  </MenubarItem>
                  <MenubarItem asChild>
                      <SignupSheet desscription={"Sign Up"} className={"font-semibold shadow-lg hover:shadow-xl transition-all w-full"}/>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>
        </div>
      </div>
    </header>
  )
}
