// import "./NotificationPopUp.css"

// import { useMainContext } from "../../../Context"

// import { CompleteLoader } from "../Loader/Loader"

function ErrorIcon() {
    return (
        <svg height="30" width="30" viewBox="-2 -2 45 45" className="ErrorLoader">
            <circle cx="20" cy="20" r="20" stroke="red" fill="none" strokeWidth="1" />
            <g stroke="#ff4949" strokeWidth="2">
                <path
                    d="M 10 10 L 30 32 M 30 10 L 10 32"
                />
            </g>
        </svg>
    )
}

function WarningIcon() {
    return (
        <svg height="30" width="30" viewBox="-2 -2 45 45">
            <polygon points="20,2 40,40 0,40 20,2 " stroke="#ffee00" fill="red" id="triangle" strokeWidth={2}/>
            <g stroke="white" fill="none" id="exclamation">
                <path d="M 18 14 C 18 8, 22 8, 22 14 M 18 13 L 21 30 M 21 30 L 22 13"/>
                <circle cx={21} cy={34} r={2} fill="white"/>
            </g>
        </svg>
    )
}

export function PopUp() {
    // Desestructurar un objeto
    const {isPopUp, setIsPopUp} = useMainContext()

    // const start = Date.now()
    
    if (!isPopUp.open) return null

    let delay = 4000

    function close() {
        setTimeout(
            () => {setIsPopUp({...isPopUp,open: false});clearTimeout(timeoutid)},
            700
        )
    }

    let Icono = <ErrorIcon />

    switch (isPopUp.type) {
        case 0:
            document.documentElement.style.setProperty("--popUp-bg-color", "#580000")
            document.documentElement.style.setProperty("--popUp-border-color", "#580000")
            delay = 12000
            Icono = <ErrorIcon />
            break
        case 1:
            document.documentElement.style.setProperty("--popUp-bg-color", "#014502")
            document.documentElement.style.setProperty("--popUp-border-color", "#77ff008c")
            Icono = <CompleteLoader size={30}/>
            break
        case 2:
            document.documentElement.style.setProperty("--popUp-bg-color", "#584300")
            document.documentElement.style.setProperty("--popUp-border-color", "#ffed00")
            Icono = <WarningIcon />
            delay = 8000
            break
        default:
            document.documentElement.style.setProperty("--popUp-bg-color", "#580000")
            document.documentElement.style.setProperty("--popUp-border-color", "#580000")
            break
    } 

    const timeoutid = setTimeout(
        () => {
            // console.warn("Tiempo de ejecucion tiemout: ", start - Date.now())
            const notiElement = document.getElementById("popUpContainer")
            if (notiElement) {
                notiElement.style.setProperty("--animation-type", "fadeOut")
                close()
            }
            close()
        },
                
        delay
    )

    return (
        <section className="popUpContainer" id="popUpContainer">
            <header>
                <h3>
                    {isPopUp.title}
                </h3>
                <svg
                    height={25}
                    width={25}
                    viewBox="0 0 12 12"
                    onClick={() => {document.getElementById("popUpContainer").style.setProperty("--animation-type", "fadeOut");clearTimeout(timeoutid);close()} }
                >
                    <g
                        fill="none"
                    >
                        <line x1={0} y1={0} x2={10} y2={10} stroke="white" strokeWidth={2} />
                        <line x1={10} y1={0} x2={0} y2={10} stroke="white" strokeWidth={2} />
                    </g>
                </svg>
            </header>
            <p>
                {isPopUp.message}
            </p>
            {Icono}
        </section>
    )
}
{/* 
    Svg para hacer una caja de texto
<svg
  height="90"
  width="90"
  viewbox="0 0 20 20"
>
  <path
    fill="purple"
    stroke="black"
    stroke-width="1"
    d="M 0 0 L 20 0 L 20 10 L 18 10 L 16 12 L 14 10 L 0 10 Z"
  >
    
  </path>
</svg> */}