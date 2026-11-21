import { CloudArrowUpIcon, CogIcon, LockClosedIcon, ArrowPathIcon, ShieldCheckIcon, ServerIcon } from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Envio para deploy',
    description: 'Uma solução simples para organizar informações e acelerar o trabalho da equipe.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Certificados SSL',
    description: 'Uma solução simples para organizar informações e acelerar o trabalho da equipe.',
    icon: LockClosedIcon,
  },
  {
    name: 'Filas simples',
    description: 'Uma solução simples para organizar informações e acelerar o trabalho da equipe.',
    icon: ArrowPathIcon,
  },
  {
    name: 'Segurança avançada',
    description: 'Uma solução simples para organizar informações e acelerar o trabalho da equipe.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'API poderosa',
    description: 'Uma solução simples para organizar informações e acelerar o trabalho da equipe.',
    icon: CogIcon,
  },
  {
    name: 'Backups do banco de dados',
    description: 'Uma solução simples para organizar informações e acelerar o trabalho da equipe.',
    icon: ServerIcon,
  },
]

export default function Example() {
  return (
    <div className="relative bg-white py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-md px-6 text-center sm:max-w-3xl lg:max-w-7xl lg:px-8">
        <h2 className="text-lg font-semibold text-indigo-600">Faça deploy mais rápido</h2>
        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Tudo o que você precisa para fazer deploy da aplicação
        </p>
        <p className="mx-auto mt-5 max-w-prose text-xl text-gray-500">
          Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
        </p>
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="pt-6">
                <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center rounded-xl bg-indigo-500 p-3 shadow-lg">
                        <feature.icon aria-hidden="true" className="size-8 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg/8 font-semibold tracking-tight text-gray-900">{feature.name}</h3>
                    <p className="mt-5 text-base/7 text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
