import { ArrowPathIcon, CloudArrowUpIcon, LockClosedIcon } from '@heroicons/react/20/solid'

const features = [
  {
    name: 'Envio para deploy',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    href: '#',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Certificados SSL',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    href: '#',
    icon: LockClosedIcon,
  },
  {
    name: 'Filas simples',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    href: '#',
    icon: ArrowPathIcon,
  },
]

export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Faça deploy mais rápido</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-balance dark:text-white">
            Tudo o que você precisa para fazer deploy da aplicação
          </p>
          <p className="mt-6 text-lg/8 text-gray-600 dark:text-gray-300">
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base/7 font-semibold text-gray-900 dark:text-white">
                  <feature.icon aria-hidden="true" className="size-5 flex-none text-indigo-600 dark:text-indigo-400" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base/7 text-gray-600 dark:text-gray-400">
                  <p className="flex-auto">{feature.description}</p>
                  <p className="mt-6">
                    <a
                      href={feature.href}
                      className="text-sm/6 font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Saiba mais <span aria-hidden="true">&rarr;</span>
                    </a>
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
