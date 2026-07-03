import type { Route } from "./+types/landing"
import { FiLogIn } from "react-icons/fi"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ecoleta" },
    { name: "description", content: "Ecoleta description" },
  ]
}

import logo from '../assets/logo.svg'
import pessoas from '../assets/pessoas.svg'

import { Link } from "react-router";

export default function Landing() {
  return (
    <div className={`flex flex-col px-5 md:px-0 h-[100vh]`}>
      <div className="container mx-auto flex flex-col flex-1">
        <header className="py-5 justify-center md:justify-between flex items-center">
          <img src={logo} alt="Ecoleta" />
        </header>
        <main className="flex flex-1 flex-col md:flex-row">
          <div className="flex flex-col flex-1 justify-center mb-5 md:mb-0">
            <h1 className="text-[#322153] text-[30px] md:text-[54px] font-[700]">Seu marketplace de coleta de resíduos.</h1>
            <p className="text-[#6C6C80] text-[18px] md:text-[24px] font-[400] mb-5">Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</p>
            <Link to="/sign-up" className="flex">
              <span className="bg-[#2FB86E] px-4 py-4 flex justify-center items-center rounded-tl-md rounded-bl-md">
                <FiLogIn color="#ffffff"/>
              </span>
              <strong className="bg-[#34CB79] px-4 py-4 text-white w-[100%] md:w-[200px] rounded-tr-md rounded-br-md">
                Cadastre-se
              </strong>
            </Link>
          </div>
          <div className="flex flex-1 justify-center items-center">
            <img src={pessoas} alt="Pessoas" className="w-50 md:w-100"/>
          </div>
        </main>
      </div>
    </div>
  );
}
