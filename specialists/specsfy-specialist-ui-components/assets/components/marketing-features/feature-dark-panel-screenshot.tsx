import { CloudArrowUpIcon, LockClosedIcon, ServerIcon } from '@heroicons/react/20/solid'

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
    name: 'Backups do banco de dados.',
    description: 'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    icon: ServerIcon,
  },
]

export default function Example() {
  return (
    <div className="bg-white py-24 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-20 sm:rounded-3xl sm:px-10 sm:py-24 lg:py-24 xl:px-24 dark:bg-gray-800/50 dark:after:pointer-events-none dark:after:absolute dark:after:inset-0 dark:after:inset-ring dark:after:inset-ring-white/10 dark:after:sm:rounded-3xl">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center lg:gap-y-0">
            <div className="lg:row-start-2 lg:max-w-md">
              <h2 className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
                Aumente sua produtividade. Comece a usar nosso aplicativo hoje.
              </h2>
              <p className="mt-6 text-lg/8 text-gray-300">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
            </div>
            <img
              alt="Captura de tela do produto"
              src="https://tailwindcss.com/mais-assets/img/component-images/dark-project-app-screenshot.png"
              width={2432}
              height={1442}
              className="relative -z-20 max-w-xl min-w-full rounded-xl shadow-xl ring-1 ring-white/10 lg:row-span-4 lg:w-5xl lg:max-w-none"
            />
            <div className="max-w-xl lg:row-start-3 lg:mt-10 lg:max-w-md lg:border-t lg:border-white/10 lg:pt-10 dark:lg:border-white/10">
              <dl className="max-w-xl space-y-8 text-base/7 text-gray-300 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative">
                    <dt className="ml-9 inline-block font-semibold text-white">
                      <feature.icon
                        aria-hidden="true"
                        className="absolute top-1 left-1 size-5 text-indigo-500 dark:text-indigo-400"
                      />
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-12 -z-10 -translate-y-1/2 transform-gpu blur-3xl lg:top-auto lg:-bottom-48 lg:translate-y-0"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="aspect-1155/678 w-288.75 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-25 dark:opacity-20"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
