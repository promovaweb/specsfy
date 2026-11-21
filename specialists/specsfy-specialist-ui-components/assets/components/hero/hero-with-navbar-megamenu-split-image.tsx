import { Popover, PopoverButton, PopoverGroup, PopoverPanel } from '@headlessui/react'
import {
  ArrowPathIcon,
  Bars3Icon,
  BookmarkSquareIcon,
  CalendarIcon,
  ChartBarIcon,
  CursorArrowRaysIcon,
  LifebuoyIcon,
  PhoneIcon,
  PlayIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

const features = [
  {
    name: 'Análises',
    href: '#',
    description: 'Entenda melhor de onde vem o seu tráfego.',
    icon: ChartBarIcon,
  },
  {
    name: 'Engajamento',
    href: '#',
    description: 'Converse diretamente com seus clientes de forma mais relevante.',
    icon: CursorArrowRaysIcon,
  },
  { name: 'Segurança', href: '#', description: "Os dados dos seus clientes permanecerão protegidos.", icon: ShieldCheckIcon },
  {
    name: 'Integrações',
    href: '#',
    description: "Conecte as ferramentas de terceiros que você já usa.",
    icon: Squares2X2Icon,
  },
  {
    name: 'Automações',
    href: '#',
    description: 'Crie funis estratégicos que ajudem seus clientes a converter',
    icon: ArrowPathIcon,
  },
]

const callsToAction = [
  { name: 'Assistir à Demonstração', href: '#', icon: PlayIcon },
  { name: 'Falar com Vendas', href: '#', icon: PhoneIcon },
]

const resources = [
  {
    name: 'Central de Ajuda',
    description: 'Encontre respostas nos fóruns ou fale com o suporte.',
    href: '#',
    icon: LifebuoyIcon,
  },
  {
    name: 'Guias',
    description: 'Aprenda a aproveitar ao máximo a plataforma.',
    href: '#',
    icon: BookmarkSquareIcon,
  },
  {
    name: 'Eventos',
    description: 'Veja encontros e outros eventos planejados perto de você.',
    href: '#',
    icon: CalendarIcon,
  },
  { name: 'Segurança', description: 'Entenda como protegemos sua privacidade.', href: '#', icon: ShieldCheckIcon },
]

const recentPosts = [
  { id: 1, name: 'Aumente sua taxa de conversão', href: '#' },
  { id: 2, name: 'Como usar SEO para atrair tráfego ao seu site', href: '#' },
  { id: 3, name: 'Melhore a experiência dos seus clientes', href: '#' },
]

export default function Example() {
  return (
    <div className="relative bg-gray-50">
      <Popover className="relative bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between py-6 md:justify-start md:space-x-10">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <a href="#">
                <span className="sr-only">Sua Empresa</span>
                <img
                  alt=""
                  src="https://tailwindcss.com/mais-assets/img/logos/mark.svg?color=indigo&shade=600"
                  className="h-8 w-auto sm:h-10"
                />
              </a>
            </div>
            <div className="-my-2 -mr-2 md:hidden">
              <PopoverButton className="relative inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden focus:ring-inset">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Abrir menu</span>
                <Bars3Icon aria-hidden="true" className="size-6" />
              </PopoverButton>
            </div>
            <PopoverGroup as="nav" className="hidden space-x-10 md:flex">
              <Popover className="relative">
                <PopoverButton className="group inline-flex items-center rounded-md bg-white text-base font-medium text-gray-500 hover:text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden data-open:text-gray-900">
                  <span>Soluções</span>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="ml-2 size-5 text-gray-400 group-hover:text-gray-500 group-data-open:text-gray-600 group-data-open:group-hover:text-gray-500"
                  />
                </PopoverButton>

                <PopoverPanel
                  transition
                  className="absolute z-10 mt-3 -ml-4 w-screen max-w-md transform px-2 transition data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in sm:px-0 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2"
                >
                  <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
                    <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                      {features.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="-m-3 flex items-start rounded-lg p-3 hover:bg-gray-50"
                        >
                          <item.icon aria-hidden="true" className="size-6 shrink-0 text-indigo-600" />
                          <div className="ml-4">
                            <p className="text-base font-medium text-gray-900">{item.name}</p>
                            <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                    <div className="space-y-6 bg-gray-50 px-5 py-5 sm:flex sm:space-y-0 sm:space-x-10 sm:px-8">
                      {callsToAction.map((item) => (
                        <div key={item.name} className="flow-root">
                          <a
                            href={item.href}
                            className="-m-3 flex items-center rounded-md p-3 text-base font-medium text-gray-900 hover:bg-gray-100"
                          >
                            <item.icon aria-hidden="true" className="size-6 shrink-0 text-gray-400" />
                            <span className="ml-3">{item.name}</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverPanel>
              </Popover>

              <a href="#" className="text-base font-medium text-gray-500 hover:text-gray-900">
                Preços
              </a>
              <a href="#" className="text-base font-medium text-gray-500 hover:text-gray-900">
                Documentação
              </a>

              <Popover className="relative">
                <PopoverButton className="group inline-flex items-center rounded-md bg-white text-base font-medium text-gray-500 hover:text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden data-open:text-gray-900">
                  <span>Mais</span>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="ml-2 size-5 text-gray-400 group-hover:text-gray-500 group-data-open:text-gray-600 group-data-open:group-hover:text-gray-500"
                  />
                </PopoverButton>

                <PopoverPanel
                  transition
                  className="absolute left-1/2 z-10 mt-3 w-screen max-w-md -translate-x-1/2 transform px-2 transition data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in sm:px-0"
                >
                  <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
                    <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                      {resources.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="-m-3 flex items-start rounded-lg p-3 hover:bg-gray-50"
                        >
                          <item.icon aria-hidden="true" className="size-6 shrink-0 text-indigo-600" />
                          <div className="ml-4">
                            <p className="text-base font-medium text-gray-900">{item.name}</p>
                            <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                    <div className="bg-gray-50 px-5 py-5 sm:px-8 sm:py-8">
                      <div>
                        <h3 className="text-base font-medium text-gray-500">Publicações recentes</h3>
                        <ul role="list" className="mt-4 space-y-4">
                          {recentPosts.map((item) => (
                            <li key={item.id} className="truncate text-base">
                              <a href={item.href} className="font-medium text-gray-900 hover:text-gray-700">
                                {item.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-5 text-sm">
                        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                          Ver todos os posts
                          <span aria-hidden="true"> &rarr;</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </PopoverPanel>
              </Popover>
            </PopoverGroup>
            <div className="hidden items-center justify-end md:flex md:flex-1 lg:w-0">
              <a href="#" className="text-base font-medium whitespace-nowrap text-gray-500 hover:text-gray-900">
                Entrar
              </a>
              <a
                href="#"
                className="ml-8 inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium whitespace-nowrap text-white shadow-xs hover:bg-indigo-700"
              >
                Criar conta
              </a>
            </div>
          </div>
        </div>

        <PopoverPanel
          transition
          className="absolute inset-x-0 top-0 z-10 origin-top-right transform p-2 transition data-closed:scale-95 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-100 data-leave:ease-in md:hidden"
        >
          <div className="divide-y-2 divide-gray-50 rounded-lg bg-white shadow-lg ring-1 ring-black/5">
            <div className="px-5 pt-5 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <img
                    alt="Sua Empresa"
                    src="https://tailwindcss.com/mais-assets/img/logos/mark.svg?color=indigo&shade=600"
                    className="h-8 w-auto"
                  />
                </div>
                <div className="-mr-2">
                  <PopoverButton className="relative inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden focus:ring-inset">
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Fechar menu</span>
                    <XMarkIcon aria-hidden="true" className="size-6" />
                  </PopoverButton>
                </div>
              </div>
              <div className="mt-6">
                <nav className="grid gap-y-8">
                  {features.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="-m-3 flex items-center rounded-md p-3 hover:bg-gray-50"
                    >
                      <item.icon aria-hidden="true" className="size-6 shrink-0 text-indigo-600" />
                      <span className="ml-3 text-base font-medium text-gray-900">{item.name}</span>
                    </a>
                  ))}
                </nav>
              </div>
            </div>
            <div className="space-y-6 px-5 py-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <a href="#" className="text-base font-medium text-gray-900 hover:text-gray-700">
                  Preços
                </a>

                <a href="#" className="text-base font-medium text-gray-900 hover:text-gray-700">
                  Documentação
                </a>
                {resources.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-base font-medium text-gray-900 hover:text-gray-700"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div>
                <a
                  href="#"
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-xs hover:bg-indigo-700"
                >
                  Criar conta
                </a>
                <p className="mt-6 text-center text-base font-medium text-gray-500">
                  Já é cliente?
                  <a href="#" className="text-indigo-600 hover:text-indigo-500">
                    Entrar
                  </a>
                </p>
              </div>
            </div>
          </div>
        </PopoverPanel>
      </Popover>

      <main className="lg:relative">
        <div className="mx-auto w-full max-w-7xl pt-16 pb-20 text-center lg:py-48 lg:text-left">
          <div className="px-6 sm:px-8 lg:w-1/2 xl:pr-16">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
              <span className="block xl:inline">Dados para fortalecer seu</span>{' '}
              <span className="block text-indigo-600 xl:inline">negócio digital</span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-lg text-gray-500 sm:text-xl md:mt-5 md:max-w-3xl">
              Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
            </p>
            <div className="mt-10 sm:flex sm:justify-center lg:justify-start">
              <div className="rounded-md shadow-sm">
                <a
                  href="#"
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:px-10 md:py-4 md:text-lg"
                >
                  Começar
                </a>
              </div>
              <div className="mt-3 rounded-md shadow-sm sm:mt-0 sm:ml-3">
                <a
                  href="#"
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-indigo-600 hover:bg-gray-50 md:px-10 md:py-4 md:text-lg"
                >
                  Demonstração ao vivo
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="relative h-64 w-full sm:h-72 md:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-1/2">
          <img
            alt=""
            src="https://images.unsplash.com/photo-1520333789090-1afc82db536a?ixlib=rb-1.2.1&auto=format&fit=crop&w=2102&q=80"
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      </main>
    </div>
  )
}
