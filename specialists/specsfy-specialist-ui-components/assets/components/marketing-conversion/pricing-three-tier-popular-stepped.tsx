import { CheckIcon } from '@heroicons/react/20/solid'

const tiers = [
  {
    name: 'Freelancer',
    id: 'tier-freelancer',
    href: '#',
    priceMensalmente: '$19',
    description: 'O essencial para entregar seu melhor trabalho aos clientes.',
    features: ['5 produtos', 'Até 1.000 assinantes', 'Análises básicas', 'Resposta do suporte em até 48 horas'],
    mostPopular: false,
  },
  {
    name: 'Startup',
    id: 'tier-startup',
    href: '#',
    priceMensalmente: '$49',
    description: 'Um plano que acompanha o crescimento acelerado da sua empresa.',
    features: [
      '25 produtos',
      'Até 10.000 assinantes',
      'Análises avançadas',
      'Resposta do suporte em até 24 horas',
      'Automações de marketing',
    ],
    mostPopular: true,
  },
  {
    name: 'Empresas',
    id: 'tier-enterprise',
    href: '#',
    priceMensalmente: '$99',
    description: 'Suporte e infraestrutura dedicados para sua empresa.',
    features: [
      'Produtos ilimitados',
      'Assinantes ilimitados',
      'Análises avançadas',
      'Resposta do suporte dedicado em até 1 hora',
      'Automações de marketing',
    ],
    mostPopular: false,
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Preços</h2>
          <p className="mt-2 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-6xl dark:text-white">
            Preços que crescem com você
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-pretty text-gray-600 sm:text-xl/8 dark:text-gray-400">
          Escolha um plano acessível com recursos para engajar seu público e criar relacionamentos com clientes
          relacionamentos e aumentar as vendas.
        </p>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier, tierIdx) => (
            <div
              key={tier.id}
              className={classNames(
                tier.mostPopular ? 'lg:z-10 lg:rounded-b-none' : 'lg:mt-8',
                tierIdx === 0 ? '-mr-px lg:rounded-r-none' : '',
                tierIdx === tiers.length - 1 ? '-ml-px lg:rounded-l-none' : '',
                'flex flex-col justify-between rounded-3xl bg-white p-8 inset-ring inset-ring-gray-200 xl:p-10 dark:bg-gray-800/50 dark:inset-ring-gray-700',
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3
                    id={tier.id}
                    className={classNames(
                      tier.mostPopular ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white',
                      'text-lg/8 font-semibold',
                    )}
                  >
                    {tier.name}
                  </h3>
                  {tier.mostPopular ? (
                    <p className="rounded-full bg-indigo-600/10 px-2.5 py-1 text-xs/5 font-semibold text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
                      Mais popular
                    </p>
                  ) : null}
                </div>
                <p className="mt-4 text-sm/6 text-gray-600 dark:text-gray-300">{tier.description}</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {tier.priceMensalmente}
                  </span>
                  <span className="text-sm/6 font-semibold text-gray-600 dark:text-gray-400">/mês</span>
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm/6 text-gray-600 dark:text-gray-300">
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
                className={classNames(
                  tier.mostPopular
                    ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-500 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400'
                    : 'text-indigo-600 inset-ring inset-ring-indigo-200 hover:inset-ring-indigo-300 dark:bg-white/10 dark:text-white dark:inset-ring-white/5 dark:hover:bg-white/20 dark:hover:inset-ring-white/5 dark:focus-visible:outline-white/75',
                  'mt-8 block rounded-md px-3 py-2 text-center text-sm/6 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500',
                )}
              >
                Comprar plano
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
