const stats = [
  { id: 1, name: 'Criadores na plataforma', value: '8,000+' },
  { id: 2, name: 'Taxa fixa da plataforma', value: '3%' },
  { id: 3, name: 'Garantia de disponibilidade', value: '99.9%' },
  { id: 4, name: 'Pagamentos aos criadores', value: '$70M' },
]

export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl dark:text-white">
              A confiança de criadores no mundo todo
            </h2>
            <p className="mt-4 text-lg/8 text-gray-600 dark:text-gray-300">
              Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
            </p>
          </div>
          <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.id} className="flex flex-col bg-gray-400/5 p-8 dark:bg-white/5">
                <dt className="text-sm/6 font-semibold text-gray-600 dark:text-gray-300">{stat.name}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
