import {
  ArrowUturnLeftIcon,
  ChatBubbleLeftEllipsisIcon,
  DocumentChartBarIcon,
  HeartIcon,
  InboxIcon,
  PencilSquareIcon,
  TrashIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Caixas de entrada ilimitadas',
    description: 'Uma solução simples para organizar informações e acelerar o trabalho da equipe.',
    icon: InboxIcon,
  },
  {
    name: 'Gerenciar integrantes da equipe',
    description: 'Uma solução simples para organizar informações e acelerar o trabalho da equipe.',
    icon: UsersIcon,
  },
  {
    name: 'Relatório de spam',
    description: 'Uma solução simples para organizar informações e acelerar o trabalho da equipe.',
    icon: TrashIcon,
  },
  {
    name: 'Escrever em Markdown',
    description: 'Uma solução simples para organizar informações e acelerar o trabalho da equipe.',
    icon: PencilSquareIcon,
  },
  {
    name: 'Relatórios da equipe',
    description: 'Uma solução simples para organizar informações e acelerar o trabalho da equipe.',
    icon: DocumentChartBarIcon,
  },
  {
    name: 'Respostas salvas',
    description: 'Uma solução simples para organizar informações e acelerar o trabalho da equipe.',
    icon: ArrowUturnLeftIcon,
  },
  {
    name: 'Comentários por e-mail',
    description: 'Uma solução simples para organizar informações e acelerar o trabalho da equipe.',
    icon: ChatBubbleLeftEllipsisIcon,
  },
  {
    name: 'Conectar-se com clientes',
    description: 'Uma solução simples para organizar informações e acelerar o trabalho da equipe.',
    icon: HeartIcon,
  },
]

export default function Example() {
  return (
    <div className="bg-indigo-700">
      <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32 lg:max-w-7xl lg:px-8 lg:py-40">
        <h2 className="text-4xl font-bold tracking-tight text-white">Caixa de entrada de suporte criada para eficiência.</h2>
        <p className="mt-6 max-w-3xl text-lg/8 text-indigo-200">
          Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
        </p>
        <div className="mt-20 grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
          {features.map((feature) => (
            <div key={feature.name}>
              <div>
                <span className="flex size-12 items-center justify-center rounded-xl bg-white/10">
                  <feature.icon aria-hidden="true" className="size-8 text-white" />
                </span>
              </div>
              <div className="mt-6">
                <h3 className="text-lg/8 font-semibold text-white">{feature.name}</h3>
                <p className="mt-2 text-base/7 text-indigo-200">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
