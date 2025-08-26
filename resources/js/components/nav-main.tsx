// resources/js/components/nav-main.tsx
import { type NavGroup } from '@/types';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';

interface NavMainProps {
    groups: NavGroup[];
}

export function NavMain({ groups }: NavMainProps) {
    const { url } = usePage();

    return (
        <>
            {groups.map((group, groupIndex) => (
                <SidebarGroup key={groupIndex}>
                    <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                    <SidebarMenu>
                        {group.items.map((item) => {
                            const isActive = url === item.href;

                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                                        <Link href={item.href!}>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}