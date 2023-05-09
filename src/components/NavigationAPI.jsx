import {useEffect, useRef, useState} from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { AnimatePresence, motion, useIsPresent } from 'framer-motion'

import { Button } from '@/components/Button'
import { useIsInsideMobileNavigation } from '@/components/MobileNavigation'
import { useSectionStore } from '@/components/SectionProvider'
import { Tag } from '@/components/Tag'
import { remToPx } from '@/lib/remToPx'

function useInitialValue(value, condition = true) {
  let initialValue = useRef(value).current
  return condition ? initialValue : value
}

export function TopLevelNavItem({ href, children }) {
  return (
    <li className="md:hidden">
      <Link
        href={href}
        className="block py-1 text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        {children}
      </Link>
    </li>
  )
}

export function NavLink({ href, tag, active, isAnchorLink = false, children }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'flex justify-between gap-2 py-1 pr-3 text-sm transition',
        isAnchorLink ? 'pl-7' : 'pl-4',
        active
          ? 'text-zinc-900 dark:text-white'
          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
      )}
    >
      <span className="truncate">{children}</span>
      {tag && (
        <Tag variant="small" color="zinc">
          {tag}
        </Tag>
      )}
    </Link>
  )
}

function VisibleSectionHighlight({ group, pathname }) {
  let [sections, visibleSections] = useInitialValue(
    [
      useSectionStore((s) => s.sections),
      useSectionStore((s) => s.visibleSections),
    ],
    useIsInsideMobileNavigation()
  )

  let isPresent = useIsPresent()
  let firstVisibleSectionIndex = Math.max(
    0,
    [{ id: '_top' }, ...sections].findIndex(
      (section) => section.id === visibleSections[0]
    )
  )
  let itemHeight = remToPx(2)
  let height = isPresent
    ? Math.max(1, visibleSections.length) * itemHeight
    : itemHeight
  let top =
    group.links.findIndex((link) => link.href === pathname) * itemHeight +
    firstVisibleSectionIndex * itemHeight

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      className="absolute inset-x-0 top-0 bg-zinc-800/2.5 will-change-transform dark:bg-white/2.5"
      style={{ borderRadius: 8, height, top }}
    />
  )
}

export function ActivePageMarker({ group, pathname }) {
  let itemHeight = remToPx(2)
  let offset = remToPx(0.25)
  let activePageIndex = group.links.findIndex((link) => link.href === pathname)
  let top = offset + activePageIndex * itemHeight

  return (
    <motion.div
      layout
      className="absolute left-2 h-6 w-px bg-orange-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      style={{ top }}
    />
  )
}

