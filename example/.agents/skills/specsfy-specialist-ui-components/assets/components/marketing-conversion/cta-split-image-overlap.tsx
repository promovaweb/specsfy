export default function Example() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="overflow-hidden rounded-lg bg-indigo-700 shadow-xl lg:grid lg:grid-cols-2 lg:gap-4">
          <div className="px-6 pt-10 pb-12 sm:px-16 sm:pt-16 lg:py-16 lg:pr-0 xl:px-20 xl:py-20">
            <div className="lg:self-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                <span className="block">Pronto para começar?</span>
                <span className="block">Comece hoje seu teste gratuito.</span>
              </h2>
              <p className="mt-4 text-lg/6 text-indigo-200">
                Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
              </p>
              <a
                href="#"
                className="mt-8 inline-flex items-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-indigo-600 shadow-sm hover:bg-indigo-50"
              >
                Cadastre-se gratuitamente
              </a>
            </div>
          </div>
          <div className="-mt-6">
            <img
              alt="Captura de tela do aplicativo"
              src="https://tailwindcss.com/mais-assets/img/component-images/full-width-with-sidebar.jpg"
              className="aspect-5/3 h-full translate-x-6 translate-y-6 transform rounded-md object-cover object-top-left sm:translate-x-16 md:aspect-2/1 lg:translate-y-20"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
