import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const tiers = [
  {
    name: 'Inicial',
    id: 'tier-starter',
    href: '#',
    featured: false,
    description: 'Tudo o que você precisa para começar.',
    price: { monthly: '$19', annually: '$199' },
    highlights: ['Domínios personalizados', 'Entrega de conteúdo na borda', 'Análises avançadas'],
  },
  {
    name: 'Escala',
    id: 'tier-scale',
    href: '#',
    featured: true,
    description: 'Mais flexibilidade em grande escala.',
    price: { monthly: '$99', annually: '$999' },
    highlights: [
      'Domínios personalizados',
      'Entrega de conteúdo na borda',
      'Análises avançadas',
      'Workshops trimestrais',
      'Login único (SSO)',
      'Suporte telefônico prioritário',
    ],
  },
  {
    name: 'Crescimento',
    id: 'tier-growth',
    href: '#',
    featured: false,
    description: 'Recursos adicionais para sua equipe em crescimento.',
    price: { monthly: '$49', annually: '$499' },
    highlights: ['Domínios personalizados', 'Entrega de conteúdo na borda', 'Análises avançadas', 'Workshops trimestrais'],
  },
]

const sections = [
  {
    name: 'Recursos',
    features: [
      { name: 'Entrega de conteúdo na borda', tiers: { Inicial: true, Crescimento: true, Escala: true } },
      { name: 'Domínios personalizados', tiers: { Inicial: '1', Crescimento: '3', Escala: 'Ilimitado' } },
      { name: 'Integrantes da equipe', tiers: { Inicial: '3', Crescimento: '20', Escala: 'Ilimitado' } },
      { name: 'Login único (SSO)', tiers: { Inicial: false, Crescimento: false, Escala: true } },
    ],
  },
  {
    name: 'Relatórios',
    features: [
      { name: 'Análises avançadas', tiers: { Inicial: true, Crescimento: true, Escala: true } },
      { name: 'Relatórios básicos', tiers: { Inicial: false, Crescimento: true, Escala: true } },
      { name: 'Relatórios profissionais', tiers: { Inicial: false, Crescimento: false, Escala: true } },
      { name: 'Criador de relatórios personalizados', tiers: { Inicial: false, Crescimento: false, Escala: true } },
    ],
  },
  {
    name: 'Suporte',
    features: [
      { name: 'Suporte online 24/7', tiers: { Inicial: true, Crescimento: true, Escala: true } },
      { name: 'Workshops trimestrais', tiers: { Inicial: false, Crescimento: true, Escala: true } },
      { name: 'Suporte telefônico prioritário', tiers: { Inicial: false, Crescimento: false, Escala: true } },
      { name: 'Integração individual', tiers: { Inicial: false, Crescimento: false, Escala: true } },
    ],
  },
]

