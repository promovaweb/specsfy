import { CheckCircleIcon } from '@heroicons/react/20/solid'

const tiers = [
  {
    name: 'Básico',
    id: 'tier-basic',
    href: '#',
    price: { monthly: '$19', annually: '$15' },
    description: 'Tudo o que é necessário para começar.',
    features: ['5 produtos', 'Até 1.000 assinantes', 'Análises básicas', 'Resposta do suporte em até 48 horas'],
  },
  {
    name: 'Essencial',
    id: 'tier-essential',
    href: '#',
    price: { monthly: '$49', annually: '$39' },
    description: 'Tudo do Básico, além de ferramentas essenciais para expandir sua empresa.',
    features: [
      '25 produtos',
      'Até 10.000 assinantes',
      'Análises avançadas',
      'Resposta do suporte em até 24 horas',
      'Automações de marketing',
    ],
  },
  {
    name: 'Crescimento',
    id: 'tier-growth',
    href: '#',
    price: { monthly: '$99', annually: '$79' },
    description: 'Tudo do Essencial, além de colaboração e análises aprofundadas.',
    features: [
      'Produtos ilimitados',
      'Assinantes ilimitados',
      'Análises avançadas',
      'Resposta do suporte dedicado em até 1 hora',
      'Automações de marketing',
      'Ferramentas personalizadas de relatórios',
    ],
  },
]

export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl sm:text-center">
          <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Preços</h2>
          <p className="mt-2 text-5xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-6xl sm:text-balance dark:text-white">
            Preços que crescem com você
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-pretty text-gray-600 sm:text-center sm:text-xl/8 dark:text-gray-400">
          Escolha um plano acessível com recursos para engajar seu público e criar relacionamentos com clientes
          relacionamentos e aumentar as vendas.
        </p>
        <div className="mt-20 flow-root">
          <div className="isolate -mt-16 grid max-w-sm grid-cols-1 gap-y-16 divide-y divide-gray-100 sm:mx-auto lg:-mx-8 lg:mt-0 lg:max-w-none lg:grid-cols-3 lg:divide-x lg:divide-y-0 xl:-mx-4 dark:divide-white/10">
            {tiers.map((tier) => (
              <div key={tier.id} className="pt-16 lg:px-8 lg:pt-0 xl:px-14">
                <h3 id={tier.id} className="text-base/7 font-semibold text-gray-900 dark:text-white">
                  {tier.name}
                </h3>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {tier.price.monthly}
                  </span>
                  <span className="text-sm/6 font-semibold text-gray-600 dark:text-gray-400">/mês</span>
                </p>
                <p className="mt-3 text-sm/6 text-gray-500 dark:text-gray-400">
                  {tier.price.annually} por mês if paid annually
                </p>
                <a
                  href={tier.href}
                  aria-describedby={tier.id}
                  className="mt-10 block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-400"
                >
                  Comprar plano
                </a>
                <p className="mt-10 text-sm/6 font-semibold text-gray-900 dark:text-white">{tier.description}</p>
                <ul role="list" className="mt-6 space-y-3 text-sm/6 text-gray-600 dark:text-gray-300">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckCircleIcon
                        aria-hidden="true"
                        className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
