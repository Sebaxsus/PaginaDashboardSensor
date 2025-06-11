import { useEffect, useState } from "react";


export default function DashboardClient() {
    
    function nivelDeGravedad(valor) {
        console.log("Valor: ", valor)
        if (valor <= 300) {
            return "light-dark(#0d611b, #1ac228)"
        }
        else if (valor > 300 && valor <= 370) {
            return "light-dark(#d18f00, #ffc400)"
        } else {
            return "light-dark(#740000, #ff0000)"
        }
    }
    const [data, setData] = useState([])

    useEffect(() => {
        const socket = new WebSocket("ws://127.0.0.1:5000/dashboard", "arduino")

        socket.onopen = () => {
            console.log("🔌 Conectado al WebSocket")
        }

        socket.onmessage = (event) => {
            try {
                const raw = JSON.parse(event.data)
                const newData = raw.data
                console.log("📦 Datos recibidos:", newData)

                if (raw.event === "historico") {
                    setData([...newData])
                } else {
                    setData((prev) => [JSON.parse(newData), ...prev]) 
                }
                const firsItemValue = data[0].valor

                nivelDeGravedad(firsItemValue)
                
            } catch (e) {
                console.error("Error al parsear JSON", e)
            }
        }

        socket.onerror = (error) => {
            console.error("WebSocket Error: ", error)
        }

        return () => socket.close()
    }, [])

    return (
        <>
            <h2 className="text-3xl text-center p-4 mb-2 border-b border-amber-50">📊 Datos en tiempo real</h2>
            <div className="relative flex flex-col min-h-56 h-full overflow-y-auto" id="Sensor-Data-List">
                <div className="flex justify-between p-2 border-b border-gray-300 sticky top-0 backdrop-blur-md z-[1]">
                    <span className="font-mono text-xl min-w-5 text-center lg:w-32 lg:h-12">Hora</span>
                    <span className="font-bold text-xl">Medida CH4</span>
                </div>
                {
                    data.map((item, index) => (
                        <>
                            {index == 0 ? document.documentElement.style.setProperty("--data-color", nivelDeGravedad(item.valor)) : null}
                            <div key={index} className={`flex py-2 px-4 border-b border-gray-300 lg:h-12 justify-between hover:opacity-70 cursor-default ${index == 0 ? "fade-in" : ""}`} style={{color: nivelDeGravedad(item.valor)}}>
                                <span className="font-mono">{item.timestamp}</span>
                                <section className="font-mono flex gap-2 items-center">
                                    {item.valor} ppm
                                    <meter
                                        className="rounded-2xl .metro"
                                        value={item.valor}
                                        min={0}
                                        max={1000}
                                        optimum={200}
                                        high={250}
                                        low={370}
                                    />
                                </section>
                            </div>
                            </>
                    )
                    )
                }
            </div>
        </>
    )
}