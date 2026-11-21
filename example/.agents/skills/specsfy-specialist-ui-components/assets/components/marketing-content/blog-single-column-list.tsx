const posts = [
  ['Aumente sua taxa de conversão', 'Marketing'],
  ['Como usar SEO para aumentar as vendas', 'Vendas'],
  ['Melhore a experiência dos seus clientes', 'Negócios'],
]

export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
            Do blog
          </h2>
          <p className="mt-2 text-lg/8 text-gray-600 dark:text-gray-300">
            Aprenda a desenvolver seu negócio com a orientação de especialistas.
          </p>
          <div className="mt-10 space-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 dark:border-gray-700">
            {posts.map(([title, category]) => (
              <article key={title} className="flex max-w-xl flex-col items-start">
                <div className="flex items-center gap-x-4 text-xs">
                  <time className="text-gray-500 dark:text-gray-400">16 mar. 2020</time>
                  <span className="rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 dark:bg-gray-800/60 dark:text-gray-300">
                    {category}
                  </span>
                </div>
                <h3 className="mt-3 text-lg/6 font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="mt-5 line-clamp-3 text-sm/6 text-gray-600 dark:text-gray-400">
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
