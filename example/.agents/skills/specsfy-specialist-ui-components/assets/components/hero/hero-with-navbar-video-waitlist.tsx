import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Produto', href: '#' },
  { name: 'Recursos', href: '#' },
  { name: 'Marketplace', href: '#' },
  { name: 'Empresa', href: '#' },
]

export default function Example() {
  return (
    <div className="relative overflow-hidden bg-white">
      <div aria-hidden="true" className="hidden lg:absolute lg:inset-0 lg:block">
        <svg
          fill="none"
          width={640}
          height={784}
          viewBox="0 0 640 784"
          className="absolute top-0 left-1/2 translate-x-64 -translate-y-8 transform"
        >
          <defs>
            <pattern
              x={118}
              y={0}
              id="9ebea6f4-a1f5-4d96-8c4e-4c2abf658047"
              width={20}
              height={20}
              patternUnits="userSpaceOnUse"
            >
              <rect x={0} y={0} fill="currentColor" width={4} height={4} className="text-gray-200" />
            </pattern>
          </defs>
          <rect y={72} fill="currentColor" width={640} height={640} className="text-gray-50" />
          <rect x={118} fill="url(#9ebea6f4-a1f5-4d96-8c4e-4c2abf658047)" width={404} height={784} />
        </svg>
      </div>

      <div className="relative pt-6 pb-16 sm:pb-24 lg:pb-32">
        <Popover>
          <nav aria-label="Global" className="relative mx-auto flex max-w-7xl items-center justify-between px-6">
            <div className="flex flex-1 items-center">
              <div className="flex w-full items-center justify-between md:w-auto">
                <a href="#">
                  <span className="sr-only">Sua Empresa</span>
                  <img
                    alt=""
                    src="https://tailwindcss.com/mais-assets/img/logos/mark.svg?color=indigo&shade=600"
                    className="h-8 w-auto sm:h-10"
                  />
                </a>
                <div className="-mr-2 flex items-center md:hidden">
                  <PopoverButton className="relative inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden focus:ring-inset">
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Abrir menu principal</span>
                    <Bars3Icon aria-hidden="true" className="size-6" />
                  </PopoverButton>
                </div>
              </div>
              <div className="hidden md:ml-10 md:block md:space-x-10">
                {navigation.map((item) => (
                  <a key={item.name} href={item.href} className="font-medium text-gray-500 hover:text-gray-900">
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
            <div className="hidden text-right md:block">
              <span className="inline-flex rounded-md shadow-md ring-1 ring-black/5">
                <a
                  href="#"
                  className="inline-flex items-center rounded-md border border-transparent bg-white px-4 py-2 text-base font-medium text-indigo-600 hover:bg-gray-50"
                >
                  Entrar
                </a>
              </span>
            </div>
          </nav>

          <PopoverPanel
            focus
            transition
            className="absolute inset-x-0 top-0 z-10 origin-top-right transform p-2 transition data-closed:scale-95 data-closed:opacity-0 data-enter:duration-150 data-enter:ease-out data-leave:duration-100 data-leave:ease-in md:hidden"
          >
            <div className="overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-black/5">
              <div className="flex items-center justify-between px-5 pt-4">
                <div>
                  <img
                    alt=""
                    src="https://tailwindcss.com/mais-assets/img/logos/mark.svg?color=indigo&shade=600"
                    className="h-8 w-auto"
                  />
                </div>
                <div className="-mr-2">
                  <PopoverButton className="relative inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden focus:ring-inset">
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Fechar menu principal</span>
                    <XMarkIcon aria-hidden="true" className="size-6" />
                  </PopoverButton>
                </div>
              </div>
              <div className="space-y-1 px-2 pt-2 pb-3">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <a
                href="#"
                className="block w-full bg-gray-50 px-5 py-3 text-center font-medium text-indigo-600 hover:bg-gray-100"
              >
                Entrar
              </a>
            </div>
          </PopoverPanel>
        </Popover>

        <main className="mx-auto mt-16 max-w-7xl px-4 px-6 sm:mt-24 lg:mt-32">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 lg:text-left">
              <h1>
                <span className="block text-base font-semibold text-gray-500 sm:text-lg lg:text-base xl:text-lg">
                  Em breve
                </span>
                <span className="mt-1 block text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl">
                  <span className="block text-gray-900">Dados para fortalecer seu</span>
                  <span className="block text-indigo-600">negócio digital</span>
                </span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
              <div className="mt-8 sm:mx-auto sm:max-w-lg sm:text-center lg:mx-0 lg:text-left">
                <p className="text-base font-medium text-gray-900">Cadastre-se para receber um aviso quando estiver pronto.</p>
                <form action="#" method="POST" className="mt-3 sm:flex">
                  <label htmlFor="email" className="sr-only">
                    E-mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Digite seu e-mail"
                    className="block w-full rounded-md border border-gray-300 p-3 text-base placeholder-gray-500 shadow-xs focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500 sm:flex-1"
                  />
                  <button
                    type="submit"
                    className="mt-3 w-full rounded-md border border-transparent bg-gray-800 px-6 py-3 text-base font-medium text-white shadow-xs hover:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden sm:mt-0 sm:ml-3 sm:inline-flex sm:w-auto sm:shrink-0 sm:items-center"
                  >
                    Avise-me
                  </button>
                </form>
                <p className="mt-3 text-sm text-gray-500">
                  Levamos a proteção dos seus dados a sério. Leia nossa
                  <a href="#" className="font-medium text-gray-900 underline">
                    Política de Privacidade
                  </a>
                  .
                </p>
              </div>
            </div>
            <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-6 lg:mx-0 lg:mt-0 lg:flex lg:max-w-none lg:items-center">
              <svg
                fill="none"
                width={640}
                height={784}
                viewBox="0 0 640 784"
                aria-hidden="true"
                className="absolute top-0 left-1/2 origin-top -translate-x-1/2 -translate-y-8 scale-75 transform sm:scale-100 lg:hidden"
              >
                <defs>
                  <pattern
                    x={118}
                    y={0}
                    id="4f4f415c-a0e9-44c2-9601-6ded5a34a13e"
                    width={20}
                    height={20}
                    patternUnits="userSpaceOnUse"
                  >
                    <rect x={0} y={0} fill="currentColor" width={4} height={4} className="text-gray-200" />
                  </pattern>
                </defs>
                <rect y={72} fill="currentColor" width={640} height={640} className="text-gray-50" />
                <rect x={118} fill="url(#4f4f415c-a0e9-44c2-9601-6ded5a34a13e)" width={404} height={784} />
              </svg>
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                <button
                  type="button"
                  className="relative block w-full overflow-hidden rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
                >
                  <span className="sr-only">Assista ao vídeo para saber mais</span>
                  <img
                    alt=""
                    src="https://images.unsplash.com/photo-1556740758-90de374c12ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                    className="w-full"
                  />
                  <span aria-hidden="true" className="absolute inset-0 flex size-full items-center justify-center">
                    <svg fill="currentColor" viewBox="0 0 84 84" className="size-20 text-indigo-500">
                      <circle r={42} cx={42} cy={42} fill="white" opacity="0.9" />
                      <path d="M55.5039 40.3359L37.1094 28.0729C35.7803 27.1869 34 28.1396 34 29.737V54.263C34 55.8604 35.7803 56.8131 37.1094 55.9271L55.5038 43.6641C56.6913 42.8725 56.6913 41.1275 55.5039 40.3359Z" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
