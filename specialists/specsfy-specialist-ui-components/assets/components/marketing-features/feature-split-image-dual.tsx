import { InboxIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function Example() {
  return (
    <div className="relative overflow-hidden bg-white pt-16 pb-32 dark:bg-gray-900">
      <div className="relative">
        <div className="lg:mx-auto lg:grid lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-2 lg:gap-24 lg:px-8">
          <div className="mx-auto max-w-xl px-6 lg:mx-0 lg:max-w-none lg:px-0 lg:py-16">
            <div>
              <div>
                <span className="flex size-12 items-center justify-center rounded-xl bg-indigo-600">
                  <InboxIcon aria-hidden="true" className="size-8 text-white" />
                </span>
              </div>
              <div className="mt-6">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Mantenha o atendimento ao cliente sob controle</h2>
                <p className="mt-4 text-lg text-gray-500">
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
                <div className="mt-6">
                  <a
                    href="#"
                    className="inline-flex rounded-lg bg-indigo-600 px-4 py-1.5 text-base/7 font-semibold text-white shadow-xs ring-1 ring-indigo-600 hover:bg-indigo-700 hover:ring-indigo-700"
                  >
                    Começar
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-8 border-t border-gray-200 pt-6">
              <blockquote>
                <div>
                  <p className="text-base text-gray-500">
                    Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                  </p>
                </div>
                <footer className="mt-3">
                  <div className="flex items-center space-x-3">
                    <div className="shrink-0">
                      <img
                        alt=""
                        src="https://images.unsplash.com/photo-1509783236416-c9ad59bae472?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80"
                        className="size-6 rounded-full"
                      />
                    </div>
                    <div className="text-base font-medium text-gray-700">Marcia Hill, Gerente de Marketing Digital</div>
                  </div>
                </footer>
              </blockquote>
            </div>
          </div>
          <div className="mt-12 sm:mt-16 lg:mt-0">
            <div className="-mr-48 pl-6 md:-mr-16 lg:relative lg:m-0 lg:h-full lg:px-0">
              <img
                alt="Interface da caixa de entrada"
                src="https://tailwindcss.com/mais-assets/img/component-images/inbox-app-screenshot-1.jpg"
                className="w-full rounded-xl shadow-xl ring-1 ring-black/5 lg:absolute lg:left-0 lg:h-full lg:w-auto lg:max-w-none"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-24">
        <div className="lg:mx-auto lg:grid lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-2 lg:gap-24 lg:px-8">
          <div className="mx-auto max-w-xl px-6 lg:col-start-2 lg:mx-0 lg:max-w-none lg:px-0 lg:py-32">
            <div>
              <div>
                <span className="flex size-12 items-center justify-center rounded-xl bg-indigo-600">
                  <SparklesIcon aria-hidden="true" className="size-8 text-white" />
                </span>
              </div>
              <div className="mt-6">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Entenda melhor seus clientes</h2>
                <p className="mt-4 text-lg text-gray-500">
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
                <div className="mt-6">
                  <a
                    href="#"
                    className="inline-flex rounded-lg bg-indigo-600 px-4 py-1.5 text-base/7 font-semibold text-white shadow-xs ring-1 ring-indigo-600 hover:bg-indigo-700 hover:ring-indigo-700"
                  >
                    Começar
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 sm:mt-16 lg:col-start-1 lg:mt-0">
            <div className="-ml-48 pr-6 md:-ml-16 lg:relative lg:m-0 lg:h-full lg:px-0">
              <img
                alt="Interface do perfil do cliente"
                src="https://tailwindcss.com/mais-assets/img/component-images/inbox-app-screenshot-2.jpg"
                className="w-full rounded-xl shadow-xl ring-1 ring-black/5 lg:absolute lg:right-0 lg:h-full lg:w-auto lg:max-w-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
