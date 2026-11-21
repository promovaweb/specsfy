const stats = [
  { label: 'Transações a cada 24 horas', value: '44 milhões' },
  { label: 'Ativos sob gestão', value: '$119 trillion' },
  { label: 'Novos usuários por ano', value: '46,000' },
]

export default function Example() {
  return (
    <div className="bg-white py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
          <h2 className="text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
            Nossa missão
          </h2>
          <div className="mt-6 flex flex-col gap-x-8 gap-y-20 lg:flex-row">
            <div className="lg:w-full lg:max-w-2xl lg:flex-auto">
              <p className="text-xl/8 text-gray-600 dark:text-gray-300">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
              <p className="mt-10 max-w-xl text-base/7 text-gray-700 dark:text-gray-400">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
            </div>
            <div className="lg:flex lg:flex-auto lg:justify-center">
              <dl className="w-64 space-y-8 xl:w-80">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col-reverse gap-y-4">
                    <dt className="text-base/7 text-gray-600 dark:text-gray-400">{stat.label}</dt>
                    <dd className="text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
