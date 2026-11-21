import { CheckIcon } from '@heroicons/react/24/outline'

const tiers = [
  {
    name: 'Padrão',
    href: '#',
    priceMensalmente: 49,
    description: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    features: [
      'Resultados consistentes',
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    ],
  },
  {
    name: 'Empresas',
    href: '#',
    priceMensalmente: 79,
    description: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    features: [
      'Resultados consistentes',
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    ],
  },
]

export default function Example() {
  return (
    <div className="bg-gray-900">
      <div className="pt-12 sm:pt-16 lg:pt-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-2 lg:max-w-none">
            <h2 className="text-xl/6 font-semibold text-gray-300">Preços</h2>
            <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              O preço certo para você, seja qual for o seu perfil
            </p>
            <p className="text-xl text-gray-300">
              Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-8 bg-gray-50 pb-12 sm:mt-12 sm:pb-16 lg:mt-16 lg:pb-24">
        <div className="relative">
          <div className="absolute inset-0 h-3/4 bg-gray-900" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-md space-y-4 lg:grid lg:max-w-5xl lg:grid-cols-2 lg:gap-5 lg:space-y-0">
              {tiers.map((tier) => (
                <div key={tier.name} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
                  <div className="bg-white px-6 py-8 sm:p-10 sm:pb-6">
                    <div>
                      <h3
                        id="tier-standard"
                        className="inline-flex rounded-full bg-indigo-100 px-4 py-1 text-base font-semibold text-indigo-600"
                      >
                        {tier.name}
                      </h3>
                    </div>
                    <div className="mt-4 flex items-baseline text-6xl font-bold tracking-tight">
                      ${tier.priceMensalmente}
                      <span className="ml-1 text-2xl font-medium tracking-normal text-gray-500">/mês</span>
                    </div>
                    <p className="mt-5 text-lg text-gray-500">{tier.description}</p>
                  </div>
                  <div className="flex flex-1 flex-col justify-between space-y-6 bg-gray-50 px-6 pt-6 pb-8 sm:p-10 sm:pt-6">
                    <ul role="list" className="space-y-4">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <div className="shrink-0">
                            <CheckIcon aria-hidden="true" className="size-6 text-green-500" />
                          </div>
                          <p className="ml-3 text-base text-gray-700">{feature}</p>
                        </li>
                      ))}
                    </ul>
                    <div className="rounded-md shadow-sm">
                      <a
                        href={tier.href}
                        aria-describedby="tier-standard"
                        className="flex items-center justify-center rounded-md border border-transparent bg-gray-800 px-5 py-3 text-base font-medium text-white hover:bg-gray-900"
                      >
                        Começar
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="relative mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:mt-5 lg:px-8">
          <div className="mx-auto max-w-md lg:max-w-5xl">
            <div className="rounded-lg bg-gray-100 px-6 py-8 sm:p-10 lg:flex lg:items-center">
              <div className="flex-1">
                <div>
                  <h3 className="inline-flex rounded-full bg-white px-4 py-1 text-base font-semibold text-gray-800">
                    Com desconto
                  </h3>
                </div>
                <div className="mt-4 text-lg text-gray-600">
                  Acesse todos os recursos da licença padrão para projetos individuais com faturamento bruto inferior a US$ 20 mil
                  por <span className="font-semibold text-gray-900">$29</span>.
                </div>
              </div>
              <div className="mt-6 rounded-md shadow-sm lg:mt-0 lg:ml-10 lg:shrink-0">
                <a
                  href="#"
                  className="flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-gray-900 hover:bg-gray-50"
                >
                  Comprar licença com desconto
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
