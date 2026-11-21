import { CheckIcon } from '@heroicons/react/20/solid'

const tiers = [
  {
    name: 'Pessoal',
    id: 'tier-hobby',
    href: '#',
    priceMensalmente: '$29',
    description: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    features: ['5 produtos', 'Até 1.000 assinantes', 'Análises básicas', 'Resposta do suporte em até 48 horas'],
  },
  {
    name: 'Equipe',
    id: 'tier-team',
    href: '#',
    priceMensalmente: '$99',
    description: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    features: [
      'Produtos ilimitados',
      'Assinantes ilimitados',
      'Análises avançadas',
      'Resposta do suporte dedicado em até 1 hora',
      'Automações de marketing',
    ],
  },
]

export default function Example() {
  return (
    <div className="isolate overflow-hidden bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 pt-24 pb-96 text-center sm:pt-32 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-base/7 font-semibold text-indigo-400">Preços</h2>
          <p className="mt-2 text-5xl font-semibold tracking-tight text-balance text-white sm:text-6xl">
            Escolha o plano certo para você
          </p>
        </div>
        <div className="relative mt-6">
          <p className="mx-auto max-w-2xl text-lg font-medium text-pretty text-gray-400 sm:text-xl/8">
            Escolha um plano acessível com recursos para engajar seu público e criar relacionamentos com clientes
            relacionamentos e aumentar as vendas.
          </p>
          <svg
            viewBox="0 0 1208 1024"
            className="absolute -top-10 left-1/2 -z-10 h-256 -translate-x-1/2 mask-[radial-gradient(closest-side,white,transparent)] sm:-top-12 md:-top-20 lg:-top-12 xl:top-0"
          >
            <ellipse cx={604} cy={512} rx={604} ry={512} fill="url(#6d1bd035-0dd1-437e-93fa-59d316231eb0)" />
            <defs>
              <radialGradient id="6d1bd035-0dd1-437e-93fa-59d316231eb0">
                <stop stopColor="#7775D6" />
                <stop offset={1} stopColor="#E935C1" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
      <div className="flow-root bg-white pb-24 sm:pb-32 dark:bg-gray-900">
        <div className="-mt-80">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto grid max-w-md grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-2">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="flex flex-col justify-between rounded-3xl bg-white p-8 shadow-xl outline-1 outline-gray-900/10 sm:p-10 dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
                >
                  <div>
                    <h3 id={tier.id} className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">
                      {tier.name}
                    </h3>
                    <div className="mt-4 flex items-baseline gap-x-2">
                      <span className="text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">
                        {tier.priceMensalmente}
                      </span>
                      <span className="text-base/7 font-semibold text-gray-600 dark:text-gray-400">/mês</span>
                    </div>
                    <p className="mt-6 text-base/7 text-gray-600 dark:text-gray-300">{tier.description}</p>
                    <ul role="list" className="mt-10 space-y-4 text-sm/6 text-gray-600 dark:text-gray-300">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex gap-x-3">
                          <CheckIcon
                            aria-hidden="true"
                            className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <a
                    href={tier.href}
                    aria-describedby={tier.id}
                    className="mt-8 block rounded-md bg-indigo-600 px-3.5 py-2 text-center text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-400"
                  >
                    Começar hoje
                  </a>
                </div>
              ))}
              <div className="flex flex-col items-start gap-x-8 gap-y-6 rounded-3xl p-8 ring-1 ring-gray-900/10 sm:gap-y-10 sm:p-10 lg:col-span-2 lg:flex-row lg:items-center dark:bg-gray-800/20 dark:ring-white/10">
                <div className="lg:min-w-0 lg:flex-1">
                  <h3 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Com desconto</h3>
                  <p className="mt-1 text-base/7 text-gray-600 dark:text-gray-400">
                    Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                  </p>
                </div>
                <a
                  href="#"
                  className="rounded-md px-3.5 py-2 text-sm/6 font-semibold text-indigo-600 inset-ring inset-ring-indigo-200 hover:inset-ring-indigo-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-white/10 dark:text-white dark:inset-ring-white/5 dark:hover:bg-white/20 dark:hover:inset-ring-white/5 dark:focus-visible:outline-white/75"
                >
                  Comprar licença com desconto <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
