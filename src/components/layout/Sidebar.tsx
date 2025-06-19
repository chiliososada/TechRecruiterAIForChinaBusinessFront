
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileText, 
  Users, 
  BarChart3,
  Inbox,
  Settings,
  ListCheck,
  BarChart2,
  ServerCog,
  Building,
  Building2,
  User,
  LogOut,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type SidebarItem = {
  icon: React.ReactNode;
  label: string;
  href: string;
  subItems?: SidebarItem[];
};

const sidebarItems: SidebarItem[] = [
  {
    icon: <BarChart3 className="h-5 w-5" />,
    label: 'ダッシュボード',
    href: '/',
  },
  {
    icon: <Building className="h-5 w-5" />,
    label: '自社',
    href: '#',
    subItems: [
      {
        icon: <FileText className="h-5 w-5" />,
        label: '案件管理',
        href: '/cases/company/own',
      },
      {
        icon: <Users className="h-5 w-5" />,
        label: '人材管理',
        href: '/candidates/company/own',
      }
    ]
  },
  {
    icon: <Building2 className="h-5 w-5" />,
    label: '他社',
    href: '#',
    subItems: [
      {
        icon: <FileText className="h-5 w-5" />,
        label: '案件管理',
        href: '/cases/company/other',
      },
      {
        icon: <Users className="h-5 w-5" />,
        label: '人材管理',
        href: '/candidates/company/other',
      }
    ]
  },
  {
    icon: <ListCheck className="h-5 w-5" />,
    label: '案件とのマッチング',
    href: '/matching',
  },
  {
    icon: <ServerCog className="h-5 w-5" />,
    label: '一括マッチング',
    href: '/batch-matching',
  },
  {
    icon: <Inbox className="h-5 w-5" />,
    label: 'メール連携',
    href: '/email',
  },
  {
    icon: <BarChart2 className="h-5 w-5" />,
    label: 'メール解析・分析',
    href: '/email-analysis',
  },
  {
    icon: <Settings className="h-5 w-5" />,
    label: '設定',
    href: '/settings',
  },
];

export function Sidebar() {
  const { user, profile, signOut } = useAuth();
  const [expandedItems, setExpandedItems] = useState<{[key: string]: boolean}>({
    '自社': true,
    '他社': true
  });

  const toggleSubMenu = (label: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const getInitials = () => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name?.charAt(0) || ''}${profile.last_name?.charAt(0) || ''}`;
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return user?.email || 'User';
  };

  return (
    <div className="h-screen flex flex-col bg-sidebar border-r border-sidebar-border">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight text-custom-blue-700">Tech Recruiter AI</h1>
      </div>
      <div className="flex-1 px-4 space-y-2 overflow-y-auto py-2">
        {sidebarItems.map((item, i) => (
          <div key={i}>
            {item.subItems ? (
              <div className="space-y-1">
                <div 
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all text-sidebar-foreground cursor-pointer"
                  onClick={() => toggleSubMenu(item.label)}
                >
                  {item.icon}
                  <span className="japanese-text flex-1">{item.label}</span>
                  <span className="text-xs">
                    {expandedItems[item.label] ? '▼' : '▶'}
                  </span>
                </div>
                
                {expandedItems[item.label] && (
                  <div className="pl-6 space-y-1 mt-1">
                    {item.subItems.map((subItem, j) => (
                      <NavLink
                        key={`${i}-${j}`}
                        to={subItem.href}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                          )
                        }
                      >
                        {subItem.icon}
                        <span className="japanese-text">{subItem.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  )
                }
              >
                {item.icon}
                <span className="japanese-text">{item.label}</span>
              </NavLink>
            )}
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full h-auto p-2 justify-start">
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-8 w-8">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} />
                  ) : null}
                  <AvatarFallback className="text-sm font-medium">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" className="w-56 mb-2">
            <NavLink to="/profile">
              <DropdownMenuItem className="cursor-pointer">
                <User className="h-4 w-4 mr-2" />
                <span className="japanese-text">个人资料</span>
              </DropdownMenuItem>
            </NavLink>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              <span className="japanese-text">退出登录</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default Sidebar;
