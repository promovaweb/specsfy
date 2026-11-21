const stats = [
  { label: 'Fundação', value: '2021' },
  { label: 'Profissionais', value: '37' },
  { label: 'Países', value: '12' },
  { label: 'Captados', value: '$25M' },
]

export default function Example() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 items-start gap-x-8 gap-y-16 sm:gap-y-24 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-4">
            <div className="relative overflow-hidden rounded-3xl bg-gray-900 px-6 pt-64 pb-9 shadow-2xl sm:px-12 lg:max-w-lg lg:px-8 lg:pb-8 xl:px-10 xl:pb-10 dark:bg-gray-800 dark:shadow-none dark:after:pointer-events-none dark:after:absolute dark:after:inset-0 dark:after:rounded-3xl dark:after:inset-ring dark:after:inset-ring-white/10">
              <img
                alt=""
                src="https://images.unsplash.com/photo-1630569267625-157f8f9d1a7e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2669&q=80"
                className="absolute inset-0 size-full rounded-3xl object-cover brightness-125 saturate-0"
              />
              <div className="absolute inset-0 bg-gray-900 mix-blend-multiply" />
              <div
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 -ml-16 -translate-x-1/2 -translate-y-1/2 transform-gpu blur-3xl"
              >
                <div
                  style={{
                    clipPath:
                      'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                  }}
                  className="aspect-1097/845 w-274.25 bg-linear-to-tr from-[#ff4694] to-[#776fff] opacity-40"
                />
              </div>
              <figure className="relative isolate">
                <svg
                  fill="none"
                  viewBox="0 0 162 128"
                  aria-hidden="true"
                  className="absolute -top-4 -left-2 -z-10 h-32 stroke-white/20"
                >
                  <path
                    d="M65.5697 118.507L65.8918 118.89C68.9503 116.314 71.367 113.253 73.1386 109.71C74.9162 106.155 75.8027 102.28 75.8027 98.0919C75.8027 94.237 75.16 90.6155 73.8708 87.2314C72.5851 83.8565 70.8137 80.9533 68.553 78.5292C66.4529 76.1079 63.9476 74.2482 61.0407 72.9536C58.2795 71.4949 55.276 70.767 52.0386 70.767C48.9935 70.767 46.4686 71.1668 44.4872 71.9924L44.4799 71.9955L44.4726 71.9988C42.7101 72.7999 41.1035 73.6831 39.6544 74.6492C38.2407 75.5916 36.8279 76.455 35.4159 77.2394L35.4047 77.2457L35.3938 77.2525C34.2318 77.9787 32.6713 78.3634 30.6736 78.3634C29.0405 78.3634 27.5131 77.2868 26.1274 74.8257C24.7483 72.2185 24.0519 69.2166 24.0519 65.8071C24.0519 60.0311 25.3782 54.4081 28.0373 48.9335C30.703 43.4454 34.3114 38.345 38.8667 33.6325C43.5812 28.761 49.0045 24.5159 55.1389 20.8979C60.1667 18.0071 65.4966 15.6179 71.1291 13.7305C73.8626 12.8145 75.8027 10.2968 75.8027 7.38572C75.8027 3.6497 72.6341 0.62247 68.8814 1.1527C61.1635 2.2432 53.7398 4.41426 46.6119 7.66522C37.5369 11.6459 29.5729 17.0612 22.7236 23.9105C16.0322 30.6019 10.618 38.4859 6.47981 47.558L6.47976 47.558L6.47682 47.5647C2.4901 56.6544 0.5 66.6148 0.5 77.4391C0.5 84.2996 1.61702 90.7679 3.85425 96.8404L3.8558 96.8445C6.08991 102.749 9.12394 108.02 12.959 112.654L12.959 112.654L12.9646 112.661C16.8027 117.138 21.2829 120.739 26.4034 123.459L26.4033 123.459L26.4144 123.465C31.5505 126.033 37.0873 127.316 43.0178 127.316C47.5035 127.316 51.6783 126.595 55.5376 125.148L55.5376 125.148L55.5477 125.144C59.5516 123.542 63.0052 121.456 65.9019 118.881L65.5697 118.507Z"
                    id="0ef284b8-28c2-426e-9442-8655d393522e"
                  />
                  <use x={86} href="#0ef284b8-28c2-426e-9442-8655d393522e" />
                </svg>
                <img
                  alt=""
                  src="https://tailwindcss.com/mais-assets/img/logos/workcation-logo-white.svg"
                  className="h-12 w-auto"
                />
                <blockquote className="mt-6 text-xl/8 font-semibold text-white">
                  <p>
                    Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                  </p>
                </blockquote>
                <figcaption className="mt-6 text-sm/6 text-gray-300">
                  <strong className="font-semibold text-white">Judith Rogers,</strong> CEO da Workcation
                </figcaption>
              </figure>
            </div>
          </div>
          <div>
            <div className="text-base/7 text-gray-700 lg:max-w-lg dark:text-gray-400">
              <p className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">Valores da empresa</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
                Nossa missão é fortalecer equipes remotas
              </h1>
              <div className="max-w-xl">
                <p className="mt-6">
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
                <p className="mt-8">
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
                <p className="mt-8">
                  Conteúdo de exemplo para demonstrar a composição e a hierarquia visual.
                </p>
              </div>
            </div>
            <dl className="mt-10 grid grid-cols-2 gap-8 border-t border-gray-900/10 pt-10 sm:grid-cols-4 dark:border-gray-800">
              {stats.map((stat, statIdx) => (
                <div key={statIdx}>
                  <dt className="text-sm/6 font-semibold text-gray-600 dark:text-gray-400">{stat.label}</dt>
                  <dd className="mt-2 text-3xl/10 font-bold tracking-tight text-gray-900 dark:text-white">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-10 flex">
              <a
                href="#"
                className="text-base/7 font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Saiba mais sobre nossa empresa <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
