const stats = [
  { label: 'Fundação', value: '2021' },
  { label: 'Profissionais', value: '37' },
  { label: 'Países', value: '12' },
  { label: 'Captados', value: '$25M' },
]

export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
          <p className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Faça deploy mais rápido</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
            Um fluxo de trabalho melhor
          </h1>
          <div className="mt-10 grid max-w-xl grid-cols-1 gap-8 text-base/7 text-gray-600 lg:max-w-none lg:grid-cols-2 dark:text-gray-300">
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
          <dl className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 sm:mt-20 sm:grid-cols-2 sm:gap-y-16 lg:mt-28 lg:grid-cols-4">
            {stats.map((stat, statIdx) => (
              <div
                key={statIdx}
                className="flex flex-col-reverse gap-y-3 border-l border-gray-200 pl-6 dark:border-white/20"
              >
                <dt className="text-base/7 text-gray-600 dark:text-gray-300">{stat.label}</dt>
                <dd className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
