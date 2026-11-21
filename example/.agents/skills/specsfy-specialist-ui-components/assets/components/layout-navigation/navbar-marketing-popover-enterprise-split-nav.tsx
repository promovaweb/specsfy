import { Popover, PopoverButton, PopoverGroup, PopoverPanel } from '@headlessui/react'
import {
  ArrowPathIcon,
  Bars3Icon,
  ChartBarIcon,
  CursorArrowRaysIcon,
  DocumentChartBarIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
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
  {
    name: 'Automações',
    description: 'Crie funis estratégicos que ajudem seus clientes a converter',
    href: '#',
    icon: ArrowPathIcon,
  },
  {
    name: 'Relatórios',
    description: 'Receba relatórios detalhados para tomar decisões mais bem informadas',
    href: '#',
    icon: DocumentChartBarIcon,
  },
]

const resources = [
  {
    name: 'Central de Ajuda',
    description: 'Encontre respostas nos fóruns ou fale com o suporte.',
    href: '#',
  },
  { name: 'Guias', description: 'Aprenda a aproveitar ao máximo a plataforma.', href: '#' },
  { name: 'Eventos', description: 'Veja encontros e outros eventos planejados perto de você.', href: '#' },
  { name: 'Segurança', description: 'Entenda como protegemos sua privacidade.', href: '#' },
]

export default function Example() {
  return (
    <Popover className="relative bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between p-6 md:justify-start md:space-x-10">
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
            <Popover className="relative">
              <PopoverButton className="group inline-flex items-center rounded-md bg-white text-base font-medium text-gray-500 hover:text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden data-open:text-gray-900 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-white dark:data-open:text-white">
                <span>Soluções</span>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="ml-2 size-5 text-gray-400 group-hover:text-gray-500 group-data-open:text-gray-600 group-data-open:group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 dark:group-data-open:text-gray-300"
                />
              </PopoverButton>

              <PopoverPanel
                transition
                className="absolute z-10 mt-3 -ml-4 w-screen max-w-md transform transition data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in lg:max-w-3xl"
              >
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 dark:ring-white/10">
                  <div className="relative grid gap-6 bg-white px-5 py-6 dark:bg-gray-900 sm:gap-8 sm:p-8 lg:grid-cols-2">
                    {solutions.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="-m-3 flex items-start rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-white/5"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-indigo-500 text-white sm:size-12">
                          <item.icon aria-hidden="true" className="size-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-base font-medium text-gray-900 dark:text-white">{item.name}</p>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                  <div className="bg-gray-50 p-5 dark:bg-gray-800/50 sm:p-8">
                    <a href="#" className="-m-3 flow-root rounded-md p-3 hover:bg-gray-100 dark:hover:bg-white/5">
                      <div className="flex items-center">
                        <div className="text-base font-medium text-gray-900 dark:text-white">Empresarial</div>
                        <span className="ml-3 inline-flex items-center rounded-full bg-indigo-100 px-3 py-0.5 text-xs/5 font-medium text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200">
                          Novo
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Fortaleça toda a equipe com ferramentas ainda mais avançadas.
                      </p>
                    </a>
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

            <Popover className="relative">
              <PopoverButton className="group inline-flex items-center rounded-md bg-white text-base font-medium text-gray-500 hover:text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden data-open:text-gray-900 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-white dark:data-open:text-white">
                <span>Mais</span>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="ml-2 size-5 text-gray-400 group-hover:text-gray-500 group-data-open:text-gray-600 group-data-open:group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 dark:group-data-open:text-gray-300"
                />
              </PopoverButton>

              <PopoverPanel
                transition
                className="absolute left-1/2 z-10 mt-3 w-screen max-w-xs -translate-x-1/2 transform px-2 transition data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in sm:px-0"
              >
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 dark:ring-white/10">
                  <div className="relative grid gap-6 bg-white px-5 py-6 dark:bg-gray-900 sm:gap-8 sm:p-8">
                    {resources.map((item) => (
                      <a key={item.name} href={item.href} className="-m-3 block rounded-md p-3 hover:bg-gray-50 dark:hover:bg-white/5">
                        <p className="text-base font-medium text-gray-900 dark:text-white">{item.name}</p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                      </a>
                    ))}
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

      <PopoverPanel
        transition
        className="absolute inset-x-0 top-0 origin-top-right transform p-2 transition data-closed:scale-95 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-100 data-leave:ease-in md:hidden"
      >
        <div className="divide-y-2 divide-gray-50 rounded-lg bg-white shadow-lg ring-1 ring-black/5 dark:divide-white/10 dark:bg-gray-900 dark:ring-white/10">
          <div className="px-5 pt-5 pb-6">
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
            <div className="mt-6">
              <nav className="grid gap-6">
                {solutions.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="-m-3 flex items-center rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-indigo-500 text-white">
                      <item.icon aria-hidden="true" className="size-6" />
                    </div>
                    <div className="ml-4 text-base font-medium text-gray-900 dark:text-white">{item.name}</div>
                  </a>
                ))}
              </nav>
            </div>
          </div>
          <div className="px-5 py-6">
            <div className="grid grid-cols-2 gap-4">
              <a href="#" className="text-base font-medium text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-300">
                Preços
              </a>

              <a href="#" className="text-base font-medium text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-300">
                Documentação
              </a>

              <a href="#" className="text-base font-medium text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-300">
                Empresarial
              </a>
              {resources.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-base font-medium text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-300"
                >
                  {item.name}
                </a>
              ))}
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
