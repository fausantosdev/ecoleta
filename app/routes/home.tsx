import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ecoleta" },
    { name: "description", content: "Ecoleta description" },
  ];
}

export default function Home() {
  return (
    <div>
      <h1>Hello word</h1>
    </div>
  );
}
