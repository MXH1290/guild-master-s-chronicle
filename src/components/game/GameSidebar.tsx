import { Scroll, Users, Swords, BookOpen } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const navItems = [
  { title: 'Quests', url: '/', icon: Scroll },
  { title: 'Guild', url: '/guild', icon: Users },
];

export function GameSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar 
      className="border-r border-border/50 bg-card/50 backdrop-blur-sm"
      collapsible="icon"
    >
      <div className="p-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Swords className="w-6 h-6 text-primary" />
          {!collapsed && (
            <span className="font-display text-lg text-foreground">Guild Master</span>
          )}
        </div>
      </div>

      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2 rounded-sm transition-colors hover:bg-muted/50"
                      activeClassName="bg-primary/20 text-primary border-l-2 border-primary"
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {!collapsed && (
                        <span className="font-display text-sm">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-3 border-t border-border/50">
        <SidebarTrigger className="w-full justify-center" />
      </div>
    </Sidebar>
  );
}