export default function Example() {
  return (
    <form className="group/tiers isolate overflow-hidden bg-white dark:bg-gray-900">
      <div className="flow-root border-b border-b-transparent bg-gray-900 pt-24 pb-16 sm:pt-32 lg:pb-0 dark:border-b-white/5 dark:bg-gray-800/25">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative z-10">
            <h2 className="mx-auto max-w-4xl text-center text-5xl font-semibold tracking-tight text-balance text-white sm:text-6xl">
              Preços que crescem com você
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-pretty text-gray-400 sm:text-xl/8">
              Escolha um plano acessível com recursos para engajar seu público e criar
              relacionamentos com clientes e aumentar as vendas.
            </p>
            <div className="mt-16 flex justify-center">
              <fieldset aria-label="Frequência de pagamento">
                <div className="grid grid-cols-2 gap-x-1 rounded-full bg-white/5 p-1 text-center text-xs/5 font-semibold text-white">
                  <label className="group relative rounded-full px-2.5 py-1 has-checked:bg-indigo-500">
                    <input
                      defaultValue="monthly"
                      defaultChecked
                      name="frequency"
                      type="radio"
                      className="absolute inset-0 appearance-none rounded-full"
                    />
                    <span className="text-white">Mensalmente</span>
                  </label>
                  <label className="group relative rounded-full px-2.5 py-1 has-checked:bg-indigo-500">
                    <input
                      defaultValue="annually"
                      name="frequency"
                      type="radio"
                      className="absolute inset-0 appearance-none rounded-full"
                    />
                    <span className="text-white">Anualmente</span>
                  </label>
                </div>
              </fieldset>
            </div>
          </div>
          <div className="relative mx-auto mt-10 grid max-w-md grid-cols-1 gap-y-8 lg:mx-0 lg:-mb-14 lg:max-w-none lg:grid-cols-3">
            <svg
              viewBox="0 0 1208 1024"
              aria-hidden="true"
              className="absolute -bottom-48 left-1/2 h-256 -translate-x-1/2 translate-y-1/2 mask-[radial-gradient(closest-side,white,transparent)] lg:-top-48 lg:bottom-auto lg:translate-y-0"
            >
              <ellipse cx={604} cy={512} rx={604} ry={512} fill="url(#d25c25d4-6d43-4bf9-b9ac-1842a30a4867)" />
              <defs>
                <radialGradient id="d25c25d4-6d43-4bf9-b9ac-1842a30a4867">
                  <stop stopColor="#7775D6" />
                  <stop offset={1} stopColor="#E935C1" />
                </radialGradient>
              </defs>
            </svg>
            <div
              aria-hidden="true"
              className="hidden lg:absolute lg:inset-x-px lg:top-4 lg:bottom-0 lg:block lg:rounded-t-2xl lg:bg-gray-800/80 lg:ring-1 lg:ring-white/10"
            />
            {tiers.map((tier) => (
              <div
                key={tier.id}
                data-featured={tier.featured ? 'true' : undefined}
                className={classNames(
                  tier.featured
                    ? 'z-10 bg-white shadow-xl outline-1 outline-gray-900/10 dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10'
                    : 'bg-gray-800/80 outline-1 -outline-offset-1 outline-white/10 lg:bg-transparent lg:pb-14 lg:outline-0',
                  'group/tier relative rounded-2xl',
                )}
              >
                <div className="p-8 lg:pt-12 xl:p-10 xl:pt-14">
                  <h3
                    id={`tier-${tier.id}`}
                    className="text-sm/6 font-semibold text-white group-data-featured/tier:text-gray-900 dark:group-data-featured/tier:text-white"
                  >
                    {tier.name}
                  </h3>
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between lg:flex-col lg:items-stretch">
                    <div className="mt-2 flex items-center gap-x-4">
                      <p className="text-4xl font-semibold tracking-tight text-white group-not-has-[[name=frequency][value=monthly]:checked]/tiers:hidden group-data-featured/tier:text-gray-900 dark:group-data-featured/tier:text-white">
                        {tier.price.monthly}
                      </p>
                      <p className="text-4xl font-semibold tracking-tight text-white group-not-has-[[name=frequency][value=annually]:checked]/tiers:hidden group-data-featured/tier:text-gray-900 dark:group-data-featured/tier:text-white">
                        {tier.price.annually}
                      </p>
                      <div className="text-sm">
                        <p className="text-white group-data-featured/tier:text-gray-900 dark:group-data-featured/tier:text-white">
                          USD
                        </p>
                        <p className="text-gray-400 group-not-has-[[name=frequency][value=monthly]:checked]/tiers:hidden group-data-featured/tier:text-gray-500 dark:group-data-featured/tier:text-gray-400">
                          Cobrado mensalmente
                        </p>
                        <p className="text-gray-400 group-not-has-[[name=frequency][value=annually]:checked]/tiers:hidden group-data-featured/tier:text-gray-500 dark:group-data-featured/tier:text-gray-400">
                          Cobrado anualmente
                        </p>
                      </div>
                    </div>
                    <button
                      value={tier.id}
                      name="tier"
                      type="submit"
                      aria-describedby={`tier-${tier.id}`}
                      className="w-full rounded-md bg-white/10 px-3 py-2 text-center text-sm/6 font-semibold text-white not-group-data-featured:inset-ring not-group-data-featured:inset-ring-white/5 group-data-featured/tier:bg-indigo-600 group-data-featured/tier:shadow-xs hover:bg-white/20 group-data-featured/tier:hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/75 group-data-featured/tier:focus-visible:outline-indigo-600 dark:group-data-featured/tier:bg-indigo-500 dark:group-data-featured/tier:shadow-none dark:group-data-featured/tier:hover:bg-indigo-400 dark:group-data-featured/tier:focus-visible:outline-indigo-500"
                    >
                      Comprar este plano
                    </button>
                  </div>
                  <div className="mt-8 flow-root sm:mt-10">
                    <ul
                      role="list"
                      className="-my-2 divide-y divide-white/5 border-t border-white/5 text-sm/6 text-white group-data-featured/tier:divide-gray-900/5 group-data-featured/tier:border-gray-900/5 group-data-featured/tier:text-gray-600 lg:border-t-0 dark:group-data-featured/tier:divide-white/10 dark:group-data-featured/tier:border-white/10 dark:group-data-featured/tier:text-white"
                    >
                      {tier.highlights.map((mainFeature) => (
                        <li key={mainFeature} className="flex gap-x-3 py-2">
                          <CheckIcon
                            aria-hidden="true"
                            className="h-6 w-5 flex-none text-gray-500 group-data-featured/tier:text-indigo-600 dark:group-data-featured/tier:text-indigo-400"
                          />
                          {mainFeature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="relative bg-gray-50 lg:pt-14 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <section aria-labelledby="mobile-comparison-heading" className="lg:hidden">
            <h2 id="mobile-comparison-heading" className="sr-only">
              Comparação de recursos
            </h2>
            <div className="mx-auto max-w-2xl space-y-16">
              {tiers.map((tier) => (
                <div key={tier.id} className="border-t border-gray-900/10 dark:border-white/10">
                  <div
                    className={classNames(
                      tier.featured ? 'border-indigo-600 dark:border-indigo-500' : 'border-transparent',
                      '-mt-px w-72 border-t-2 pt-10 md:w-80',
                    )}
                  >
                    <h3
                      className={classNames(
                        tier.featured ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white',
                        'text-sm/6 font-semibold',
                      )}
                    >
                      {tier.name}
                    </h3>
                    <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">{tier.description}</p>
                  </div>
                  <div className="mt-10 space-y-10">
                    {sections.map((section) => (
                      <div key={section.name}>
                        <h4 className="text-sm/6 font-semibold text-gray-900 dark:text-white">{section.name}</h4>
                        <div className="relative mt-6">
                          <div
                            aria-hidden="true"
                            className="absolute inset-y-0 right-0 hidden w-1/2 rounded-lg bg-white shadow-xs sm:block dark:bg-gray-800/50 dark:shadow-none"
                          />
                          <div
                            className={classNames(
                              tier.featured
                                ? 'ring-2 ring-indigo-600 dark:ring-indigo-500'
                                : 'ring-1 ring-gray-900/10 dark:ring-white/10',
                              'relative rounded-lg bg-white shadow-xs sm:rounded-none sm:bg-transparent sm:shadow-none sm:ring-0 dark:bg-gray-800/50 dark:shadow-none dark:sm:bg-transparent',
                            )}
                          >
                            <dl className="divide-y divide-gray-200 text-sm/6 dark:divide-white/10">
                              {section.features.map((feature) => (
                                <div
                                  key={feature.name}
                                  className="flex items-center justify-between px-4 py-3 sm:grid sm:grid-cols-2 sm:px-0"
                                >
                                  <dt className="pr-4 text-gray-600 dark:text-gray-400">{feature.name}</dt>
                                  <dd className="flex items-center justify-end sm:justify-center sm:px-4">
                                    {typeof feature.tiers[tier.name] === 'string' ? (
                                      <span
                                        className={
                                          tier.featured
                                            ? 'font-semibold text-indigo-600 dark:text-indigo-400'
                                            : 'text-gray-900 dark:text-white'
                                        }
                                      >
                                        {feature.tiers[tier.name]}
                                      </span>
                                    ) : (
                                      <>
                                        {feature.tiers[tier.name] === true ? (
                                          <CheckIcon
                                            aria-hidden="true"
                                            className="mx-auto size-5 text-indigo-600 dark:text-indigo-400"
                                          />
                                        ) : (
                                          <XMarkIcon
                                            aria-hidden="true"
                                            className="mx-auto size-5 text-gray-400 dark:text-gray-600"
                                          />
                                        )}
                                        <span className="sr-only">
                                          {feature.tiers[tier.name] === true ? 'Sim' : 'Não'}
                                        </span>
                                      </>
                                    )}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          </div>
                          <div
                            aria-hidden="true"
                            className={classNames(
                              tier.featured
                                ? 'ring-2 ring-indigo-600 dark:ring-indigo-500'
                                : 'ring-1 ring-gray-900/10 dark:ring-white/10',
                              'pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 rounded-lg sm:block',
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section aria-labelledby="comparison-heading" className="hidden lg:block">
            <h2 id="comparison-heading" className="sr-only">
              Comparação de recursos
            </h2>
            <div className="grid grid-cols-4 gap-x-8 border-t border-gray-900/10 before:block dark:border-white/10">
              {tiers.map((tier) => (
                <div key={tier.id} aria-hidden="true" className="-mt-px">
                  <div
                    className={classNames(
                      tier.featured ? 'border-indigo-600 dark:border-indigo-500' : 'border-transparent',
                      'border-t-2 pt-10',
                    )}
                  >
                    <p
                      className={classNames(
                        tier.featured ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white',
                        'text-sm/6 font-semibold',
                      )}
                    >
                      {tier.name}
                    </p>
                    <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">{tier.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="-mt-6 space-y-16">
              {sections.map((section) => (
                <div key={section.name}>
                  <h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white">{section.name}</h3>
                  <div className="relative -mx-8 mt-10">
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-8 inset-y-0 grid grid-cols-4 gap-x-8 before:block"
                    >
                      <div className="size-full rounded-lg bg-white shadow-xs dark:bg-gray-800/50 dark:shadow-none" />
                      <div className="size-full rounded-lg bg-white shadow-xs dark:bg-gray-800/50 dark:shadow-none" />
                      <div className="size-full rounded-lg bg-white shadow-xs dark:bg-gray-800/50 dark:shadow-none" />
                    </div>
                    <table className="relative w-full border-separate border-spacing-x-8">
                      <thead>
                        <tr className="text-left">
                          <th scope="col">
                            <span className="sr-only">Recurso</span>
                          </th>
                          {tiers.map((tier) => (
                            <th key={tier.id} scope="col">
                              <span className="sr-only">{tier.name} tier</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.features.map((feature, featureIdx) => (
                          <tr key={feature.name}>
                            <th
                              scope="row"
                              className="w-1/4 py-3 pr-4 text-left text-sm/6 font-normal text-gray-900 dark:text-white"
                            >
                              {feature.name}
                              {featureIdx !== section.features.length - 1 ? (
                                <div className="absolute inset-x-8 mt-3 h-px bg-gray-200 dark:bg-white/10" />
                              ) : null}
                            </th>
                            {tiers.map((tier) => (
                              <td key={tier.id} className="relative w-1/4 px-4 py-0 text-center">
                                <span className="relative size-full py-3">
                                  {typeof feature.tiers[tier.name] === 'string' ? (
                                    <span
                                      className={classNames(
                                        tier.featured
                                          ? 'font-semibold text-indigo-600 dark:text-indigo-400'
                                          : 'text-gray-900 dark:text-white',
                                        'text-sm/6',
                                      )}
                                    >
                                      {feature.tiers[tier.name]}
                                    </span>
                                  ) : (
                                    <>
                                      {feature.tiers[tier.name] === true ? (
                                        <CheckIcon
                                          aria-hidden="true"
                                          className="mx-auto size-5 text-indigo-600 dark:text-indigo-400"
                                        />
                                      ) : (
                                        <XMarkIcon
                                          aria-hidden="true"
                                          className="mx-auto size-5 text-gray-400 dark:text-gray-600"
                                        />
                                      )}
                                      <span className="sr-only">
                                        {feature.tiers[tier.name] === true ? 'Sim' : 'Não'}
                                      </span>
                                    </>
                                  )}
                                </span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-8 inset-y-0 grid grid-cols-4 gap-x-8 before:block"
                    >
                      {tiers.map((tier) => (
                        <div
                          key={tier.id}
                          className={classNames(
                            tier.featured
                              ? 'ring-2 ring-indigo-600 dark:ring-indigo-500'
                              : 'ring-1 ring-gray-900/10 dark:ring-white/10',
                            'rounded-lg',
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </form>
  )
}
