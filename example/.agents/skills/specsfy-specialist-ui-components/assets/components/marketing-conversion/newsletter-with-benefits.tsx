import { CalendarDaysIcon, HandCaptadosIcon } from '@heroicons/react/24/outline'

export default function Example() {
  return (
    <div className="relative isolate overflow-hidden bg-white py-16 sm:py-24 lg:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
          <div className="max-w-xl lg:max-w-lg">
            <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Assine nossa newsletter
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
            </p>
            <div className="mt-6 flex max-w-md gap-x-4">
              <label htmlFor="email-address" className="sr-only">
                Endereço de e-mail
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                placeholder="Digite seu e-mail"
                autoComplete="email"
                className="min-w-0 flex-auto rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-indigo-500"
              />
              <button
                type="submit"
                className="flex-none rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
              >
                Assinar
              </button>
            </div>
          </div>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:pt-2">
            <div className="flex flex-col items-start">
              <div className="rounded-md bg-white/50 p-2 ring-1 ring-gray-200 dark:bg-white/5 dark:ring-white/10">
                <CalendarDaysIcon aria-hidden="true" className="size-6 text-gray-600 dark:text-white" />
              </div>
              <dt className="mt-4 text-base font-semibold text-gray-900 dark:text-white">Artigos semanais</dt>
              <dd className="mt-2 text-base/7 text-gray-600 dark:text-gray-400">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </dd>
            </div>
            <div className="flex flex-col items-start">
              <div className="rounded-md bg-white/50 p-2 ring-1 ring-gray-200 dark:bg-white/5 dark:ring-white/10">
                <HandCaptadosIcon aria-hidden="true" className="size-6 text-gray-600 dark:text-white" />
              </div>
              <dt className="mt-4 text-base font-semibold text-gray-900 dark:text-white">Sem spam</dt>
              <dd className="mt-2 text-base/7 text-gray-600 dark:text-gray-400">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div aria-hidden="true" className="absolute top-0 left-1/2 -z-10 -translate-x-1/2 blur-3xl xl:-top-6">
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="aspect-1155/678 w-288.75 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 dark:opacity-30"
        />
      </div>
    </div>
  )
}
