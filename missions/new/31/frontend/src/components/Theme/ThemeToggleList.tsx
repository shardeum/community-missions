import React from 'react'
import { Fragment, useEffect, useState } from 'react'
import { MoonIcon, SunIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'
import { useTheme } from 'next-themes'
import { Listbox } from '@headlessui/react'
import { usePopper } from 'hooks/use-popper'

export const ThemeToggleList = ({ noTabIndex = false }) => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  const settings = [
    {
      value: 'light',
      label: 'Light',
      icon: SunIcon,
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: MoonIcon,
    },
    {
      value: 'system',
      label: 'System',
      icon: ComputerDesktopIcon,
    },
  ]

  let [trigger, container] = usePopper({
    strategy: 'fixed',
    modifiers: [{ name: 'offset', options: { offset: [0, 0] } }],
  })

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <span className="relative">
      <Listbox value={theme} onChange={setTheme}>
        <Listbox.Label className="sr-only">Theme</Listbox.Label>
        <Listbox.Button
          type="button"
          ref={trigger}
          tabIndex={noTabIndex ? -1 : 0}
          className="group rounded-full p-1 hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          <SunIcon
            className={
              'inline-block h-6 w-6 dark:hidden ' +
              (theme !== 'system' && theme === 'light' ? 'text-red-400' : 'text-slate-500')
            }
          />
          <MoonIcon
            className={
              'hidden h-6 w-6 dark:inline-block ' +
              (theme !== 'system' && theme === 'dark' ? 'text-yellow-500' : 'text-slate-500')
            }
          />
        </Listbox.Button>
        <Listbox.Options as="div" ref={container}>
          <ul className=" m-1 rounded-lg border border-slate-200/50 bg-slate-50/50 p-1.5 backdrop-blur dark:border-slate-800/50 dark:bg-slate-900/50">
            {settings.map(({ value, label, icon: Icon }) => (
              <Listbox.Option key={value} value={value} as={Fragment}>
                {({ active, selected }) => (
                  <li
                    className={
                      'flex cursor-pointer items-center rounded-md py-1 px-2' +
                      (active ? ' bg-slate-200 dark:bg-slate-800' : '') +
                      (selected && value === 'light' ? ' text-red-500' : '') +
                      (selected && value === 'dark' ? ' text-yellow-500' : '')
                    }
                    tabIndex={0}
                  >
                    <Icon className="mr-2 h-6 w-6" />
                    {label}
                  </li>
                )}
              </Listbox.Option>
            ))}
          </ul>
        </Listbox.Options>
      </Listbox>
    </span>
  )
}
