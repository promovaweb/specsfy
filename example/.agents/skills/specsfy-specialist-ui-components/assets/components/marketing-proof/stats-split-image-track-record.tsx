const stats = [
  { id: 1, name: 'Criadores na plataforma', value: '8,000+' },
  { id: 2, name: 'Taxa fixa da plataforma', value: '3%' },
  { id: 3, name: 'Garantia de disponibilidade', value: '99.9%' },
  { id: 4, name: 'Pagamentos aos criadores', value: '$70M' },
]

export default function Example() {
  return (
    <div className="relative bg-white dark:bg-gray-900">
      <img
        alt=""
        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2850&q=80"
        className="h-56 w-full bg-gray-50 object-cover lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-1/2 dark:bg-gray-800"
      />
      <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
        <div className="px-6 pt-16 pb-24 sm:pt-20 sm:pb-32 lg:col-start-2 lg:px-8 lg:pt-32">
          <div className="mx-auto max-w-2xl lg:mr-0 lg:max-w-lg">
            <h2 className="text-base/8 font-semibold text-indigo-600 dark:text-indigo-400">Nosso histórico</h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
              A confiança de milhares de criadores no mundo todo
            </p>
            <p className="mt-6 text-lg/8 text-gray-600 dark:text-gray-300">
              Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
            </p>
            <dl className="mt-16 grid max-w-xl grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 xl:mt-16">
              {stats.map((stat) => (
                <div
                  key={stat.id}
                  className="flex flex-col gap-y-3 border-l border-gray-900/10 pl-6 dark:border-white/10"
                >
                  <dt className="text-sm/6 text-gray-600 dark:text-gray-400">{stat.name}</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
