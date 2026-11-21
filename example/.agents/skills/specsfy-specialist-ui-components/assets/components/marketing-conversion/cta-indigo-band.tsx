export default function Example() {
  return (
    <div className="bg-indigo-700">
      <div className="px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
            Aumente sua produtividade. Comece a usar nosso aplicativo hoje.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-indigo-200">
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="#"
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-xs hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white dark:shadow-none"
            >
              Começar
            </a>
            <a href="#" className="text-sm/6 font-semibold text-white">
              Saiba mais
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
