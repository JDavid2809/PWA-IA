(function(){
    const STORAGE_KEY = 'bitacoraGymRegistros';
    const diasSemana = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

    function cargarFechaYHora(){
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const fechaString = now.toLocaleDateString('es-ES', options);
        const diaSemanaString = diasSemana[now.getDay()];

        const fechaInput = document.getElementById('fecha');
        const diaInput = document.getElementById('dia-semana');
        if(fechaInput) fechaInput.value = fechaString;
        if(diaInput) diaInput.value = diaSemanaString;
    }

    function _escapeHtml(str){
        if(!str) return '';
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
    }

    function renderBitacoraList(){
        const listEl = document.getElementById('bitacora-list');
        if(!listEl) return;
        try{
            const registrosJSON = localStorage.getItem(STORAGE_KEY);
            const registros = registrosJSON ? JSON.parse(registrosJSON) : [];
            if(!registros || registros.length === 0){
                listEl.innerHTML = '<li class="p-message">Aún no hay sesiones registradas.</li>';
                return;
            }
            listEl.innerHTML = '';
            registros.slice().reverse().forEach(reg => {
                const li = document.createElement('li');
                li.style.padding = '10px';
                li.style.borderBottom = '1px solid #444';
                const comentariosHtml = _escapeHtml(reg.comentarios).replace(/\n/g, '<br>');
                const idSafe = Number(reg.id) || 0;
                li.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
                        <div style="flex:1">
                            <strong>${_escapeHtml(reg.fecha)} (${_escapeHtml(reg.diaSemana)})</strong>
                            <div style="margin-top:6px;">${comentariosHtml}</div>
                        </div>
                    </div>
                `;
                listEl.appendChild(li);
            });
        } catch(err){
            console.error('Error leyendo bitácora desde localStorage:', err);
            listEl.innerHTML = '<li class="error-message">No se pudo cargar la bitácora.</li>';
        }
    }

    function registrarSesion(){
        const fecha = document.getElementById('fecha')?.value || '';
        const diaSemana = document.getElementById('dia-semana')?.value || '';
        const comentariosEl = document.getElementById('comentarios');
        const comentario = comentariosEl?.value?.trim() || '';

        if(!comentario){
            alert('Por favor ingresa el detalle de la sesión antes de guardar.');
            return;
        }

        const nuevoRegistro = { id: Date.now(), fecha, diaSemana, comentarios: comentario };

        try{
            const registrosJSON = localStorage.getItem(STORAGE_KEY);
            const registros = registrosJSON ? JSON.parse(registrosJSON) : [];
            registros.push(nuevoRegistro);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));

            // limpiar textarea y actualizar fecha/hora
            if(comentariosEl) comentariosEl.value = '';
            cargarFechaYHora();

            // actualizar vista de bitácora
            renderBitacoraList();

            // confirmar al usuario
            alert('Sesión guardada ✅');
        } catch (err){
            console.error('Error guardando en localStorage:', err);
            alert('Ocurrió un error al guardar. Revisa la consola.');
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        cargarFechaYHora();
        const btn = document.getElementById('guardar-sesion-btn');
        if(btn) btn.addEventListener('click', registrarSesion);
        // Renderizar bitácora al cargar la página
        renderBitacoraList();
    });

    function deleteRegistro(id){
        if(!id){
            return;
        }
        if(!confirm('¿Eliminar esta sesión? Esta acción no se puede deshacer.')) return;
        try{
            const registrosJSON = localStorage.getItem(STORAGE_KEY);
            const registros = registrosJSON ? JSON.parse(registrosJSON) : [];
            const nuevos = registros.filter(r => Number(r.id) !== Number(id));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevos));
            renderBitacoraList();
        } catch(err){
            console.error('Error al eliminar registro:', err);
            alert('No se pudo eliminar el registro. Revisa la consola.');
        }
    }

    function clearAllRegistros(){
        if(!confirm('¿Borrar todas las entradas de la bitácora? Esta acción eliminará todo el historial.')) return;
        try{
            localStorage.removeItem(STORAGE_KEY);
            renderBitacoraList();
            alert('Bitácora vaciada ✅');
        } catch(err){
            console.error('Error borrando bitácora:', err);
            alert('No se pudo borrar la bitácora. Revisa la consola.');
        }
    }

    // Exponer funciones globales para los botones inline
    window.deleteRegistro = deleteRegistro;
    window.clearAllRegistros = clearAllRegistros;

    // Exponer para debug si se quiere llamar desde consola
    window.registrarSesion = registrarSesion;
})();
