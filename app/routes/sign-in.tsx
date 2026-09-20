
import type { Route } from "./+types/sign-in"
import { data, Link, redirect, useFetcher } from "react-router"
import * as yup from "yup"
import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithYup } from "@conform-to/yup"
import { authService } from "~/services/auth-service"
import { session } from "~/services/session-service"
import { commitSession, getSession } from "~/services/session-server"

const signInSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(6)
})

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(
    request.headers.get("Cookie")
  )

  return data(
    { error: await session.get("error") },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      }
    }
  )
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(
    request.headers.get("Cookie")
  )

  const formData = await request.formData()

  const email = formData.get("email")
  const password = formData.get("password")

  // https://ts-node-api-jpgk.onrender.com/auth/sign-in
  const { status, data, message } = await authService.signIn({
    email: email as string,
    password: password as string
  })

  if (!status) return { message } // session.flash("error", errors)

  return redirect("/new-point", {
    headers: {
      "Set-Cookie": await commitSession(session),
    }
  })
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login" },
    { name: "description", content: "Página de Login" },
  ]
}

// Quando usa <fetcher.Form> a action não retorna para "actionData" do componente, ela retorna para "fetcher.data"
export default function SignIn({ actionData, loaderData }: Route.ComponentProps) {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithYup(formData, {
        schema: signInSchema
      })
    }
  })

  const fetcher = useFetcher()

  const { error } = loaderData

  return (
    <main className="flex flex-col justify-center md:max-w-[30%] mx-auto h-[100vh] px-3">
      <fetcher.Form
        {...getFormProps(form)}
        method="POST"
        className="flex flex-col justify-center">
        {error && (
          <p className="bg-red-100 p-2 rounded-md text-center text-red-500 mb-5">{error}</p>
        )}
        <fieldset className="mt-10">
          {fetcher.data?.errors && (
            <p className="bg-red-100 p-2 rounded-md text-center text-red-500 mb-5">{fetcher.data.errors}</p>
          )}
          {fetcher.data?.message && (
            <p className="bg-red-100 p-2 rounded-md text-center text-red-500 mb-5">
              {fetcher.data.message}
            </p>
          )}
          <legend className="mb-5">
            <h2 className="text-[#322153] text-[24px] font-bold">Login</h2>
          </legend>
          <div className="flex flex-col mb-5">
            <label htmlFor="email" className="text-[#6C6C80] text-[14px]">E-mail</label>
            <input
              {...getInputProps(fields.email, { type: "email" })}
              className="h-[40px] bg-[#dcdcde] rounded-md px-3"/>
            {fields.email.errors ? (
              <p className="text-red-500">{fields.email.errors}</p>
            ) : null}
          </div>
          <div className="flex flex-col mb-5">
            <label htmlFor="password" className="text-[#6C6C80] text-[14px]">Senha</label>
            <input
              {...getInputProps(fields.password, { type: "password" })}
              className="h-[40px] bg-[#dcdcde] rounded-md px-3"/>
            {fields.password.errors ? (
              <p className="text-red-500">{fields.password.errors}</p>
            ) : null}
          </div>
        </fieldset>
        <button
          type="submit"
          disabled={fetcher.state !== "idle"}
          className="text-white bg-[#34CB79] hover:bg-[#32be71] px-10 py-3 rounded-md disabled:opacity-25 disabled:bg-gray-500">
            Entrar
        </button>
      </fetcher.Form>
      <span className="flex justify-center gap-2 mt-5 text-[#322153]">Ainda não possui conta? <Link to="/sign-up" className="underline">Cadastre-se.</Link></span>
    </main>
  )
}
