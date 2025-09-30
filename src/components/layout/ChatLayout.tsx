import React, { useState, memo } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  defaultLayout?: number[];
  defaultCollapsed?: boolean;
  navCollapsedSize?: number;
  isChatSelected?: boolean; // New prop to track if a chat is selected
  onBackToSidebar?: () => void; // New prop for back button functionality
}

const ChatLayout: React.FC<ChatLayoutProps> = memo(({
  sidebar,
  children,
  defaultLayout = [20, 80],
  defaultCollapsed = false,
  navCollapsedSize = 4,
  isChatSelected = false,
  onBackToSidebar,
}) => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  if (isMobile) {
    return (
      <div className="flex h-screen flex-col">
        {isChatSelected && onBackToSidebar ? (
          // Show back button header when chat is selected on mobile
          <div className="flex items-center p-4 border-b border-border bg-card">
            <button 
              onClick={onBackToSidebar}
              className="p-2 rounded-full hover:bg-accent focus:outline-none mr-2"
              aria-label="Back to chats"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
          </div>
        ) : (
          // Show sidebar when no chat is selected on mobile
          <div className="flex-none border-b border-border bg-card">
            {sidebar}
          </div>
        )}
        <div className="flex-1 overflow-hidden bg-background">
          {children}
        </div>
      </div>
    );
  }

  return (
    <ResizablePanelGroup
      direction="horizontal"
      onLayout={(sizes: number[]) => {
        document.cookie = `react-resizable-panels:layout=${JSON.stringify(
          sizes,
        )}`;
      }}
      className="h-screen max-h-screen items-stretch"
    >
      <ResizablePanel
        defaultSize={defaultLayout[0]}
        collapsedSize={navCollapsedSize}
        collapsible={true}
        minSize={15}
        maxSize={20}
        onCollapse={() => {
          setIsCollapsed(true);
          document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(true)}`;
        }}
        onExpand={() => {
          setIsCollapsed(false);
          document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(false)}`;
        }}
        className={cn(
          "bg-card border-r border-border transition-all duration-300 ease-in-out backdrop-blur-sm",
          isCollapsed && "min-w-[50px]",
          !isCollapsed && "min-w-[250px]"
        )}
      >
        {sidebar}
      </ResizablePanel>
      <ResizableHandle withHandle className="bg-border/50 hover:bg-accent-primary/50" />
      <ResizablePanel defaultSize={defaultLayout[1]} minSize={30} className="bg-background">
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
});

ChatLayout.displayName = 'ChatLayout';

export default ChatLayout;