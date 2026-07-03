import { useEffect, useMemo, useRef, useState } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"

import "leaflet/dist/leaflet.css"

/**
 * O useMap() é um hook do React-Leaflet que serve para acessar a instância do mapa criada pelo <MapContainer>, permitindo controlar zoom, centro, camadas, etc.
 * Ele só funciona quando usado dentro de um componente que seja filho (direto ou indireto) do <MapContainer>, porque é esse container que cria e disponibiliza o contexto do mapa.
 * Se você tentar usar useMap() fora da árvore do <MapContainer>, ele não encontra o contexto e retorna erro ou undefined.
 */
function MyMap({ position }: {
  position: {
    lat: number
    lng: number
  }
}) {
  const map = useMap()
  map.setView(position)

  return null
}

export default function MapClient({ onChangePosition }: {
  onChangePosition: (position: { lat: number, lng: number }) => void
}) {
  const [position, setPosition] = useState({lat: 0, lng: 0})
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false)

  const markerRef = useRef<any>(null)

  const eventHandlers = useMemo(() => ({
    dragend() {
      const marker = markerRef.current

      if (marker != null) {
        setPosition(marker.getLatLng())
        onChangePosition(marker.getLatLng())
      }
    },
  }), [])

  const handleGetLocation = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    navigator.permissions.query({name:'geolocation'}).then(function(result) {
      if (result.state === 'granted') {
        setLocationPermissionGranted(true)
      } else if (result.state === 'denied') {
        setLocationPermissionGranted(false)
      }
    })

    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords

      const newPos = { lat: latitude, lng: longitude }

      setPosition(newPos)
      onChangePosition(newPos)
    })
  }
  /*useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords

      setPosition({
        lat: latitude,
        lng: longitude
      })

      onChangePosition({
        lat: latitude,
        lng: longitude
      })
    })
  }, [])*/

  return(
    <>
      <button
        className={`text-white bg-[#34CB79] px-8 py-1 rounded-md cursor-pointer mb-5 ${locationPermissionGranted && 'disabled:opacity-50 disabled:cursor-not-allowed'}`}
        onClick={handleGetLocation}
        disabled={locationPermissionGranted}>
        Obter minha localização atual(necessita permissão)
      </button>
      {locationPermissionGranted && <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={true}
        className="h-[300px] w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
      <MyMap position={position}/>
      <Marker
        position={position}
        draggable
        ref={markerRef}
        eventHandlers={eventHandlers}>
          <Popup>{position.lat}, {position.lng}</Popup>
      </Marker>
    </MapContainer>}
    </>
  )
}

/**
 * https://react-leaflet.js.org/docs/example-draggable-marker/
 *
 *
 */

/**
 * Erro:
 * Switched to client rendering because the server rendering errored:
 * Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.
 *
 * Solução:
 * Garantir que o componente do mapa só seja renderizado no cliente, usando um estado isClient que é definido como true dentro de um useEffect (que só roda no cliente).
 * Assim, o componente do mapa só é incluído na árvore de componentes quando isClient é true, evitando o erro de renderização no servidor.
 * OBS: usar o isClient apenas no componente que importa o mapa, não dentro do próprio mapa.
 *
 * link: https://github.com/remix-run/remix/discussions/8686
 */

/**
 * Erro:
 * [Violation] Only request geolocation information in response to a user gesture.
 *
 * Solução:
 */
