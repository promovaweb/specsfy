import { CheckIcon } from '@heroicons/react/20/solid'

const features = [
  {
    name: 'Convidar integrantes da equipe',
    description: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
  },
  { name: 'Visualização em lista', description: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.' },
  {
    name: 'Atalhos de teclado',
    description: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
  },
  { name: 'Calendários', description: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.' },
  { name: 'Notificações', description: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.' },
  { name: 'Quadros', description: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.' },
  { name: 'Relatórios', description: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.' },
  { name: 'Aplicativo móvel', description: 'Acesse os recursos principais também pelo aplicativo móvel.' },
]

export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-5">
          <div className="col-span-2">
            <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Tudo o que você precisa</h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
              Plataforma completa
            </p>
            <p className="mt-6 text-base/7 text-gray-700 dark:text-gray-300">
              Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
            </p>
          </div>
          <dl className="col-span-3 grid grid-cols-1 gap-x-8 gap-y-10 text-base/7 text-gray-600 sm:grid-cols-2 lg:gap-y-16 dark:text-gray-400">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-9">
                <dt className="font-semibold text-gray-900 dark:text-white">
                  <CheckIcon
                    aria-hidden="true"
                    className="absolute top-1 left-0 size-5 text-indigo-500 dark:text-indigo-400"
                  />
                  {feature.name}
                </dt>
                <dd className="mt-2">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
