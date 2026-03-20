import { BrowserRouter, Routes, Route } from "react-router"
import { Nav } from "./components/nav"
import { Home } from "./pages/home"
import { Playground } from "./pages/playground"

export function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/playground" element={<Playground />} />
      </Routes>
    </BrowserRouter>
  )
}
