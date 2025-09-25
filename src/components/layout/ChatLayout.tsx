import React from 'react';
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
      <div className="flex h-screen flex-col bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-5"> {/* Subtle blobs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-400 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        <div className="relative z-10 flex-none border-b border-border">
          {sidebar}
        </div>
        <div className="relative z-10 flex-1 overflow-hidden bg-background/80 rounded-lg shadow-inner">
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
      className="h-screen max-h-screen items-stretch bg-gradient-to-br from-blue-500 to-purple-600 text-white relative overflow-hidden"
    >
      <div className="absolute inset-0 z-0 opacity-5"> {/* Subtle blobs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-400 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>
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
          "bg-card border-r border-border relative z-10",
          isCollapsed &&
            "min-w-[50px] transition-all duration-300 ease-in-out",
        )}
      >
        {sidebar}
      </ResizablePanel>
      <ResizableHandle withHandle className="relative z-10" />
      <ResizablePanel defaultSize={defaultLayout[1]} minSize={30} className="relative z-10 bg-background/80 rounded-l-lg shadow-inner">
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default ChatLayout;