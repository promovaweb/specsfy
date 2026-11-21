export default function Example() {
  return (
    <div className="bg-indigo-700 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
        <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:col-span-7">
          Quer receber novidades e atualizações do produto? Assine nossa newsletter.
        </h2>
        <form className="w-full max-w-md lg:col-span-5 lg:pt-2">
          <div className="flex gap-x-4">
            <label htmlFor="email-address" className="sr-only">
              Endereço de e-mail
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              required
              placeholder="Digite seu e-mail"
              autoComplete="email"
              className="min-w-0 flex-auto rounded-md bg-white/10 px-3.5 py-2 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-white/75 focus:outline-2 focus:-outline-offset-2 focus:outline-white sm:text-sm/6"
            />
            <button
              type="submit"
              className="flex-none rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-xs hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Assinar
            </button>
          </div>
          <p className="mt-4 text-sm/6 text-gray-300">
            Protegemos seus dados. Leia nossa{' '}
            <a href="#" className="font-semibold whitespace-nowrap text-white hover:text-indigo-50">
              política de privacidade
            </a>
            .
          </p>
        </form>
      </div>
    </div>
  )
}
