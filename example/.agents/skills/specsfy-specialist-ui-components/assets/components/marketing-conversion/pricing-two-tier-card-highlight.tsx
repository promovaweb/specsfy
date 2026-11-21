import { CheckIcon } from '@heroicons/react/20/solid'

const tiers = [
  {
    name: 'Pessoal',
    id: 'tier-personal',
    href: '#',
    priceMensalmente: '$29',
    description: "O plano ideal para começar a usar nosso produto.",
    features: [
      '25 produtos',
      'Até 10.000 assinantes',
      'Segmentação de público',
      'Análises avançadas',
      'Suporte por email',
      'Automações de marketing',
    ],
    featured: true,
  },
  {
    name: 'Equipe',
    id: 'tier-team',
    href: '#',
    priceMensalmente: '$99',
    description: 'Um plano que acompanha o crescimento acelerado da sua empresa.',
    features: ['Suporte prioritário', 'Login único', 'Integrações empresariais', 'Ferramentas personalizadas de relatórios'],
    featured: false,
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  return (
    <div className="relative isolate bg-white px-6 py-24 sm:py-32 lg:px-8 dark:bg-gray-900">
      <div aria-hidden="true" className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl">
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="mx-auto aspect-1155/678 w-288.75 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
        />
      </div>
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Preços</h2>
        <p className="mt-2 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-6xl dark:text-white">
          Escolha o plano certo para você
        </p>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-pretty text-gray-600 sm:text-xl/8 dark:text-gray-400">
        Escolha um plano acessível com recursos para engajar seu público e criar relacionamentos com clientes
        relacionamentos e aumentar as vendas.
      </p>
      <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
        {tiers.map((tier, tierIdx) => (
          <div
            key={tier.id}
            className={classNames(
              tier.featured
                ? 'relative bg-white shadow-2xl dark:bg-gray-800 dark:shadow-none'
                : 'bg-white/60 sm:mx-8 lg:mx-0 dark:bg-gray-800/50',
              tier.featured
                ? ''
                : tierIdx === 0
                  ? 'rounded-t-3xl sm:rounded-b-none lg:rounded-tr-none lg:rounded-bl-3xl'
                  : 'sm:rounded-t-none lg:rounded-tr-3xl lg:rounded-bl-none',
              'rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10 dark:ring-white/10',
            )}
          >
            <h3 id={tier.id} className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">
              {tier.name}
            </h3>
            <p className="mt-4 flex items-baseline gap-x-2">
              <span className="text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {tier.priceMensalmente}
              </span>
              <span className="text-base text-gray-500 dark:text-gray-400">/mês</span>
            </p>
            <p className="mt-6 text-base/7 text-gray-600 dark:text-gray-300">{tier.description}</p>
            <ul role="list" className="mt-8 space-y-3 text-sm/6 text-gray-600 sm:mt-10 dark:text-gray-300">
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <CheckIcon aria-hidden="true" className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400" />
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href={tier.href}
              aria-describedby={tier.id}
              className={classNames(
                tier.featured
                  ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400'
                  : 'text-indigo-600 inset-ring inset-ring-indigo-200 hover:inset-ring-indigo-300 focus-visible:outline-indigo-600 dark:bg-white/10 dark:text-white dark:inset-ring-white/5 dark:hover:bg-white/20 dark:hover:inset-ring-white/5 dark:focus-visible:outline-white/75',
                'mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10 dark:focus-visible:outline-indigo-500',
              )}
            >
              Começar hoje
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
