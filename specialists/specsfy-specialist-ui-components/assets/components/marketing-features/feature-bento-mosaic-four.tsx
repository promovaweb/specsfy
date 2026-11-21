export default function Example() {
  return (
    <div className="bg-gray-50 py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Faça deploy mais rápido</h2>
        <p className="mt-2 max-w-lg text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
          Tudo o que você precisa para fazer deploy da aplicação
        </p>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
          <div className="flex p-px lg:col-span-4">
            <div className="w-full overflow-hidden rounded-lg bg-white shadow-sm outline outline-black/5 max-lg:rounded-t-4xl lg:rounded-tl-4xl dark:bg-gray-800 dark:shadow-none dark:outline-white/15">
              <img
                alt=""
                src="https://tailwindcss.com/mais-assets/img/component-images/bento-02-releases.png"
                className="h-80 object-cover object-left dark:hidden"
              />
              <img
                alt=""
                src="https://tailwindcss.com/mais-assets/img/component-images/dark-bento-02-releases.png"
                className="h-80 object-cover object-left not-dark:hidden"
              />
              <div className="p-10">
                <h3 className="text-sm/4 font-semibold text-gray-500 dark:text-gray-400">Lançamentos</h3>
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-900 dark:text-white">Envio para deploy</p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 dark:text-gray-400">
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
              </div>
            </div>
          </div>
          <div className="flex p-px lg:col-span-2">
            <div className="w-full overflow-hidden rounded-lg bg-white shadow-sm outline outline-black/5 lg:rounded-tr-4xl dark:bg-gray-800 dark:shadow-none dark:outline-white/15">
              <img
                alt=""
                src="https://tailwindcss.com/mais-assets/img/component-images/bento-02-integrations.png"
                className="h-80 object-cover dark:hidden"
              />
              <img
                alt=""
                src="https://tailwindcss.com/mais-assets/img/component-images/dark-bento-02-integrations.png"
                className="h-80 object-cover not-dark:hidden"
              />
              <div className="p-10">
                <h3 className="text-sm/4 font-semibold text-gray-500 dark:text-gray-400">Integrações</h3>
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-900 dark:text-white">
                  Conecte suas ferramentas favoritas
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 dark:text-gray-400">
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
              </div>
            </div>
          </div>
          <div className="flex p-px lg:col-span-2">
            <div className="w-full overflow-hidden rounded-lg bg-white shadow-sm outline outline-black/5 lg:rounded-bl-4xl dark:bg-gray-800 dark:shadow-none dark:outline-white/15">
              <img
                alt=""
                src="https://tailwindcss.com/mais-assets/img/component-images/bento-02-security.png"
                className="h-80 object-cover dark:hidden"
              />
              <img
                alt=""
                src="https://tailwindcss.com/mais-assets/img/component-images/dark-bento-02-security.png"
                className="h-80 object-cover not-dark:hidden"
              />
              <div className="p-10">
                <h3 className="text-sm/4 font-semibold text-gray-500 dark:text-gray-400">Segurança</h3>
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-900 dark:text-white">
                  Controle de acesso avançado
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 dark:text-gray-400">
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
              </div>
            </div>
          </div>
          <div className="flex p-px lg:col-span-4">
            <div className="w-full overflow-hidden rounded-lg bg-white shadow-sm outline outline-black/5 max-lg:rounded-b-4xl lg:rounded-br-4xl dark:bg-gray-800 dark:shadow-none dark:outline-white/15">
              <img
                alt=""
                src="https://tailwindcss.com/mais-assets/img/component-images/bento-02-performance.png"
                className="h-80 object-cover object-left dark:hidden"
              />
              <img
                alt=""
                src="https://tailwindcss.com/mais-assets/img/component-images/dark-bento-02-performance.png"
                className="h-80 object-cover object-left not-dark:hidden"
              />
              <div className="p-10">
                <h3 className="text-sm/4 font-semibold text-gray-500 dark:text-gray-400">Desempenho</h3>
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-900 dark:text-white">
                  Builds extremamente rápidos
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 dark:text-gray-400">
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
