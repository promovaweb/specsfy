'use client'

import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Produto', href: '#' },
  { name: 'Recursos', href: '#' },
  { name: 'Empresa', href: '#' },
]

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white dark:bg-gray-900">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex flex-1">
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <a key={item.name} href={item.href} className="text-sm/6 font-semibold text-gray-900 dark:text-white">
                {item.name}
              </a>
            ))}
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-400 dark:hover:text-white"
            >
              <span className="sr-only">Abrir menu principal</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>
        </div>
        <a href="#" className="-m-1.5 p-1.5">
          <span className="sr-only">Sua Empresa</span>
          <img
            alt=""
            src="https://tailwindcss.com/mais-assets/img/logos/mark.svg?color=indigo&shade=600"
            className="h-8 w-auto dark:hidden"
          />
          <img
            alt=""
            src="https://tailwindcss.com/mais-assets/img/logos/mark.svg?color=indigo&shade=500"
            className="hidden h-8 w-auto dark:block"
          />
        </a>
        <div className="flex flex-1 justify-end">
          <a href="#" className="text-sm/6 font-semibold text-gray-900 dark:text-white">
            Entrar <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </nav>
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 left-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex flex-1">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-400 dark:hover:text-white"
              >
                <span className="sr-only">Fechar menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Sua Empresa</span>
              <img
                alt=""
                src="https://tailwindcss.com/mais-assets/img/logos/mark.svg?color=indigo&shade=600"
                className="h-8 w-auto dark:hidden"
              />
              <img
                alt=""
                src="https://tailwindcss.com/mais-assets/img/logos/mark.svg?color=indigo&shade=500"
                className="hidden h-8 w-auto dark:block"
              />
            </a>
            <div className="flex flex-1 justify-end">
              <a href="#" className="text-sm/6 font-semibold text-gray-900 dark:text-white">
                Entrar <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/5"
              >
                {item.name}
              </a>
            ))}
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}
