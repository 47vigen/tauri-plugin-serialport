import { useState } from "react"
import { Serialport } from "tauri-plugin-serialport-api"
import "./App.css"
import reactLogo from "./assets/react.svg"

function App() {
  const [ports, setPorts] = useState("")

  const checkPorts = async () => {
    try {
      const ports = await Serialport.available_ports()
      setPorts(JSON.stringify(ports, null, 2))
    } catch {}
  }

  return (
    <div className="container">
      <h1>Welcome to Tauri!</h1>

      <div className="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault()
          void checkPorts()
        }}
      >
        <button type="submit">Greet</button>
      </form>

      <p>{ports}</p>
    </div>
  )
}

export default App
