/// <reference types="vite/client" />
import "../app.css";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RightSidebarContext } from "@/context/right-sidebar-context";
import { useState, type ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "willspace" },
      ],
    }),
    component: RootComponent,
  },
);

function RootComponent() {
  const [rightSidebarContent, setRightSidebarContent] =
    useState<ReactNode | null>(null);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="h-svh overflow-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="willspace-theme"
        >
          <SidebarProvider className="flex h-full flex-col">
            <RightSidebarContext.Provider value={{ setRightSidebarContent }}>
              <Header />
              <div className="flex flex-1 min-h-0 overflow-hidden">
                <Outlet />
                <RightSidebar content={rightSidebarContent} />
              </div>
            </RightSidebarContext.Provider>
          </SidebarProvider>
        </ThemeProvider>

        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
        <Toaster />
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
