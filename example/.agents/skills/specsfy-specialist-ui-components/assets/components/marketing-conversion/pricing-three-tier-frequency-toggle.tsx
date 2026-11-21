import { CheckIcon } from '@heroicons/react/20/solid'

const frequencies = [
  { value: 'monthly', label: 'Mensalmente', priceSuffix: '/mês' },
  { value: 'annually', label: 'Anualmente', priceSuffix: '/ano' },
]

const tiers = [
  {
    name: 'Freelancer',
    id: 'tier-freelancer',
    href: '#',
    price: { monthly: '$19', annually: '$199' },
    description: 'O essencial para entregar seu melhor trabalho aos clientes.',
    features: ['5 produtos', 'Até 1.000 assinantes', 'Análises básicas', 'Resposta do suporte em até 48 horas'],
    featured: false,
    cta: 'Comprar plano',
  },
  {
    name: 'Startup',
    id: 'tier-startup',
    href: '#',
    price: { monthly: '$29', annually: '$299' },
    description: 'Um plano que acompanha o crescimento acelerado da sua empresa.',
    features: [
      '25 produtos',
      'Até 10.000 assinantes',
      'Análises avançadas',
      'Resposta do suporte em até 24 horas',
      'Automações de marketing',
    ],
    featured: false,
    cta: 'Comprar plano',
  },
  {
    name: 'Empresas',
    id: 'tier-enterprise',
    href: '#',
    price: 'Custom',
    description: 'Suporte e infraestrutura dedicados para sua empresa.',
    features: [
      'Produtos ilimitados',
      'Assinantes ilimitados',
      'Análises avançadas',
      'Resposta do suporte dedicado em até 1 hora',
      'Automações de marketing',
      'Ferramentas personalizadas de relatórios',
    ],
    featured: true,
    cta: 'Falar com vendas',
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  return (
    <form className="group/tiers bg-white py-24 sm:py-32 dark:bg-gray-900">
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
        <div className="mt-16 flex justify-center">
          <fieldset aria-label="Frequência de pagamento">
            <div className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs/5 font-semibold inset-ring inset-ring-gray-200 dark:inset-ring-white/10">
              {frequencies.map((frequency) => (
                <label
                  key={frequency.value}
                  className="group relative rounded-full px-2.5 py-1 has-checked:bg-indigo-600 dark:has-checked:bg-indigo-500"
                >
                  <input
                    defaultValue={frequency.value}
                    defaultChecked={frequency.value === 'monthly'}
                    name="frequency"
                    type="radio"
                    className="absolute inset-0 appearance-none rounded-full"
                  />
                  <span className="text-gray-500 group-has-checked:text-white dark:text-gray-400">
                    {frequency.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              data-featured={tier.featured ? 'true' : undefined}
              className="group/tier rounded-3xl p-8 ring-1 ring-gray-200 data-featured:bg-gray-900 data-featured:ring-gray-900 xl:p-10 dark:bg-gray-800/50 dark:ring-white/10 dark:data-featured:bg-gray-800/50 dark:data-featured:ring-2 dark:data-featured:ring-indigo-500"
            >
              <h3
                id={`tier-${tier.id}`}
                className="text-lg/8 font-semibold text-gray-900 group-data-featured/tier:text-white dark:text-white dark:group-data-featured/tier:text-indigo-400"
              >
                {tier.name}
              </h3>
              <p className="mt-4 text-sm/6 text-gray-600 group-data-featured/tier:text-gray-300 dark:text-gray-300">
                {tier.description}
              </p>
              {typeof tier.price === 'string' ? (
                <p className="mt-6 text-4xl font-semibold tracking-tight text-gray-900 group-data-featured/tier:text-white dark:text-white">
                  {tier.price}
                </p>
              ) : (
                <>
                  <p className="mt-6 flex items-baseline gap-x-1 group-not-has-[[name=frequency][value=monthly]:checked]/tiers:hidden">
                    <span className="text-4xl font-semibold tracking-tight text-gray-900 group-data-featured/tier:text-white dark:text-white">
                      {tier.price.monthly}
                    </span>
                    <span className="text-sm/6 font-semibold text-gray-600 group-data-featured/tier:text-gray-300 dark:text-gray-400">
                      /mês
                    </span>
                  </p>
                  <p className="mt-6 flex items-baseline gap-x-1 group-not-has-[[name=frequency][value=annually]:checked]/tiers:hidden">
                    <span className="text-4xl font-semibold tracking-tight text-gray-900 group-data-featured/tier:text-white dark:text-white">
                      {tier.price.annually}
                    </span>
                    <span className="text-sm/6 font-semibold text-gray-600 group-data-featured/tier:text-gray-300 dark:text-gray-400">
                      /ano
                    </span>
                  </p>
                </>
              )}

              <button
                value={tier.id}
                name="tier"
                type="submit"
                aria-describedby={`tier-${tier.id}`}
                className="mt-6 block w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm/6 font-semibold text-white shadow-xs group-data-featured/tier:bg-white/10 group-data-featured/tier:inset-ring group-data-featured/tier:inset-ring-white/5 hover:bg-indigo-500 group-data-featured/tier:hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 group-data-featured/tier:focus-visible:outline-white/75 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
              >
                {tier.cta}
              </button>
              <ul
                role="list"
                className="mt-8 space-y-3 text-sm/6 text-gray-600 group-data-featured/tier:text-gray-300 xl:mt-10 dark:text-gray-300"
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon
                      aria-hidden="true"
                      className={classNames(
                        tier.featured ? 'text-white dark:text-indigo-400' : 'text-indigo-600 dark:text-indigo-400',
                        'h-6 w-5 flex-none',
                      )}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </form>
  )
}
