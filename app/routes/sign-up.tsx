import { Link, redirect, useFetcher } from "react-router"
import type { Route } from "./+types/sign-up"
import * as yup from "yup"
import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithYup } from "@conform-to/yup"

const signUpSchema = yup.object({
  name: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().min(8)
})

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()

  const name = formData.get("name")
  const email = formData.get("email")
  const password = formData.get("password")

  const response = await fetch("http://localhost:3333/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Is-Web": "1"
      },
      credentials: "include",
      body: JSON.stringify({ name, email, password }),
  })

  const { status, errors } = await response.json()

  if (!status) return { errors }

  return redirect('/sign-in')
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Criar conta" },
    { name: "description", content: "Página de criação de conta" },
  ]
}

export default function SignUp() {
    const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithYup(formData, {
        schema: signUpSchema
      })
    }
  })

  const fetcher = useFetcher()

  return (
    <main className='flex flex-col justify-center md:max-w-[30%] mx-auto h-[100vh] px-3'>
      <fetcher.Form
        {...getFormProps(form)}
        method="POST"
        className="flex flex-col justify-center">
      <fieldset className="mt-10">
        {fetcher.data?.errors && (
          <p className="bg-red-100 p-2 rounded-md text-center text-red-500 mb-5">{fetcher.data.errors}</p>
        )}
        <legend className="mb-5">
          <h2 className="text-[#322153] text-[24px] font-bold">Faça seu cadastro</h2>
        </legend>
        <div className="flex flex-col mb-5">
          <label htmlFor="name" className="text-[#6C6C80] text-[14px]">Nome completo</label>
          <input
            {...getInputProps(fields.name, { type: "text" })}
            className="h-[40px] bg-[#dcdcde] rounded-md px-3"/>
          {fields.name.errors ? (
            <p className="text-red-500">{fields.name.errors}</p>
          ) : null}
        </div>
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
        disabled={fetcher.state !== 'idle'}
        className="text-white bg-[#34CB79] hover:bg-[#32be71] px-10 py-3 rounded-md disabled:opacity-25 disabled:bg-gray-500">
          Cadastrar
      </button>
      </fetcher.Form>
      <span className="flex justify-center gap-2 mt-5 text-[#322153]">Já possui conta? <Link to="/sign-in" className="underline">Faça login.</Link></span>
    </main>
  )
}
