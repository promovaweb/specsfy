import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  FingerPrintIcon,
  LockClosedIcon,
  ServerIcon,
} from '@heroicons/react/20/solid'

const features = [
  {
    name: 'Envio para deploy.',
    description: 'Conteúdo de exemplo para demonstrar a composição visual do componente.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Certificados SSL.',
    description: 'Centralize as informações essenciais e avance com mais clareza em cada etapa.',
    icon: LockClosedIcon,
  },
  {
    name: 'Filas simples.',
    description: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    icon: ArrowPathIcon,
  },
  {
    name: 'Segurança avançada.',
    description: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    icon: FingerPrintIcon,
  },
  {
    name: 'API poderosa.',
    description: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    icon: Cog6ToothIcon,
  },
  {
    name: 'Backups do banco de dados.',
    description: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    icon: ServerIcon,
  },
]

export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Tudo o que você precisa</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
            Sem servidor? Sem problema.
          </p>
          <p className="mt-6 text-lg/8 text-gray-700 dark:text-gray-300">
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </p>
        </div>
        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 text-base/7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-16 dark:text-gray-400">
          {features.map((feature) => (
            <div key={feature.name} className="relative pl-9">
              <dt className="inline font-semibold text-gray-900 dark:text-white">
                <feature.icon
                  aria-hidden="true"
                  className="absolute top-1 left-1 size-5 text-indigo-600 dark:text-indigo-500"
                />
                {feature.name}
              </dt>{' '}
              <dd className="inline">{feature.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
