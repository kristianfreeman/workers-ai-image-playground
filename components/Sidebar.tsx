import React from 'react';
import { Sidebar, SidebarItem } from 'shadcn-ui';

const SidebarNavigation = () => {
  return (
    <Sidebar>
      <SidebarItem href="/">Home</SidebarItem>
      <SidebarItem href="/chat">Chat</SidebarItem>
      <SidebarItem href="/image-generator">Image Generator</SidebarItem>
      <SidebarItem href="/images">Images</SidebarItem>
      <SidebarItem href="/settings">Settings</SidebarItem>
    </Sidebar>
  );
};

export default SidebarNavigation;
