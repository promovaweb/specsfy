'use client'

import { Fragment } from 'react'
import { CheckIcon, MinusIcon, PlusIcon } from '@heroicons/react/16/solid'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'

const tiers = [
  {
    name: 'Inicial',
    description: 'Tudo o que você precisa para começar.',
    priceMensalmente: '$19',
    href: '#',
    highlights: [
      { description: 'Domínios personalizados' },
      { description: 'Entrega de conteúdo na borda' },
      { description: 'Análises avançadas' },
      { description: 'Workshops trimestrais', disabled: true },
      { description: 'Login único (SSO)', disabled: true },
      { description: 'Suporte telefônico prioritário', disabled: true },
    ],
  },
  {
    name: 'Crescimento',
    description: 'Recursos adicionais para sua equipe em crescimento.',
    priceMensalmente: '$49',
    href: '#',
    highlights: [
      { description: 'Domínios personalizados' },
      { description: 'Entrega de conteúdo na borda' },
      { description: 'Análises avançadas' },
      { description: 'Workshops trimestrais' },
      { description: 'Login único (SSO)', disabled: true },
      { description: 'Suporte telefônico prioritário', disabled: true },
    ],
  },
  {
    name: 'Escala',
    description: 'Mais flexibilidade em grande escala.',
    priceMensalmente: '$99',
    href: '#',
    highlights: [
      { description: 'Domínios personalizados' },
      { description: 'Entrega de conteúdo na borda' },
      { description: 'Análises avançadas' },
      { description: 'Workshops trimestrais' },
      { description: 'Login único (SSO)' },
      { description: 'Suporte telefônico prioritário' },
    ],
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
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-6 max-lg:text-center lg:max-w-7xl lg:px-8">
        <h1 className="text-5xl font-semibold tracking-tight text-balance text-gray-950 sm:text-6xl lg:text-pretty dark:text-white">
          Preços que acompanham o tamanho da sua equipe
        </h1>
        <p className="mt-6 max-w-2xl text-lg font-medium text-pretty text-gray-600 max-lg:mx-auto sm:text-xl/8 dark:text-gray-400">
          Escolha um plano acessível com recursos para engajar seu público e criar relacionamentos com clientes
          relacionamentos e aumentar as vendas.
        </p>
      </div>
      <div className="relative pt-16 sm:pt-24">
        <div className="absolute inset-x-0 top-48 bottom-0 bg-[radial-gradient(circle_at_center_center,#7775D6,#592E71,#030712_70%)] lg:bg-[radial-gradient(circle_at_center_150%,#7775D6,#592E71,#030712_70%)] dark:bg-[radial-gradient(circle_at_center_center,#7775D680,#592E7180,transparent_70%)] dark:lg:bg-[radial-gradient(circle_at_center_150%,#7775D680,#592E7180,transparent_70%)]" />
        <div className="relative mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className="-m-2 grid grid-cols-1 rounded-4xl bg-white/2.5 shadow-[inset_0_0_2px_1px_#ffffff4d] ring-1 ring-black/5 max-lg:mx-auto max-lg:w-full max-lg:max-w-md dark:shadow-[inset_0_0_2px_1px_#ffffff32]"
              >
                <div className="grid grid-cols-1 rounded-4xl p-2 shadow-md shadow-black/5 dark:shadow-none">
                  <div className="rounded-3xl bg-white p-10 pb-9 shadow-2xl ring-1 ring-black/5 dark:bg-gray-800 dark:shadow-none dark:ring-white/10">
                    <h2 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {tier.name} <span className="sr-only">plano</span>
                    </h2>
                    <p className="mt-2 text-sm/6 text-pretty text-gray-600 dark:text-gray-300">{tier.description}</p>
                    <div className="mt-8 flex items-center gap-4">
                      <div className="text-5xl font-semibold text-gray-950 dark:text-white">{tier.priceMensalmente}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p>USD</p>
                        <p>por mês</p>
                      </div>
                    </div>
                    <div className="mt-8">
                      <a
                        href={tier.href}
                        aria-label={`Iniciar um teste grátis no plano ${tier.name}`}
                        className="inline-block rounded-md bg-indigo-600 px-3.5 py-2 text-center text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-400"
                      >
                        Iniciar teste grátis
                      </a>
                    </div>
                    <div className="mt-8">
                      <h3 className="text-sm/6 font-medium text-gray-950 dark:text-white">Comece a vender com:</h3>
                      <ul className="mt-3 space-y-3">
                        {tier.highlights.map((highlight) => (
                          <li
                            key={highlight.description}
                            data-disabled={highlight.disabled}
                            className="group flex items-start gap-4 text-sm/6 text-gray-600 data-disabled:text-gray-400 dark:text-gray-300 dark:data-disabled:text-gray-500"
                          >
                            <span className="inline-flex h-6 items-center">
                              <PlusIcon
                                aria-hidden="true"
                                className="size-4 fill-gray-400 group-data-disabled:fill-gray-300 dark:fill-gray-500 dark:group-data-disabled:fill-gray-600"
                              />
                            </span>
                            {highlight.disabled ? <span className="sr-only">Não incluído:</span> : null}
                            {highlight.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between py-16 opacity-60 max-sm:mx-auto max-sm:max-w-md max-sm:flex-wrap max-sm:justify-evenly max-sm:gap-x-4 max-sm:gap-y-4 sm:py-24">
            <img
              alt="Transistor"
              src="https://tailwindcss.com/mais-assets/img/logos/158x48/transistor-logo-white.svg"
              className="h-9 max-sm:mx-auto sm:h-8 lg:h-12"
            />
            <img
              alt="Laravel"
              src="https://tailwindcss.com/mais-assets/img/logos/158x48/laravel-logo-white.svg"
              className="h-9 max-sm:mx-auto sm:h-8 lg:h-12"
            />
            <img
              alt="Tuple"
              src="https://tailwindcss.com/mais-assets/img/logos/158x48/tuple-logo-white.svg"
              className="h-9 max-sm:mx-auto sm:h-8 lg:h-12"
            />
            <img
              alt="SavvyCal"
              src="https://tailwindcss.com/mais-assets/img/logos/158x48/savvycal-logo-white.svg"
              className="h-9 max-sm:mx-auto sm:h-8 lg:h-12"
            />
            <img
              alt="Statamic"
              src="https://tailwindcss.com/mais-assets/img/logos/158x48/statamic-logo-white.svg"
              className="h-9 max-sm:mx-auto sm:h-8 lg:h-12"
            />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-6 pt-16 sm:pt-24 lg:max-w-7xl lg:px-8">
        <table className="w-full text-left max-sm:hidden">
          <caption className="sr-only">Comparação de planos</caption>
          <colgroup>
            <col className="w-2/5" />
            <col className="w-1/5" />
            <col className="w-1/5" />
            <col className="w-1/5" />
          </colgroup>
          <thead>
            <tr>
              <td className="p-0" />
              {tiers.map((tier) => (
                <th key={tier.name} scope="col" className="p-0">
                  <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    {tier.name} <span className="sr-only">plano</span>
                  </div>
                </th>
              ))}
            </tr>
            <tr>
              <th className="p-0" />
              {tiers.map((tier) => (
                <td key={tier.name} className="px-0 pt-3 pb-0">
                  <a
                    href={tier.href}
                    aria-label={`Começar com o plano ${tier.name}`}
                    className="inline-block rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring dark:inset-ring-white/5 dark:hover:bg-white/20"
                  >
                    Começar
                  </a>
                </td>
              ))}
            </tr>
          </thead>
          {sections.map((section) => (
            <tbody key={section.name} className="group">
              <tr>
                <th scope="colgroup" colSpan={4} className="px-0 pt-10 pb-0 group-first-of-type:pt-5">
                  <div className="-mx-4 rounded-lg bg-gray-50 px-4 py-3 text-sm/6 font-semibold text-gray-950 dark:bg-gray-800/50 dark:text-white">
                    {section.name}
                  </div>
                </th>
              </tr>
              {section.features.map((feature) => (
                <tr key={feature.name} className="border-b border-gray-100 last:border-none dark:border-white/10">
                  <th scope="row" className="px-0 py-4 text-sm/6 font-normal text-gray-600 dark:text-gray-300">
                    {feature.name}
                  </th>
                  {tiers.map((tier) => (
                    <td key={tier.name} className="p-4 max-sm:text-center">
                      {typeof feature.tiers[tier.name] === 'string' ? (
                        <>
                          <span className="sr-only">{tier.name} includes:</span>
                          <span className="text-sm/6 text-gray-950 dark:text-white">{feature.tiers[tier.name]}</span>
                        </>
                      ) : (
                        <>
                          {feature.tiers[tier.name] === true ? (
                            <CheckIcon
                              aria-hidden="true"
                              className="inline-block size-4 fill-green-600 dark:fill-green-500"
                            />
                          ) : (
                            <MinusIcon
                              aria-hidden="true"
                              className="inline-block size-4 fill-gray-400 dark:fill-gray-500"
                            />
                          )}
                          <span className="sr-only">
                            {feature.tiers[tier.name] === true
                              ? `Incluído in ${tier.name}`
                              : `Não incluído in ${tier.name}`}
                          </span>
                        </>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
        <TabGroup className="sm:hidden">
          <TabList className="flex">
            {tiers.map((tier) => (
              <Tab
                key={tier.name}
                className="w-1/3 border-b border-gray-100 py-4 text-base/8 font-medium text-indigo-600 not-focus-visible:focus:outline-none data-selected:border-indigo-600 dark:border-white/10 dark:text-indigo-400 dark:data-selected:border-indigo-400"
              >
                {tier.name}
              </Tab>
            ))}
          </TabList>
          <TabPanels as={Fragment}>
            {tiers.map((tier) => (
              <TabPanel key={tier.name} className="focus:outline-none">
                <a
                  href={tier.href}
                  className="mt-8 block rounded-md bg-white px-3.5 py-2.5 text-center text-sm font-semibold text-gray-900 shadow-xs inset-ring ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:ring-transparent dark:inset-ring-white/5 dark:hover:bg-white/20"
                >
                  Começar
                </a>
                {sections.map((section) => (
                  <Fragment key={section.name}>
                    <div className="-mx-6 mt-10 rounded-lg bg-gray-50 px-6 py-3 text-sm/6 font-semibold text-gray-950 group-first-of-type:mt-5 dark:bg-gray-800/50 dark:text-white">
                      {section.name}
                    </div>
                    <dl>
                      {section.features.map((feature) => (
                        <div
                          key={feature.name}
                          className="grid grid-cols-2 border-b border-gray-100 py-4 last:border-none dark:border-white/10"
                        >
                          <dt className="text-sm/6 font-normal text-gray-600 dark:text-gray-300">{feature.name}</dt>
                          <dd className="text-center">
                            {typeof feature.tiers[tier.name] === 'string' ? (
                              <span className="text-sm/6 text-gray-950 dark:text-white">
                                {feature.tiers[tier.name]}
                              </span>
                            ) : (
                              <>
                                {feature.tiers[tier.name] === true ? (
                                  <CheckIcon
                                    aria-hidden="true"
                                    className="inline-block size-4 fill-green-600 dark:fill-green-500"
                                  />
                                ) : (
                                  <MinusIcon
                                    aria-hidden="true"
                                    className="inline-block size-4 fill-gray-400 dark:fill-gray-500"
                                  />
                                )}
                                <span className="sr-only">{feature.tiers[tier.name] === true ? 'Sim' : 'Não'}</span>
                              </>
                            )}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </Fragment>
                ))}
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  )
}
