const timeline = [
  {
    name: 'Fundação da empresa',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    date: 'Aug 2021',
    dateTime: '2021-08',
  },
  {
    name: 'Captação de US$ 65 milhões',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    date: 'Dec 2021',
    dateTime: '2021-12',
  },
  {
    name: 'Lançamento da versão beta',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    date: 'Feb 2022',
    dateTime: '2022-02',
  },
  {
    name: 'Lançamento global do produto',
    description:
      'Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.',
    date: 'Dec 2022',
    dateTime: '2022-12',
  },
]

export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 overflow-hidden lg:mx-0 lg:max-w-none lg:grid-cols-4">
          {timeline.map((item) => (
            <div key={item.name}>
              <time
                dateTime={item.dateTime}
                className="flex items-center text-sm/6 font-semibold text-indigo-600 dark:text-indigo-400"
              >
                <svg viewBox="0 0 4 4" aria-hidden="true" className="mr-4 size-1 flex-none">
                  <circle r={2} cx={2} cy={2} fill="currentColor" />
                </svg>
                {item.date}
                <div
                  aria-hidden="true"
                  className="absolute -ml-2 h-px w-screen -translate-x-full bg-gray-900/10 sm:-ml-4 lg:static lg:-mr-6 lg:ml-8 lg:w-auto lg:flex-auto lg:translate-x-0 dark:bg-white/15"
                />
              </time>
              <p className="mt-6 text-lg/8 font-semibold tracking-tight text-gray-900 dark:text-white">{item.name}</p>
              <p className="mt-1 text-base/7 text-gray-600 dark:text-gray-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
