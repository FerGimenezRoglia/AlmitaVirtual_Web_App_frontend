# Almita Virtual – Frontend

Este repositorio contiene el **frontend** del proyecto **Almita Virtual**, una aplicación web donde los usuarios pueden crear y compartir entornos personalizados con documentos importantes (como su CV o carta de presentación), acompañados por una Almita animada que expresa el estado simbólico del entorno.

El foco de este cliente web es **una experiencia visual, emocional y personal**, con diseño responsivo y animaciones adaptadas a la interacción del visitante.

##  Funcionalidad principal

- Visualización pública o privada de un entorno.
- Subida y eliminación de archivos (PDF, JPG, PNG).
- Visualización y descarga de archivo.
- Animaciones e interfaz sensible (estados de Almita).
- Botón “Me Interesa” con frases que cambian dinámicamente.
- Popup dentro del monitor simulando feedback de sistema.
- Gestión de colores por entorno.
- Diseño reduccionista, tipográfico e inmersivo.

##  Estados visuales de Almita

- `IDLE`: reposo inicial.
- `ACTIVE`: se subió un archivo.
- `REFLECTIVE`: se eliminó el archivo.
- `EXCITED`: un visitante descargó el archivo.
- `INSPIRED`: un visitante hizo clic en “me interesa”.

##  Tecnologías utilizadas

- React 18
- Vite
- React Router
- Tailwind CSS
- Cloudinary (para previsualizar imágenes)
- CSS Modules y variables CSS
- Iconografía SVG personalizada

##  Estructura del proyecto

```
src/
├── assets/            # Imágenes y SVG
├── components/        # Botones, modales, cuadrantes, etc.
├── pages/             # Home, Environment
├── routes/            # Configuración de rutas
├── utils/             # Helpers (Cloudinary, colores, frases)
├── main.jsx           # Entry point
└── index.css          # Estilos globales
```

##  Cómo iniciar el proyecto

1. Clona el repositorio:

```bash
git clone https://github.com/FerGimenezRoglia/AlmitaVirtual_Web_App_frontend.git
cd AlmitaVirtual_Web_App_frontend
```

2. Instala las dependencias:

```bash
npm install
```

3. Inicia el servidor de desarrollo:

```bash
npm run dev
```

##  Variables de entorno

Crear un archivo `.env` en la raíz con tus variables personalizadas si usas servicios externos como Cloudinary.

##  Tests

(Actualmente no incluye pruebas unitarias; puede integrarse Jest + React Testing Library en futuras versiones).

##  Buenas prácticas implementadas

- Separación de lógica en componentes reutilizables.
- Código accesible, semántico y responsivo.
- Manejo de errores con popups y feedback visual.
- Consistencia visual entre estados.

##  Notas

- El frontend depende del backend de [Almita Virtual – Backend API](https://github.com/FerGimenezRoglia/AlmitaVirtual_Web_App).
- Los entornos públicos son accesibles desde un link compartido.
- El diseño está optimizado para pantallas medianas y grandes (versión mobile en progreso).

---

>  *“Una Almita puede decir mucho con poco.”*