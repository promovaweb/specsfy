export default function Example() {
  return (
    <div className="bg-white py-16 sm:py-24 lg:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance text-gray-900 sm:text-4xl dark:text-white">
          Quer receber novidades e atualizações do produto? Assine nossa newsletter.
        </h2>
        <form className="mt-10 max-w-md">
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
              className="min-w-0 flex-auto rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-gray-700 dark:focus:outline-indigo-500"
            />
            <button
              type="submit"
              className="flex-none rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
            >
              Assinar
            </button>
          </div>
          <p className="mt-4 text-sm/6 text-gray-900 dark:text-gray-300">
            Protegemos seus dados. Leia nossa{' '}
            <a
              href="#"
              className="font-semibold whitespace-nowrap text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              política de privacidade
            </a>
            .
          </p>
        </form>
      </div>
    </div>
  )
}
