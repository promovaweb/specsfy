export default function Example() {
  return (
    <div className="bg-white py-16 sm:py-24 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gray-900 px-6 py-20 shadow-xl sm:rounded-3xl sm:px-10 sm:py-24 md:px-12 lg:px-20 dark:bg-black dark:shadow-none dark:after:pointer-events-none dark:after:absolute dark:after:inset-0 dark:after:inset-ring dark:after:inset-ring-white/10 dark:after:sm:rounded-3xl">
          <img
            alt=""
            src="https://images.unsplash.com/photo-1601381718415-a05fb0a261f3?ixid=MXwxMjA3fDB8MHxwcm9maWxlLXBhZ2V8ODl8fHxlbnwwfHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1216&q=80"
            className="absolute inset-0 size-full object-cover brightness-150 saturate-0"
          />
          <div className="absolute inset-0 bg-gray-900/90 mix-blend-multiply" />
          <div aria-hidden="true" className="absolute -top-56 -left-80 transform-gpu blur-3xl">
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="aspect-1097/845 w-274.25 bg-linear-to-r from-[#ff4694] to-[#776fff] opacity-[0.45] dark:opacity-[0.30]"
            />
          </div>
          <div
            aria-hidden="true"
            className="hidden md:absolute md:bottom-16 md:left-200 md:block md:transform-gpu md:blur-3xl"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
              className="aspect-1097/845 w-274.25 bg-linear-to-r from-[#ff4694] to-[#776fff] opacity-25 dark:opacity-20"
            />
          </div>
          <div className="relative mx-auto max-w-2xl lg:mx-0">
            <img
              alt=""
              src="https://tailwindcss.com/mais-assets/img/logos/workcation-logo-white.svg"
              className="h-12 w-auto dark:hidden"
            />
            <img
              alt=""
              src="https://tailwindcss.com/mais-assets/img/logos/workcation-logo-white.svg"
              className="h-12 w-auto not-dark:hidden"
            />
            <figure>
              <blockquote className="mt-6 text-lg font-semibold text-white sm:text-xl/8">
                <p>
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
              </blockquote>
              <figcaption className="mt-6 text-base text-white dark:text-gray-200">
                <div className="font-semibold">Judith Black</div>
                <div className="mt-1">CEO da Workcation</div>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </div>
  )
}
