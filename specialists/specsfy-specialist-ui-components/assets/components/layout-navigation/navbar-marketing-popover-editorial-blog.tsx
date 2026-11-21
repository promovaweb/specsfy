import { Popover, PopoverButton, PopoverGroup, PopoverPanel } from '@headlessui/react'
import {
  Bars3Icon,
  BookmarkSquareIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ComputerDesktopIcon,
  CursorArrowRaysIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  NewspaperIcon,
  PhoneIcon,
  PlayIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

const solutions = [
  {
    name: 'Análises',
    description: 'Entenda melhor de onde vem o seu tráfego.',
    href: '#',
    icon: ChartBarIcon,
  },
  {
    name: 'Engajamento',
    description: 'Converse diretamente com seus clientes de forma mais relevante.',
    href: '#',
    icon: CursorArrowRaysIcon,
  },
  { name: 'Segurança', description: 'Os dados dos seus clientes permanecerão protegidos.', href: '#', icon: ShieldCheckIcon },
  {
    name: 'Integrações',
    description: "Conecte as ferramentas de terceiros que você já usa.",
    href: '#',
    icon: Squares2X2Icon,
  },
]

const callsToAction = [
  { name: 'Assistir à Demonstração', href: '#', icon: PlayIcon },
  { name: 'Ver todos os produtos', href: '#', icon: CheckCircleIcon },
  { name: 'Falar com Vendas', href: '#', icon: PhoneIcon },
]

const company = [
  { name: 'Sobre', href: '#', icon: InformationCircleIcon },
  { name: 'Clientes', href: '#', icon: BuildingOfficeIcon },
  { name: 'Imprensa', href: '#', icon: NewspaperIcon },
  { name: 'Carreiras', href: '#', icon: BriefcaseIcon },
  { name: 'Privacidade', href: '#', icon: ShieldCheckIcon },
]

const resources = [
  { name: 'Comunidade', href: '#', icon: UserGroupIcon },
  { name: 'Parceiros', href: '#', icon: GlobeAltIcon },
  { name: 'Guias', href: '#', icon: BookmarkSquareIcon },
  { name: 'Webinars', href: '#', icon: ComputerDesktopIcon },
]

const blogPosts = [
  {
    id: 1,
    name: 'Aumente sua taxa de conversão',
    href: '#',
    preview: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    imageUrl:
      'https://images.unsplash.com/photo-1558478551-1a378f63328e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2849&q=80',
  },
  {
    id: 2,
    name: 'Como usar SEO para atrair tráfego ao seu site',
    href: '#',
    preview: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    imageUrl:
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2300&q=80',
  },
]

export default function Example() {
  return (
    <Popover className="relative bg-white dark:bg-gray-900">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 shadow-sm dark:shadow-none" />
      <div className="relative z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:py-4 md:justify-start md:space-x-10 lg:px-8">
          <div>
            <a href="#" className="flex">
              <span className="sr-only">Sua Empresa</span>
              <img
                alt=""
                src="https://tailwindcss.com/mais-assets/img/logos/mark.svg?color=indigo&shade=600"
                className="h-8 w-auto dark:hidden sm:h-10"
              />
              <img
                alt=""
                src="https://tailwindcss.com/mais-assets/img/logos/mark.svg?color=indigo&shade=500"
                className="hidden h-8 w-auto dark:block sm:h-10"
              />
            </a>
          </div>
          <div className="-my-2 -mr-2 md:hidden">
            <PopoverButton className="relative inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden focus:ring-inset dark:bg-gray-900 dark:hover:bg-white/5 dark:hover:text-gray-300">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Abrir menu</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </PopoverButton>
          </div>
          <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
            <PopoverGroup as="nav" className="flex space-x-10">
              <Popover>
                <PopoverButton className="group inline-flex items-center rounded-md bg-white text-base font-medium text-gray-500 hover:text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden data-open:text-gray-900 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-white dark:data-open:text-white">
                  <span>Soluções</span>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="ml-2 size-5 text-gray-400 group-hover:text-gray-500 group-data-open:text-gray-600 group-data-open:group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 dark:group-data-open:text-gray-300"
                  />
                </PopoverButton>

                <PopoverPanel
                  transition
                  className="absolute inset-x-0 top-full z-10 hidden transform bg-white shadow-lg transition data-closed:-translate-y-1 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in dark:bg-gray-900 dark:shadow-none md:block"
                >
                  <div className="mx-auto grid max-w-7xl gap-y-6 px-4 py-6 sm:grid-cols-2 sm:gap-8 sm:px-6 sm:py-8 lg:grid-cols-4 lg:px-8 lg:py-12 xl:py-16">
                    {solutions.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="-m-3 flex flex-col justify-between rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-white/5"
                      >
                        <div className="flex md:h-full lg:flex-col">
                          <div className="shrink-0">
                            <span className="inline-flex size-10 items-center justify-center rounded-md bg-indigo-500 text-white sm:size-12">
                              <item.icon aria-hidden="true" className="size-6" />
                            </span>
                          </div>
                          <div className="ml-4 md:flex md:flex-1 md:flex-col md:justify-between lg:mt-4 lg:ml-0">
                            <div>
                              <p className="text-base font-medium text-gray-900 dark:text-white">{item.name}</p>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                            </div>
                            <p className="mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 lg:mt-4">
                              Saiba mais
                              <span aria-hidden="true"> &rarr;</span>
                            </p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50">
                    <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 sm:flex sm:space-y-0 sm:space-x-10 sm:px-6 lg:px-8">
                      {callsToAction.map((item) => (
                        <div key={item.name} className="flow-root">
                          <a
                            href={item.href}
                            className="-m-3 flex items-center rounded-md p-3 text-base font-medium text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-white/5"
                          >
                            <item.icon aria-hidden="true" className="size-6 shrink-0 text-gray-400 dark:text-gray-500" />
                            <span className="ml-3">{item.name}</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverPanel>
              </Popover>
              <a href="#" className="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Preços
              </a>
              <a href="#" className="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Documentação
              </a>
              <Popover>
                <PopoverButton className="group inline-flex items-center rounded-md bg-white text-base font-medium text-gray-500 hover:text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden data-open:text-gray-900 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-white dark:data-open:text-white">
                  <span>Mais</span>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="ml-2 size-5 text-gray-400 group-hover:text-gray-500 group-data-open:text-gray-600 group-data-open:group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 dark:group-data-open:text-gray-300"
                  />
                </PopoverButton>

                <PopoverPanel
                  transition
                  className="absolute inset-x-0 top-full z-10 hidden transform shadow-lg transition data-closed:-translate-y-1 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in dark:shadow-none md:block"
                >
                  <div className="absolute inset-0 flex">
                    <div className="w-1/2 bg-white dark:bg-gray-900" />
                    <div className="w-1/2 bg-gray-50 dark:bg-gray-800/50" />
                  </div>
                  <div className="relative mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
                    <nav className="grid gap-y-10 bg-white px-4 py-8 dark:bg-gray-900 sm:grid-cols-2 sm:gap-x-8 sm:px-6 sm:py-12 lg:px-8 xl:pr-12">
                      <div>
                        <h3 className="text-base font-medium text-gray-500 dark:text-gray-400">Empresa</h3>
                        <ul role="list" className="mt-5 space-y-6">
                          {company.map((item) => (
                            <li key={item.name} className="flow-root">
                              <a
                                href={item.href}
                                className="-m-3 flex items-center rounded-md p-3 text-base font-medium text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/5"
                              >
                                <item.icon aria-hidden="true" className="size-6 shrink-0 text-gray-400 dark:text-gray-500" />
                                <span className="ml-4">{item.name}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-gray-500 dark:text-gray-400">Recursos</h3>
                        <ul role="list" className="mt-5 space-y-6">
                          {resources.map((item) => (
                            <li key={item.name} className="flow-root">
                              <a
                                href={item.href}
                                className="-m-3 flex items-center rounded-md p-3 text-base font-medium text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/5"
                              >
                                <item.icon aria-hidden="true" className="size-6 shrink-0 text-gray-400 dark:text-gray-500" />
                                <span className="ml-4">{item.name}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </nav>
                    <div className="bg-gray-50 px-4 py-8 dark:bg-gray-800/50 sm:px-6 sm:py-12 lg:px-8 xl:pl-12">
                      <div>
                        <h3 className="text-base font-medium text-gray-500 dark:text-gray-400">Do blog</h3>
                        <ul role="list" className="mt-6 space-y-6">
                          {blogPosts.map((post) => (
                            <li key={post.id} className="flow-root">
                              <a href={post.href} className="-m-3 flex rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-white/5">
                                <div className="hidden shrink-0 sm:block">
                                  <img alt="" src={post.imageUrl} className="h-20 w-32 rounded-md object-cover" />
                                </div>
                                <div className="w-0 flex-1 sm:ml-8">
                                  <h4 className="truncate text-base font-medium text-gray-900 dark:text-white">{post.name}</h4>
                                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{post.preview}</p>
                                </div>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-6 text-sm font-medium">
                        <a href="#" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                          Ver todos os posts
                          <span aria-hidden="true"> &rarr;</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </PopoverPanel>
              </Popover>
            </PopoverGroup>
            <div className="flex items-center md:ml-12">
              <a href="#" className="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Entrar
              </a>
              <a
                href="#"
                className="ml-8 inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-xs hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                Criar conta
              </a>
            </div>
          </div>
        </div>
      </div>

      <PopoverPanel
        transition
        className="absolute inset-x-0 top-0 z-30 origin-top-right transform p-2 transition data-closed:scale-95 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-100 data-leave:ease-in md:hidden"
      >
        <div className="divide-y-2 divide-gray-50 rounded-lg bg-white shadow-lg ring-1 ring-black/5 dark:divide-white/10 dark:bg-gray-900 dark:ring-white/10">
          <div className="px-5 pt-5 pb-6 sm:pb-8">
            <div className="flex items-center justify-between">
              <div>
                <img
                  alt="Sua Empresa"
                  src="https://tailwindcss.com/mais-assets/img/logos/mark.svg?color=indigo&shade=600"
                  className="h-8 w-auto dark:hidden"
                />
                <img
                  alt="Sua Empresa"
                  src="https://tailwindcss.com/mais-assets/img/logos/mark.svg?color=indigo&shade=500"
                  className="hidden h-8 w-auto dark:block"
                />
              </div>
              <div className="-mr-2">
                <PopoverButton className="relative inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden focus:ring-inset dark:bg-gray-900 dark:hover:bg-white/5 dark:hover:text-gray-300">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Fechar menu</span>
                  <XMarkIcon aria-hidden="true" className="size-6" />
                </PopoverButton>
              </div>
            </div>
            <div className="mt-6 sm:mt-8">
              <nav>
                <div className="grid gap-7 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-8">
                  {solutions.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="-m-3 flex items-center rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-indigo-500 text-white sm:size-12">
                        <item.icon aria-hidden="true" className="size-6" />
                      </div>
                      <div className="ml-4 text-base font-medium text-gray-900 dark:text-white">{item.name}</div>
                    </a>
                  ))}
                </div>
                <div className="mt-8 text-base">
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                    Ver todos os produtos
                    <span aria-hidden="true"> &rarr;</span>
                  </a>
                </div>
              </nav>
            </div>
          </div>
          <div className="px-5 py-6">
            <div className="grid grid-cols-2 gap-4">
              <a href="#" className="rounded-md text-base font-medium text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-300">
                Preços
              </a>
              <a href="#" className="rounded-md text-base font-medium text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-300">
                Documentação
              </a>
              <a href="#" className="rounded-md text-base font-medium text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-300">
                Empresa
              </a>
              <a href="#" className="rounded-md text-base font-medium text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-300">
                Recursos
              </a>
              <a href="#" className="rounded-md text-base font-medium text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-300">
                Blog
              </a>
              <a href="#" className="rounded-md text-base font-medium text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-300">
                Falar com Vendas
              </a>
            </div>
            <div className="mt-6">
              <a
                href="#"
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-xs hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                Criar conta
              </a>
              <p className="mt-6 text-center text-base font-medium text-gray-500 dark:text-gray-400">
                Já é cliente?{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                  Entrar
                </a>
              </p>
            </div>
          </div>
        </div>
      </PopoverPanel>
    </Popover>
  )
}
