import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { FiUpload } from "react-icons/fi"

type Props = {} & React.InputHTMLAttributes<HTMLInputElement>

export default function Dropzone({...inputProps}: Props) {
  const [selectedFileUrl, setSelectedFileUrl] = useState("")

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0]

    const fileUrl = URL.createObjectURL(file)

    setSelectedFileUrl(fileUrl)
  }, [])

  const {getRootProps, getInputProps} = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
    }
  })

  return (
    <div {...getRootProps()} className="h-[300px] bg-[#e1faec] rounded-2xl flex justify-center items-center outline-0">
      <input
        {...getInputProps()}
        {...inputProps}
        accept="image/*"/>
      {
        selectedFileUrl
        ? <img
            src={selectedFileUrl} alt="Point thumbnail"
            className="h-[100%] w-[100%] rounded-2xl object-cover"/>
        : (
          <p className="rounded-2xl border-2 border-dashed border-[#4ecb79] px-2 w-[90%] h-[90%] flex justify-center items-center gap-2">
            <FiUpload/>
            Arraste e solte a imagem aqui.
          </p>
        )
      }
    </div>
  )
}
