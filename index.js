// INPUTS
const txtId = document.getElementById("txtId");
const txtNombre = document.getElementById("txtNombre");
const txtApellido = document.getElementById("txtApellido");

// BOTONES
const btnBuscar = document.getElementById("btnBuscar");
const btnRegistrar = document.getElementById("btnRegistrar");
const btnIniciar = document.getElementById("btnIniciar");

function clearInputs(){
    txtId.value = "";
    txtNombre.value = "";
    txtApellido.value = "";
}

function mezclarArray(array){
    return array.sort(() => Math.random() - 0.5);
}

function buscarPersona(){
    let contenedorPreguntas = document.getElementById("contenedorPreguntas")
    let resultado = document.getElementById("resultadoEvaluacion")

    let id = txtId.value.trim();

    if(!id){
        alert("Ingrese un ID");
        contenedorPreguntas.innerHTML = ""
        resultado.innerHTML = ""
        txtId.focus();
        return;
    }

    let personas = JSON.parse(localStorage.getItem("personas")) || [];
    let personaEncontrada = personas.find(persona => persona.id === id);

    // PERSONA NO EXISTE
    if(!personaEncontrada){

        alert("No existe la persona")

        contenedorPreguntas.innerHTML = ""
        resultado.innerHTML = ""
        txtNombre.value = "";
        txtApellido.value = "";

        btnRegistrar.classList.remove("hidden");
        btnIniciar.classList.add("hidden");
        txtNombre.focus();

        return;
    }

    // PERSONA EXISTE
    txtNombre.value = personaEncontrada.nombre;
    txtApellido.value = personaEncontrada.apellido;
    contenedorPreguntas.innerHTML = ""
    resultado.innerHTML = ""

    btnIniciar.classList.remove("hidden");
    btnRegistrar.classList.add("hidden");
}

function guardarPersona(){

    let id = txtId.value.trim();
    let nombre = txtNombre.value.trim();
    let apellido = txtApellido.value.trim();


    if(!id || !nombre || !apellido){
        alert("Complete todos los campos");
        return;
    }

    let personas = JSON.parse(localStorage.getItem("personas")) || [];
    let personaExiste = personas.find(persona => persona.id === id);

    if(personaExiste){
        alert("El ID ya existe");
        return;
    }

    let nuevaPersona = {
        id: id,
        nombre: nombre,
        apellido: apellido,
        intentos: 0
    };

    personas.push(nuevaPersona);

    localStorage.setItem("personas", JSON.stringify(personas));

    alert("Usuario registrado");

    btnRegistrar.classList.add("hidden");
    btnIniciar.classList.remove("hidden");

}

async function renderizarPreguntas(){

    let response = await fetch("preguntas.json");
    let data = await response.json();
    let contenedor = document.getElementById("contenedorPreguntas");

    let resultado = document.getElementById("resultadoEvaluacion");
    resultado.classList.add("hidden");

    contenedor.innerHTML = "";
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

        contenedor.innerHTML += `
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

    contenedor.innerHTML += `
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

    mostrarResultado(correctas, incorrectas, nota);
}


function mostrarResultado(correctas, incorrectas, nota){

    let contenedorPreguntas = document.getElementById("contenedorPreguntas");
    contenedorPreguntas.innerHTML = "";
    contenedorPreguntas.classList.add("hidden")

    let resultado = document.getElementById("resultadoEvaluacion");
    resultado.classList.remove("hidden");

    let id = txtId.value.trim();
    let personas = JSON.parse(localStorage.getItem("personas")) || [];
    let persona = personas.find(persona => persona.id === id);
    resultado.innerHTML = `
    
        <div class="resultadoCard">

            <h2>Resultado Final</h2>

            <h3 class="nombreAlumno">
                ${persona.nombre} ${persona.apellido}
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

function iniciarEvaluacion(){

    let id = txtId.value.trim();
    let personas = JSON.parse(localStorage.getItem("personas")) || [];
    let personaEncontrada = personas.find(persona => persona.id === id);

    // INCREMENTAR INTENTOS
    personaEncontrada.intentos++;

    // GUARDAR CAMBIOS
    localStorage.setItem("personas", JSON.stringify(personas));

    btnIniciar.classList.add("hidden")
    renderizarPreguntas();
}


//EVENTOS
btnBuscar.addEventListener("click", buscarPersona);
btnRegistrar.addEventListener("click", guardarPersona);
btnIniciar.addEventListener("click", iniciarEvaluacion);
txtId.addEventListener("keypress", function(event){

    if(event.key === "Enter"){
        buscarPersona();
    }

});