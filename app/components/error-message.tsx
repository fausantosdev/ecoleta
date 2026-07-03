import { useEffect, useState } from "react"

export function ErrorMessage({ message, duration = 3000 }: { message: string, duration?: number }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!message) {
      setVisible(false)
      return
    }

    // mostra a mensagem sempre que o texto mudar
    setVisible(true)

    const timer = setTimeout(() => {
      setVisible(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [message, duration])

  if (!message) return null

  return (
    <div
      aria-live="polite"
      className={`transform transition-opacity duration-500 mb-5 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <p
        className="
          text-red-600
          bg-red-100
          border border-red-300
          p-2
          rounded-md
          mt-2
        "
      >
        {message}
      </p>
    </div>
  )
}
