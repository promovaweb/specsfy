export default function Example() {
  return (
    <div className="bg-gray-50 pt-12 sm:pt-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            A confiança de desenvolvedores de mais de 80 planetas
          </h2>
          <p className="mt-3 text-xl text-gray-500 sm:mt-4">
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </p>
        </div>
      </div>
      <div className="mt-10 bg-white pb-12 sm:pb-16">
        <div className="relative">
          <div className="absolute inset-0 h-1/2 bg-gray-50" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <dl className="rounded-lg bg-white shadow-lg sm:grid sm:grid-cols-3">
                <div className="flex flex-col border-b border-gray-100 p-6 text-center sm:border-0 sm:border-r">
                  <dt className="order-2 mt-2 text-lg/6 font-medium text-gray-500">Calabresa</dt>
                  <dd className="order-1 text-5xl font-bold tracking-tight text-indigo-600">100%</dd>
                </div>
                <div className="flex flex-col border-t border-b border-gray-100 p-6 text-center sm:border-0 sm:border-r sm:border-l">
                  <dt className="order-2 mt-2 text-lg/6 font-medium text-gray-500">Entrega</dt>
                  <dd className="order-1 text-5xl font-bold tracking-tight text-indigo-600">24/7</dd>
                </div>
                <div className="flex flex-col border-t border-gray-100 p-6 text-center sm:border-0 sm:border-l">
                  <dt className="order-2 mt-2 text-lg/6 font-medium text-gray-500">Calorias</dt>
                  <dd className="order-1 text-5xl font-bold tracking-tight text-indigo-600">100k</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
