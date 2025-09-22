import React from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  defaultLayout?: number[];
  defaultCollapsed?: boolean;
  navCollapsedSize?: number;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({
  sidebar,
  children,
  defaultLayout = [20, 80], // Changed to percentages
  defaultCollapsed = false,
  navCollapsedSize = 4,
}) => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  if (isMobile) {
    return (
      <div className="flex h-screen flex-col">
        <div className="flex-none">
          {sidebar}
        </div>
        <Separator />
        <div className="flex-1 overflow-hidden">
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
          document.cookie = `react-resizable-panels:collapsed=${true}`;
        }}
        onExpand={() => {
          setIsCollapsed(false);
          document.cookie = `react-resizable-panels:collapsed=${false}`;
        }}
        className={cn(
          isCollapsed &&
            "min-w-[50px] transition-all duration-300 ease-in-out",
        )}
      >
        {sidebar}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default ChatLayout;