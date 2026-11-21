import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline'

export default function Example() {
  return (
    <div className="relative bg-white">
      <div className="absolute inset-0">
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gray-50" />
      </div>
      <div className="relative mx-auto max-w-7xl lg:grid lg:grid-cols-5">
        <div className="bg-gray-50 px-6 py-16 lg:col-span-2 lg:px-8 lg:py-24 xl:pr-12">
          <div className="mx-auto max-w-lg">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Entre em contato</h2>
            <p className="mt-3 text-lg/6 text-gray-500">
              Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
            </p>
            <dl className="mt-8 text-base text-gray-500">
              <div>
                <dt className="sr-only">Endereço postal</dt>
                <dd>
                  <p>742 Evergreen Terrace</p>
                  <p>Springfield, OR 12345</p>
                </dd>
              </div>
              <div className="mt-6">
                <dt className="sr-only">Telefone</dt>
                <dd className="flex">
                  <PhoneIcon aria-hidden="true" className="size-6 shrink-0 text-gray-400" />
                  <span className="ml-3">+1 (555) 123-4567</span>
                </dd>
              </div>
              <div className="mt-3">
                <dt className="sr-only">E-mail</dt>
                <dd className="flex">
                  <EnvelopeIcon aria-hidden="true" className="size-6 shrink-0 text-gray-400" />
                  <span className="ml-3">support@example.com</span>
                </dd>
              </div>
            </dl>
            <p className="mt-6 text-base text-gray-500">
              Procurando oportunidades de carreira?{' '}
              <a href="#" className="font-medium text-gray-700 underline">
                Ver todas as vagas
              </a>
              .
            </p>
          </div>
        </div>
        <div className="bg-white px-6 py-16 lg:col-span-3 lg:px-8 lg:py-24 xl:pl-12">
          <div className="mx-auto max-w-lg lg:max-w-none">
            <form action="#" method="POST" className="grid grid-cols-1 gap-y-6">
              <div>
                <label htmlFor="full-name" className="sr-only">
                  Nome completo
                </label>
                <input
                  id="full-name"
                  name="full-name"
                  type="text"
                  placeholder="Nome completo"
                  autoComplete="name"
                  className="block w-full rounded-md border border-gray-300 px-4 py-3 placeholder-gray-500 shadow-xs focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="E-mail"
                  autoComplete="email"
                  className="block w-full rounded-md border border-gray-300 px-4 py-3 placeholder-gray-500 shadow-xs focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="phone" className="sr-only">
                  Telefone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  placeholder="Telefone"
                  autoComplete="tel"
                  className="block w-full rounded-md border border-gray-300 px-4 py-3 placeholder-gray-500 shadow-xs focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="message" className="sr-only">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Mensagem"
                  className="block w-full rounded-md border border-gray-300 px-4 py-3 placeholder-gray-500 shadow-xs focus:border-indigo-500 focus:ring-indigo-500"
                  defaultValue={''}
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-xs hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
