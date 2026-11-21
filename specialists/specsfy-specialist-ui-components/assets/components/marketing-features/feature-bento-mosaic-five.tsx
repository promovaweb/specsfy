export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Faça deploy mais rápido</h2>
        <p className="mt-2 max-w-lg text-4xl font-semibold tracking-tight text-pretty text-gray-950 sm:text-5xl dark:text-white">
          Tudo o que você precisa para fazer deploy da aplicação
        </p>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
          <div className="relative lg:col-span-3">
            <div className="absolute inset-0 rounded-lg bg-white max-lg:rounded-t-4xl lg:rounded-tl-4xl dark:bg-gray-800" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)] lg:rounded-tl-[calc(2rem+1px)]">
              <img
                alt=""
                src="https://tailwindcss.com/mais-assets/img/component-images/bento-01-performance.png"
                className="h-80 object-cover object-left dark:hidden"
              />
              <img
                alt=""
                src="https://tailwindcss.com/mais-assets/img/component-images/dark-bento-01-performance.png"
                className="h-80 object-cover object-left not-dark:hidden"
              />
              <div className="p-10 pt-4">
                <h3 className="text-sm/4 font-semibold text-indigo-600 dark:text-indigo-400">Desempenho</h3>
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 dark:text-white">
                  Builds extremamente rápidos
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 dark:text-gray-400">
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-lg shadow-sm outline outline-black/5 max-lg:rounded-t-4xl lg:rounded-tl-4xl dark:outline-white/15" />
          </div>
          <div className="relative lg:col-span-3">
            <div className="absolute inset-0 rounded-lg bg-white lg:rounded-tr-4xl dark:bg-gray-800" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] lg:rounded-tr-[calc(2rem+1px)]">
              <img
                alt=""
                src="https://tailwindcss.com/mais-assets/img/component-images/bento-01-releases.png"
                className="h-80 object-cover object-left lg:object-right dark:hidden"
              />
              <img
                alt=""
                src="https://tailwindcss.com/mais-assets/img/component-images/dark-bento-01-releases.png"
                className="h-80 object-cover object-left not-dark:hidden lg:object-right"
              />
              <div className="p-10 pt-4">
                <h3 className="text-sm/4 font-semibold text-indigo-600 dark:text-indigo-400">Lançamentos</h3>
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 dark:text-white">Envio para deploy</p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 dark:text-gray-400">
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-lg shadow-sm outline outline-black/5 lg:rounded-tr-4xl dark:outline-white/15" />
          </div>
          <div className="relative lg:col-span-2">
            <div className="absolute inset-0 rounded-lg bg-white lg:rounded-bl-4xl dark:bg-gray-800" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] lg:rounded-bl-[calc(2rem+1px)]">
              <img
                alt=""
                src="https://tailwindcss.com/mais-assets/img/component-images/bento-01-speed.png"
                className="h-80 object-cover object-left dark:hidden"
              />
              <img
                alt=""
                src="https://tailwindcss.com/mais-assets/img/component-images/dark-bento-01-speed.png"
                className="h-80 object-cover object-left not-dark:hidden"
              />
              <div className="p-10 pt-4">
                <h3 className="text-sm/4 font-semibold text-indigo-600 dark:text-indigo-400">Velocidade</h3>
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 dark:text-white">
                  Criado para usuários avançados
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 dark:text-gray-400">
                  Uma experiência simples, rápida e consistente em qualquer dispositivo.
                </p>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-lg shadow-sm outline outline-black/5 lg:rounded-bl-4xl dark:outline-white/15" />
          </div>
          <div className="relative lg:col-span-2">
            <div className="absolute inset-0 rounded-lg bg-white dark:bg-gray-800" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)]">
              <img
                alt=""
                src="https://tailwindcss.com/mais-assets/img/component-images/bento-01-integrations.png"
                className="h-80 object-cover dark:hidden"
              />
              <img
                alt=""
                src="https://tailwindcss.com/mais-assets/img/component-images/dark-bento-01-integrations.png"
                className="h-80 object-cover not-dark:hidden"
              />
              <div className="p-10 pt-4">
                <h3 className="text-sm/4 font-semibold text-indigo-600 dark:text-indigo-400">Integrações</h3>
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 dark:text-white">
                  Conecte suas ferramentas favoritas
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 dark:text-gray-400">
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-lg shadow-sm outline outline-black/5 dark:outline-white/15" />
          </div>
          <div className="relative lg:col-span-2">
            <div className="absolute inset-0 rounded-lg bg-white max-lg:rounded-b-4xl lg:rounded-br-4xl dark:bg-gray-800" />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-br-[calc(2rem+1px)]">
              <img
                alt=""
                src="https://tailwindcss.com/mais-assets/img/component-images/bento-01-network.png"
                className="h-80 object-cover dark:hidden"
              />
              <img
                alt=""
                src="https://tailwindcss.com/mais-assets/img/component-images/dark-bento-01-network.png"
                className="h-80 object-cover not-dark:hidden"
              />
              <div className="p-10 pt-4">
                <h3 className="text-sm/4 font-semibold text-indigo-600 dark:text-indigo-400">Rede</h3>
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 dark:text-white">
                  CDN distribuída globalmente
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 dark:text-gray-400">
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-lg shadow-sm outline outline-black/5 max-lg:rounded-b-4xl lg:rounded-br-4xl dark:outline-white/15" />
          </div>
        </div>
      </div>
    </div>
  )
}
