const features = [
  {
    name: 'Envio para deploy',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
  },
  {
    name: 'Certificados SSL',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
  },
  {
    name: 'Filas simples',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
  },
  {
    name: 'Segurança avançada',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
  },
  {
    name: 'API poderosa',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
  },
  {
    name: 'Backups do banco de dados',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
  },
]

export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
            Plataforma completa
          </h2>
          <p className="mt-6 text-lg/8 text-gray-700 dark:text-gray-300">
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </p>
        </div>
        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 text-base/7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.name}>
              <dt className="font-semibold text-gray-900 dark:text-white">{feature.name}</dt>
              <dd className="mt-1 text-gray-600 dark:text-gray-400">{feature.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
