type Response = {
  status: boolean
  data: any,
  errors: any
}

async function states(): Promise<Response> {
  const response = fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(async (res) => {
      let result = await res.json()

      result = result.map((state: any) => ({
        id: state.id,
        uf: state.sigla,
        name: state.nome
      }))

      return {
        status: true,
        data: result,
        errors: null
      }
    })
    .catch((err) => {
      return {
        status: false,
        data: null,
        errors: err
      }
    })

  return response

  //return await response.json()
}

async function citiesByUf(uf: string) {
  const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  return await response.json()
}

export const ibgeService = {
  states,
  citiesByUf
}
