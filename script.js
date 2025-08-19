document.addEventListener('DOMContentLoaded', () => {
    const machinesContainer = document.getElementById('machines-container');
    const noteForm = document.getElementById('note-form');
    const notesContainer = document.getElementById('notes-container');
    const questionForm = document.getElementById('question-form');
    const questionsContainer = document.getElementById('questions-container');
    const machineSelectNotes = document.getElementById('machine-select-notes');
    const machineSelectQuestions = document.getElementById('machine-select-questions');

    // Nuevos elementos para la gestión de máquinas
    const machineForm = document.getElementById('machine-form');
    const originalHostnameInput = document.getElementById('original-hostname');
    const machineHostnameInput = document.getElementById('machine-hostname');
    const machineIpInput = document.getElementById('machine-ip');
    const machinePortsInput = document.getElementById('machine-ports');
    const machineServicesInput = document.getElementById('machine-services');
    const saveMachineBtn = document.getElementById('save-machine-btn');

    // Nuevos botones de importación/exportación
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');

    // Estructura de datos en localStorage
    let data = JSON.parse(localStorage.getItem('ejptData')) || {
        machines: {},
        notes: [],
        questions: []
    };

    // --- Funciones de exportación e importación ---
    function exportData() {
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ejpt_data_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function importData(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                if (importedData.machines && importedData.notes && importedData.questions) {
                    data = importedData;
                    saveData();
                    alert('Datos importados con éxito.');
                } else {
                    alert('Error: El archivo no tiene el formato correcto.');
                }
            } catch (e) {
                alert('Error: No se pudo leer el archivo JSON.');
            }
        };
        reader.readAsText(file);
    }


    // --- Funciones de renderizado y guardado ---
    function saveData() {
        localStorage.setItem('ejptData', JSON.stringify(data));
        renderDashboard();
        renderNotes();
        renderQuestions();
        updateMachineSelects();
    }

    function renderDashboard() {
        machinesContainer.innerHTML = '';
        const machineNames = Object.keys(data.machines).sort();
        machineNames.forEach(name => {
            const machine = data.machines[name];
            const card = document.createElement('div');
            card.className = 'machine-card';
            card.innerHTML = `
                <h3>${machine.hostname}</h3>
                <p><strong>IP:</strong> ${machine.ip}</p>
                <p><strong>Puertos:</strong> ${machine.ports.join(', ') || 'No hay puertos registrados'}</p>
                <p><strong>Servicios:</strong> ${machine.services.join(', ') || 'No hay servicios registrados'}</p>
                <div class="card-actions">
                    <button class="edit-btn" data-hostname="${machine.hostname}">
                        <span class="material-icons">edit</span>
                    </button>
                    <button class="delete-btn" data-hostname="${machine.hostname}">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            `;
            machinesContainer.appendChild(card);
        });

        // Añadir listeners a los nuevos botones
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', handleEditMachine);
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDeleteMachine);
        });
    }

    function renderNotes() {
        notesContainer.innerHTML = '';
        data.notes.forEach(note => {
            const noteDiv = document.createElement('div');
            noteDiv.className = 'note-item';
            noteDiv.innerHTML = `
                <h4>${note.title} (Máquina: ${note.machine})</h4>
                <p>${note.content}</p>
            `;
            notesContainer.appendChild(noteDiv);
        });
    }

    function renderQuestions() {
        questionsContainer.innerHTML = '';
        const filteredQuestions = data.questions.sort((a, b) => a.number - b.number);
        // Aquí podríamos añadir lógica para filtrar por máquina si fuera necesario
        filteredQuestions.forEach(q => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-item';
            questionDiv.innerHTML = `
                <h4>Pregunta ${q.number} (Máquina: ${q.machine})</h4>
                <p>${q.text}</p>
            `;
            questionsContainer.appendChild(questionDiv);
        });
    }

    function updateMachineSelects() {
        const machineNames = Object.keys(data.machines).sort();
        machineSelectNotes.innerHTML = '';
        machineSelectQuestions.innerHTML = '';
        machineNames.forEach(name => {
            const option1 = document.createElement('option');
            option1.value = name;
            option1.textContent = name;
            machineSelectNotes.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = name;
            option2.textContent = name;
            machineSelectQuestions.appendChild(option2);
        });
    }

    // --- Manejo de Eventos ---
    
    // Formulario de máquinas
    machineForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const hostname = machineHostnameInput.value.trim();
        const ip = machineIpInput.value.trim();
        const ports = machinePortsInput.value.split(',').map(p => p.trim()).filter(p => p);
        const services = machineServicesInput.value.split(',').map(s => s.trim()).filter(s => s);
        const originalHostname = originalHostnameInput.value;

        if (originalHostname && originalHostname !== hostname) {
            // Eliminar la máquina antigua si el hostname ha cambiado
            delete data.machines[originalHostname];
        }

        data.machines[hostname] = {
            ip,
            hostname,
            ports,
            services
        };
        saveData();
        machineForm.reset();
        originalHostnameInput.value = ''; // Resetear el campo oculto
        saveMachineBtn.textContent = 'Guardar Máquina';
    });

    // Botón de edición de máquina
    function handleEditMachine(e) {
        const hostname = e.currentTarget.dataset.hostname;
        const machine = data.machines[hostname];

        // Llenar el formulario con los datos de la máquina
        originalHostnameInput.value = hostname;
        machineHostnameInput.value = machine.hostname;
        machineIpInput.value = machine.ip;
        machinePortsInput.value = machine.ports.join(', ');
        machineServicesInput.value = machine.services.join(', ');
        saveMachineBtn.textContent = 'Actualizar Máquina';
        
        // Mover el scroll al formulario
        machineForm.scrollIntoView({ behavior: 'smooth' });
    }

    // Botón de eliminación de máquina
    function handleDeleteMachine(e) {
        const hostname = e.currentTarget.dataset.hostname;
        if (confirm(`¿Estás seguro de que quieres eliminar la máquina ${hostname}?`)) {
            delete data.machines[hostname];
            
            // Eliminar también las notas y preguntas asociadas
            data.notes = data.notes.filter(note => note.machine !== hostname);
            data.questions = data.questions.filter(q => q.machine !== hostname);
            
            saveData();
        }
    }

    // Formulario de notas
    noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newNote = {
            machine: machineSelectNotes.value,
            title: document.getElementById('note-title').value,
            content: document.getElementById('note-content').value
        };
        data.notes.push(newNote);
        saveData();
        noteForm.reset();
    });

    // Formulario de preguntas
    questionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newQuestion = {
            machine: machineSelectQuestions.value,
            number: parseInt(document.getElementById('question-number').value),
            text: document.getElementById('question-text').value
        };
        data.questions.push(newQuestion);
        saveData();
        questionForm.reset();
    });
    
    // Carga inicial
    saveData();

    // Eventos de los nuevos botones
    exportBtn.addEventListener('click', exportData);
    importBtn.addEventListener('click', () => {
        importFile.click();
    });
    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            importData(file);
        }
    });
});
