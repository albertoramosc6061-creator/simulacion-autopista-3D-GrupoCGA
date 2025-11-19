SIMULACION-AUTOPISTA-3D (Versión Media)
=====================================

Contenido del ZIP:
  - index.html
  - style.css
  - script.js
  - assets/    (carpeta para modelos, texturas, etc.)
  - readme.txt

Requisitos (software):
  - Navegador moderno (Chrome, Edge, Firefox)
  - Editor: Visual Studio Code (opcional)
  - Extensión Live Server (recomendada) para ver cambios en caliente

Cómo ejecutar (forma rápida):
  1. Descomprime la carpeta en tu PC.
  2. Abre 'index.html' en el navegador (doble clic). 
     - Si el modelo GLTF u otros recursos externos se usan localmente, usa Live Server:
       Instala Live Server en VS Code, abre la carpeta y selecciona 'Open with Live Server'.
  3. Verás la escena 3D con el minibús moviéndose y un panel lateral con datos.

Qué contiene la versión Media (recomendado para presentar):
  - Puntos con nombres reales (Peaje El Alto, Cervecería, Viaducto, Terminal, Pérez Velasco).
  - Vectores entre puntos (líneas verdes y flechas).
  - Minibús representado por una esfera roja que recorre los tramos.
  - Panel lateral que muestra:
      * Tramo actual
      * Magnitud del tramo (m)
      * Velocidad aproximada (m/s)
      * Aceleración aproximada (m/s²)
  - Botones para ocultar/mostrar vectores y reiniciar animación.

Sugerencias para la presentación:
  - Abre el proyecto con Live Server para mejor rendimiento.
  - En la exposición, explica cómo se obtuvieron las coordenadas (Google Maps / Google Earth).
  - Muestra cómo se calculan magnitudes y cómo se puede derivar la velocidad y aceleración.
  - Si quieres, graba un video con OBS o usa la grabadora del sistema.

Notas técnicas:
  - Las coordenadas en el código están en metros (aprox.) y se escalan visualmente con la constante SCALE.
  - Para mejorar la precisión puedes sustituir coordenadas reales (lat/long) transformándolas a un sistema de coordenadas planas.
  - Para la versión avanzada se puede importar un modelo 3D (.gltf) al minibús y añadir un terreno.

Si quieres que suba este ZIP y te dé el enlace de descarga, dime "sube el ZIP" o "dame el ZIP".
También puedo: generar un video demo, añadir más controles, o convertirlo a versión avanzada.
