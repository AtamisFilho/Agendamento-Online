import Link from 'next/link'
import { CalendarDays, Clock, Bell, CheckCircle } from 'lucide-react'

const features = [
  {
    icon: CalendarDays,
    title: 'Agendamento fácil',
    description: 'Escolha o serviço, data e horário em poucos cliques.',
  },
  {
    icon: Clock,
    title: 'Disponibilidade em tempo real',
    description: 'Veja apenas os horários disponíveis, sem confusão.',
  },
  {
    icon: Bell,
    title: 'Lembretes automáticos',
    description: 'Receba e-mail de confirmação e lembrete antes do horário.',
  },
  {
    icon: CheckCircle,
    title: 'Gestão simples',
    description: 'Cancele ou visualize seus agendamentos a qualquer hora.',
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <CalendarDays className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Agendamento Online</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Cadastrar-se
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 bg-gradient-to-b from-indigo-50 to-white">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Agende seu horário <span className="text-indigo-600">online</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Marque sua consulta ou serviço em segundos, sem telefonemas, sem espera.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="w-full rounded-xl bg-indigo-600 px-8 py-3 text-base font-semibold text-white hover:bg-indigo-700 sm:w-auto"
            >
              Agendar agora
            </Link>
            <Link
              href="/login"
              className="w-full rounded-xl border border-gray-300 bg-white px-8 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-12 text-center text-2xl font-bold text-gray-900">
            Tudo que você precisa
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="flex flex-col items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                    <Icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Agendamento Online. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
