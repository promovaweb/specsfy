import { Fragment } from 'react'
import { CheckIcon, MinusIcon } from '@heroicons/react/20/solid'

const tiers = [
  { name: 'Inicial', id: 'tier-starter', href: '#', priceMensalmente: '$19', mostPopular: false },
  { name: 'Crescimento', id: 'tier-growth', href: '#', priceMensalmente: '$49', mostPopular: true },
  { name: 'Escala', id: 'tier-scale', href: '#', priceMensalmente: '$99', mostPopular: false },
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
        <div className="mx-auto mt-12 max-w-md space-y-8 sm:mt-16 lg:hidden">
          {tiers.map((tier) => (
            <section
              key={tier.id}
              className={classNames(
                tier.mostPopular
                  ? 'rounded-xl bg-gray-400/5 inset-ring inset-ring-gray-200 dark:bg-white/5 dark:inset-ring-white/10'
                  : '',
                'p-8',
              )}
            >
              <h3 id={tier.id} className="text-sm/6 font-semibold text-gray-900 dark:text-white">
                {tier.name}
              </h3>
              <p className="mt-2 flex items-baseline gap-x-1 text-gray-900 dark:text-white">
                <span className="text-4xl font-semibold">{tier.priceMensalmente}</span>
                <span className="text-sm font-semibold">/mês</span>
              </p>
              <a
                href={tier.href}
                aria-describedby={tier.id}
                className={classNames(
                  tier.mostPopular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400'
                    : 'text-indigo-600 inset-ring inset-ring-indigo-200 hover:inset-ring-indigo-300 dark:bg-white/10 dark:text-white dark:inset-ring-white/5 dark:hover:bg-white/20 dark:hover:inset-ring-white/5 dark:focus-visible:outline-white/75',
                  'mt-8 block rounded-md px-3 py-2 text-center text-sm/6 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500',
                )}
              >
                Comprar plano
              </a>
              <ul role="list" className="mt-10 space-y-4 text-sm/6 text-gray-900 dark:text-gray-200">
                {sections.map((section) => (
                  <li key={section.name}>
                    <ul role="list" className="space-y-4">
                      {section.features.map((feature) =>
                        feature.tiers[tier.name] ? (
                          <li key={feature.name} className="flex gap-x-3">
                            <CheckIcon
                              aria-hidden="true"
                              className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400"
                            />
                            <span>
                              {feature.name}{' '}
                              {typeof feature.tiers[tier.name] === 'string' ? (
                                <span className="text-sm/6 text-gray-500 dark:text-gray-400">
                                  ({feature.tiers[tier.name]})
                                </span>
                              ) : null}
                            </span>
                          </li>
                        ) : null,
                      )}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <div className="isolate mt-20 hidden lg:block">
          <div className="relative -mx-8">
            {tiers.some((tier) => tier.mostPopular) ? (
              <div className="absolute inset-x-4 inset-y-0 -z-10 flex">
                <div
                  style={{ marginLeft: `${(tiers.findIndex((tier) => tier.mostPopular) + 1) * 25}%` }}
                  aria-hidden="true"
                  className="flex w-1/4 px-4"
                >
                  <div className="w-full rounded-t-xl border-x border-t border-gray-900/10 bg-gray-400/5 dark:border-white/10 dark:bg-gray-800/50" />
                </div>
              </div>
            ) : null}
            <table className="w-full table-fixed border-separate border-spacing-x-8 text-left">
              <caption className="sr-only">Comparação de planos</caption>
              <colgroup>
                <col className="w-1/4" />
                <col className="w-1/4" />
                <col className="w-1/4" />
                <col className="w-1/4" />
              </colgroup>
              <thead>
                <tr>
                  <td />
                  {tiers.map((tier) => (
                    <th key={tier.id} scope="col" className="px-6 pt-6 xl:px-8 xl:pt-8">
                      <div className="text-sm/7 font-semibold text-gray-900 dark:text-white">{tier.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">
                    <span className="sr-only">Preço</span>
                  </th>
                  {tiers.map((tier) => (
                    <td key={tier.id} className="px-6 pt-2 xl:px-8">
                      <div className="flex items-baseline gap-x-1 text-gray-900 dark:text-white">
                        <span className="text-4xl font-semibold">{tier.priceMensalmente}</span>
                        <span className="text-sm/6 font-semibold">/mês</span>
                      </div>
                      <a
                        href={tier.href}
                        className={classNames(
                          tier.mostPopular
                            ? 'bg-indigo-600 text-white hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400'
                            : 'text-indigo-600 inset-ring inset-ring-indigo-200 hover:inset-ring-indigo-300 dark:bg-white/10 dark:text-white dark:inset-ring-white/5 dark:hover:bg-white/20 dark:hover:inset-ring-white/5 dark:focus-visible:outline-white/75',
                          'mt-8 block rounded-md px-3 py-2 text-center text-sm/6 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500',
                        )}
                      >
                        Comprar plano
                      </a>
                    </td>
                  ))}
                </tr>
                {sections.map((section, sectionIdx) => (
                  <Fragment key={section.name}>
                    <tr>
                      <th
                        scope="colgroup"
                        colSpan={4}
                        className={classNames(
                          sectionIdx === 0 ? 'pt-8' : 'pt-16',
                          'pb-4 text-sm/6 font-semibold text-gray-900 dark:text-white',
                        )}
                      >
                        {section.name}
                        <div className="absolute inset-x-8 mt-4 h-px bg-gray-900/10 dark:bg-white/10" />
                      </th>
                    </tr>
                    {section.features.map((feature) => (
                      <tr key={feature.name}>
                        <th scope="row" className="py-4 text-sm/6 font-normal text-gray-900 dark:text-gray-200">
                          {feature.name}
                          <div className="absolute inset-x-8 mt-4 h-px bg-gray-900/5 dark:bg-white/5" />
                        </th>
                        {tiers.map((tier) => (
                          <td key={tier.id} className="px-6 py-4 xl:px-8">
                            {typeof feature.tiers[tier.name] === 'string' ? (
                              <div className="text-center text-sm/6 text-gray-500 dark:text-gray-400">
                                {feature.tiers[tier.name]}
                              </div>
                            ) : (
                              <>
                                {feature.tiers[tier.name] === true ? (
                                  <CheckIcon
                                    aria-hidden="true"
                                    className="mx-auto size-5 text-indigo-600 dark:text-indigo-400"
                                  />
                                ) : (
                                  <MinusIcon
                                    aria-hidden="true"
                                    className="mx-auto size-5 text-gray-400 dark:text-gray-500"
                                  />
                                )}
                                <span className="sr-only">
                                  {feature.tiers[tier.name] === true ? 'Incluído' : 'Não incluído'} em {tier.name}
                                </span>
                              </>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
