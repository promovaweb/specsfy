export default function Example() {
  return (
    <div className="overflow-hidden bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start">
          <div className="lg:pt-4 lg:pr-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Faça deploy mais rápido</h2>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
                Um fluxo de trabalho melhor
              </p>
              <p className="mt-6 text-lg/8 text-gray-700 dark:text-gray-300">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
              <div className="mt-8">
                <a
                  href="#"
                  className="inline-flex rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                >
                  Começar
                </a>
              </div>
              <figure className="mt-16 border-l border-gray-200 pl-8 text-gray-700 dark:border-gray-700 dark:text-gray-300">
                <blockquote className="text-base/7">
                  <p>
                    Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                  </p>
                </blockquote>
                <figcaption className="mt-6 flex gap-x-4 text-sm/6">
                  <img
                    alt=""
                    src="https://images.unsplash.com/photo-1509783236416-c9ad59bae472?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80"
                    className="size-6 flex-none rounded-full"
                  />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">Maria Hill</span> -{' '}
                    <span className="text-gray-600 dark:text-gray-400">Gerente de Marketing</span>
                  </div>
                </figcaption>
              </figure>
            </div>
          </div>
          <img
            alt="Captura de tela do produto"
            src="https://tailwindcss.com/mais-assets/img/component-images/dark-project-app-screenshot.png"
            width={2432}
            height={1442}
            className="w-3xl max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-228 md:-ml-4 lg:ml-0 dark:ring-white/10"
          />
        </div>
      </div>
    </div>
  )
}
