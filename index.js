// INPUTS
const txtId = document.getElementById("txtId");
const txtNombre = document.getElementById("txtNombre");
const txtApellido = document.getElementById("txtApellido");

// BOTONES
const btnBuscar = document.getElementById("btnBuscar");
const btnRegistrar = document.getElementById("btnRegistrar");
const btnIniciar = document.getElementById("btnIniciar");
const btnHistorial = document.getElementById("btnHistorial");

// CONTENEDORES
const contenedorPreguntas = document.getElementById("contenedorPreguntas");
const resultadoEvaluacion = document.getElementById("resultadoEvaluacion");

let usuarioActual = null;


function mostrarAlerta(icono, mensaje){

    Swal.fire({
        toast: true,
        position: "top-end",
        icon: icono,
        title: mensaje,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
    });

}


function obtenerPersonas(){
    return JSON.parse(localStorage.getItem("personas")) || [];
}

function guardarPersonas(personas){
    localStorage.setItem("personas", JSON.stringify(personas));
}

function buscarPersonaPorId(id){
    let personas = obtenerPersonas();
    return personas.find(persona => persona.id === id);
}

function mezclarArray(array){
    return array.sort(() => Math.random() - 0.5);
}

function buscarPersona(){

    let id = txtId.value.trim();

    if(!id){
        mostrarAlerta("warning", "Ingrese un ID");
        contenedorPreguntas.innerHTML = ""
        resultadoEvaluacion.innerHTML = ""
        txtId.focus();
        return;
    }

    let personaEncontrada = buscarPersonaPorId(id);

    // PERSONA NO EXISTE
    if(!personaEncontrada){

        mostrarAlerta("error", "Usuario no encontrado");

        contenedorPreguntas.innerHTML = ""
        resultadoEvaluacion.innerHTML = ""
        txtNombre.value = "";
        txtApellido.value = "";

        btnRegistrar.classList.remove("hidden");
        btnIniciar.classList.add("hidden");
        btnHistorial.classList.add("hidden");
        txtNombre.focus();

        return;
    }

    // PERSONA EXISTE
    usuarioActual = personaEncontrada;
    txtNombre.value = personaEncontrada.nombre;
    txtApellido.value = personaEncontrada.apellido;
    contenedorPreguntas.innerHTML = ""
    resultadoEvaluacion.innerHTML = ""

    btnIniciar.classList.remove("hidden");
    btnHistorial.classList.remove("hidden");
    btnRegistrar.classList.add("hidden");
}

function guardarPersona(){

    let id = txtId.value.trim();
    let nombre = txtNombre.value.trim();
    let apellido = txtApellido.value.trim();


    if(!id || !nombre || !apellido){
        mostrarAlerta("warning", "Complete todos los campos");
        return;
    }

    let personas = obtenerPersonas();
    let personaExiste = buscarPersonaPorId(id);

    if(personaExiste){
        mostrarAlerta("error", "El ID ya está registrado");
        return;
    }

    let nuevaPersona = {
        id: id,
        nombre: nombre,
        apellido: apellido,
        intentos: 0,
        historial: []
    };

    personas.push(nuevaPersona);

    guardarPersonas(personas);
    mostrarAlerta("success", "Usuario registrado correctamente");

    btnRegistrar.classList.add("hidden");
    btnIniciar.classList.remove("hidden");
    usuarioActual = nuevaPersona;

}

async function renderizarPreguntas(){

    let response = await fetch("preguntas.json");
    let data = await response.json();
    
    resultadoEvaluacion.classList.add("hidden");
    contenedorPreguntas.classList.remove("hidden");

    contenedorPreguntas.innerHTML = "";
    let preguntasMezcladas = mezclarArray([...data.preguntas]);
    preguntasMezcladas.forEach((pregunta, index) => {

        let opcionesHTML = "";
        let opcionesMezcladas = mezclarArray([...pregunta.opciones]);
        opcionesMezcladas.forEach((opcion, opcionIndex) => {

            opcionesHTML += `
                <label class="opcion">

                    <input 
                        type="radio"
                        name="pregunta${pregunta.id}"
                        value="${opcion.correcta}"
                    >

                    ${String.fromCharCode(65 + opcionIndex)}) ${opcion.texto}

                </label>
            `;

        });

        contenedorPreguntas.innerHTML += `
            <div class="pregunta">

                <h3>
                    ${index + 1}. ${pregunta.pregunta}
                </h3>

                <div class="opciones">
                    ${opcionesHTML}
                </div>

            </div>
        `;

    });

    contenedorPreguntas.innerHTML += `
        <button type="button" id="btnCalificar">
            Finalizar Evaluación
        </button>
    `;

    let btnCalificar = document.getElementById("btnCalificar");
    btnCalificar.addEventListener("click", calificarExamen);
}

