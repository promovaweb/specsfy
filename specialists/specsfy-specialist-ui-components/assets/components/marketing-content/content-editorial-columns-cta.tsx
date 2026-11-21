export default function Example() {
  return (
    <div className="overflow-hidden bg-white px-6 py-16 lg:px-8 xl:py-36">
      <div className="mx-auto max-w-max lg:max-w-7xl">
        <div className="relative z-10 mb-8 md:mb-2 md:px-6">
          <div className="max-w-prose lg:max-w-none">
            <h2 className="text-base font-semibold text-indigo-600">Transações</h2>
            <p className="mt-2 text-3xl/8 font-bold tracking-tight text-gray-900 sm:text-4xl">
              Uma maneira melhor de enviar dinheiro
            </p>
          </div>
        </div>
        <div className="relative">
          <svg
            fill="none"
            width={404}
            height={384}
            viewBox="0 0 404 384"
            aria-hidden="true"
            className="absolute top-0 right-0 -mt-20 -mr-20 hidden md:block md:[overflow-anchor:none]"
          >
            <defs>
              <pattern
                x={0}
                y={0}
                id="95e8f2de-6d30-4b7e-8159-f791729db21b"
                width={20}
                height={20}
                patternUnits="userSpaceOnUse"
              >
                <rect x={0} y={0} fill="currentColor" width={4} height={4} className="text-gray-200" />
              </pattern>
            </defs>
            <rect fill="url(#95e8f2de-6d30-4b7e-8159-f791729db21b)" width={404} height={384} />
          </svg>
          <svg
            fill="none"
            width={404}
            height={384}
            viewBox="0 0 404 384"
            aria-hidden="true"
            className="absolute bottom-0 left-0 -mb-20 -ml-20 hidden md:block md:[overflow-anchor:none]"
          >
            <defs>
              <pattern
                x={0}
                y={0}
                id="7a00fe67-0343-4a3c-8e81-c145097a3ce0"
                width={20}
                height={20}
                patternUnits="userSpaceOnUse"
              >
                <rect x={0} y={0} fill="currentColor" width={4} height={4} className="text-gray-200" />
              </pattern>
            </defs>
            <rect fill="url(#7a00fe67-0343-4a3c-8e81-c145097a3ce0)" width={404} height={384} />
          </svg>
          <div className="relative md:bg-white md:p-6">
            <div className="lg:grid lg:grid-cols-2 lg:gap-6">
              <div className="text-lg/8 text-gray-500">
                <p>
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
                <p className="mt-6">
                  Organize a narrativa com contexto suficiente para orientar a decisão. Destaque as{' '}
                  <a href="#" className="font-medium text-indigo-600 underline">
                    evidências principais
                  </a>{' '}
                  e explique como elas sustentam a proposta apresentada.
                </p>
                <ol role="list" className="mt-6 list-decimal space-y-3 pl-7">
                  <li className="pl-2">A solução evolui conforme as evidências do projeto.</li>
                  <li className="pl-2">A experiência permanece simples e acessível para todas as pessoas.</li>
                </ol>
                <p className="mt-6">
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
              </div>
              <div className="mt-6 text-lg/8 text-gray-500 lg:mt-0">
                <p>
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
                <p className="mt-6">
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
                <p className="mt-6">
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
              </div>
            </div>
            <div className="mt-8 inline-flex rounded-md shadow-sm">
              <a
                href="#"
                className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-medium text-white hover:bg-indigo-700"
              >
                Falar com vendas
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
