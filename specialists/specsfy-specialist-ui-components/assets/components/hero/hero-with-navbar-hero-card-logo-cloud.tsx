import { Popover, PopoverButton, PopoverGroup, PopoverPanel } from '@headlessui/react'
import {
  Bars3Icon,
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleLeftRightIcon,
  InboxIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/20/solid'

const solutions = [
  {
    name: 'Caixa de entrada',
    description: 'Entenda melhor de onde vem o seu tráfego.',
    href: '#',
    icon: InboxIcon,
  },
  {
    name: 'Mensagens',
    description: 'Converse diretamente com seus clientes de forma mais relevante.',
    href: '#',
    icon: ChatBubbleBottomCenterTextIcon,
  },
  {
    name: 'Chat ao vivo',
    description: "Os dados dos seus clientes permanecerão protegidos.",
    href: '#',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    name: 'Base de conhecimento',
    description: "Conecte as ferramentas de terceiros que você já usa.",
    href: '#',
    icon: QuestionMarkCircleIcon,
  },
]

const navigation = [
  { name: 'Preços', href: '#' },
  { name: 'Parceiros', href: '#' },
  { name: 'Empresa', href: '#' },
]

export default function Example() {
  return (
    <div className="bg-white">
      <header>
        <Popover className="relative bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:justify-start md:space-x-10 lg:px-8">
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
                  className="absolute z-10 mt-3 -ml-4 w-screen max-w-md transform transition data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in lg:left-1/2 lg:ml-0 lg:max-w-2xl lg:-translate-x-1/2"
                >
                  <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
                    <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8 lg:grid-cols-2">
                      {solutions.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="-m-3 flex items-start rounded-lg p-3 hover:bg-gray-50"
                        >
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white sm:size-12">
                            <item.icon aria-hidden="true" className="size-6" />
                          </div>
                          <div className="ml-4">
                            <p className="text-base font-medium text-gray-900">{item.name}</p>
                            <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </PopoverPanel>
              </Popover>

              {navigation.map((item) => (
                <a key={item.name} href={item.href} className="text-base font-medium text-gray-500 hover:text-gray-900">
                  {item.name}
                </a>
              ))}
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

          <PopoverPanel
            transition
            className="absolute inset-x-0 top-0 z-30 origin-top-right transform p-2 transition data-closed:scale-95 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-100 data-leave:ease-in md:hidden"
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
                  <nav className="grid grid-cols-1 gap-7">
                    {solutions.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="-m-3 flex items-center rounded-lg p-3 hover:bg-gray-50"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white">
                          <item.icon aria-hidden="true" className="size-6" />
                        </div>
                        <div className="ml-4 text-base font-medium text-gray-900">{item.name}</div>
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
              <div className="px-5 py-6">
                <div className="grid grid-cols-2 gap-4">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="text-base font-medium text-gray-900 hover:text-gray-700"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="mt-6">
                  <a
                    href="#"
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-xs hover:bg-indigo-700"
                  >
                    Criar conta
                  </a>
                  <p className="mt-6 text-center text-base font-medium text-gray-500">
                    Já é cliente?
                    <a href="#" className="text-gray-900">
                      Entrar
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </PopoverPanel>
        </Popover>
      </header>

      <main>
        <div>
          <div className="relative">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gray-100" />
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
                <div className="absolute inset-0">
                  <img
                    alt="Pessoas trabalhando em notebooks"
                    src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2830&q=80&sat=-100"
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-0 bg-indigo-700 mix-blend-multiply" />
                </div>
                <div className="relative px-6 py-16 sm:py-24 lg:px-8 lg:py-32">
                  <h1 className="text-center text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                    <span className="block text-white">Assuma o controle do seu</span>
                    <span className="block text-indigo-200">atendimento ao cliente</span>
                  </h1>
                  <p className="mx-auto mt-6 max-w-lg text-center text-xl text-indigo-200 sm:max-w-3xl">
                    Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                  </p>
                  <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
                    <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
                      <a
                        href="#"
                        className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-indigo-700 shadow-xs hover:bg-indigo-50 sm:px-8"
                      >
                        Começar
                      </a>
                      <a
                        href="#"
                        className="flex items-center justify-center rounded-md border border-transparent bg-indigo-500/60 px-4 py-3 text-base font-medium text-white shadow-xs hover:bg-indigo-500/70 sm:px-8"
                      >
                        Demonstração ao vivo
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100">
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
              <p className="text-center text-base font-semibold text-gray-500">
                A confiança de mais de cinco pequenas empresas
              </p>
              <div className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-6 lg:grid-cols-5">
                <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
                  <img
                    alt="Tuple"
                    src="https://tailwindcss.com/mais-assets/img/logos/tuple-logo-gray-400.svg"
                    className="h-12"
                  />
                </div>
                <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
                  <img
                    alt="Mirage"
                    src="https://tailwindcss.com/mais-assets/img/logos/mirage-logo-gray-400.svg"
                    className="h-12"
                  />
                </div>
                <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
                  <img
                    alt="StaticKit"
                    src="https://tailwindcss.com/mais-assets/img/logos/statickit-logo-gray-400.svg"
                    className="h-12"
                  />
                </div>
                <div className="col-span-1 flex justify-center md:col-span-2 md:col-start-2 lg:col-span-1">
                  <img
                    alt="Transistor"
                    src="https://tailwindcss.com/mais-assets/img/logos/transistor-logo-gray-400.svg"
                    className="h-12"
                  />
                </div>
                <div className="col-span-2 flex justify-center md:col-span-2 md:col-start-4 lg:col-span-1">
                  <img
                    alt="Workcation"
                    src="https://tailwindcss.com/mais-assets/img/logos/workcation-logo-gray-400.svg"
                    className="h-12"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
