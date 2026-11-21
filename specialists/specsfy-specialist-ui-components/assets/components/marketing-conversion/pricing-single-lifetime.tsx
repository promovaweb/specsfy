import { CheckIcon } from '@heroicons/react/20/solid'

const includedFeatures = [
  'Acesso ao fórum privado',
  'Recursos para integrantes',
  'Entrada para a conferência anual',
  'Camiseta oficial para integrantes',
]

export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl sm:text-center">
          <h2 className="text-5xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-6xl sm:text-balance dark:text-white">
            Preços simples e transparentes
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-pretty text-gray-500 sm:text-xl/8 dark:text-gray-400">
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none dark:bg-gray-800/50 dark:ring-white/10">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">Assinatura vitalícia</h3>
            <p className="mt-6 text-base/7 text-gray-600 dark:text-gray-300">
              Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
            </p>
            <div className="mt-10 flex items-center gap-x-4">
              <h4 className="flex-none text-sm/6 font-semibold text-indigo-600 dark:text-indigo-400">
                O que está incluído
              </h4>
              <div className="h-px flex-auto bg-gray-100 dark:bg-white/10" />
            </div>
            <ul
              role="list"
              className="mt-8 grid grid-cols-1 gap-4 text-sm/6 text-gray-600 sm:grid-cols-2 sm:gap-6 dark:text-gray-300"
            >
              {includedFeatures.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <CheckIcon aria-hidden="true" className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:shrink-0">
            <div className="rounded-2xl bg-gray-50 py-10 text-center inset-ring inset-ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16 dark:bg-gray-900 dark:inset-ring-white/10">
              <div className="mx-auto max-w-xs px-8">
                <p className="text-base font-semibold text-gray-600 dark:text-gray-400">Pague uma vez e use para sempre</p>
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">$349</span>
                  <span className="text-sm/6 font-semibold tracking-wide text-gray-600 dark:text-gray-400">USD</span>
                </p>
                <a
                  href="#"
                  className="mt-10 block w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                >
                  Obter acesso
                </a>
                <p className="mt-6 text-xs/5 text-gray-600 dark:text-gray-400">
                  Faturas e recibos disponíveis para facilitar o reembolso pela empresa
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
