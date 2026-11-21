export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
          <p className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Faça deploy mais rápido</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
            Um fluxo de trabalho melhor
          </h1>
          <div className="mt-10 grid max-w-xl grid-cols-1 gap-8 text-base/7 text-gray-700 lg:max-w-none lg:grid-cols-2 dark:text-gray-300">
            <div>
              <p>
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
              <p className="mt-8">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
            </div>
            <div>
              <p>
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
              <p className="mt-8">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
            </div>
          </div>
          <div className="mt-10 flex">
            <a
              href="#"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
            >
              Começar
            </a>
          </div>
        </div>
      </div>
      <div className="relative overflow-hidden pt-16 lg:pt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <img
            alt=""
            src="https://tailwindcss.com/mais-assets/img/component-images/project-app-screenshot.png"
            className="mb-[-12%] rounded-xl shadow-2xl ring-1 ring-gray-900/10 dark:hidden dark:shadow-xl dark:ring-white/10"
          />
          <img
            alt=""
            src="https://tailwindcss.com/mais-assets/img/component-images/dark-project-app-screenshot.png"
            className="mb-[-12%] rounded-xl shadow-2xl ring-1 ring-gray-900/10 not-dark:hidden dark:shadow-xl dark:ring-white/10"
          />
          <div aria-hidden="true" className="relative">
            <div className="absolute -inset-x-20 bottom-0 bg-linear-to-t from-white pt-[7%] dark:from-gray-900" />
          </div>
        </div>
      </div>
    </div>
  )
}
