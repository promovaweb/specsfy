const posts = [
  ['Aumente sua taxa de conversão', 'https://images.unsplash.com/photo-1496128858413-b36217c2ce36?auto=format&fit=crop&w=1200&q=80'],
  ['Como usar SEO para aumentar as vendas', 'https://images.unsplash.com/photo-1547586696-ea22b4d4235d?auto=format&fit=crop&w=1200&q=80'],
  ['Melhore a experiência dos seus clientes', 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=1200&q=80'],
]

export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <h2 className="text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
            Do blog
          </h2>
          <p className="mt-2 text-lg/8 text-gray-600 dark:text-gray-400">
            Aprenda a desenvolver seu negócio com a orientação de especialistas.
          </p>
          <div className="mt-16 space-y-20 lg:mt-20">
            {posts.map(([title, imageUrl]) => (
              <article key={title} className="relative isolate flex flex-col gap-8 lg:flex-row">
                <div className="relative aspect-video sm:aspect-2/1 lg:aspect-square lg:w-64 lg:shrink-0">
                  <img alt="" src={imageUrl} className="absolute inset-0 size-full rounded-2xl object-cover" />
                </div>
                <div>
                  <time className="text-xs text-gray-500 dark:text-gray-400">16 mar. 2020</time>
                  <h3 className="mt-3 text-lg/6 font-semibold text-gray-900 dark:text-white">{title}</h3>
                  <p className="mt-5 text-sm/6 text-gray-600 dark:text-gray-400">
                    Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