async function calificarExamen(){

    let response = await fetch("preguntas.json");
    let data = await response.json();
    let correctas = 0;

    data.preguntas.forEach(pregunta => {

        let respuestaSeleccionada = document.querySelector(
            `input[name="pregunta${pregunta.id}"]:checked`
        );

        // NO RESPONDIO
        if(!respuestaSeleccionada){
            return;
        }

        // RESPUESTA CORRECTA
        if(respuestaSeleccionada.value === "true"){
            correctas++;
        }

    });

    let totalPreguntas = data.preguntas.length;
    let incorrectas = totalPreguntas - correctas;
    let nota = (correctas / totalPreguntas) * 20;

    let personas = obtenerPersonas();

    let persona = personas.find(
        persona => persona.id === usuarioActual.id
    );

    let fecha = new Date().toLocaleDateString();

    persona.historial.push({
        intento: persona.intentos,
        nota: nota,
        fecha: fecha
    });

    usuarioActual = persona;

    guardarPersonas(personas);
    mostrarResultado(correctas, incorrectas, nota);

}


function mostrarResultado(correctas, incorrectas, nota){

    contenedorPreguntas.innerHTML = "";
    contenedorPreguntas.classList.add("hidden")
    
    resultadoEvaluacion.classList.remove("hidden");
    btnHistorial.classList.remove("hidden")

    resultadoEvaluacion.innerHTML = `
    
        <div class="resultadoCard">

            <h2>Resultado Final</h2>

            <h3 class="nombreAlumno">
                ${usuarioActual.nombre} ${usuarioActual.apellido}
            </h3>

            <div class="estadisticas">

                <div class="estadistica correctas">
                    <span>${correctas}</span>
                    <p>Correctas</p>
                </div>

                <div class="estadistica incorrectas">
                    <span>${incorrectas}</span>
                    <p>Incorrectas</p>
                </div>

                <div class="estadistica nota">
                    <span>${nota.toFixed(1)}</span>
                    <p>Nota Final</p>
                </div>

            </div>

        </div>

    `;

}

function mostrarHistorial(){

    if(!usuarioActual){
        return;
    }

    btnHistorial.classList.add("hidden")

    // OCULTAR PREGUNTAS
    contenedorPreguntas.classList.add("hidden");
    resultadoEvaluacion.classList.remove("hidden");

    resultadoEvaluacion.innerHTML = `

        <div class="resultadoCard">

            <h2>Historial de Evaluaciones</h2>

            <h3 class="nombreAlumno">
                ${usuarioActual.nombre} ${usuarioActual.apellido}
            </h3>

            <table class="tablaHistorial">
                <thead>
                    <tr>
                        <th>N° Intento</th>
                        <th>Nota</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>

                    ${usuarioActual.historial.map((item) => `

                        <tr>
                            <td>${item.intento}</td>
                            <td>${item.nota.toFixed(1)}</td>
                            <td>${item.fecha}</td>
                        </tr>

                    `).join("")}

                </tbody>
            </table>
        </div>

    `;
}

function iniciarEvaluacion(){

    if(usuarioActual.intentos >= 3){
        mostrarAlerta("error", "Máximo de intentos alcanzado");
        return;
    }

    let personas = obtenerPersonas();

    let persona = personas.find(
        persona => persona.id === usuarioActual.id
    );

    // INCREMENTAR INTENTOS
    persona.intentos++;

    usuarioActual = persona;
    // GUARDAR CAMBIOS
    guardarPersonas(personas);

    btnIniciar.classList.add("hidden")
    btnHistorial.classList.add("hidden")
    renderizarPreguntas();
}


//EVENTOS
btnBuscar.addEventListener("click", buscarPersona);
btnRegistrar.addEventListener("click", guardarPersona);
btnHistorial.addEventListener("click", mostrarHistorial);
btnIniciar.addEventListener("click", iniciarEvaluacion);
txtId.addEventListener("keypress", function(event){

    if(event.key === "Enter"){
        buscarPersona();
    }

});