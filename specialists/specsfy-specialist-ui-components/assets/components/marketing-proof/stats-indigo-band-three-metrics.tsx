export default function Example() {
  return (
    <div className="bg-indigo-800">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            A confiança de desenvolvedores de mais de 80 planetas
          </h2>
          <p className="mt-3 text-xl text-indigo-200 sm:mt-4">
            Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
          </p>
        </div>
        <dl className="mt-10 text-center sm:mx-auto sm:grid sm:max-w-3xl sm:grid-cols-3 sm:gap-8">
          <div className="flex flex-col">
            <dt className="order-2 mt-2 text-lg/6 font-medium text-indigo-200">Calabresa</dt>
            <dd className="order-1 text-5xl font-bold tracking-tight text-white">100%</dd>
          </div>
          <div className="mt-10 flex flex-col sm:mt-0">
            <dt className="order-2 mt-2 text-lg/6 font-medium text-indigo-200">Entrega</dt>
            <dd className="order-1 text-5xl font-bold tracking-tight text-white">24/7</dd>
          </div>
          <div className="mt-10 flex flex-col sm:mt-0">
            <dt className="order-2 mt-2 text-lg/6 font-medium text-indigo-200">Calorias</dt>
            <dd className="order-1 text-5xl font-bold tracking-tight text-white">100k+</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
