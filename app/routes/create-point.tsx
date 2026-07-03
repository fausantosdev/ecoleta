import { Suspense, useEffect, useState } from "react"
import type { Route } from "./+types/sign-in"
import { redirect, useFetcher, data } from "react-router"
import * as yup from "yup"
import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithYup } from "@conform-to/yup"

import Map from "~/components/map.client"

import { collectService } from "~/services/collect-service"
import { fileService } from "~/services/file-service"

import { session } from "~/services/session-service"
import { ibgeService } from '~/services/ibge-service'
import { commitSession, getSession } from "~/services/session-server"
import Dropzone from "~/components/dropzone"
import { request } from "https"

type Item = {
  id: number
  title: string
  image: string
}

const createPointSchema = yup.object({
  image: yup.mixed()
    .required()
    .test(
        "file-required",
        "Selecione uma imagem.",
        (file) => {
          return file instanceof File && file.size > 0
        }
      ),
  name: yup.string().min(3).required(),
  email: yup.string().email().required(),
  whatsapp: yup.string().min(10).required(),
  latitude: yup.number(),
  longitude: yup.number(),
  uf: yup.string().length(2).required(),
  city: yup.string().required(),
  items: yup .array()
    .transform((value) => (Array.isArray(value) ? value : [value]))
    .of(yup.number().required())
    .min(1).required(),
})

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(
    request.headers.get("Cookie")
  )

  if (!session.get("token")) {
    session.flash("error", "Você precisa estar logado para acessar essa página.")

    return redirect("/sign-in", {
      headers: {
        "Set-Cookie": await commitSession(session)
      }
    })
  }

  const { status, data: responseData, errors } = await collectService.getItems({
    token: session.get("token")!
  })

  if (!status) {
    session.flash("error", "Ocorreu um erro. Por favor faça login novamente")
    console.log(errors)

    return redirect("/sign-in", {
      headers: {
        "Set-Cookie": await commitSession(session),
      }
    })
  }

  const ufs = await ibgeService.states()
  //const c = await ibgeService.citiesByUf('pe')

  if (!status) return { errors }

  return data(
    {
      error: errors || session.get("error") || null,
      success: session.get("success") || null,
      items: responseData,
      ufs,
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session) // Aqui usamos session.commit para garantir que quaisquer alterações na sessão (como flash messages) sejam salvas e enviadas de volta ao cliente. Isso é importante para que as mensagens de sucesso ou erro sejam exibidas corretamente na interface do usuário após o redirecionamento.
      }
    }
  )
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()// Aqui estamos lendo os dados do formulário enviados pelo cliente. O objeto FormData é uma estrutura que representa os campos do formulário e seus valores, permitindo que possamos processar os dados de maneira mais fácil. Depois de obter o FormData, podemos convertê-lo em um formato mais utilizável, como um objeto JavaScript, para facilitar a manipulação dos dados antes de enviá-los para o serviço de criação de ponto de coleta.
  const session = await getSession(
    request.headers.get("Cookie")
  )

  const fileResponse = await fileService.createFile({
    token: session.get("token")!,
    file: formData.get("image") as File
  })

  if (!fileResponse.status) session.flash("error", fileResponse.message)

  // Converte tipos corretos
  const d = {
    image: fileResponse.data.name,
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    whatsapp: formData.get("whatsapp") as string,
    latitude: Number(formData.get("latitude")),
    longitude: Number(formData.get("longitude")),
    uf: formData.get("uf") as string,
    city: formData.get("city") as string,
    items: formData.getAll('items').map(Number),
  }

  const { status, errors } = await collectService.createPoint({
    token: session.get("token")!,
    data: d
  })

  if (!status) session.flash("error", errors)

  session.flash("success", "Ponto de coleta criado com sucesso!")

  if (!status) {
    return redirect("/new-point", {
        headers: {
          "Set-Cookie": await commitSession(session), // Garantindo que a mensagem de erro seja salva na sessão antes do redirecionamento
        }
      }
    )
  }

  session.flash("success", "Ponto de coleta criado com sucesso!")

  return redirect("/new-point", {
    headers: {
      "Set-Cookie": await commitSession(session),
    }
  })
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Novo ponto de coleta" },
    { name: "description", content: "Página de cadastro de novo ponto de coleta" },
  ]
}

