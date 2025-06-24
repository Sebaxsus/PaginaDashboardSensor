import { useEffect, useState, useCallback, useRef } from "react";

export default function DashboardClient() {

    const [data, setData] = useState([])
    const [timestampDirection, setTimestampDirection] = useState(true)
    const [valueDirection, setValueDirection] = useState(true)

    const socketRef = useRef(null)

    document.getElementById("filter_button").onclick = (event) => {
        const filterValue = document.getElementById("filter_data").value
        // console.log(`Click en el Filtro ${filterValue.split("T")[0]}`)
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            console.warn("Aun no se ha establecido la conexion al Servidor WebSocket")
            return
        }
        // Aqui como el filtro actualmente solo usa fechas
        // El orden estara definido por el estado Guardado
        // en timestampDirection
        const body = JSON.stringify({
            "event":"historico",
            "filter": {
                "date": filterValue.split("T")[0]
            },
            "order":{
                "by": "timestamp",
                "direction": timestampDirection == true ? "DESC" : "ASC"
            }
        })

        socketRef.current.send(body)
    }

    
    
    function nivelDeGravedad(valor) {
        if (valor <= 300) {
            return "light-dark(#0d611b, #1ac228)"
        }
        else if (valor > 300 && valor <= 370) {
            return "light-dark(#d18f00, #ffc400)"
        } else {
            return "light-dark(#740000, #ff0000)"
        }
    }

    useEffect(() => {
        const socket = new WebSocket("ws://127.0.0.1:5000/dashboard", "arduino")

        socketRef.current = socket

        socket.onopen = () => {
            console.log("🔌 Conectado al WebSocket")
        }

        socket.onmessage = (event) => {
            console.log(timestampDirection, valueDirection)
            try {
                const raw = JSON.parse(event.data)
                const newData = raw.data
                console.log("📦 Datos recibidos:", newData)

                if (raw.event === "historico") {
                    setData([...newData])
                } else {
                    setData((prev) => [JSON.parse(newData), ...prev])
                }
                
            } catch (e) {
                console.error("Error al parsear JSON", e)
            }
        }

        socket.onerror = (error) => {
            console.error("WebSocket Error: ", error)
        }

        return () => socket.close()
    }, [])

    function orderBy(column, direction) {
        
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            console.warn("Aun no se ha establecido la conexion al Servidor WebSocket")
            return
        }
        console.log("Pre ",timestampDirection, valueDirection)
        if (column === "timestamp") {
            setTimestampDirection(!timestampDirection)
            setValueDirection(true)
        } else {
            setValueDirection(!valueDirection)
            setTimestampDirection(true)
        }

        console.log("Post ",timestampDirection, valueDirection)
        
        valueDirection ? document.getElementById("Arrow_Value").classList.remove("rotate-180") : document.getElementById("Arrow_Value").classList.add("rotate-180")
        timestampDirection ? document.getElementById("Arrow_Time").classList.remove("rotate-180") : document.getElementById("Arrow_Time").classList.add("rotate-180")
        
        const body = JSON.stringify({
            "event":"historico",
            "order":{
                "by": column,
                "direction": direction == true ? "DESC" : "ASC"
            }
        })

        socketRef.current.send(body)
    }

    return (
        <>
            <h2 className="text-3xl text-center p-4 mb-2 border-b border-amber-50">📊 Datos en tiempo real</h2>
            <div className="relative flex flex-col min-h-56 h-full overflow-y-auto duration-150" id="Sensor-Data-List">
                <div className="flex justify-between p-2 border-b border-gray-300 sticky top-0 backdrop-blur-md z-[1]">
                    <div key={"data-List-Title-1"} className="flex flex-col justify-center items-center lg:px-12 hover:rounded-md hover:backdrop-blur-lg hover:backdrop-brightness-105 hover:bg-cyan-900 cursor-pointer" onClick={() => {orderBy("timestamp", timestampDirection)}}>
                        <span className="font-mono text-xl text-center">Hora</span>
                        <div className="bg-[var(--colour-txt)] size-5 arrow duration-150" id="Arrow_Time"></div>
                    </div>
                    <div key={"data-List-Title-2"} className="flex flex-col justify-center items-center lg:px-12 hover:rounded-md hover:backdrop-blur-lg hover:backdrop-brightness-105 hover:bg-cyan-900 cursor-pointer" onClick={() => {orderBy("valor", valueDirection)}}>
                        <span className="font-bold text-xl">Medida CH4</span>
                        <div className="bg-[var(--colour-txt)] size-5 arrow duration-150" id="Arrow_Value"></div>
                    </div>
                </div>
                {
                    data.map((item, index) => {
                        index === 0 ? document.documentElement.style.setProperty("--data-color", nivelDeGravedad(item.valor)) : null
                        /*
                        Si en algun momento alguien ve esto y se pregunta
                        Por que está esto aqui:
                            Porque la piche animacion no se vuelve a activar (Trigger) si no le quito
                            la clase y espero cierto tiempo, (No se cual es el minimo pero en 200ms sirve 👍)
                        */
                        if (document.getElementById("first-Data") && index === 1) {
                            document.getElementById("first-Data").classList.remove("fade-in")
                            setTimeout(() => {
                                document.getElementById("first-Data").classList.add("fade-in")
                            }, 200)
                        }

                        return (
                        <>
                            <div key={`data-${index}`} className={`flex py-2 px-4 border-b border-gray-300 lg:h-12 justify-between hover:opacity-70 cursor-default ${index == 0 ? "fade-in" : ""}`} style={{color: nivelDeGravedad(item.valor)}} id={index == 0 ? "first-Data" : ""}>
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
                    }
                    )
                }
            </div>
        </>
    )
}