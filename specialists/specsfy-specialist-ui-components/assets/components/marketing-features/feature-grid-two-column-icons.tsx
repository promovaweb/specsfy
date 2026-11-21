import { ArrowPathIcon, CloudArrowUpIcon, FingerPrintIcon, LockClosedIcon } from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Envio para deploy',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Certificados SSL',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    icon: LockClosedIcon,
  },
  {
    name: 'Filas simples',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    icon: ArrowPathIcon,
  },
  {
    name: 'Segurança avançada',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    icon: FingerPrintIcon,
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
          <p className="mt-6 text-lg/8 text-gray-700 dark:text-gray-300">
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base/7 font-semibold text-gray-900 dark:text-white">
                  <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500">
                    <feature.icon aria-hidden="true" className="size-6 text-white" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base/7 text-gray-600 dark:text-gray-400">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
