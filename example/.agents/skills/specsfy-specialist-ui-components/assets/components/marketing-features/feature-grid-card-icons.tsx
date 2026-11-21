import { InboxIcon, TrashIcon, UsersIcon } from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Caixas de entrada ilimitadas',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    href: '#',
    icon: InboxIcon,
  },
  {
    name: 'Gerenciar integrantes da equipe',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    href: '#',
    icon: UsersIcon,
  },
  {
    name: 'Relatório de spam',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    href: '#',
    icon: TrashIcon,
  },
]

export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
            Mantenha o atendimento ao cliente sob controle
          </h2>
          <p className="mt-6 text-lg/8 text-gray-600 dark:text-gray-300">
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="text-base/7 font-semibold text-gray-900 dark:text-white">
                  <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500">
                    <feature.icon aria-hidden="true" className="size-6 text-white" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base/7 text-gray-600 dark:text-gray-400">
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