export default function CreatePoint({ loaderData, actionData }: Route.ComponentProps) {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithYup(formData, {
        schema: createPointSchema
      })
    }
  })

  const [isClient, setIsClient] = useState(false);

  const [coords, setCoords] = useState({ lat: 0, lng: 0 })
  const [uf, setUf] = useState<string>('')
  const [cities, setCities] = useState([])
  const [selectedFile, setSelectedFile] = useState<File>()

  const fetcher = useFetcher()

  const { items, ufs, error, success } = loaderData

  function errorsFieldMap(errors: Array<string>) {
    return errors.map((error, index) => (
      <p key={index} className="text-red-500 text-sm">{error}</p>
    ))
  }

  async function loadCities(uf: string) {
    const result = await ibgeService.citiesByUf(uf)
    setCities(prev => result)
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    loadCities(uf)
  }, [uf])

  return (
    <main className='flex flex-col md:max-w-[50%] mx-auto h-[calc(100vh-50px)]'>
      {error && (
        <div className="bg-red-100 p-2 rounded-md text-center text-red-500 mb-5">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 p-2 rounded-md text-center text-green-500 mb-5">
          {success}
        </div>
      )}
      <fetcher.Form
        {...getFormProps(form)}
        method="POST"
        encType="multipart/form-data">
        {fetcher.data?.errors && (
          <p className="bg-red-100 p-2 rounded-md text-center text-red-500 mb-5">{fetcher.data.errors}</p>
        )}
        <h1 className="text-[#322153] text-[30px] font-[700]">Cadastro do<br/>ponto de coleta</h1>
        <fieldset className="mt-10">
          <Dropzone
            {...getInputProps(fields.image, { type: "file" })}/>
          {fields.image.errors ? errorsFieldMap(fields.image.errors) : null}
        </fieldset>
        <fieldset className="mt-10">
          <legend className="mb-5">
            <h2 className="text-[#322153] text-[24px] font-bold">Dados</h2>
          </legend>

          <div className="flex flex-col mb-5">
            <label htmlFor="name" className="text-[#6C6C80] text-[14px]">Nome da entidade</label>
            <input
              {...getInputProps(fields.name, { type: "text" })}
              className="h-[40px] bg-[#dcdcde] rounded-md px-3"/>
            {fields.name.errors ? errorsFieldMap(fields.name.errors) : null}
          </div>

          <div className="flex flex-col md:flex-row gap-5">
            <div className="flex flex-1 flex-col">
              <label htmlFor="email" className="text-[#6C6C80] text-[14px]">E-mail</label>
              <input
                {...getInputProps(fields.email, { type: "email" })}
                className="h-[40px] bg-[#dcdcde] rounded-md px-3"/>
              {fields.email.errors ? errorsFieldMap(fields.email.errors): null}
            </div>

            <div className="flex flex-1 flex-col">
              <label htmlFor="name" className="text-[#6C6C80] text-[14px]">Whatsapp</label>
              <input
                {...getInputProps(fields.whatsapp, { type: "tel" })}
                className="h-[40px] bg-[#dcdcde] rounded-md px-3"/>
              {fields.whatsapp.errors ? errorsFieldMap(fields.whatsapp.errors) : null}
            </div>
          </div>
        </fieldset>

        <fieldset className="mt-10">
          <legend className="flex w-[100%] flex-col md:flex-row md:justify-between md:items-center mb-5">
            <h2 className="text-[#322153] text-[24px] font-bold">Endereço</h2>
            <span className="text-[14px]">Selecione o endereço no mapa</span>
          </legend>
          <input {...getInputProps(fields.latitude, { type: "hidden" })} value={coords.lat}/>
          <input {...getInputProps(fields.longitude, { type: "hidden" })} value={coords.lng}/>
          <Suspense fallback={<div>Carregando mapa...</div>}>
            {isClient && <Map onChangePosition={setCoords}/>}
          </Suspense>
          <div className="flex flex-col md:flex-row gap-5 mt-5">
            <div className="flex flex-1 flex-col">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                {...getInputProps(fields.uf, { type: "text" })}
                onChange={e => setUf(e.target.value)}
                className="h-[40px] bg-[#dcdcde] rounded-md px-3">
                  <option value="">Selecione um estado</option>
                  {ufs.data.map((uf: any) => (
                    <option key={uf.id} value={uf.uf}>{uf.name}</option>
                  ))}
              </select>
              {fields.uf.errors ? errorsFieldMap(fields.uf.errors) : null}
            </div>

            <div className="flex flex-1 flex-col">
              <label htmlFor="city">Cidade</label>
              <select
                {...getInputProps(fields.city, { type: "text" })}
                className="h-[40px] bg-[#dcdcde] rounded-md px-3"
                disabled={cities.length == 0}>
                <option value="0">Selecione uma cidade</option>
                {cities.map((city: any) => (
                  <option key={city.id} value={city.nome}>{city.nome}</option>
                ))}
              </select>
              {fields.city.errors ? errorsFieldMap(fields.city.errors) : null}
            </div>
          </div>
        </fieldset>

        <fieldset className="mt-10">
          <legend className="flex w-[100%] flex-col md:flex-row md:justify-between md:items-center mb-5">
            <h2 className="text-[#322153] text-[24px] font-bold">Ítens de coleta</h2>
            <span className="text-[14px]">Selecione um ou mais itens abaixo</span>
          </legend>
          {fields.items.errors ? errorsFieldMap(fields.items.errors) : null}
          <ul className="w-[100%] grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((item: Item) => {
              const checkboxId = `item-${item.id}`
              return (
                <li key={item.id}>
                  <label
                    htmlFor={checkboxId}
                    className="relative cursor-pointer flex flex-col justify-center items-center p-5 rounded-md bg-gray-200 border-2 border-green-950 hover:bg-[#d4f7e0] transition"
                  >
                    <input
                      {...getInputProps(fields.items, {
                        type: "checkbox",
                        value: String(item.id)
                      })}
                      id={checkboxId}
                      className="absolute top-2 left-2"/>
                    <img src={item.image} alt={item.title} />
                    <span className="text-[#322153] text-[16px] mt-5">{item.title}</span>
                  </label>
                </li>
              )
            })}
          </ul>
        </fieldset>
        <div className="flex justify-end my-10 pb-10">
          <button
            disabled={fetcher.state !== "idle"}
            className="text-white bg-[#34CB79] px-10 py-3 rounded-md cursor-pointer">Cadastrar ponto de coleta</button>
        </div>
      </fetcher.Form>
    </main>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div className="bg-red-100 text-red-600 p-4 rounded-md">
      <h1>Create point page</h1>
      <p>{error.message}</p>
    </div>
  )
}
