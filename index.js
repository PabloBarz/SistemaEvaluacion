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

function buscarPersona(){

    let id = txtId.value.trim();

    if(!id){
        alert("Ingrese un ID");
        txtId.focus();
        return;
    }

    let personas = JSON.parse(localStorage.getItem("personas")) || [];

    let personaEncontrada = personas.find(persona => persona.id === id);

    // PERSONA NO EXISTE
    if(!personaEncontrada){

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
        intentos: 1
    };

    personas.push(nuevaPersona);

    localStorage.setItem("personas", JSON.stringify(personas));

    alert("Persona registrada");

    clearInputs();

    btnRegistrar.classList.add("hidden");
}


//EVENTOS
btnBuscar.addEventListener("click", buscarPersona);
btnRegistrar.addEventListener("click", guardarPersona);
txtId.addEventListener("keypress", function(event){

    if(event.key === "Enter"){
        buscarPersona();
    }

});