function NavigationGroup({ group, className }) {
  // If this is the mobile navigation then we always render the initial
  // state, so that the state does not change during the close animation.
  // The state will still update when we re-open (re-render) the navigation.
  let isInsideMobileNavigation = useIsInsideMobileNavigation()
  let [router, sections] = useInitialValue(
    [useRouter(), useSectionStore((s) => s.sections)],
    isInsideMobileNavigation
  )

  let isActiveGroup =
    group.links.findIndex((link) => link.href === router.pathname) !== -1

  return (
    <li className={clsx('relative mt-6', className)}>
      <motion.h2
        layout="position"
        className="text-xs font-semibold text-zinc-900 dark:text-white"
      >
        {group.title}
      </motion.h2>
      <div className="relative mt-3 pl-2">
        <AnimatePresence initial={!isInsideMobileNavigation}>
          {isActiveGroup && (
            <VisibleSectionHighlight group={group} pathname={router.pathname} />
          )}
        </AnimatePresence>
        <motion.div
          layout
          className="absolute inset-y-0 left-2 w-px bg-zinc-900/10 dark:bg-white/5"
        />
        <AnimatePresence initial={false}>
          {isActiveGroup && (
            <ActivePageMarker group={group} pathname={router.pathname} />
          )}
        </AnimatePresence>
        <ul role="list" className="border-l border-transparent">
          {group.links.map((link) => (
            <motion.li key={link.href} layout="position" className="relative">
              <NavLink href={link.href} active={link.href === router.pathname}>
                {link.title}
              </NavLink>
              <AnimatePresence mode="popLayout" initial={false}>
                {link.href === router.pathname && sections.length > 0 && (
                  <motion.ul
                    role="list"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: { delay: 0.1 },
                    }}
                    exit={{
                      opacity: 0,
                      transition: { duration: 0.15 },
                    }}
                  >
                    {sections.map((section) => (
                      <li key={section.id}>
                        <NavLink
                          href={`${link.href}#${section.id}`}
                          tag={section.tag}
                          isAnchorLink
                        >
                          {section.title}
                        </NavLink>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.li>
          ))}
        </ul>
      </div>
    </li>
  )
}

export const docsNavigation = [
  {
    title: 'About NetBird',
    links: [
      { title: 'Why Wireguard with NetBird?', href: '/docs/about-netbird/why-wireguard-with-netbird' },
      { title: 'How Netbird Works', href: '/docs/about-netbird/how-netbird-works' },
      { title: 'NetBird vs. Traditional VPN', href: '/docs/about-netbird/netbird-vs-traditional-vpn' },
      { title: 'Other', href: '/docs/about-netbird/other' },
      { title: 'FAQ', href: '/docs/about-netbird/faq' },
    ],
  },
  {
    title: 'How-to',
    links: [
      { title: 'Getting Started', href: '/docs/how-to/getting-started' },
      { title: 'Peers', href: '/docs/how-to/peers' },
      { title: 'Setup Keys', href: '/docs/how-to/setup-keys' },
      { title: 'Access Control', href: '/docs/how-to/access-control' },
      { title: 'Network Routes', href: '/docs/how-to/network-routes' },
      { title: 'DNS', href: '/docs/how-to/dns' },
      { title: 'Users', href: '/docs/how-to/users' },
      { title: 'Activity', href: '/docs/how-to/activity' },
      { title: 'Settings', href: '/docs/how-to/settings' },
      { title: 'Examples', href: '/docs/how-to/examples' },
      { title: 'CLI', href: '/docs/how-to/cli' },
    ],
  },
  {
    title: 'Self-Hosted',
    links: [
      { title: 'Installation Guide', href: '/docs/selfhosted/selfhosted-guide' },
      { title: 'Identity Providers', href: '/docs/selfhosted/identity-providers' },
    ],
  },

]

export const apiNavigation = [
  {
    title: 'Guides',
    links: [
      { title: 'Quickstart', href: '/ipa/quickstart' },
      { title: 'Authentication', href: '/ipa/authentication' },
      { title: 'Errors', href: '/ipa/errors' },
      // { title: 'Events', href: '/accounts' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { title: 'Accounts', href: '/ipa/accounts' },
      { title: 'Users', href: '/ipa/users' },
      { title: 'Tokens', href: '/ipa/tokens' },
      { title: 'Peers', href: '/ipa/peers' },
      { title: 'Setup Keys', href: '/ipa/setup-keys' },
      { title: 'Groups', href: '/ipa/groups' },
      { title: 'Rules', href: '/ipa/rules' },
      { title: 'Policies', href: '/ipa/policies' },
      { title: 'Routes', href: '/ipa/routes' },
      { title: 'DNS', href: '/ipa/dns' },
      { title: 'Events', href: '/ipa/events' },
    ],
  },
]

export function NavigationAPI(props) {
  let router = useRouter()
  return (
    <nav {...props}>
      <ul role="list">
        <TopLevelNavItem href="https://netbird.io/">Home</TopLevelNavItem>
        <TopLevelNavItem href="/docs/introductions">Docs</TopLevelNavItem>
        <TopLevelNavItem href="/ipa/introductions">API</TopLevelNavItem>
        <TopLevelNavItem href="https://netbird.io/blog/">Blog</TopLevelNavItem>
        <TopLevelNavItem href="https://github.com/netbirdio/netbird">Github</TopLevelNavItem>
        <TopLevelNavItem href="https://join.slack.com/t/netbirdio/shared_invite/zt-vrahf41g-ik1v7fV8du6t0RwxSrJ96A">Support</TopLevelNavItem>
        {
          router.route.startsWith('/docs') && docsNavigation.map((group, groupIndex) => (
          <NavigationGroup
            key={group.title}
            group={group}
            className={groupIndex === 0 && 'md:mt-0'}
          />
          )) ||
          router.route.startsWith('/ipa') && apiNavigation.map((group, groupIndex) => (
          <NavigationGroup
            key={group.title}
            group={group}
            className={groupIndex === 0 && 'md:mt-0'}
          />
          ))
        }
        <li className="sticky bottom-0 z-10 mt-6 min-[416px]:hidden">
          <Button href="https://app.netbird.io/" variant="filled" className="w-full">
            Sign in
          </Button>
        </li>
      </ul>
    </nav>
  )
}